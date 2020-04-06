import forEach from 'lodash/forEach';
import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import includes from 'lodash/includes';
import map from 'lodash/map';
import remove from 'lodash/remove';
import isArray from 'lodash/isArray';

import uuid from 'uuid/v1';

import {getRequest, postRequest} from "./RequestUtils";
import ResultStore from "./ResultStore";

const allowAddRowAndEditNameTaxonomies = ['control', 'device', 'risk'];

const LOCAL_STORAGE_KEY_TAXONOMY = "taxonomy";
const LOCAL_STORAGE_KEY_MASTER_DATA = "masterData";
const LOCAL_STORAGE_KEY_TABLE_DATA = "tableData";
const LOCAL_STORAGE_KEY_MAPPING_DATA = "mappingData";
const LOCAL_STORAGE_KEY_PARAMETER_DATA = "parameterData";

const DataStore = () => {

  let childCounter = 1;

  const _getTaxonomy = () => {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_TAXONOMY));
  };

  const _setTaxonomy = taxonomy => {
    localStorage.setItem(LOCAL_STORAGE_KEY_TAXONOMY, JSON.stringify(taxonomy));
  };

  const _getMasterData = () => {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_MASTER_DATA));
  };

  const _setMasterData = masterData => {
    localStorage.setItem(LOCAL_STORAGE_KEY_MASTER_DATA, JSON.stringify(masterData));
  };

  const _getTableData = () => {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_TABLE_DATA));
  };

  const _setTableData = tableData => {
    localStorage.setItem(LOCAL_STORAGE_KEY_TABLE_DATA, JSON.stringify(tableData));
  };

  const _getMappingData = () => {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_MAPPING_DATA));
  };

  const _setMappingData = (mappingData) => {
    localStorage.setItem(LOCAL_STORAGE_KEY_MAPPING_DATA, JSON.stringify(mappingData));
  };

  const _getParameterData = () => {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_PARAMETER_DATA));
  };

  const _setParameterData = (parameterData) => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PARAMETER_DATA, JSON.stringify(parameterData));
  };

  const _resetData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_TAXONOMY);
    localStorage.removeItem(LOCAL_STORAGE_KEY_MASTER_DATA);
    localStorage.removeItem(LOCAL_STORAGE_KEY_TABLE_DATA);
    localStorage.removeItem(LOCAL_STORAGE_KEY_MAPPING_DATA);
    _setParameterData(defaultParametersData);
  };

  let defaultParametersData = {
    asset: {
      min: 0,
      max: 1
    },
    action: {
      min: 0,
      max: 1
    },
    vulnerability: {
      min: 0,
      max: 1
    },
    property: {
      min: 0,
      max: 100
    },
    device: {
      min: 0,
      max: 1
    },
    controlImplementation: {
      min: 1,
      max: 5,
    },
    controlEffectiveness: {
      min: 1,
      max: 5,
    },
    risk: {
      min: 0,
      max: 1
    },
    controlSensitivityDelta: 0.5,
    useDevicePrevalencyScores: false,
  };

  _setParameterData(defaultParametersData);

  const _getNewUUID = () => uuid();

  const _getTaxonomiesAndMasterListFromServer = callback => {
    _getMasterListFromServer(() => _getTaxonomyFromServer(() => _getTaxonomyTableDataFromServer(callback)));
  };

  const _getTaxonomyTableDataFromServer = callback => {
    getRequest('table_data', data => {
      _setTableData(data);
      callback();
    })
  };

  const _getMasterListFromServer = callback => {
    getRequest('master_list', masterList => {
      _setMasterData(masterList);
      callback();
    });
  };

  const _getTaxonomyFromServer = callback => {
    getRequest('taxonomy', taxonomyData => {
      _setTaxonomy(taxonomyData);
      callback();
    });
  };

  const _getMappingDataFromServer = callback => {
    getRequest('mapping', mappingData => {
      _setMappingData(mappingData);
      callback();
    });
  };

  const _traverseAndFillLabel = array => {
    forEach(array, value => {
      value.label = _getMasterListEntry(value.id);
      let children = value.children;
      if (!isEmpty(children)) {
        _traverseAndFillLabel(children);
      }
    });
  };

  const _getTaxonomyTree = () => {
    let taxonomyClone = cloneDeep(_getTaxonomy());
    _traverseAndFillLabel(taxonomyClone);
    return taxonomyClone;
  };

  const _deleteFromTaxonomyTree = (id, taxonomyId) => {
    const taxonomy = _getTaxonomy();
    _traverseAndDeleteChild(taxonomy[taxonomyId].children, id, taxonomyId);
    _setTaxonomy(taxonomy);
  };

  const _traverseAndDeleteChild = (children, id, taxonomyId) => {
    const deletedChild = remove(children, child => {
      return child.id === id
    });
    if (deletedChild && deletedChild[0]) {
      _deleteAllChildrenAndTheirReferences(deletedChild[0], taxonomyId);
      return true;
    }
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (!isEmpty(child.children)) {
        if (_traverseAndDeleteChild(child.children, id, taxonomyId)) {
          return true;
        }
      }
    }
    return false;
  };

  const _deleteAllChildrenAndTheirReferences = (parent, taxonomyId) => {
    const children = parent.children;
    if (isEmpty(children)) {
      return;
    }
    let listOfIds = [];
    _traverseAndGetAllIds(children, listOfIds);
    // Delete all entries for above ids from masterList
    _deleteMasterListEntry(listOfIds);
    // Delete all entries for above ids from tableData
    let taxonomyTableData = _getTableData();
    if (taxonomyTableData && taxonomyTableData[taxonomyId]) {
      forEach(listOfIds, id => {
        delete taxonomyTableData[taxonomyId].data[id];
      });
      _setTableData(taxonomyTableData);
    }
    // TODO: Delete ids from mappings as well
  };

  const _traverseAndGetAllIds = (children, listOfIds) => {
    forEach(children, child => {
      listOfIds.push(child.id);
      _traverseAndGetAllIds(child.children, listOfIds);
    })
  };

  const _updateMasterListEntry = (id, label) => {
    const masterData = _getMasterData();
    masterData[id] = label;
    _setMasterData(masterData);
  };

  const _deleteMasterListEntry = ids => {
    const masterData = _getMasterData();
    if (isArray(ids)) {
      forEach(ids, id => {
        delete masterData[id];
      });
    } else {
      delete masterData[ids];
    }
    _setMasterData(masterData);
  };

  const _getMasterListEntry = id => {
    const masterData = _getMasterData();
    return masterData[id];
  };

  const _traverseAndAddChild = (children, parentId, childId) => {
    for (let i = 0; i < children.length; i++) {
      if (children[i].id === parentId) {
        children[i].children.push({id: childId, children: []});
        return true;
      }
      if (_traverseAndAddChild(children[i].children, parentId, childId)) {
        return true;
      }
    }
    return false;
  };

  const _addChildToHierarchy = (mainTaxonomyId, parentId, childId) => {
    const taxonomy = _getTaxonomy();
    _traverseAndAddChild(taxonomy[mainTaxonomyId].children, parentId, childId);
    _setTaxonomy(taxonomy);
  };

  const _getTaxonomyTableData = taxonomyId => {
    let isRiskTaxonomy = taxonomyId === 'risk';

    const taxonomyTableData = _getTableData();

    if (isEmpty(taxonomyTableData)) {
      return {};
    }

    const taxonomyData = cloneDeep(taxonomyTableData[taxonomyId]);

    if (isEmpty(taxonomyData) && !isRiskTaxonomy) {
      return {};
    }

    const taxonomy = _getTaxonomy();
    let columns = isRiskTaxonomy ? [] : taxonomyData.columnSequence;
    let rows = isRiskTaxonomy ? cloneDeep(taxonomy.risk.children) : taxonomyData.data;

    let columnData = [{
      title: 'Name',
      field: 'name',
      editable: includes(allowAddRowAndEditNameTaxonomies, taxonomyId) ? undefined : 'never',
    }];
    let rowData = [];

    forEach(columns, columnId => {
      columnData.push({
        title: _getMasterListEntry(columnId),
        field: columnId,
        type: 'numeric'
      });
    });

    forEach(rows, (data, taxonomyId) => {
      !isRiskTaxonomy && (data.id = taxonomyId);
      data.name = _getMasterListEntry(isRiskTaxonomy ? data.id : taxonomyId);
      isRiskTaxonomy && (delete data.children);
      rowData.push(data);
    });

    return {columnData, rowData};
  };

  const _updateTaxonomyTableData = (id, newData, taxonomyId) => {
    delete newData.id;
    delete newData.name;
    if (taxonomyId !== "risk") {
      /**
       * In case of risk taxonomy, code will not reach here.
       */
      let taxonomyTableData = _getTableData();
      taxonomyTableData[taxonomyId].data[id] = newData;
      _setTableData(taxonomyTableData);
    }
  };

  const _deleteFromTaxonomyTableData = (id, oldData, taxonomyId) => {
    oldData && delete oldData.id;
    oldData && delete oldData.name;
    if (taxonomyId !== "risk") {
      /**
       * In case of risk taxonomy, code will not reach here.
       */
      let taxonomyTableData = _getTableData();
      if (taxonomyTableData && taxonomyTableData[taxonomyId]) {
        delete taxonomyTableData[taxonomyId].data[id];
        _setTableData(taxonomyTableData);
      }
    }
  };

  const _handleRowAddedToTable = (newData, taxonomyId) => {
    const uuid = _getNewUUID();
    _updateMasterListEntry(uuid, newData.name);
    _updateTaxonomyTableData(uuid, newData, taxonomyId);
  };

  const _handleRowUpdatedInTable = (newData, oldData, taxonomyId) => {
    if (!isEqual(newData.name, oldData.name)) {
      _updateMasterListEntry(newData.id, newData.name);
    }
    _updateTaxonomyTableData(newData.id, newData, taxonomyId);
  };

  const _handleRowDeletedInTable = (id, oldData, taxonomyId) => {
    _deleteFromTaxonomyTableData(id, oldData, taxonomyId);
    _deleteMasterListEntry(id);
    _deleteFromTaxonomyTree(id, taxonomyId);
    // TODO: Delete id from mappings as well
  };

  const _getMapping = (src, dest) => {
    const mappingData = _getMappingData();
    if (isEmpty(mappingData)) {
      return {};
    }
    let mappings = mappingData[src + '-' + dest];
    if (isEmpty(mappings)) {
      return {};
    }
    let sources = [];
    forEach(mappings, (values, key) => {
      if (_getMasterListEntry(key)) {
        let destinations = [];
        forEach(values, value => {
          if (_getMasterListEntry(value)) {
            destinations.push({
              id: value,
              label: _getMasterListEntry(value),
            });
          }
        });
        sources.push({
          id: key,
          label: _getMasterListEntry(key),
          mappings: destinations
        });
      }
    });
    return sources;
    /*
    return map(mappings, (values, key) => {
      return {
        id: key,
        label: _getMasterListEntry(key),
        mappings: map(values, value => {
          return {
            id: value,
            label: _getMasterListEntry(value),
          };
        })
      }
    });
    */
  };

  const _traverseTreeRecursively = (children, leafNodeIds) => {
    forEach(children, child => {
      if (isEmpty(child.children)) {
        leafNodeIds.push(child.id);
      } else {
        _traverseTreeRecursively(child.children, leafNodeIds);
      }
    });
  };

  const _getAvailableAndSelectedMappings = (srcId, src, dest) => {
    const mappingData = _getMappingData();
    let selectedIds = mappingData[src + '-' + dest][srcId];
    let selected = [];
    let available = [];
    let leafNodeIds = [];
    const taxonomy = _getTaxonomy();

    _traverseTreeRecursively(taxonomy[dest].children, leafNodeIds);
    forEach(leafNodeIds, id => {
      const node = {
        id: id,
        label: _getMasterListEntry(id)
      };
      if (includes(selectedIds, id)) {
        selected.push(node);
      } else {
        available.push(node);
      }
    });
    return {
      selected,
      available
    };
  };

  const _saveSelectedMappings = (srcId, selectedIds, src, dest) => {
    let mappingData = _getMappingData();
    mappingData[src + '-' + dest][srcId] = selectedIds;
    _setMappingData(mappingData);
  };

  const _modifyParameters = (newParametersData) => {
    const parametersData = _getParameterData();

    forEach(parametersData, (oldParam, taxonomyId) => {
      if (taxonomyId === "controlSensitivityDelta" || taxonomyId === "useDevicePrevalencyScores") {
        // No values to modify for these parameters.
        return;
      }
      const newParam = newParametersData[taxonomyId];
      if (isEqual(oldParam, newParam)) {
        // If the parameters haven't changed, return.
        return;
      }
      let type = taxonomyId;
      if (taxonomyId === "controlImplementation" || taxonomyId === "controlEffectiveness") {
        type = "control";
      }
      let taxonomyTableData = _getTableData();
      let data = taxonomyTableData[type].data;
      forEach(data, (values, id) => {
        forEach(values, (oldValue, key) => {
          if (type === "control") {
            // For controls, controlImplementation is implScore
            // and controlEffectiveness is effScore.
            if (taxonomyId === "controlImplementation" && key === "effScore") {
              return;
            }
            if (taxonomyId === "controlEffectiveness" && key === "implScore") {
              return;
            }
          }
          let oldMin = oldParam.min;
          let oldMax = oldParam.max;
          let newMin = newParam.min;
          let newMax = newParam.max;
          data[id][key] = (((oldValue - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin
        });
      });
      _setTableData(taxonomyTableData);
    });

    _setParameterData(newParametersData);
  };

  const _getParametersByType = type => {
    const parametersData = _getParameterData();

    if (type === "control") {
      return {
        controlImplementation: parametersData.controlImplementation,
        controlEffectiveness: parametersData.controlEffectiveness,
      };
    } else {
      return parametersData[type];
    }
  };

  const _getSingularLabelByType = type => {
    switch (type) {
      case "asset":
        return "Asset";
      case "action":
        return "Action";
      case "vulnerability":
        return "Vulnerability";
      case "property":
        return "Property";
      case "control":
        return "Control";
      case "device":
        return "Device";
      case "risk":
        return "Risk";
      default:
        return "";
    }
  };

  const _getPluralLabelByType = type => {
    switch (type) {
      case "asset":
        return "Assets";
      case "action":
        return "Actions";
      case "vulnerability":
        return "Vulnerabilities";
      case "property":
        return "Properties";
      case "control":
        return "Controls";
      case "device":
        return "Devices";
      case "risk":
        return "Risks";
      default:
        return "";
    }
  };

  const _getAssetRequest = () => {
    const tableData = cloneDeep(_getTableData());
    const assetData = tableData["asset"];

    const metadata = {
      "FIELD1": "Asset ID",
      "FIELD2": "Asset Name",
      "FIELD3": "Asset Category",
      "Threat Actor": "Asset Subcategory"
    };

    const columns = assetData.columnSequence;
    forEach(columns, column => {
      const columnName = _getMasterListEntry(column);
      metadata[columnName] = "Asset Likelihood Score";
    });

    const data = [metadata];

    const values = assetData.data;
    forEach(values, (value, id) => {
      const dataItem = {
        "FIELD1": id,
        "FIELD2": _getMasterListEntry(id),
        // TODO: Asset Category
        "FIELD3": "",
        // TODO: Asset Subcategory
        "Threat Actor": ""
      };
      forEach(columns, column => {
        const columnName = _getMasterListEntry(column);
        dataItem[columnName] = value[column];
      });
      data.push(dataItem);
    });

    return {
      csvname: "assets",
      data
    };
  };

  const _getActionRequest = () => {
    const tableData = cloneDeep(_getTableData());
    const actionData = tableData["asset"];

    const metadata = {
      "FIELD1": "Action ID",
      "FIELD2": "Action Name",
      "FIELD3": "Action Mechanism",
      "Threat Actor": "Action Category"
    };

    const columns = actionData.columnSequence;
    forEach(columns, column => {
      const columnName = _getMasterListEntry(column);
      metadata[columnName] = "Action Likelihood Score";
    });

    const data = [metadata];

    const values = actionData.data;
    forEach(values, (value, id) => {
      const dataItem = {
        "FIELD1": id,
        "FIELD2": _getMasterListEntry(id),
        // TODO: Action Mechanism
        "FIELD3": "",
        // TODO: Action Category
        "Threat Actor": ""
      };
      forEach(columns, column => {
        const columnName = _getMasterListEntry(column);
        dataItem[columnName] = value[column];
      });
      data.push(dataItem);
    });

    return {
      csvname: "actions",
      data
    };
  };

  const _getVulnerabilityRequest = () => {
    const tableData = cloneDeep(_getTableData());
    const vulnerabilityData = tableData["vulnerability"];

    const data = [];

    const values = vulnerabilityData.data;
    forEach(values, (value, id) => {
      const dataItem = {
        "Vulnerability ID": id,
        "Vulnerability Name": _getMasterListEntry(id),
        // TODO: Attack Layer
        "Attack Layer": "",
        // TODO: Vulnerability Category
        "Vulnerability Category": "",
        "Vulnerability Prevalency Score": value.vulPrevScore
      };
      data.push(dataItem);
    });

    return {
      csvname: "vulnerabilities",
      data
    };
  };

  const _getPropertyRequest = () => {
    const tableData = cloneDeep(_getTableData());
    const propertyData = tableData["property"];

    const data = [];

    const values = propertyData.data;
    forEach(values, (value, id) => {
      const dataItem = {
        "Property ID": id,
        "Property Name": _getMasterListEntry(id),
        // TODO: High Level
        "High Level": "",
        // TODO: Vulnerability Category
        "Low Level": "",
        "Impact Score": value.propImpactScore
      };
      data.push(dataItem);
    });

    return {
      csvname: "properties",
      data
    };
  };

  const _getControlRequest = () => {
    const tableData = cloneDeep(_getTableData());
    const controlData = tableData["control"];

    const data = [];

    const columns = controlData.columnSequence;
    const values = controlData.data;
    forEach(values, (value, id) => {
      const dataItem = {
        "Control ID": id,
        "Control Name": _getMasterListEntry(id)
      };
      forEach(columns, column => {
        const columnName = _getMasterListEntry(column);
        dataItem[columnName] = value[column];
      });
      data.push(dataItem);
    });

    return {
      csvname: "controls",
      data
    };
  };

  const _getDeviceRequest = () => {
    const tableData = cloneDeep(_getTableData());
    const deviceData = tableData["device"];

    const data = [];

    const values = deviceData.data;
    forEach(values, (value, id) => {
      const dataItem = {
        "Device ID": id,
        "Device Name": _getMasterListEntry(id),
        // TODO: Device Class
        "Device Class": "",
        // TODO: Device Subclass
        "Device Subclass": "",
        "Device Prevalency Score": value.devPrevScore
      };
      data.push(dataItem);
    });

    return {
      csvname: "devices",
      data
    };
  };

  const _getRiskRequest = () => {
    const taxonomy = _getTaxonomy();
    const risks = taxonomy.risk.children;

    const data = [];

    forEach(risks, risk => {
      data.push({
        "Risk ID": risk.id,
        "Risk Name": _getMasterListEntry(risk.id)
      });
    });

    return {
      csvname: "risks",
      data
    };
  };

  const _getParametersRequest = () => {
    const parametersData = _getParameterData();
    const useDevicePrevalencyScores = parametersData.useDevicePrevalencyScores ? "1" : "0";

    return {
      "csvname": "parameters",
      "data": [
        {
          "Use Device Prevalency Scores": "Control Sensitivity Delta",
          [useDevicePrevalencyScores]: parametersData.controlSensitivityDelta,
          "FIELD3": null
        },
        {
          "Use Device Prevalency Scores": "Asset Likelihood Score Range",
          [useDevicePrevalencyScores]: parametersData.asset.min,
          "FIELD3": parametersData.asset.max
        },
        {
          "Use Device Prevalency Scores": "Action Likelihood Score Range",
          [useDevicePrevalencyScores]: parametersData.action.min,
          "FIELD3": parametersData.action.max
        },
        {
          "Use Device Prevalency Scores": "Vulnerability Prevalency Score Range",
          [useDevicePrevalencyScores]: parametersData.vulnerability.min,
          "FIELD3": parametersData.vulnerability.max
        },
        {
          "Use Device Prevalency Scores": "Impact Score Range",
          [useDevicePrevalencyScores]: parametersData.property.min,
          "FIELD3": parametersData.property.max
        },
        {
          "Use Device Prevalency Scores": "Device Prevalency Score Range",
          [useDevicePrevalencyScores]: parametersData.device.min,
          "FIELD3": parametersData.device.max
        },
        {
          "Use Device Prevalency Scores": "Control Implementation Score Range",
          [useDevicePrevalencyScores]: parametersData.controlImplementation.min,
          "FIELD3": parametersData.controlImplementation.max
        },
        {
          "Use Device Prevalency Scores": "Control Effectiveness Score Range",
          [useDevicePrevalencyScores]: parametersData.controlEffectiveness.min,
          "FIELD3": parametersData.controlEffectiveness.max
        },
        {
          "Use Device Prevalency Scores": "Risk Score Range",
          [useDevicePrevalencyScores]: parametersData.risk.min,
          "FIELD3": parametersData.risk.max
        }
      ]
    };
  };

  const _getMapRequest = (mappingId, srcName, csvname) => {
    const mappingData = _getMappingData();
    const mappings = mappingData[mappingId];
    const data = [];
    forEach(mappings, (values, id) => {
      const dataItem = {
        [`${srcName} ID`]: id,
        [`${srcName} Name`]: _getMasterListEntry(id)
      };
      let n = 3;
      forEach(values, value => {
        dataItem[`FIELD${n++}`] = value;
      });
      data.push(dataItem);
    });

    return {
      csvname,
      data
    };
  };

  const _calculateResults = () => {
    const assetRequest = _getAssetRequest();
    const actionRequest = _getActionRequest();
    const vulnerabilityRequest = _getVulnerabilityRequest();
    const propertyRequest = _getPropertyRequest();
    const controlRequest = _getControlRequest();
    const deviceRequest = _getDeviceRequest();
    const riskRequest = _getRiskRequest();
    const parametersRequest = _getParametersRequest();
    const a2aMapRequest = _getMapRequest("action-asset", "Action", "a2aMap");
    const c2vMapRequest = _getMapRequest("control-vulnerability", "Control", "c2vMap");
    const d2vMapRequest = _getMapRequest("device-vulnerability", "Device", "d2vMap");
    const r2cMapRequest = _getMapRequest("risk-control", "Risk", "r2cMap");
    const r2vMapRequest = _getMapRequest("risk-vulnerability", "Risk", "r2vMap");
    const v2aMapRequest = _getMapRequest("vulnerability-action", "Vulnerability", "v2aMap");
    const v2pMapRequest = _getMapRequest("vulnerability-property", "Vulnerability", "v2pMap");

    const datarequest = map(
      [assetRequest, actionRequest, vulnerabilityRequest, propertyRequest, controlRequest, deviceRequest, riskRequest,
        parametersRequest, a2aMapRequest, c2vMapRequest, d2vMapRequest, r2cMapRequest, r2vMapRequest, v2aMapRequest,
        v2pMapRequest],
      inputfile => {
        return {inputfile};
      });

    // postRequest("jsontocsv", {datarequest}, ResultStore.processAndSetCalculatedResults);
    postRequest("jsontocsv", {datarequest}, response => console.log(response));
  };

  return {

    getNewUUID: () => {
      return _getNewUUID();
    },

    getTaxonomiesAndMasterListFromServer: callback => {
      _getTaxonomiesAndMasterListFromServer(callback);
    },

    getTaxonomyTableDataFromServer: callback => {
      _getTaxonomyTableDataFromServer(callback);
    },

    getMappingDataFromServer: callback => {
      _getMappingDataFromServer(callback);
    },

    getTaxonomyTree: () => {
      return _getTaxonomyTree();
    },

    getMasterListEntry: id => {
      return _getMasterListEntry(id);
    },

    updateMasterListEntry: (id, label) => {
      _updateMasterListEntry(id, label);
    },

    getNewChildName: () => {
      return "Untitled " + childCounter++;
    },

    addChildToHierarchy: (mainTaxonomy, parentId, childId) => {
      _addChildToHierarchy(mainTaxonomy, parentId, childId);
    },

    getTaxonomyTableData: taxonomyId => {
      return _getTaxonomyTableData(taxonomyId);
    },

    handleRowAddedToTable: (newData, taxonomyId) => {
      _handleRowAddedToTable(newData, taxonomyId);
    },

    handleRowUpdatedInTable: (newData, oldData, taxonomyId) => {
      _handleRowUpdatedInTable(newData, oldData, taxonomyId);
    },

    handleRowDeletedInTable: (id, oldData, taxonomyId) => {
      _handleRowDeletedInTable(id, oldData, taxonomyId);
    },

    shouldAllowAddRow: taxonomyId => {
      return includes(allowAddRowAndEditNameTaxonomies, taxonomyId);
    },

    getMapping: (src, dest) => {
      return _getMapping(src, dest);
    },

    getAvailableAndSelectedMappings: (srcId, src, dest) => {
      return _getAvailableAndSelectedMappings(srcId, src, dest);
    },

    saveSelectedMappings: (srcId, selectedIds, src, dest) => {
      return _saveSelectedMappings(srcId, selectedIds, src, dest);
    },

    getParameters: () => {
      return _getParameterData();
    },

    modifyParameters: newParametersData => {
      _modifyParameters(newParametersData);
    },

    getParametersByType: type => {
      return _getParametersByType(type);
    },

    getSingularLabelByType: type => {
      return _getSingularLabelByType(type);
    },

    getPluralLabelByType: type => {
      return _getPluralLabelByType(type);
    },

    calculateResults: () => {
      _calculateResults();
    },

    resetAppData: () => {
      _resetData();
    },
  };
};

export default DataStore();
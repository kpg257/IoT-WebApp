import isEmpty from "lodash/isEmpty";
import forEach from "lodash/forEach";

import {getRequest} from "./RequestUtils";

const ResultStore = () => {

  const LOCAL_STORAGE_KEY_RESULT_INHERENT = "overallInherentRisk";
  const LOCAL_STORAGE_KEY_RESULT_RESIDUAL = "overallResidualRisk";
  const LOCAL_STORAGE_KEY_RESULT_RISKS = "risksPerDomain";
  const LOCAL_STORAGE_KEY_RESULT_IMPACT = "vulnerabilityLikelihoodImpact";
  const LOCAL_STORAGE_KEY_RESULT_DATA = "controlSensitivities";
  const LOCAL_STORAGE_KEY_RESULT_DOMAIN = "controlSensitivitiesPerDomain";

  const _getOverallInherentRisk = () => {
    return localStorage.getItem(LOCAL_STORAGE_KEY_RESULT_INHERENT);
  };
  const _setOverallInherentRisk = data => {
    localStorage.setItem(LOCAL_STORAGE_KEY_RESULT_INHERENT, data);
  };
  const _getOverallResidualRisk = () => {
    return localStorage.getItem(LOCAL_STORAGE_KEY_RESULT_RESIDUAL);
  };
  const _setOverallResidualRisk = data => {
    localStorage.setItem(LOCAL_STORAGE_KEY_RESULT_RESIDUAL, data);
  };
  const _getRisksPerDomainData = () => {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_RESULT_RISKS));
  };
  const _setRisksPerDomainData = data => {
    localStorage.setItem(LOCAL_STORAGE_KEY_RESULT_RISKS, JSON.stringify(data));
  };
  const _getVulnerabilityLikelihoodImpactData = () => {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_RESULT_IMPACT));
  };
  const _setVulnerabilityLikelihoodImpactData = data => {
    localStorage.setItem(LOCAL_STORAGE_KEY_RESULT_IMPACT, JSON.stringify(data));
  };
  const _getControlSensitivitiesData = () => {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_RESULT_DATA));
  };
  const _setControlSensitivitiesData = data => {
    localStorage.setItem(LOCAL_STORAGE_KEY_RESULT_DATA, JSON.stringify(data));
  };
  const _getControlSensitivitiesPerDomainData = () => {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_RESULT_DOMAIN));
  };
  const _setControlSensitivitiesPerDomainData = data => {
    localStorage.setItem(LOCAL_STORAGE_KEY_RESULT_DOMAIN, JSON.stringify(data));
  };

  const _getDefaultResultsFromServer = callback => {
    getRequest("result", data => {
      _setOverallInherentRisk(data[LOCAL_STORAGE_KEY_RESULT_INHERENT]);
      _setOverallResidualRisk(data[LOCAL_STORAGE_KEY_RESULT_RESIDUAL]);
      _setRisksPerDomainData(data[LOCAL_STORAGE_KEY_RESULT_RISKS]);
      _setVulnerabilityLikelihoodImpactData(data[LOCAL_STORAGE_KEY_RESULT_IMPACT]);
      _setControlSensitivitiesData(data[LOCAL_STORAGE_KEY_RESULT_DATA]);
      _setControlSensitivitiesPerDomainData(data[LOCAL_STORAGE_KEY_RESULT_DOMAIN]);
      callback && callback();
    });
  };

  const _processAndSetCalculatedResults = response => {
    forEach(response, file => {
      let fileName = Object.keys(file)[0];
      let data = file[fileName];

      switch (fileName) {
        case "CalculatedRisksFullFramework.csv":
          // _setOverallInherentRisk();
          // _setOverallResidualRisk();
          break;
        case "CalculatedRisksPerDomain.csv":
          // _setRisksPerDomainData();
          break;
        case "VulnerabilitiesLikelihoodImpact.csv":
          // _setVulnerabilityLikelihoodImpactData();
          break;
        case "ControlSensitivities.csv":
          // _setControlSensitivitiesData();
          break;
        case "Communications Security Control Sensitivities.csv":
        case "Encryption Control Sensitivities.csv":
        case "Event Logging and Monitoring Sensitivities.csv":
        case "Governance and Accountability Control Sensitivities.csv":
        case "Identity and Access Management Control Sensitivities.csv":
        case "Physical Security Control Sensitivities.csv":
        case "Supplier Security Control Sensitivities.csv":
        case "Systems Security Control Sensitivities.csv":
        case "Threat and Vulnerability Management Control Sensitivities.csv":
          // _setControlSensitivitiesPerDomainData();
          break;
        default:
          console.log("Calculated Result not handled for file name: " + fileName);
          break;
      }
    });
  };

  return {
    areResultsEmpty: () => {
      return isEmpty(_getOverallInherentRisk()) || isEmpty(_getOverallResidualRisk()) ||
        isEmpty(_getRisksPerDomainData()) || isEmpty(_getVulnerabilityLikelihoodImpactData()) ||
        isEmpty(_getControlSensitivitiesData()) || isEmpty(_getRisksPerDomainData());
    },
    getDefaultResultsFromServer: callback => {
      _getDefaultResultsFromServer(callback);
    },
    getOverallInherentRisk: () => {
      return _getOverallInherentRisk();
    },
    getOverallResidualRisk: () => {
      return _getOverallResidualRisk();
    },
    getRisksPerDomainData: () => {
      return _getRisksPerDomainData();
    },
    getVulnerabilityLikelihoodImpactData: () => {
      return _getVulnerabilityLikelihoodImpactData();
    },
    getControlSensitivitiesData: () => {
      return _getControlSensitivitiesData();
    },
    getControlSensitivitiesPerDomainData: () => {
      return _getControlSensitivitiesPerDomainData();
    },
    processAndSetCalculatedResults: () => {
      _processAndSetCalculatedResults();
    },
  };
};

export default ResultStore();
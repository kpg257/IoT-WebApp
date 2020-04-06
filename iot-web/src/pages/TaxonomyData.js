import isEmpty from 'lodash/isEmpty';
import forEach from 'lodash/forEach';

import React, {useState, useEffect} from 'react';

import makeStyles from '@material-ui/core/styles/makeStyles';
import TextField from "@material-ui/core/TextField";

import MaterialTable from "material-table";

import DataStore from "../store/DataStore";

const useStyles = makeStyles({
  table: {
    margin: `20px`,
  },
  numberField: {
    width: `100%`,
  },
  nameField: {
    width: `100%`
  }
});

const TaxonomyData = props => {

  const classes = useStyles();

  const taxonomyId = props.match.params.id;

  const allowModifyColumnsTaxonomies = ['asset', 'action'];

  const parameters = DataStore.getParametersByType(taxonomyId);

  const getNumberField = (props, min, max) =>
    <TextField
      className={classes.numberField}
      type="number"
      value={props.value}
      onChange={e => props.onChange(e.target.value)}
      inputProps={{
        min: min,
        max: max,
        step: /*(max - min) / 10*/0.01,
      }}
    />;

  const getMultilineTextField = props =>
    <TextField
      className={classes.nameField}
      type="text"
      value={props.value}
      onChange={e => props.onChange(e.target.value)}
      multiline
    />;

  const modifyNumericColumns = data => {
    forEach(data.columnData, column => {
      if (column.field === "implScore") {
        column.editComponent = props => getNumberField(props, parameters.controlImplementation.min, parameters.controlImplementation.max);
      } else if (column.field === "effScore") {
        column.editComponent = props => getNumberField(props, parameters.controlEffectiveness.min, parameters.controlEffectiveness.max);
      } else if (column.field === "name") {
        column.editComponent = props => getMultilineTextField(props);
      } else if (column.type === "numeric") {
        column.editComponent = props => getNumberField(props, parameters.min, parameters.max);
      }
    });
  };

  const [state, setState] = useState({
    columnData: [],
    rowData: [],
  });

  const setTableDataAndResolve = () => {
    let data = DataStore.getTaxonomyTableData(taxonomyId);
    modifyNumericColumns(data);
    setState(data);
  };

  useEffect(() => {
    let data = DataStore.getTaxonomyTableData(taxonomyId);
    if (!isEmpty(data)) {
      modifyNumericColumns(data);
      setState(data);
    } else {
      DataStore.getTaxonomyTableDataFromServer(() => {
        let data = DataStore.getTaxonomyTableData(taxonomyId);
        modifyNumericColumns(data);
        setState(data);
      });
    }
  }, [taxonomyId]);

  const isInputDataValid = newData => {
    if (taxonomyId === "control") {
      const implScore = +newData.implScore;
      if (implScore < parameters.controlImplementation.min || implScore > parameters.controlImplementation.max) {
        alert(`Value for implementation score should be between ${parameters.controlImplementation.min} and ${parameters.controlImplementation.max}`);
        return false;
      }
      const effScore = +newData.effScore;
      if (effScore < parameters.controlEffectiveness.min || effScore > parameters.controlEffectiveness.max) {
        alert(`Value for effectiveness score should be between ${parameters.controlEffectiveness.min} and ${parameters.controlEffectiveness.max}`);
        return false;
      }
    } else {
      let isError = false;
      forEach(newData, (value, key) => {
        if (key !== "id" && key !== "name") {
          const numValue = +value;
          if (numValue < parameters.min || numValue > parameters.max) {
            alert(`Value for scores should be between ${parameters.min} and ${parameters.max}`);
            isError = true;
            return false;
          }
        }
      });
      if (isError) {
        return false;
      }
    }
    return true;
  };

  const onRowAdd = newData =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!isInputDataValid(newData)) {
          reject();
          return;
        }
        DataStore.handleRowAddedToTable(newData, taxonomyId);
        setTableDataAndResolve();
        resolve();
      }, 1000)
    });

  const onRowUpdate = (newData, oldData) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!isInputDataValid(newData)) {
          reject();
          return;
        }
        DataStore.handleRowUpdatedInTable(newData, oldData, taxonomyId);
        setTableDataAndResolve();
        resolve();
      }, 1000)
    });

  const onRowDelete = oldData =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        DataStore.handleRowDeletedInTable(oldData.id, oldData, taxonomyId);
        setTableDataAndResolve();
        resolve()
      }, 1000)
    });

  return (
    <div className={classes.table}>
      <MaterialTable
        columns={state.columnData}
        data={state.rowData}
        options={{
          paging: false,
          showTitle: false,
          searchFieldAlignment: "left",
          actionsColumnIndex: -1,
        }}
        editable={{
          onRowAdd: DataStore.shouldAllowAddRow(taxonomyId) ? onRowAdd : undefined,
          onRowUpdate: onRowUpdate,
          onRowDelete: onRowDelete,
        }}
      />
    </div>
  );
};

export default TaxonomyData;
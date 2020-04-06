import React, {useState} from 'react';

import makeStyles from "@material-ui/core/styles/makeStyles";

import TransferList from "../views/TransferList";

import {parse} from "query-string";

import DataStore from "../store/DataStore";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles({
  root: {
    margin: `20px`,
    padding: `5px`,
  },
  url: {
    textDecoration: `none`,
    color: `inherit`,
  },
  title: {},
});

const ModifyMapping = props => {

  const classes = useStyles();

  const params = parse(props.location.search);
  const sourceId = params.id;
  const source = params.src;
  const destination = params.dest;

  const {selected, available} = DataStore.getAvailableAndSelectedMappings(sourceId, source, destination);
  const sourceTitle = "Mapping for " + DataStore.getSingularLabelByType(source) + ": " + DataStore.getMasterListEntry(sourceId);
  const destinationLabel = DataStore.getPluralLabelByType(destination);

  const [state] = useState({
    selected,
    available,
  });

  const onSaveClicked = (selectedIdsForSave) => {
    DataStore.saveSelectedMappings(sourceId, selectedIdsForSave, source, destination);
  };

  return (
    <div className={classes.root}>
      <Typography variant="h6" className={classes.title}>
        {sourceTitle}
      </Typography>
      <TransferList
        left={state.available}
        right={state.selected}
        navigateBackURL={`/mapping?src=${source}&dest=${destination}`}
        onSaveHandler={onSaveClicked}
        destinationLabel={destinationLabel}
      />
    </div>
  );

};

export default ModifyMapping;
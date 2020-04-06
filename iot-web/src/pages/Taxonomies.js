import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';

import React, {useState, useEffect} from 'react';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import TaxonomyTreePaper from "../views/TaxonomyTreePaper";

import DataStore from "../store/DataStore";

const Taxonomies = () => {

  const [state, setState] = useState({
    asset: {},
    action: {},
    vulnerability: {},
    property: {},
    menuAnchorElement: null,
    selectedTaxonomyId: null,
    selectedTaxonomyLabel: null,
    dialogOpen: false,
  });

  useEffect(() => {
    let taxonomies = DataStore.getTaxonomyTree();

    if (!isEmpty(taxonomies)) {
      setState({
        ...state,
        asset: taxonomies.asset,
        action: taxonomies.action,
        vulnerability: taxonomies.vulnerability,
        property: taxonomies.property,
      });
    } else {
      DataStore.getTaxonomiesAndMasterListFromServer(() => {
        taxonomies = DataStore.getTaxonomyTree();
        setState({
          ...state,
          asset: taxonomies.asset,
          action: taxonomies.action,
          vulnerability: taxonomies.vulnerability,
          property: taxonomies.property,
        });
      });
    }
  }, []);

  const handleMenuClosed = () => {
    setState({
      ...state,
      menuAnchorElement: null,
      selectedTaxonomyId: null,
      selectedTaxonomyLabel: null,
    });
  };

  const handleMenuOpened = (event, id, label) => {
    event.preventDefault();
    event.stopPropagation();
    setState({
      ...state,
      menuAnchorElement: event.currentTarget,
      selectedTaxonomyId: id,
      selectedTaxonomyLabel: label,
    });
  };

  const handleEditLabelClicked = () => {
    setState({
      ...state,
      dialogOpen: true,
      menuAnchorElement: null,
    });
  };

  const handleAddChildClicked = () => {
    const mainTaxonomy = state.selectedTaxonomyId.split("-")[0];
    const newChildId = mainTaxonomy + "-" + DataStore.getNewUUID();
    const newChildLabel = DataStore.getNewChildName();
    DataStore.updateMasterListEntry(newChildId, newChildLabel);
    DataStore.addChildToHierarchy(mainTaxonomy, state.selectedTaxonomyId, newChildId);
    // TODO: Add an entry in TableData for newly created child.
    // TODO: If the child is the first child of the parent, delete the entry of the parent from TableData.
    const taxonomies = DataStore.getTaxonomyTree();
    setState({
      ...state,
      asset: taxonomies.asset,
      action: taxonomies.action,
      vulnerability: taxonomies.vulnerability,
      property: taxonomies.property,
      menuAnchorElement: null,
    });
  };

  const handleDeleteClicked = () => {
    const mainTaxonomy = state.selectedTaxonomyId.split("-")[0];
    DataStore.handleRowDeletedInTable(state.selectedTaxonomyId, undefined, mainTaxonomy);
    const taxonomies = DataStore.getTaxonomyTree();
    setState({
      ...state,
      asset: taxonomies.asset,
      action: taxonomies.action,
      vulnerability: taxonomies.vulnerability,
      property: taxonomies.property,
      menuAnchorElement: null,
    });
  };

  const handleDialogClose = () => {
    setState({
      ...state,
      dialogOpen: false,
    });
  };

  const handleLabelChanged = (event) => {
    setState({
      ...state,
      selectedTaxonomyLabel: event.target.value,
    });
  };

  const handleLabelSaveClicked = () => {
    DataStore.updateMasterListEntry(state.selectedTaxonomyId, state.selectedTaxonomyLabel);
    const taxonomies = DataStore.getTaxonomyTree();
    setState({
      ...state,
      asset: taxonomies.asset,
      action: taxonomies.action,
      vulnerability: taxonomies.vulnerability,
      property: taxonomies.property,
      selectedTaxonomyId: null,
      selectedTaxonomyLabel: null,
      dialogOpen: false,
    });
  };

  return (
    <div>
      {map([state.asset, state.action, state.vulnerability, state.property], (taxonomy, index) => {
        return <TaxonomyTreePaper key={index} taxonomy={taxonomy} menuOpenHandler={handleMenuOpened}/>;
      })}
      <Menu
        anchorEl={state.menuAnchorElement}
        open={Boolean(state.menuAnchorElement)}
        onClose={handleMenuClosed}
      >
        <MenuItem onClick={handleEditLabelClicked}>Edit Label</MenuItem>
        <MenuItem onClick={handleAddChildClicked}>Add Child</MenuItem>
        <MenuItem onClick={handleDeleteClicked}>Delete</MenuItem>
      </Menu>
      <Dialog open={!!state.dialogOpen} onClose={handleDialogClose} fullWidth>
        <DialogTitle>Edit Label</DialogTitle>
        <DialogContent>
          <TextField
            required
            defaultValue={state.selectedTaxonomyLabel}
            onChange={handleLabelChanged}
            margin="normal"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLabelSaveClicked} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Taxonomies;
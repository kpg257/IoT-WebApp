import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';

import React, {useState, useEffect} from 'react';
import {NavLink} from "react-router-dom";

import makeStyles from "@material-ui/core/styles/makeStyles";
import Paper from "@material-ui/core/Paper";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import TreeView from "@material-ui/lab/TreeView";
import TreeItem from '@material-ui/lab/TreeItem';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';

import {parse} from 'query-string'

import DataStore from "../store/DataStore";

const useStyles = makeStyles({
  paper: {
    margin: `20px`,
    padding: `5px`,
  },
  taxonomy: {
    margin: `5px`,
  },
  url: {
    textDecoration: `none`,
    color: `inherit`,
  },
  source: {
    margin: `10px 0`,
  },
  treeLabel: {
    textAlign: `start`,
  },
  list: {
    padding: 0,
  },
  listItem: {
    padding: 0,
  },
  listIcon: {
    minWidth: `24px`,
    color: `black`,
  },
  listText: {
    margin: 0,
  },
});


const Mappings = props => {

  const classes = useStyles();

  const params = parse(props.location.search);

  const source = params.src;
  const destination = params.dest;

  const [state, setState] = useState({
    mappings: [],
    menuAnchorElement: null,
    selectedSourceId: null,
  });

  useEffect(() => {
    const setMappingInState = mapping => setState({
      ...state,
      mappings: mapping,
    });

    let data = DataStore.getMapping(source, destination);
    if (isEmpty(data)) {
      DataStore.getMappingDataFromServer(() => {
        let data = DataStore.getMapping(source, destination);
        setMappingInState(data);
      });
    } else {
      setMappingInState(data);
    }
  }, [source, destination]);

  const renderMappings = () => {
    return map(state.mappings, src => {
      return (
        <TreeItem
          key={src.id}
          nodeId={src.id}
          label={src.label}
          className={`${classes.source} ${classes.treeLabel}`}
          onContextMenu={event => handleMenuOpened(event, src.id)}
        >
          <List className={classes.list}>
            {map(src.mappings, mapping => {
              return (
                <ListItem key={mapping.id} className={classes.listItem}>
                  <ListItemIcon className={classes.listIcon}>
                    <RadioButtonUncheckedIcon style={{width: `0.5em`, height: `0.5em`}}/>
                  </ListItemIcon>
                  <ListItemText className={classes.listText} primary={mapping.label}/>
                </ListItem>
                // <TreeItem key={mapping.id} nodeId={mapping.id} label={mapping.label} className={classes.treeLabel}/>
              );
            })}
          </List>
        </TreeItem>
      );
    });
  };

  const handleMenuOpened = (event, id) => {
    event.preventDefault();
    event.stopPropagation();
    setState({
      ...state,
      menuAnchorElement: event.currentTarget,
      selectedSourceId: id,
    });
  };

  const handleMenuClosed = () => {
    setState({
      ...state,
      menuAnchorElement: null,
      selectedSourceId: null,
    });
  };

  const getModifyMappingURL = () => {
    return `/mapping/edit?id=${state.selectedSourceId}&src=${source}&dest=${destination}`;
  };

  return (
    <div>
      <Paper className={classes.paper}>
        <TreeView defaultCollapseIcon={<ExpandMoreIcon/>} defaultExpandIcon={<ChevronRightIcon/>}>
          {renderMappings()}
        </TreeView>
      </Paper>
      <Menu
        anchorEl={state.menuAnchorElement}
        open={Boolean(state.menuAnchorElement)}
        onClose={handleMenuClosed}
      >
        <NavLink to={getModifyMappingURL() || ''} className={classes.url}>
          <MenuItem>
            Modify Mapping
          </MenuItem>
        </NavLink>
      </Menu>
    </div>
  );
};

export default Mappings;
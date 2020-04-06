import map from "lodash/map";
import isEmpty from "lodash/isEmpty";

import React from 'react';
import PropTypes from 'prop-types';
import {NavLink} from "react-router-dom";

import makeStyles from '@material-ui/core/styles/makeStyles';
import Paper from "@material-ui/core/Paper";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListItem from "@material-ui/core/ListItem";

import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

const useStyles = makeStyles({
  paper: {
    margin: `20px`,
    padding: `5px`,
  },
  url: {
    textDecoration: `none`,
    color: `inherit`,
    fontSize: `larger`,
    fontWeight: `bold`,
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
    textAlign: `start`,
  },
  taxonomy: {
    textAlign: `start`,
  }
});

const TaxonomyTreePaper = (props) => {

  const classes = useStyles();

  /**
   * Source: https://stackoverflow.com/a/32851198
   */
  const romanize = num => {
    let lookup = {M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1};
    let roman = '';
    for (let i in lookup) {
      while (num >= lookup[i]) {
        roman += i;
        num -= lookup[i];
      }
    }
    return roman;
  };

  const getLabel = (level, index, taxonomyLabel) => {
    switch (level) {
      case 1:
        return romanize(index + 1) + ". " + taxonomyLabel;
      case 2:
        return String.fromCharCode(65 + index) + ". " + taxonomyLabel;
      case 3:
        return (index + 1) + ". " + taxonomyLabel;
      case 4:
        return String.fromCharCode(97 + index) + ". " + taxonomyLabel;
      default:
        return taxonomyLabel;
    }
  };

  const renderChildren = (taxonomies, level) => {
    return map(taxonomies, (taxonomy, index) => renderTaxonomy(taxonomy, level, index));
  };

  const renderTaxonomy = (taxonomy, level, index) => {

    const label = getLabel(level, index, taxonomy.label);

    return (
      isEmpty(taxonomy.children) ?
        <ListItem key={taxonomy.id} className={classes.listItem}>
          <ListItemIcon className={classes.listIcon}>
            <ChevronRightIcon style={{display: `none`}}/>
          </ListItemIcon>
          <ListItemText className={classes.listText} primary={label}
                        onContextMenu={event => props.menuOpenHandler(event, taxonomy.id, taxonomy.label)}/>
        </ListItem>
        :
        <TreeItem key={taxonomy.id} nodeId={taxonomy.id} label={label} className={classes.taxonomy}
                  onContextMenu={event => props.menuOpenHandler(event, taxonomy.id, taxonomy.label)}>
          {renderChildren(taxonomy.children, level + 1)}
        </TreeItem>
    );
  };

  const renderFirstLevelTaxonomy = taxonomy => {
    return (
      <div>
        <NavLink to={`/taxonomies/${taxonomy.id}`} className={classes.url}>
          {taxonomy.label}
        </NavLink>
        {renderChildren(taxonomy.children, 1)}
      </div>
    );
  };

  return (
    <div>
      <Paper className={classes.paper}>
        <TreeView defaultCollapseIcon={<ExpandMoreIcon/>} defaultExpandIcon={<ChevronRightIcon/>}>
          {renderFirstLevelTaxonomy(props.taxonomy)}
        </TreeView>
      </Paper>
    </div>
  );

};

TaxonomyTreePaper.propTypes = {
  taxonomy: PropTypes.object,
  menuOpenHandler: PropTypes.func,
};

export default TaxonomyTreePaper;
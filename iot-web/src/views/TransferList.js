import difference from 'lodash/difference';
import intersection from 'lodash/intersection';
import map from 'lodash/map';

import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {NavLink} from 'react-router-dom';
import {makeStyles} from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles(theme => ({
  root: {
    margin: `auto`,
    width: `auto`,
  },
  paper: {
    width: `40vw`,
    height: `70vh`,
    overflow: 'auto',
  },
  button: {
    margin: `2vh 0`,
  },
  actionButton: {
    margin: `2vw`,
    width: `6vw`,
  },
}));

const TransferList = props => {

  const {navigateBackURL, onSaveHandler, destinationLabel} = props;

  const classes = useStyles();

  const [state, setState] = useState({
    checked: [],
    leftChecked: [],
    rightChecked: [],
    left: props.left,
    right: props.right,
  });

  const handleToggle = value => {
    const currentIndex = state.checked.indexOf(value);
    const newChecked = [...state.checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    const leftChecked = intersection(newChecked, state.left);
    const rightChecked = intersection(newChecked, state.right);

    setState({
      ...state,
      checked: newChecked,
      leftChecked: leftChecked,
      rightChecked: rightChecked,
    });
  };

  const handleAllRight = () => {
    setState({
      ...state,
      leftChecked: [],
      left: [],
      right: state.right.concat(state.left),
    });
  };

  const handleCheckedRight = () => {
    setState({
      ...state,
      checked: difference(state.checked, state.leftChecked),
      leftChecked: [],
      left: difference(state.left, state.leftChecked),
      right: state.right.concat(state.leftChecked),
    });
  };

  const handleCheckedLeft = () => {
    setState({
      ...state,
      checked: difference(state.checked, state.rightChecked),
      rightChecked: [],
      left: state.left.concat(state.rightChecked),
      right: difference(state.right, state.rightChecked),
    });
  };

  const handleAllLeft = () => {
    setState({
      ...state,
      rightChecked: [],
      left: state.left.concat(state.right),
      right: [],
    });
  };

  const customList = (items, header) => (
    <Paper className={classes.paper}>
      <List subheader={<ListSubheader>{header}</ListSubheader>} dense component="div" role="list">
        {items.map(item => {
          const labelId = `transfer-list-item-${item.id}-label`;

          return (
            <ListItem key={item.id} role="listitem" button onClick={() => handleToggle(item)}>
              <ListItemIcon>
                <Checkbox
                  checked={state.checked.indexOf(item) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{'aria-labelledby': labelId}}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={item.label}/>
            </ListItem>
          );
        })}
        <ListItem/>
      </List>
    </Paper>
  );

  const transferList = () => (
    <Grid container spacing={2} justify="center" alignItems="center" className={classes.root}>
      <Grid item>{customList(state.left, "Available " + destinationLabel)}</Grid>
      <Grid item>
        <Grid container direction="column" alignItems="center">
          <Button
            variant="outlined"
            size="small"
            className={classes.button}
            onClick={handleAllRight}
            disabled={state.left.length === 0}
            aria-label="move all right"
          >
            &gt;&gt;
          </Button>
          <Button
            variant="outlined"
            size="small"
            className={classes.button}
            onClick={handleCheckedRight}
            disabled={state.leftChecked.length === 0}
            aria-label="move selected right"
          >
            &gt;
          </Button>
          <Button
            variant="outlined"
            size="small"
            className={classes.button}
            onClick={handleCheckedLeft}
            disabled={state.rightChecked.length === 0}
            aria-label="move selected left"
          >
            &lt;
          </Button>
          <Button
            variant="outlined"
            size="small"
            className={classes.button}
            onClick={handleAllLeft}
            disabled={state.right.length === 0}
            aria-label="move all left"
          >
            &lt;&lt;
          </Button>
        </Grid>
      </Grid>
      <Grid item>{customList(state.right, "Selected " + destinationLabel)}</Grid>
    </Grid>
  );

  return (
    <div>
      {transferList()}
      <NavLink to={navigateBackURL}>
        <Button variant="contained" color="secondary" className={classes.actionButton}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          className={classes.actionButton}
          onClick={() => onSaveHandler(map(state.right, 'id'))}
        >
          Save
        </Button>
      </NavLink>
    </div>
  );
};

TransferList.propTypes = {
  left: PropTypes.array,
  right: PropTypes.array,
  navigateBackURL: PropTypes.string,
  onSaveHandler: PropTypes.func,
  destinationLabel: PropTypes.string,
};

export default TransferList;
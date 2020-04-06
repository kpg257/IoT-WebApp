import isNumber from 'lodash/isNumber';

import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Switch from "@material-ui/core/Switch";

const useStyles = makeStyles({
  paramsContainer: {
    padding: `0 20px`,
    width: `20vw`,
  },
  titleAndBtnContainer: {
    textAlign: `center`,
  },
  title: {
    margin: `20px 0 10px 0`,
  },
  applyBtn: {
    margin: `10px 0`,
  },
  scoreContainer: {
    margin: `20px 0`,
  },
  minMaxField: {
    margin: `0 10px`,
    width: `5vw`,
  }
});

const TITLE = "Parameters";
const BTN_APPLY = "Apply";
const HEADER_ASSET = "Asset Likelihood Score Range";
const HEADER_ACTION = "Action Likelihood Score Range";
const HEADER_VULNERABILITY = "Vulnerability Prevalency Score Range";
const HEADER_PROPERTY = "Impact Score Range";
const HEADER_DEVICE = "Device Prevalency Score Range";
const HEADER_CONTROL_IMPLEMENTATION = "Control Implementation Score Range";
const HEADER_CONTROL_EFFECTIVENESS = "Control Effectiveness  Score Range";
const HEADER_RISK = "Risk Score Range";
const HEADER_CONTROL_SENSITIVITY_DELTA = "Control Sensitivity Delta";
const HEADER_USE_DEVICE_PREVALENCY_SCORES = "Use Device Prevalency Scores";

const Parameters = props => {

  const classes = useStyles();

  const {parametersData, parameterChangeHandler, onSaveHandler} = props;

  const renderScoreContainer = (title, type) => {
    let step = 0.01;
    /*if (isNumber(parametersData[type].max) && isNumber(parametersData[type].min)) {
      step = ((parametersData[type].max - parametersData[type].min) / 100).toFixed(2);
      if (step == 0) {
        step = 0.1;
      }
    }*/
    return (
      <div className={classes.scoreContainer}>
        <Typography>
          {title}
        </Typography>
        <TextField
          className={classes.minMaxField}
          label="Min"
          value={parametersData[type].min}
          onChange={(event) => parameterChangeHandler(type, "min", event.target.value)}
          type="number"
          inputProps={{
            min: 0,
            max: isNumber(parametersData[type].max) ? parametersData[type].max : undefined,
            step: step,
          }}
          margin="normal"
        />
        <TextField
          className={classes.minMaxField}
          label="Max"
          value={parametersData[type].max}
          onChange={(event) => parameterChangeHandler(type, "max", event.target.value)}
          type="number"
          inputProps={{
            min: isNumber(parametersData[type].min) ? parametersData[type].min : 0,
            step: step,
          }}
          margin="normal"
        />
      </div>
    );
  };

  const renderControlSensitivityDelta = () => {
    return (
      <div className={classes.scoreContainer}>
        <Typography>
          {HEADER_CONTROL_SENSITIVITY_DELTA}
        </Typography>
        <TextField
          className={classes.minMaxField}
          label="Value"
          value={parametersData.controlSensitivityDelta}
          onChange={(event) => parameterChangeHandler("controlSensitivityDelta", null, event.target.value)}
          type="number"
          inputProps={{
            min: 0,
            step: 0.01,
          }}
          margin="normal"
        />
      </div>
    );
  };

  const renderUseDevicePrevalencySwitch = () => {
    return (
      <div className={classes.scoreContainer}>
        <Typography>
          {HEADER_USE_DEVICE_PREVALENCY_SCORES}
        </Typography>
        <Switch
          checked={parametersData.useDevicePrevalencyScores}
          onChange={(event) => parameterChangeHandler("useDevicePrevalencyScores", null, event.target.checked)}
        />
      </div>
    );
  };

  return (
    <div className={classes.paramsContainer}>
      <div className={classes.titleAndBtnContainer}>
        <Typography variant="h6" className={classes.title}>
          {TITLE}
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          className={classes.applyBtn}
          onClick={onSaveHandler}
        >
          {BTN_APPLY}
        </Button>
      </div>
      {renderScoreContainer(HEADER_ASSET, "asset")}
      {renderScoreContainer(HEADER_ACTION, "action")}
      {renderScoreContainer(HEADER_VULNERABILITY, "vulnerability")}
      {renderScoreContainer(HEADER_PROPERTY, "property")}
      {renderScoreContainer(HEADER_DEVICE, "device")}
      {renderScoreContainer(HEADER_CONTROL_IMPLEMENTATION, "controlImplementation")}
      {renderScoreContainer(HEADER_CONTROL_EFFECTIVENESS, "controlEffectiveness")}
      {renderScoreContainer(HEADER_RISK, "risk")}
      {renderControlSensitivityDelta()}
      {renderUseDevicePrevalencySwitch()}
    </div>
  );
};

Parameters.propTypes = {
  parametersData: PropTypes.object,
  parameterChangeHandler: PropTypes.func,
  onSaveHandler: PropTypes.func,
};

export default Parameters;
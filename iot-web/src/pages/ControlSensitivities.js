import React, {useEffect, useState} from 'react';

import makeStyles from "@material-ui/core/styles/makeStyles";
import Paper from "@material-ui/core/Paper";
import {HorizontalBar} from "react-chartjs-2";

import ResultStore from "../store/ResultStore";

import {barChartOptions, getRisksPerDomainDataForChart} from "./ChartConstants";

const useStyles = makeStyles({
  mainContainer: {
    padding: 10
  },
  overallRiskCardContainer: {
    display: `flex`
  },
  overallRiskCard: {
    width: `50%`,
    margin: 10
  },
  chartPaper: {
    margin: 10,
    padding: 10
  }
});

const ControlSensitivities = () => {

  const [state, setState] = useState({
    data: []
  });

  const setStateWithNewData = () => {
    setState({
      data: ResultStore.getControlSensitivitiesData()
    });
  };

  useEffect(() => {
    if (ResultStore.areResultsEmpty()) {
      ResultStore.getDefaultResultsFromServer(setStateWithNewData);
    } else {
      setStateWithNewData();
    }
  }, []);

  const classes = useStyles();

  return (
    <div className={classes.mainContainer}>
      <Paper className={classes.chartPaper}>
        <HorizontalBar
          data={getRisksPerDomainDataForChart(state.data)}
          width={40}
          options={barChartOptions}
        />
      </Paper>
    </div>
  );
};

export default ControlSensitivities;

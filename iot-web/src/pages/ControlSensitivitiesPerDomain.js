import map from "lodash/map";

import React, {useEffect, useState} from 'react';

import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
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

const ControlSensitivitiesPerDomain = () => {

  const [state, setState] = useState({
    data: []
  });

  const setStateWithNewData = () => {
    setState({
      data: ResultStore.getControlSensitivitiesPerDomainData()
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

  const renderRisksPerDomain = () => {
    const data = state.data;
    return (
      <>
        {map(data, item => {
          return (
            <Paper className={classes.chartPaper}>
              <Typography variant="h5" component="h3">
                {item.title}
              </Typography>
              <HorizontalBar
                data={getRisksPerDomainDataForChart(item.data)}
                width={3000 / item.data.length}
                options={barChartOptions}
              />
            </Paper>
          );
        })}
      </>
    );
  };

  return (
    <div className={classes.mainContainer}>
      {renderRisksPerDomain()}
    </div>
  );
};

export default ControlSensitivitiesPerDomain;

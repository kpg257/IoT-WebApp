import forEach from "lodash/forEach";
import includes from "lodash/includes";
import split from "lodash/split";

import React, {useEffect, useState} from 'react';

import makeStyles from "@material-ui/core/styles/makeStyles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import {Bar, Bubble} from "react-chartjs-2";

import ResultStore from "../store/ResultStore";

import {bubbleChartOptions} from "./ChartConstants";

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

const ResultsCalculatedRisks = () => {

  const [state, setState] = useState({
    inherentRisk: 0,
    residualRisk: 0,
    risksPerDomain: [],
    impactData: []
  });

  const setStateWithNewData = () => {
    setState({
      inherentRisk: ResultStore.getOverallInherentRisk(),
      residualRisk: ResultStore.getOverallResidualRisk(),
      risksPerDomain: ResultStore.getRisksPerDomainData(),
      impactData: ResultStore.getVulnerabilityLikelihoodImpactData()
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

  const barChartOptions = {
    scales: {
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Risk Score'
        }
      }],
      xAxes: [{
        ticks: {
          autoSkip: false,
          maxRotation: 90,
          minRotation: 0
        }
      }]
    }
  };


  const renderOverallRiskCards = () => {
    return (
      <div className={classes.overallRiskCardContainer}>
        <Card className={classes.overallRiskCard}>
          <CardContent>
            <Typography variant="h5" component="h2">
              Overall Inherent Risk
            </Typography>
            <Typography variant="body2" component="p">
              {state.inherentRisk}
            </Typography>
          </CardContent>
        </Card>
        <Card className={classes.overallRiskCard}>
          <CardContent>
            <Typography variant="h5" component="h2">
              Overall Residual Risk
            </Typography>
            <Typography variant="body2" component="p">
              {state.residualRisk}
            </Typography>
          </CardContent>
        </Card>
      </div>
    );
  };

  const getRisksPerDomainDataForChart = () => {
    const data = state.risksPerDomain;
    let labels = [];
    let inherentValues = [];
    let residualValues = [];
    forEach(data, item => {
      const {domain, inherentRisk, residualRisk} = item;
      if (includes(domain, " ")) {
        labels.push(split(domain, " "));
      } else {
        labels.push(domain);
      }
      inherentValues.push(inherentRisk);
      residualValues.push(residualRisk);
    });
    return {
      labels: labels,
      datasets: [
        {
          label: "Inherent Risk",
          backgroundColor: "#ccffcc",
          data: inherentValues
        },
        {
          label: "Residual Risk",
          backgroundColor: "#ccf",
          data: residualValues
        }
      ]
    };
  };

  const renderRisksPerDomainChart = () => {
    return (
      <Paper className={classes.chartPaper}>
        <Typography variant="h5" component="h3">
          Risk Scores Per Risk Domain
        </Typography>
        <Bar
          data={getRisksPerDomainDataForChart()}
          width={800}
          options={barChartOptions}
        />
      </Paper>
    );
  };

  const getVulnerabilityLikelihoodImpactDataForChart = () => {
    const data = state.impactData;
    let datasets = [];
    forEach(data, item => {
      datasets.push({
        label: item.vulnerability,
        backgroundColor: "#ffbac7",
        data: [{x: item.likelihood, y: item.impact, r: 8}]
      })
    });
    return {datasets}
  };

  const renderVulnerabilityLikelihoodImpact = () => {
    return (
      <Paper className={classes.chartPaper}>
        <Typography variant="h5" component="h3">
          Vulnerability Risk Matrix
        </Typography>
        <Bubble
          data={getVulnerabilityLikelihoodImpactDataForChart()}
          width={800}
          options={bubbleChartOptions}
        />
      </Paper>
    );
  };

  return (
    <div className={classes.mainContainer}>
      {renderOverallRiskCards()}
      {renderRisksPerDomainChart()}
      {renderVulnerabilityLikelihoodImpact()}
    </div>
  );
};

export default ResultsCalculatedRisks;

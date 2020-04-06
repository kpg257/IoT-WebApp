import forEach from "lodash/forEach";

export const barChartOptions = {
  scales: {
    xAxes: [{
      display: true,
      position: 'top'
    }]
  },
  plugins: [{
    beforeInit: chart => {
      chart.data.labels.forEach((e, i, a) => {
        if (/\n/.test(e)) {
          a[i] = e.split(/\n/);
        }
      })
    }
  }]
};


const BUBBLE_CHART_Y_AXIS_LABEL = "Impact";
const BUBBLE_CHART_X_AXIS_LABEL = "Likelihood";

export const bubbleChartOptions = {
  legend: {
    display: false
  },
  scales: {
    yAxes: [{
      scaleLabel: {
        display: true,
        labelString: BUBBLE_CHART_Y_AXIS_LABEL
      }
    }],
    xAxes: [{
      scaleLabel: {
        display: true,
        labelString: BUBBLE_CHART_X_AXIS_LABEL
      }
    }],
  },
  tooltips: {
    callbacks: {
      label: (tooltipItem, data) => {
        return `${data.datasets[tooltipItem.datasetIndex].label} (${BUBBLE_CHART_Y_AXIS_LABEL}: ${tooltipItem.yLabel}, ${BUBBLE_CHART_X_AXIS_LABEL}: ${tooltipItem.xLabel})`;
      }
    }
  }
};

export const getRisksPerDomainDataForChart = data => {
  let labels = [];
  let riskValues = [];
  const maxCharsInLine = window.innerWidth / 20;
  forEach(data, item => {
    const label = item.control;
    if (label.length > maxCharsInLine) {
      let words = label.split(" ");
      let str = "";
      const labelArray = [];
      words.forEach(word => {
        if ((str + " " + word).length > maxCharsInLine) {
          labelArray.push(str);
          str = word;
        } else {
          str += " " + word;
        }
      });
      if (str.length > 0) {
        labelArray.push(str);
      }
      labels.push(labelArray);
      // labels.push(label.match(new RegExp('.{1,' + maxCharsInLine + '}', 'g')) || label);
    } else {
      labels.push(label);
    }
    riskValues.push(item.risk);
  });
  return {
    labels: labels,
    datasets: [
      {
        label: "Residual Risk Reduction",
        backgroundColor: "#ffbac7",
        barThickness: 50,
        data: riskValues
      }
    ]
  };
};

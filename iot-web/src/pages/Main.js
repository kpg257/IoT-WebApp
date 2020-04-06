import map from 'lodash/map';
import cloneDeep from 'lodash/cloneDeep';
import forEach from 'lodash/forEach';
import isNumber from 'lodash/isNumber';
import isBoolean from 'lodash/isBoolean';

import React, {useState} from 'react';
import {Route, Redirect, withRouter, NavLink} from 'react-router-dom';
import {parse} from 'query-string'

import {makeStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";

import MenuIcon from '@material-ui/icons/Menu';
import SettingsIcon from '@material-ui/icons/Settings';

import Taxonomies from './Taxonomies';
import TaxonomyData from './TaxonomyData';
import Mappings from './Mappings';
import ModifyMapping from './ModifyMapping';
import ResultsCalculatedRisks from './ResultsCalculatedRisks';
import ControlSensitivities from './ControlSensitivities';
import ControlSensitivitiesPerDomain from './ControlSensitivitiesPerDomain';

import Parameters from "../views/Parameters";

import DataStore from "../store/DataStore";

const useStyles = makeStyles({
    menuDiv: {
      width: `300px`
    },
    titleDiv: {
      width: `calc(100% - 600px)`
    },
    settingsDiv: {
      width: `300px`
    },
    menuButton: {
      float: `left`,
    },
    title: {},
    settingsButton: {
      marginLeft: `10px`,
    },
    url: {
      textDecoration: `none`,
      color: `inherit`,
    },
  },
);

const URL_HOME = "/";
const URL_TAXONOMY = "/taxonomy";
const URL_SELECTED_TAXONOMY = "/taxonomy/:id";
const URL_MAPPING = "/mapping";
const URL_MODIFY_MAPPING = "/mapping/edit";

const URL_ASSET = URL_TAXONOMY + "/asset";
const URL_ACTION = URL_TAXONOMY + "/action";
const URL_VULNERABILITY = URL_TAXONOMY + "/vulnerability";
const URL_PROPERTY = URL_TAXONOMY + "/property";
const URL_CONTROL = URL_TAXONOMY + "/control";
const URL_DEVICE = URL_TAXONOMY + "/device";
const URL_RISK = URL_TAXONOMY + "/risk";

const URL_RESULTS = "/results";
const URL_RESULTS_RISKS = URL_RESULTS + "/risks";
const URL_RESULTS_CONTROL = URL_RESULTS + "/controls";
const URL_RESULTS_CONTROL_DOMAIN = URL_RESULTS + "/controls/domain";

const TITLE_TAXONOMY = "IoT Attack Taxonomy";
const LABEL_RISK = "Risks";
const LABEL_CONTROL = "Controls";
const LABEL_DEVICE = "Devices";
const TITLE_ACTION_ASSET_MAPPING = "Action-Asset Mapping";
const TITLE_CONTROL_VULNERABILITY_MAPPING = "Control-Vulnerability Mapping";
const TITLE_DEVICE_VULNERABILITY_MAPPING = "Device-Vulnerability Mapping";
const TITLE_RISK_CONTROL_MAPPING = "Risk-Control Mapping";
const TITLE_RISK_VULNERABILITY_MAPPING = "Risk-Vulnerability Mapping";
const TITLE_VULNERABILITY_ACTION_MAPPING = "Vulnerability-Action Mapping";
const TITLE_VULNERABILITY_PROPERTY_MAPPING = "Vulnerability-Property Mapping";
const TITLE_CALCULATED_RISKS = "Calculated Risks";
const TITLE_CONTROL_SENSITIVITIES = "Controls for Residual Risk Reduction";
const TITLE_CONTROL_SENSITIVITIES_PER_DOMAIN = "Domain-Specific Controls for Residual Risk Reduction";

const getMappingUrl = (src, dest) => {
  return `${URL_MAPPING}?src=${src}&dest=${dest}`;
};

const MENU_ITEMS = [
  {
    label: "Home",
    subItems: [
      {
        url: URL_TAXONOMY,
        label: TITLE_TAXONOMY,
      },
    ],
  },
  {
    label: "Taxonomy Dimensions",
    subItems: [
      {
        url: URL_ASSET,
        label: "Assets",
      },
      {
        url: URL_ACTION,
        label: "Actions",
      },
      {
        url: URL_VULNERABILITY,
        label: "Vulnerabilities",
      },
      {
        url: URL_PROPERTY,
        label: "Properties",
      },
      {
        url: URL_CONTROL,
        label: LABEL_CONTROL,
      },
      {
        url: URL_DEVICE,
        label: LABEL_DEVICE,
      },
      {
        url: URL_RISK,
        label: LABEL_RISK,
      },
    ],
  },
  {
    label: "Taxonomy Mapping",
    subItems: [
      {
        url: getMappingUrl('action', 'asset'),
        label: TITLE_ACTION_ASSET_MAPPING,
      },
      {
        url: getMappingUrl('control', 'vulnerability'),
        label: TITLE_CONTROL_VULNERABILITY_MAPPING,
      },
      {
        url: getMappingUrl('device', 'vulnerability'),
        label: TITLE_DEVICE_VULNERABILITY_MAPPING,
      },
      {
        url: getMappingUrl('risk', 'control'),
        label: TITLE_RISK_CONTROL_MAPPING,
      },
      {
        url: getMappingUrl('risk', 'vulnerability'),
        label: TITLE_RISK_VULNERABILITY_MAPPING,
      },
      {
        url: getMappingUrl('vulnerability', 'action'),
        label: TITLE_VULNERABILITY_ACTION_MAPPING,
      },
      {
        url: getMappingUrl('vulnerability', 'property'),
        label: TITLE_VULNERABILITY_PROPERTY_MAPPING,
      },
    ],
  },
  {
    label: "Results",
    subItems: [
      {
        url: URL_RESULTS_RISKS,
        label: TITLE_CALCULATED_RISKS,
      },
      {
        url: URL_RESULTS_CONTROL,
        label: TITLE_CONTROL_SENSITIVITIES,
      },
      {
        url: URL_RESULTS_CONTROL_DOMAIN,
        label: TITLE_CONTROL_SENSITIVITIES_PER_DOMAIN,
      },
    ],
  },
];

const Main = (props) => {

  const classes = useStyles();

  const [state, setState] = useState({
    menuDrawer: false,
    settingsDrawer: false,
    parametersData: DataStore.getParameters(),
    resetDialogOpen: false,
    calculateDialogOpen: false,
  });

  const onParameterChange = (type, field, value) => {
    let parametersData = cloneDeep(state.parametersData);
    if (field)
      parametersData[type][field] = +value;
    else
      parametersData[type] = isBoolean(value) ? value : +value;

    setState({
      ...state,
      parametersData: parametersData,
    });
  };

  const onParameterSaveClicked = () => {
    let isDataValid = true;
    forEach(state.parametersData, data => {
      if (typeof data === "object") {
        if (!isNumber(data.min) || !isNumber(data.max)) {
          isDataValid = false;
          return false;
        }
        if (data.min < 0 || data.min >= data.max) {
          isDataValid = false;
          return false;
        }
      } else {
        if (!isNumber(data) && !isBoolean(data)) {
          isDataValid = false;
          return false;
        }
      }
    });
    if (!isDataValid) {
      alert("Data for parameters is not valid. Please check your data.");
      return;
    }
    DataStore.modifyParameters(state.parametersData);
    toggleDrawer('settingsDrawer');
  };

  const onCalculateClicked = () => {
    DataStore.calculateResults();
    setState({
      ...state,
      calculateDialogOpen: true
    });
  };

  const handleCalculateDialogClose = () => {
    setState({
      ...state,
      calculateDialogOpen: false
    });
  };

  const onResetDataBtnClicked = () => {
    setState({
      ...state,
      resetDialogOpen: true
    });
  };

  const handleResetDialogClose = () => {
    setState({
      ...state,
      resetDialogOpen: false
    });
  };

  const handleResetConfirmClicked = () => {
    DataStore.resetAppData();
    handleResetDialogClose();
    const {history, location} = props;
    if (location.pathname === URL_TAXONOMY) {
      history.push(URL_HOME);
    } else {
      history.push(URL_TAXONOMY);
    }
  };

  const getTitle = () => {
    const path = props.location.pathname;
    switch (path) {
      case URL_HOME:
      case URL_TAXONOMY:
        return TITLE_TAXONOMY;
      case URL_ASSET:
        return "Attacker Assets";
      case URL_ACTION:
        return "Attacker Actions";
      case URL_VULNERABILITY:
        return "Exploitable Vulnerabilities";
      case URL_PROPERTY:
        return "Compromised Properties";
      case URL_CONTROL:
        return LABEL_CONTROL;
      case URL_DEVICE:
        return LABEL_DEVICE;
      case URL_RISK:
        return LABEL_RISK;
      case URL_MAPPING:
      case URL_MODIFY_MAPPING:
        const params = parse(props.location.search);
        const src = params.src;
        const dest = params.dest;
        if (src === 'action' && dest === 'asset')
          return TITLE_ACTION_ASSET_MAPPING;
        if (src === 'control' && dest === 'vulnerability')
          return TITLE_CONTROL_VULNERABILITY_MAPPING;
        if (src === 'device' && dest === 'vulnerability')
          return TITLE_DEVICE_VULNERABILITY_MAPPING;
        if (src === 'risk' && dest === 'control')
          return TITLE_RISK_CONTROL_MAPPING;
        if (src === 'risk' && dest === 'vulnerability')
          return TITLE_RISK_VULNERABILITY_MAPPING;
        if (src === 'vulnerability' && dest === 'action')
          return TITLE_VULNERABILITY_ACTION_MAPPING;
        if (src === 'vulnerability' && dest === 'property')
          return TITLE_VULNERABILITY_PROPERTY_MAPPING;
        console.log("Page title missing for mapping: src=" + src + ", dest=" + dest);
        return "";
      case URL_RESULTS_RISKS:
        return TITLE_CALCULATED_RISKS;
      case URL_RESULTS_CONTROL:
        return TITLE_CONTROL_SENSITIVITIES;
      case URL_RESULTS_CONTROL_DOMAIN:
        return TITLE_CONTROL_SENSITIVITIES_PER_DOMAIN;
      default:
        console.log("Page title missing for: " + path);
        return "";
    }
  };

  const toggleDrawer = key => {
    setState({
      ...state,
      [key]: !state[key],
    })
  };

  const renderMenu = () => {
    return (
      <>
        {map(MENU_ITEMS, (item, index) => {
          return (
            <div key={index}>
              <List subheader={<ListSubheader>{item.label}</ListSubheader>}>
                {map(item.subItems, subItem => {
                  return (
                    <NavLink
                      key={subItem.label}
                      to={subItem.url}
                      className={classes.url}
                      onClick={() => toggleDrawer('menuDrawer')}
                    >
                      <ListItem button>
                        <ListItemText primary={subItem.label}/>
                      </ListItem>
                    </NavLink>
                  );
                })}
              </List>
              <Divider/>
            </div>
          );
        })}
      </>
    );
  };

  const renderToolbar = () => {
    return <>
      <div className={classes.menuDiv}>
        <IconButton edge="start" className={classes.menuButton} color="inherit"
                    onClick={() => toggleDrawer('menuDrawer')}>
          <MenuIcon/>
        </IconButton>
      </div>
      <div className={classes.titleDiv}>
        <Typography variant="h6" className={classes.title}>
          {getTitle()}
        </Typography>
      </div>
      <div className={classes.settingsDiv}>
        <Button color="inherit" onClick={onResetDataBtnClicked}>Reset App Data</Button>
        <Button color="inherit" onClick={onCalculateClicked}>Calculate</Button>
        <IconButton edge="end" className={classes.settingsButton} color="inherit"
                    onClick={() => toggleDrawer('settingsDrawer')}>
          <SettingsIcon/>
        </IconButton>
      </div>
    </>;
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          {renderToolbar()}
        </Toolbar>
      </AppBar>

      <Drawer open={state.menuDrawer} onClose={() => toggleDrawer('menuDrawer')}>
        {renderMenu()}
      </Drawer>

      <Drawer open={state.settingsDrawer} anchor="right" onClose={() => toggleDrawer('settingsDrawer')}>
        <Parameters
          parametersData={state.parametersData}
          parameterChangeHandler={onParameterChange}
          onSaveHandler={onParameterSaveClicked}
        />
      </Drawer>

      <Route exact path={URL_HOME} component={Taxonomies}/>
      <Route exact path={URL_TAXONOMY} component={Taxonomies}/>
      <Route exact path={URL_SELECTED_TAXONOMY} component={TaxonomyData}/>
      <Route exact path={URL_MAPPING} component={Mappings}/>
      <Route exact path={URL_MODIFY_MAPPING} component={ModifyMapping}/>
      <Route exact path={URL_RESULTS_RISKS} component={ResultsCalculatedRisks}/>
      <Route exact path={URL_RESULTS_CONTROL} component={ControlSensitivities}/>
      <Route exact path={URL_RESULTS_CONTROL_DOMAIN} component={ControlSensitivitiesPerDomain}/>
      <Redirect exact to={URL_TAXONOMY}/>

      <Dialog open={!!state.resetDialogOpen} onClose={handleResetDialogClose} fullWidth>
        <DialogTitle>Reset App Data</DialogTitle>
        <DialogContent>Are you sure you want to reset the data? All the changes will be lost.</DialogContent>
        <DialogActions>
          <Button onClick={handleResetDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleResetConfirmClicked} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!state.calculateDialogOpen} onClose={handleCalculateDialogClose} fullWidth>
        <DialogTitle>The results will be ready soon.</DialogTitle>
        <DialogContent>Please navigate to the <b>Results</b> page to view them.</DialogContent>
        <DialogActions>
          <Button onClick={handleCalculateDialogClose} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default withRouter(Main);
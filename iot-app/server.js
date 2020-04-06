const cors = require('cors');
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

const Rest = require('./rest');

function Server() {
  app.use(cors());
  app.options('*', cors());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use(bodyParser.text());
  let router = express.Router();
  app.use('', router);
  new Rest(router);
  app.listen(4000, function () {
    console.log('Server started')
  });
}

new Server();
const fs = require('fs');

function Rest(router) {

  const URL_PREFIX = '/api/';

  const taxonomy = JSON.parse(fs.readFileSync('./data/parent-child-map.json', 'utf8'));
  const masterList = JSON.parse(fs.readFileSync('./data/master-list.json', 'utf8'));
  const scoreData = JSON.parse(fs.readFileSync('./data/default-data.json', 'utf8'));
  const mappingData = JSON.parse(fs.readFileSync('./data/default-mapping-data.json', 'utf8'));
  const results = JSON.parse(fs.readFileSync('./data/default-results.json', 'utf8'));

  router.get(URL_PREFIX + 'taxonomy', (req, res) => {
    res.json(taxonomy);
  });

  router.get(URL_PREFIX + 'master_list', (req, res) => {
    res.json(masterList);
  });

  router.get(URL_PREFIX + 'table_data', (req, res) => {
    res.json(scoreData);
  });

  router.get(URL_PREFIX + 'mapping', (req, res) => {
    res.json(mappingData);
  });

  router.get(URL_PREFIX + 'result', (req, res) => {
    res.json(results);
  });
}

module.exports = Rest;
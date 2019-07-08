'use strict';

const fs = require('fs');
const path = require('path');
const CircularJson = require('macaca-circular-json');

const pkg = require('../package');
const _ = require('./common/helper');
const logger = require('./common/logger');

const {
  chalk
} = _;

module.exports = (data, opts) => {
  const options = _.merge({
    name: pkg.name,
    distDir: process.cwd()
  }, opts);

  // Support custom JSON file name by ths config:
  // --reporter-options reportJSONFilename=index
  const reportJSONFilename = opts.reporterOptions && opts.reporterOptions.reportJSONFilename || 'json-final';

  const targetJSON = path.join(options.distDir, 'reports', `${reportJSONFilename}.json`);
  fs.writeFileSync(targetJSON, CircularJson.stringify(data, null, 2), 'utf8');
  logger.info(chalk.cyan(`json reporter generated: ${targetJSON}`));

  const configJSON = path.join(options.distDir, 'reports', 'config.json');
  fs.writeFileSync(configJSON, CircularJson.stringify(options, null, 2), 'utf8');
  logger.info(chalk.cyan(`reporter config generated: ${configJSON}`));
};

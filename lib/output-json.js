'use strict';

const fs = require('fs');
const path = require('path');

const pkg = require('../package');
const _ = require('./common/helper');
const logger = require('./common/logger');

const {
  chalk,
} = _;

module.exports = (data, opts) => {
  const options = _.merge({
    name: pkg.name,
    distDir: process.cwd()
  }, opts);

  const targetJSON = path.join(options.distDir, 'reports', 'json-final.json');
  fs.writeFileSync(targetJSON, JSON.stringify(data, null, 2), 'utf8');
  logger.info(chalk.cyan(`json reporter generated: ${targetJSON}`));

  const configJSON = path.join(options.distDir, 'reports', 'config.json');
  fs.writeFileSync(configJSON, JSON.stringify(options, null, 2), 'utf8');
  logger.info(chalk.cyan(`reporter config generated: ${configJSON}`));
};

'use strict';

const fs = require('fs');
const path = require('path');
const Coverage = require('macaca-coverage');
const remap = require('remap-istanbul/lib/remap');
const isCI = require('is-ci');
const CircularJson = require('macaca-circular-json');

const _ = require('./common/helper');
const logger = require('./common/logger');

const {
  collector,
  Reporter
} = Coverage({
  runtime: 'web'
});

const {
  chalk
} = _;

const cwd = process.cwd();

const reporter = new Reporter();

const useRemap = process.env.MACACA_REPORTER_USE_REMAP;

module.exports = (callback) => {
  const coverageDir = path.join(cwd, 'coverage', '.temp');

  if (!_.isExistedDir(coverageDir)) {
    return callback();
  }
  const coverageFiles = fs
    .readdirSync(coverageDir)
    .filter(i => path.extname(i) === '.json');

  if (!coverageFiles.length) {
    return callback();
  }
  coverageFiles.map(i => {
    const file = path.join(coverageDir, i);
    const content = fs.readFileSync(file, 'utf8');
    const __coverage__ = CircularJson.parse(content);

    if (useRemap) {
      const _collector = remap(__coverage__, {
        warn: () => {},
        warnMissingSourceMaps: false,
        mapFileName: filename => {
          const originName = filename
            .replace(/\.vue\.[jt]s(\?.+)?$/, '.vue');
          return originName;
        }
      });
      collector.add(_collector.getFinalCoverage());
    } else {
      collector.add(__coverage__);
    }
  });

  reporter.addAll([
    'html',
    'lcov',
    'json'
  ]);
  reporter.write(collector, true, () => {
    if (!isCI) {
      _.rimraf(coverageDir);
    }
    const coverageHtml = path.join(cwd, 'coverage', 'index.html');
    logger.info(chalk.cyan(`coverage reporter generated: ${coverageHtml}`));
    callback();
  });
};

'use strict';

const mocha = require('mocha');

const render = require('./render');
const _ = require('./common/helper');
const outputJson = require('./output-json');
const renderCoverage = require('./coverage');

const {
  Base,
  Spec
} = mocha.reporters;

const {
  stringify,
  getSuite
} = _;

const totalTests = {
  total: 0,
};

function done(output, options, config, failures, exit) {
  try {
    if (process.env.MACACA_RUN_IN_PARALLEL) {
      output.suites.suites = output.suites.suites
        .filter(item => item.suites.length)
        .map(item => item.suites[0]);
    }
    render(output, options);
    outputJson(output, options);

    // support torchjs exit
    exit && exit(failures ? 1 : 0);

    renderCoverage(() => {
      // exit finally
      process.exit(failures ? 1 : 0);
    });
  } catch (e) {
    console.log(e);
  }
}

function MacacaReporter(runner, options) {

  const getSuiteData = status => {
    const result = getSuite(stringify(this._originSuiteData), totalTests, status);
    const obj = {
      stats: this.stats,
      suites: JSON.parse(result)
    };

    const {
      passes,
      failures,
      pending,
      tests // runed testcase
    } = obj.stats;

    const passPercentage = Math.round((passes / (totalTests.total - pending)) * 1000) / 10;
    const pendingPercentage = Math.round((pending / totalTests.total) * 1000) / 10;

    if (status === 'end') {
      obj.stats.passPercent = passPercentage;
      obj.stats.pendingPercent = pendingPercentage;
      obj.stats.other = passes + failures + pending - tests;
      obj.stats.hasOther = obj.stats.other > 0;
      obj.stats.skipped = totalTests.total - tests + pending;
      obj.stats.pending = 0; // use skiped
      obj.stats.hasSkipped = obj.stats.skipped > 0;
      obj.stats.tests = totalTests.total; // total testcase
    }
    return obj;
  };

  this.done = (failures, exit) => done(this.output, options, this.config, failures, exit);
  totalTests.total = 0;

  this.config = {
    reportFilename: 'report',
    saveJson: true
  };
  Base.call(this, runner);

  new Spec(runner);

  const handleTestEnd = status => {
    const obj = getSuiteData(status);
    obj.stats.duration = obj.suites._totalTime || 0;
    this.output = obj;

    if (typeof window === 'object' &&
      window._macaca_reportor &&
      window._macaca_reportor._update) {
      window._macaca_reportor._update(encodeURI(stringify(obj)));
    }
  };

  runner.on('start', () => {
    this._originSuiteData = runner.suite;
  });

  runner.on('test', test => {
    test.uuid = _.uuid();
  });

  runner.on('test end', test => {
    handleTestEnd('test_end');
  });

  runner.on('suite', test => {
    handleTestEnd('suite');
  });

  runner.on('end', test => {
    handleTestEnd('end');
  });

  runner.on('pending', test => {
    test.uuid = _.uuid();
  });
}

MacacaReporter.appendToContext = function (mocha, content) {
  try {
    const test = mocha.currentTest || mocha.test;

    if (!test.context) {
      test.context = content;
    } else if (Array.isArray(test.context)) {
      test.context.push(content);
    } else {
      test.context = [test.context];
      test.context.push(content);
    }
  } catch (e) {
    console.log('error', e)
  }
};

module.exports = MacacaReporter;

'use strict';

const fs = require('fs');
const path = require('path');
const utils = require('macaca-utils');
const mochaUtils = require('mocha').utils;
const microtemplate = require('microtemplate');
const stringify = require('json-stringify-safe');

const _ = utils.merge({}, utils);

function transferCode(data) {
  data = data
    .replace(/\r\n?|[\n\u2028\u2029]/g, '\n')
    .replace(/^\uFEFF/, '')
    .replace(/^function\s*\(.*\)\s*{|\(.*\)\s*=>\s*{?/, '')
    .replace(/\s*\}$/, '');

  const spaces = data.match(/^\n?( *)/)[1].length;
  const tabs = data.match(/^\n?(\t*)/)[1].length;
  const reg = new RegExp(`^\n?${tabs ? '\t' : ' '}{${tabs || spaces}}`, 'gm');

  return data
    .replace(reg, '')
    .replace(/^\s+|\s+$/g, '')
    .replace(/\)\./g, '\)\n\.');
}

function transferTest(test, suite) {
  const code = test.fn ? test.fn.toString() : test.body;

  const cleaned = {
    title: test.title,
    fullTitle: suite.title + '--' + test.title,
    duration: test.duration || 0,
    state: test.state,
    pass: test.state === 'passed',
    fail: test.state === 'failed',
    pending: test.pending,
    context: mochaUtils.stringify(test.context),
    code: code && transferCode(code),
    uuid: test.uuid || _.uuid()
  };

  cleaned.skipped = !cleaned.pass && !cleaned.fail && !cleaned.pending && !cleaned.isHook;
  return cleaned;
}

function transferSuite(suite, totalTests, totalTime) {
  suite.uuid = _.uuid();
  let cleanTmpTests = _.map(suite.tests, test => test.state && transferTest(test, suite));
  let cleanTests = _.remove(cleanTmpTests, test => !!test);

  const passingTests = _.filter(cleanTests, {
    state: 'passed'
  });

  const failingTests = _.filter(cleanTests, {
    state: 'failed'
  });

  const pendingTests = _.filter(cleanTests, {
    pending: true
  });

  const skippedTests = _.filter(cleanTests, { skipped: true });
  let duration = 0;

  _.each(cleanTests, test => {
    duration += test.duration;
    totalTime.time += test.duration;
  });

  suite.tests = cleanTests;
  suite.fullFile = suite.file || '';
  suite.file = suite.file ? suite.file.replace(process.cwd(), '') : '';
  suite.passes = passingTests;
  suite.failures = failingTests;
  suite.pending = pendingTests;
  suite.skipped = skippedTests;
  suite.totalTests = suite.tests.length;
  suite.totalPasses = passingTests.length;
  suite.totalFailures = failingTests.length;
  suite.totalPending = pendingTests.length;
  suite.totalSkipped = skippedTests.length;
  suite.duration = duration;
}

function getSuite(suite, totalTests) {
  let totalTime = {
    time: 0
  };
  const queue = [];
  let result = JSON.parse(suite);
  let next = result;
  totalTests.total++;
  while (next) {

    if (next.root) {
      transferSuite(next, totalTests, totalTime);
    }

    if (next.suites.length) {
      _.each(next.suites, (nextSuite, i) => {
        transferSuite(nextSuite, totalTests, totalTime);
        queue.push(nextSuite);
      });
    }
    next = queue.shift();
  }
  result._totalTime = totalTime.time;
  return stringify(result);
}

_.getSuite = getSuite;
_.microtemplate = microtemplate;
_.stringify = stringify;

_.copyfile = function(origin, target) {
  _.mkdir(path.dirname(target));
  fs.writeFileSync(target, origin, 'utf8');
};

module.exports = _;

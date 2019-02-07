'use strict';

const {
  webpackHelper,
} = require('macaca-wd');

const {
  driver,
  BASE_URL,
} = webpackHelper;

describe('test/macaca-reporter.test.js', () => {
  before(() => {
    return driver
      .initWindow({
        width: 375,
        height: 667,
        deviceScaleFactor: 2
      });
  });

  afterEach(function () {
    return driver
      .coverage()
      .saveScreenshots(this);
  });

  after(() => {
    return driver
      .openReporter(false)
      .quit();
  });

  it('page render should be ok', () => {
    return driver
      .getUrl(BASE_URL)
      .sleep(5000);
  });

});

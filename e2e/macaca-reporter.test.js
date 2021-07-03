'use strict';

const {
  webpackHelper
} = require('macaca-wd');

const {
  driver,
  BASE_URL
} = webpackHelper;

describe('e2e/macaca-reporter.test.js', () => {
  before(() => {
    return driver
      .initWindow({
        width: 800,
        height: 600,
        deviceScaleFactor: 2
      });
  });

  afterEach(function () {
    return driver
      .coverage()
      .saveScreenshots(this)
      .stopMediaRecorder();
  });

  after(() => {
    return driver
      .openReporter(false)
      .quit();
  });

  it('page render should be ok', function() {
    return driver
      .getUrl(BASE_URL)
      .startMediaRecorder()
      .sleep(2000);
  });

  it('mind render should be ok', function() {
    return driver
      .getUrl(BASE_URL)
      .startMediaRecorder()
      .sleep(2000)
      .saveScreenshots(this)
      .elementByClassName('anticon-cluster')
      .click()
      .sleep(2000);
  });
});

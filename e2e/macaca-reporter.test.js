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
      .saveScreenshots(this);
  });

  after(() => {
    return driver
      .openReporter(false)
      .waitForVideosSave()
      .quit();
  });

  it('page render should be ok', function() {
    return driver
      .getUrl(BASE_URL)
      .startMediaRecorder(this)
      .sleep(2000)
      .stopMediaRecorder();
  });

  it('mind render should be ok', function() {
    return driver
      .getUrl(BASE_URL)
      .startMediaRecorder(this)
      .sleep(2000)
      .saveScreenshots(this)
      .elementByClassName('anticon-cluster')
      .click()
      .sleep(2000)
      .stopMediaRecorder();
  });
});

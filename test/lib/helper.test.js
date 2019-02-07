'use strict';

const fs = require('fs');
const Flatted = require('flatted');

const {
  getSuite,
  stringify
} = require('../../lib/common/helper');

const originData = require('../fixtures/origin');

describe('test/lib/helper.test.js', () => {

  it('getSuite should be ok', () => {
    const res = getSuite(stringify(originData), {
      total: 0,
    });
    console.log(res);
  });

});


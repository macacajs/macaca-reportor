'use strict';

const render = require('../../lib/render');
const data = require('../fixtures/final');

describe('test/lib/render.test.js', () => {

  it('reporter render should be ok', () => {
    render(data);
  });

});

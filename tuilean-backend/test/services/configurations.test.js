const assert = require('assert');
const app = require('../../src/app');

describe('\'configurations\' service', () => {
  it('registered the service', () => {
    const service = app.service('configurations');

    assert.ok(service, 'Registered the service');
  });
});

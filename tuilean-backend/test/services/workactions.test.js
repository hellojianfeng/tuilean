const assert = require('assert');
const app = require('../../src/app');

describe('\'workactions\' service', () => {
  it('registered the service', () => {
    const service = app.service('workactions');

    assert.ok(service, 'Registered the service');
  });
});

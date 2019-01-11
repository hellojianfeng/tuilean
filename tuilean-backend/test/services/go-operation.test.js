const assert = require('assert');
const app = require('../../src/app');

describe('\'go-operation\' service', () => {
  it('registered the service', () => {
    const service = app.service('go-operation');

    assert.ok(service, 'Registered the service');
  });
});

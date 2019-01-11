const assert = require('assert');
const app = require('../../src/app');

describe('\'operations\' service', () => {
  it('registered the service', () => {
    const service = app.service('operations');

    assert.ok(service, 'Registered the service');
  });
});

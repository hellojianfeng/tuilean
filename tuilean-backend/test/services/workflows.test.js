const assert = require('assert');
const app = require('../../src/app');

describe('\'workflows\' service', () => {
  it('registered the service', () => {
    const service = app.service('workflows');

    assert.ok(service, 'Registered the service');
  });
});

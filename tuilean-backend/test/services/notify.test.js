const assert = require('assert');
const app = require('../../src/app');

describe('\'notify\' service', () => {
  it('registered the service', () => {
    const service = app.service('notify');

    assert.ok(service, 'Registered the service');
  });
});

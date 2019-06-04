const assert = require('assert');
const app = require('../../src/app');

describe('\'leaves\' service', () => {
  it('registered the service', () => {
    const service = app.service('leaves');

    assert.ok(service, 'Registered the service');
  });
});

const assert = require('assert');
const app = require('../../src/app');

describe('\'notifier\' service', () => {
  it('registered the service', () => {
    const service = app.service('notifier');

    assert.ok(service, 'Registered the service');
  });
});

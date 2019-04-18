const assert = require('assert');
const app = require('../../src/app');

describe('\'work-action\' service', () => {
  it('registered the service', () => {
    const service = app.service('work-action');

    assert.ok(service, 'Registered the service');
  });
});

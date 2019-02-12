const assert = require('assert');
const app = require('../../src/app');

describe('\'do-operation\' service', () => {
  it('registered the service', () => {
    const service = app.service('do-operation');

    assert.ok(service, 'Registered the service');
  });
});

const assert = require('assert');
const app = require('../../src/app');

describe('\'orgs\' service', () => {
  it('registered the service', () => {
    const service = app.service('orgs');

    assert.ok(service, 'Registered the service');
  });
});

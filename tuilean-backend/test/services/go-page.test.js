const assert = require('assert');
const app = require('../../src/app');

describe('\'go-page\' service', () => {
  it('registered the service', () => {
    const service = app.service('go-page');

    assert.ok(service, 'Registered the service');
  });
});

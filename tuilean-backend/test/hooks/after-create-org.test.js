const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const afterCreateOrg = require('../../src/hooks/after-create-org');

describe('\'after-create-org\' hook', () => {
  let app;

  beforeEach(() => {
    app = feathers();

    app.use('/dummy', {
      async get(id) {
        return { id };
      }
    });

    app.service('dummy').hooks({
      after: afterCreateOrg()
    });
  });

  it('runs the hook', async () => {
    const result = await app.service('dummy').get('test');
    
    assert.deepEqual(result, { id: 'test' });
  });
});

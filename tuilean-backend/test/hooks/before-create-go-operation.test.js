const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const beforeCreateGoOperation = require('../../src/hooks/before-create-go-operation');

describe('\'before-create-go-operation\' hook', () => {
  let app;

  beforeEach(() => {
    app = feathers();

    app.use('/dummy', {
      async get(id) {
        return { id };
      }
    });

    app.service('dummy').hooks({
      before: beforeCreateGoOperation()
    });
  });

  it('runs the hook', async () => {
    const result = await app.service('dummy').get('test');
    
    assert.deepEqual(result, { id: 'test' });
  });
});

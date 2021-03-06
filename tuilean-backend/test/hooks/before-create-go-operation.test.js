const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const beforeCreatedoOperation = require('../../src/hooks/before-create-do-operation');

describe('\'before-create-do-operation\' hook', () => {
  let app;

  beforeEach(() => {
    app = feathers();

    app.use('/dummy', {
      async get(id) {
        return { id };
      }
    });

    app.service('dummy').hooks({
      before: beforeCreatedoOperation()
    });
  });

  it('runs the hook', async () => {
    const result = await app.service('dummy').get('test');
    
    assert.deepEqual(result, { id: 'test' });
  });
});

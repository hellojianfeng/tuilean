const { authenticate } = require('@feathersjs/authentication').hooks;

const beforeCreateWorkflow = require('../../hooks/before-create-workflow');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [beforeCreateWorkflow()],
    update: [beforeCreateWorkflow()],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};

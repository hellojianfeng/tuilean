const { authenticate } = require('@feathersjs/authentication').hooks;

const beforeCreateChannel = require('../../hooks/before-create-channel');

const afterCreateChannel = require('../../hooks/after-create-channel');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [beforeCreateChannel()],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [afterCreateChannel()],
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

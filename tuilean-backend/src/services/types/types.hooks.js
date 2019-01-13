const { authenticate } = require('@feathersjs/authentication').hooks;

const beforeCreateType = require('../../hooks/before-create-type');

const addNamePath = require('../../hooks/add-name-path');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [beforeCreateType(), addNamePath()],
    update: [],
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

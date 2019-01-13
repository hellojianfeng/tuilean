const { authenticate } = require('@feathersjs/authentication').hooks;

const beforeCreateOrg = require('../../hooks/before-create-org');

const afterCreateOrg = require('../../hooks/after-create-org');

const addNamePath = require('../../hooks/add-name-path');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [addNamePath(),beforeCreateOrg()],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [afterCreateOrg()],
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

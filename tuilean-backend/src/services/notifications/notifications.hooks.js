const { authenticate } = require('@feathersjs/authentication').hooks;

const afterCreateNotification = require('../../hooks/after-create-notification');

const beforeCreateNotification = require('../../hooks/before-create-notification');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [beforeCreateNotification()],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [afterCreateNotification()],
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

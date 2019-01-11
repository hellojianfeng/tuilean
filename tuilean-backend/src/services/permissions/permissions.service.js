// Initializes the `permissions` service on path `/permissions`
const createService = require('feathers-mongoose');
const createModel = require('../../models/permissions.model');
const hooks = require('./permissions.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/permissions', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('permissions');

  service.hooks(hooks);
};

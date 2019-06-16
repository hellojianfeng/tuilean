// Initializes the `configurations` service on path `/configurations`
const createService = require('feathers-mongoose');
const createModel = require('../../models/configurations.model');
const hooks = require('./configurations.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/configurations', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('configurations');

  service.hooks(hooks);
};

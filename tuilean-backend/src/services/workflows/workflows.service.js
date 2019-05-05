// Initializes the `workflows` service on path `/workflows`
const createService = require('feathers-mongoose');
const createModel = require('../../models/workflows.model');
const hooks = require('./workflows.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/workflows', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('workflows');

  service.hooks(hooks);
};

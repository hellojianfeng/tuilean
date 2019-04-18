// Initializes the `work-action` service on path `/work-action`
const createService = require('feathers-mongoose');
const createModel = require('../../models/work-action.model');
const hooks = require('./work-action.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/work-action', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('work-action');

  service.hooks(hooks);
};

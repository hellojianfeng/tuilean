// Initializes the `leaves` service on path `/leaves`
const createService = require('feathers-mongoose');
const createModel = require('../../models/leaves.model');
const hooks = require('./leaves.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/leaves', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('leaves');

  service.hooks(hooks);
};

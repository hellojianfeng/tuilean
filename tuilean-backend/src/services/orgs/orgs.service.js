// Initializes the `orgs` service on path `/orgs`
const createService = require('feathers-mongoose');
const createModel = require('../../models/orgs.model');
const hooks = require('./orgs.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/orgs', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('orgs');

  service.hooks(hooks);
};

// Initializes the `go-page` service on path `/go-page`
const createService = require('feathers-mongoose');
const createModel = require('../../models/go-page.model');
const hooks = require('./go-page.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/go-page', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('go-page');

  service.hooks(hooks);
};

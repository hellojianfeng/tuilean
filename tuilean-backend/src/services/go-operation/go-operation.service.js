// Initializes the `go-operation` service on path `/go-operation`
const createService = require('feathers-mongoose');
const createModel = require('../../models/go-operation.model');
const hooks = require('./go-operation.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/go-operation', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('go-operation');

  service.hooks(hooks);
};

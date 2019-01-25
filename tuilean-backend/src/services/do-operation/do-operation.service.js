// Initializes the `do-operation` service on path `/do-operation`
const createService = require('feathers-mongoose');
const createModel = require('../../models/do-operation.model');
const hooks = require('./do-operation.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/do-operation', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('do-operation');

  service.hooks(hooks);
};

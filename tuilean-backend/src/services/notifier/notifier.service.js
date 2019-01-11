// Initializes the `notifier` service on path `/notifier`
const createService = require('feathers-mongoose');
const createModel = require('../../models/notifier.model');
const hooks = require('./notifier.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/notifier', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('notifier');

  service.hooks(hooks);
};

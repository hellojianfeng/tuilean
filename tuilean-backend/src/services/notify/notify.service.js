// Initializes the `notify` service on path `/notify`
const createService = require('feathers-mongoose');
const createModel = require('../../models/notify.model');
const hooks = require('./notify.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/notify', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('notify');

  service.hooks(hooks);
};

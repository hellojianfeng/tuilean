const users = require('./users/users.service.js');
const orgs = require('./orgs/orgs.service.js');
const roles = require('./roles/roles.service.js');
const permissions = require('./permissions/permissions.service.js');
const operations = require('./operations/operations.service.js');
const pages = require('./pages/pages.service.js');
const types = require('./types/types.service.js');
const goOperation = require('./go-operation/go-operation.service.js');
const notifications = require('./notifications/notifications.service.js');
const channels = require('./channels/channels.service.js');
const notifier = require('./notifier/notifier.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(orgs);
  app.configure(roles);
  app.configure(permissions);
  app.configure(operations);
  app.configure(pages);
  app.configure(types);
  app.configure(goOperation);
  app.configure(notifications);
  app.configure(channels);
  app.configure(notifier);
};

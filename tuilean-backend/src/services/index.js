const users = require('./users/users.service.js');
const orgs = require('./orgs/orgs.service.js');
const roles = require('./roles/roles.service.js');
const permissions = require('./permissions/permissions.service.js');
const operations = require('./operations/operations.service.js');
const pages = require('./pages/pages.service.js');
const types = require('./types/types.service.js');
const doOperation = require('./do-operation/do-operation.service.js');
const notifications = require('./notifications/notifications.service.js');
const channels = require('./channels/channels.service.js');
const notify = require('./notify/notify.service.js');
const workflows = require('./workflows/workflows.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(orgs);
  app.configure(roles);
  app.configure(permissions);
  app.configure(operations);
  app.configure(pages);
  app.configure(types);
  app.configure(doOperation);
  app.configure(notifications);
  app.configure(channels);
  app.configure(notify);
  app.configure(workflows);
};

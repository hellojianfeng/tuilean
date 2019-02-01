// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const service = context.service;
    const event_id = context.data.type + '_' + context.result._id;
    await service.patch(context.result._id, { event_id });
    return context;
  };
};

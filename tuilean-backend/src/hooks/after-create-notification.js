// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const channel_id = context.data.channel;
    context.service.emit( 'notification_' + channel_id, { type: 'notification', data: context.data});
    return context;
  };
};

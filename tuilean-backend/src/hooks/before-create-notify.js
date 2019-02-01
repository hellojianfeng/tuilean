// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const buildResult = require('../utils/js/build-result')(context,options);
    const channelHelper = require('../utils/js/channel-helper')(context,options);
    //const contextParser = require('../utils/js/context-parser')(context, options);
    const notifyHelper = require('../utils/js/notify-helper')(context, options);
    const action = context.data.action || 'open';
    const notifyData = context.data.data;

    //const user = context.params.user;

    const notificationService = context.app.service('notifications');

    const channelQuery = { type: 'notify' };

    const user_channels = await channelHelper.getUserChannels(channelQuery);

    if (action === 'open'){
      context.result = await buildResult.notify({user_channels});
      return context;
    }

    if(action === 'send'){
      const { from, to } = notifyData;
      let from_channel, to_channel;

      if (from.channel){
        from_channel = await channelHelper.getChannel(from.channel);
      }

      if(to.channel){
        to_channel = await channelHelper.getChannel(to.channel);
      }

      if(!from_channel){
        from_channel = await channelHelper.findOrCreateChannel({scope: from, type: 'notify'});
      }

      if(!to_channel){
        to_channel = await channelHelper.findOrCreateChannel({scope: to, type: 'notify'});
      }

      context.result.notifications = {};

      if (from_channel && to_channel){
        const from_notification = from.notification;
        const to_notification = to.notification;

        const isAllowNotify = await notifyHelper.filterScope({from_channel, to_channel});
        if(isAllowNotify){
          const from_create_data = {
            channel: {
              oid: from_channel._id,
              path: from_channel.path,
              tags: from_channel.tags,
              scope_hash: from_channel.scope_hash
            },
            path: from_notification.path,
            tags: from_notification.tags,
            contents: from_notification.contents
          };
          if(from_notification.name){
            from_create_data.name = from_notification.name;
          }
          if(from_notification.name){
            from_create_data.name = from_notification.name;
          }
          const created_from = await notificationService.create(from_create_data);
          context.service.emit(from_channel.event_id, {notification: created_from});
          context.result.notifications.from = created_from;
  
          const created_to = await notificationService.create({channel: to_channel, contents: to_notification});
          context.service.emit(to_channel.event_id, {notification: created_to});
          context.result.notifications.to = created_to;
        } else {
          throw new Error('not allow notify!');
        }
      } else {
        throw new Error('please provide valide from channel data and valid to channel data! ');
      }
    }

    return context;
  };
};

// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const buildResult = require('../utils/js/build-result')(context,options);
    const channelHelper = require('../utils/js/channel-helper')(context,options);
    const contextParser = require('../utils/js/context-parser')(context, options);
    const notifyHelper = require('../utils/js/notify-helper')(context, options);
    const action = context.data.action || 'open';
    const notifyData = context.data.data;

    //const user = context.params.user;
    const { current_org, current_page } = await contextParser.parse();

    const notificationService = context.app.service('notifications');

    const channelQuery = { org: current_org, page: current_page };

    const {org_channels,self_channels} = await channelHelper.getUserChannels(channelQuery);

    if (action === 'open'){
      const org_listeners = org_channels.map ( o => {
        return {
          listen_id: 'notify_'+ o.channel.oid,
          channel: o
        };
      });
      const self_listeners = self_channels.map ( o => {
        return {
          listen_id: 'notify_'+ o.channel.oid,
          channel: o
        };
      });
      return context.result = buildResult.notify({org_listeners,self_listeners});
    }

    if(action === 'send'){
      const { from, to } = notifyData;
      let from_channel, to_channel;

      from_channel = await channelHelper.getChannel(from);

      to_channel = await channelHelper.getChannel(to);

      context.result.notifications = {};

      if (from_channel && to_channel){

        const isAllowNotify = await notifyHelper.checkAllowNotify({from_channel, to_channel});
        if(isAllowNotify){
          const from_notification_data = {
            channel: {
              oid: from_channel._id,
              path: from_channel.path,
              tags: from_channel.tags
            },
            path: notifyData.path + '-from',
            tags: notifyData.tags,
            contents: from.contents
          };

          const to_notification_data = {
            channel: {
              oid: from_channel._id,
              path: from_channel.path,
              tags: from_channel.tags
            },
            path: notifyData.path + '-to',
            tags: notifyData.tags,
            contents: from.contents
          };

          if(notifyData.tags){
            from_notification_data.tags = notifyData.tags;
            to_notification_data.tags = notifyData.tags;
          }

          const created_from = await notificationService.create(from_notification_data);
          context.service.emit(from_channel.event_id, {notification: created_from});
          context.result.notify.from = created_from;

          const created_to = await notificationService.create(to_notification_data);
          context.service.emit(to_channel.event_id, {notification: created_to});
          context.result.notify.to = created_to;
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

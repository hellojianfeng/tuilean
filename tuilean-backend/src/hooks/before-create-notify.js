// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const buildResult = require('../utils/js/build-result')(context,options);
    const channelHelper = require('../utils/js/channel-helper')(context,options);
    const contextParser = require('../utils/js/context-parser')(context, options);
    //const notifyHelper = require('../utils/js/notify-helper')(context, options);
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
      let { from_channel, to_channel, listen, contents } = notifyData;
      from_channel = await channelHelper.getChannel(from_channel);
      to_channel = await channelHelper.getChannel(to_channel);
      context.result.notifications = {};

      if (from_channel && to_channel && listen && listen.type && listen.path && contents){
        if (await channelHelper.checkAllowListen(notifyData)){
          const created_to = await notificationService.create(notifyData);
          const event_id = listen.type + '-'+ listen.path + '-' + to_channel._id;
          context.service.emit(event_id, {data: created_to});
          context.result.notify = created_to;
        } else {
          throw new Error('not allow notify!');
        }
      } else {
        throw new Error('please check input!');
      }
    }
  };
};

// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const buildResult = require('../utils/js/build-result')(context,options);
    const channelHelper = require('../utils/js/channel-helper')(context,options);
    const contextParser = require('../utils/js/context-parser')(context, options);
    const operationData = context.data.operation;
    const page = context.data.page;
    const channelData = context.data.channel;
    const action = context.data.action || 'open';
    const notificationData = context.data.data;

    const user = context.params.user;

    const notificationService = context.app.service('notifications');

    const operation = operationData ? await contextParser.getOperation({operation: operationData}) : null;

    const channelQuery = { type: 'notify' };

    if (operation){
      channelQuery.operation = operation;
    }

    if(page){
      channelQuery.page = page;
    }

    const user_channels = await channelHelper.getUserChannels(channelQuery);

    if (action === 'open'){
      context.result = await buildResult.notify({user_channels});
      return context;
    }

    if(action === 'send'){
      if(channelData){
        channelData.type = 'notify';
        const channel = await contextParser.getChannel(channelData);
        notificationData.channel = { oid: channel._id, path: channel.path, type: channel.type };
        if ( page ){
          notificationData.from = { page, users: [user.email] };
        }
        if ( operation ) {
          notificationData.from = 
          { 
            operation: {
              oid: operation._id, 
              path: operation.path, 
              org_id: operation.org_id, 
              org_path: operation.org_path 
            }, 
            users: [ user.email ]
          };
        }
        const created = await notificationService.create(notificationData);
        notificationData.notification_id = created._id;
        context.service.emit( channel.event_id, { type: 'notify', data: notificationData});
        context.result = await buildResult.notify({message: 'emit notify event!'});
      } else {
        context.result = await buildResult.notify({ code: 202, error: 'please provide channel data!'});
      }
    }

    if(action === 'create-channel' || action === 'new-channel'){
      let { creator, joiners, channel } = context.data;
      const inviter = {};
      if (creator){
        let channelPath ='notify';
        if (creator.operation){
          inviter.operations = [creator.operation];
          channelPath += '_' + creator.operation._id;
        }
        if (creator.page){
          inviter.pages = [creator.page];
          channelPath += '_' + page;
        }
        if(creator.user){
          inviter.users = [creator.user];
          channelPath += '_' + creator.user._id;
        }
        channel = channel || { type: 'notify', path: channelPath };
        channel.inviter = inviter;
        channel.joiners = joiners;
        const created = await channelHelper.createChannel(channel);
        return context.result = buildResult.notify({created_channel: created});
      }
    }

    return context;
  };
};

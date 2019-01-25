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
    const notifyData = context.data.data;

    const notificationService = context.app.service('notifications');

    const operation = operationData ? await contextParser.getOperation({operation: operationData}) : null;

    const channelQuery = { type: 'notify' };
    if (page) {
      channelQuery.page = page;
    }
    if(operation){
      channelQuery.operation = operation;
    }
    const channels = await channelHelper.getChannels(channelQuery);

    if (action === 'open'){
      context.result = await buildResult.notify({channels});
      return context;
    }

    if(action === 'send'){
      const channel = await contextParser.getChannel(channelData);
      notifyData.channel = channel._id;
      const created = await notificationService.create(notifyData);
      context.service.emit( 'notify_' + channel._id, { type: 'notify', data: created});
      // const channelData = { from_scope: context.data.from_scope, path: context.data.path};
      // const channel = await channelHelper.findOrCreateChannel(channelData);
      // const notificationService = context.app.service('notifications');
      // const channels = channelHelper.getChannels();
      // const notificationData = {};
      // if(notifyData.name){
      //   notificationData.name = notifyData.name;
      // }
      // if(notifyData.description){
      //   notificationData.description = notifyData.description;
      // }
      // if(notifyData.channel && notifyData.contents && channels.includes(notifyData.channel)){
      //   notificationData.channel = notifyData.channel;
      //   notificationData.contents =notifyData.contents;
        
      //   const created = await notificationService.create(notificationData);
      //   context.service.emit( 'notify_' + notifyData.channel, { type: 'notification', data: created});
      // }
      // if(notifyData.to_scope && notifyData.from_scope && notifyData.contents){
      //   const to_scope = channelHelper.formatScope(notifyData.to_scope);
      //   const from_scope = channelHelper.formatScope(notifyData.from_scope);
      //   const checked = await channelHelper.checkAllowCreateChannel(from_scope,to_scope);
      //   if(checked && checked.code && checked.code !== 0){
      //     context.result = checked;
      //     return context;
      //   }
      //   const channelService = context.app.service('channels');
      //   const created = await channelService.create({to_scope,from_scope});
      //   notificationData.channel = created.channel;
      //   notificationData.contents = notifyData.contents;
      //   const created2 = await notificationService.create(notificationData);
      //   context.service.emit( 'notify_' + notifyData.channel, { type: 'notification', data: created2});
      //}
    }

    if(action === 'create-channel'){
      const { to_scopes, from_scope, channel_path } = notifyData;

      if(to_scopes && from_scope) {
        const created = channelHelper.findOrCreateChannel({to_scopes,from_scope, path: channel_path, type: 'notify'});
        if (created){
          const result = await buildResult.notify({created_channel: created});
          return result;
        } else {
          context.result = await buildResult.notify({code: 300, error: 'fail to create channel, please check input!'});
          return context;
        }
      }
    }

    return context;
  };
};
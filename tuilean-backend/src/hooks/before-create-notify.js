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

    if (action === 'open'){
      //const user = context.params.user;
      const {org_channels,self_channels, operation_channels} = await channelHelper.getUserChannels(notifyData);
      context.result = buildResult.notify({org_channels,self_channels,operation_channels});
    }

    if(action === 'send' || action === 'push'){
      const result = await notifyHelper.send(notifyData);
      context.result = Object.assign(context.result,await buildResult.notify(result));
    }

    if(['receive','pull'].includes(action)){
      const result = await notifyHelper.receive(notifyData);
      context.result = Object.assign(context.result,await buildResult.notify(result));
    }

    return context;
  };
};

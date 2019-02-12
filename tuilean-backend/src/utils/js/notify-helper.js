

module.exports = function(context, options) {
  const channelHelper = require('./channel-helper')(context,options);
  //const contextParser = require('../utils/js/context-parser')(context, options);


  //const contextParser = require('./context-parser')(context,options);
  //const channelHelper = require('./channel-helper');

  // const validateEmail = (email) => {
  //   var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  //   return re.test(String(email).toLowerCase());
  // };

  const send = async notifyData => {
    const notificationService = context.app.service('notifications');
    //return await notifyService.create({action: 'send', data: options},context.params);

    let { from_channel, to_channel, listen, contents } = notifyData;
    from_channel = await channelHelper.getChannel(from_channel);
    to_channel = await channelHelper.getChannel(to_channel);
    if(typeof listen === 'string'){
      listen = { type: 'notify', path: listen};
    }
    listen.type === listen.type || 'notify';
    notifyData.listen = listen;

    if (from_channel && to_channel && listen && listen.type && listen.path && contents){
      if (await channelHelper.checkAllowListen(notifyData)){
        notifyData.sender = context.params.user;
        const created_to = await notificationService.create(notifyData);
        const event_id = listen.type + '-'+ listen.path + '-' + to_channel._id;
        context.service.emit(event_id, {data: created_to});
        return { notification: created_to, emit: event_id};
      } else {
        throw new Error('not allow notify!');
      }
    } else {
      throw new Error('please check input!');
    }
  };

  return {send };
};


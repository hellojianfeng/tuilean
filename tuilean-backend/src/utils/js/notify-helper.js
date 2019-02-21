
module.exports = function(context, options) {
  const channelHelper = require('./channel-helper')(context,options);
  const notificationService = context.app.service('notifications');
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

    if (from_channel && to_channel && listen && contents){
      if (await channelHelper.checkAllowListen(notifyData)){
        notifyData.sender = context.params.user;
        const created_to = await notificationService.create(notifyData);
        const event_id = 'notify' + '-'+ listen + '-' + to_channel._id;
        context.service.emit(event_id, {data: created_to});
        return { notification: created_to, emit: event_id};
      } else {
        throw new Error('not allow notify!');
      }
    } else {
      throw new Error('please check input!');
    }
  };

  const find = async notifyData => {

    let { sent, received, from, to, from_channel, to_channel, from_scopes, to_scopes } = notifyData;

    from_scopes = from_scopes || sent && sent.from_scopes || sent && sent.scopes || from && from.from_scopes || from && from.scopes || from_channel && from_channel.from_scopes || from_channel && from_channel.scopes;
    from_channel = from_channel || sent && sent.from_channel || sent && sent.channel || from && from.channel || from && from.from_channel;

    to_scopes = to_scopes || received && received.to_scopes || received && received.scopes || to && to.scopes || to && to.to_scopes || to_channel && to_channel.to_scopes || to_channel && to_channel.scopes;
    to_channel = to_channel || received && received.to_channel || received && received.channel || to && to.channel || to && to.to_channel;

    from_scopes = await channelHelper.formatScope(from_scopes);
    to_scopes = await channelHelper.formatScope(to_scopes);
    from_channel = await channelHelper.getChannel(from_channel) || await channelHelper.getChannel({scopes: from_scopes});
    to_channel = await channelHelper.getChannel(to_channel) || await channelHelper.getChannel({scopes: to_scopes});

    sent = sent || {};
    sent = Object.assign({ $limit: 20, $skip : 0, $sort: { createdAt: -1 }}, sent) ;
    
    received = received || {};
    received = Object.assign({ $limit: 20, $skip : 0, $sort: { createdAt: -1 }}, received) ;

    const to_listen = to && to.listen || received && received.listen;
    const from_listen = from && from.listen || sent && sent.listen;
    
    let sent_notifications, received_notifications;

    if (from_listen && sent && from_channel){
      const finds = await notificationService.find({query:{
        $limit: received.$limit,
        $skip: received.$skip,
        $sort: received.$sort,
        'from_channel._id': from_channel._id,
        listen: from_listen
      }});
      sent_notifications = finds.data;
    }

    if(to_listen && received && to_channel){
      const finds = await notificationService.find({query:{
        $limit: sent.$limit,
        $skip: sent.$skip,
        $sort: sent.$sort,
        'to_channel._id': to_channel._id,
        listen: to_listen
      }});
      received_notifications = finds.data;
    }

    return {sent_notifications, received_notifications };
  };

  return {send, find };
};


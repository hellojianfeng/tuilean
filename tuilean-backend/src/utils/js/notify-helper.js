
const objectHash = require('object-hash');
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

  const find = async notifyData => {

    let { from_channel, to_channel, from_scopes, to_scopes, listen } = notifyData;

    from_channel = await channelHelper.getChannel(from_channel);
    to_channel = await channelHelper.getChannel(to_channel);
    from_scopes = await channelHelper.formatScope(from_scopes);
    to_scopes = await channelHelper.formatScope(to_scopes);

    const listenPath = typeof listen === 'string' ? listen : listen && listen.path;

    let sent = notifyData.send || { $limit: 20, $skip : 0, $sort: { createdAt: -1 }};
    let receive = notifyData.receive || { $limit: 20, $skip : 0, $sort: { createdAt: -1 }};
    let sent_notifications, receive_notifications;

    if ( listenPath){
      if (sent){
        if (from_channel){
          sent = Object.assign(sent, {
            from_channel,
            path: listenPath
          });
          const finds = await notificationService(sent);
          sent_notifications = finds.data;
        } else if (from_scopes){
          const scopes_hash = objectHash(from_scopes);
          sent = Object.assign(sent, {
            scopes_hash,
            path: listenPath
          });
          const finds = await notificationService(sent);
          sent_notifications = finds.data;
        }
      }

      if(receive){
        if (to_channel){
          receive = Object.assign(receive, {
            to_channel,
            path: listenPath
          });
          const finds = await notificationService.find({query:receive});
          receive_notifications = finds.data;
        } else if(to_scopes){
          const scopes_hash = objectHash(to_scopes);
          receive = Object.assign(receive, {
            'to_channel.scopes_hash': scopes_hash,
            path: listenPath
          });
          const finds = await notificationService.find({query:receive});
          receive_notifications = finds.data;
        }
      }
    }

    return {sent_notifications, receive_notifications };
  };

  return {send, find };
};


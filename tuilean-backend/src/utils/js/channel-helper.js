

module.exports = function(context, options) {

  const contextParser = require('./context-parser')(context,options);

  const filterJoiners = ( options ) => {
    let { inviter, joiners, type } = options;
    const allow_joiners = [];

    joiners.map ( o => {
      const e = o.page || o.operation;
      e.channels.allow.map( a => {
        if (type && type === 'notify' && a.channel && a.channel.type && a.channel.type === type ){
          if ( inviter.page && a.scopes){
            a.scopes.map ( s => {
              if ( s.page && s.page === inviter.page){
                allow_joiners.push(o);
              }
            });
          }
          if ( inviter.operation && inviter.operation.path && inviter.operation.org_path && a.scopes ){
            a.scopes.map ( o => {
              if(o.operation && o.operation.path && o.operation.path === inviter.operation.path){
                if(o.operation.org_path && o.operation.org_path === inviter.operation.org_path){
                  allow_joiners.push(o);
                }
              }
            });
          }
        }
      });
    });

    return { inviter, allow_joiners, joiners };
  };

  const addChannelScopes = async ( options ) => {
    const userService = context.app.service('users');
    const operationService = context.app.service('operations');

    const { scopes, channel } = options;
    const channels = [];
    for ( const scope of scopes){
      const { page, operation, roles, permissions, users } = scope;

      if ( page || operation ){
        if (users && users.length > 0) {
          for ( const email of users ){
            const finds = await userService.find({query:{email}});
            const user = finds.data[0];
            if (user){
              user.channels = user.channels || {};
              user.channels.joined = user.channels.joined || [];
              let isNewChannel = true;
              user.channels.joined.map ( o => {
                if ( o.channel.oid.equals(channel._id)){
                  //to-do: how to determind scope is exist?
                  o.scopes.push({page, operation,roles, permissions});
                  channels.push({page, operation,roles, permissions,user});
                  isNewChannel = false;
                }
              });
              if(isNewChannel){
                user.channels.joined.push({channel: { oid: channel._id, path: channel.path} , scopes: [{page, operation,roles, permissions}]});
                channels.push({page, operation,roles, permissions,user});
              }
  
              await userService.patch(user._id, {channels: user.channels});
            }
          }
          continue;
        }

        if ( operation)
        {
          operation.channels = operation.channels || {};
          operation.channels.joined = operation.channels.joined || [];
          let isNewChannel = true;
          operation.channels.joined.map ( o => {
            if ( o.channel.oid.equals(channel._id)){
              //to-do: how to determind scope is exist?
              o.scopes.push({roles, permissions});
              channels.push({roles, permissions,operation});
              isNewChannel = false;
            }
          });
          if(isNewChannel){
            operation.channels.joined.push({channel: { oid: channel._id, path: channel.path} , scopes: [{roles, permissions}]});
            channels.push({roles, permissions,operation});
          }
          await operationService.patch(operation._id, {channels: operation.channels});
        }
      } else {
        channels.push({code: 201, error: 'must provide operation or page for channel scope!'});
      }
    }

    return channels;
  };

  const getChannel = async ( options ) => {
    if (options && options._id && options.path && options.type){
      return options;
    }
  };

  const findOrCreateChannel = async ( options ) => {
    return options;
  };

  return {

    filterJoiners,

    getUserChannels: async ( options = {}) => {

      const user = context.params.user;

      const typeChannels = ( owners, type ) => {
        const channels = [];
        owners.map ( o => {
          channels.concat(o.channels.joined.map ( c => {
            return c.channel.type === type;
          }));
        });
        return channels;
      };

      const type = options.type || 'notify';

      const { user_operations } = await contextParser.parse();

      const user_operation_channels = typeChannels(user_operations,type);
      const user_self_channels = typeChannels([user],type);

      const user_all_channels = user_operation_channels.concat(user_self_channels);
      return { user_all_channels,user_operation_channels,user_self_channels};
    },

    createChannel: async ( options ) => {
      let { creator, joiners, type, name, path, tags, description } = options;
      const channelService = context.app.service('channels');
      const { inviter, allow_joiners } = filterJoiners({inviter: creator,joiners, type});

      if ( name && !path){
        path = name;
      }

      if (!name && path){
        name = path;
      }

      type = type || 'notify';

      const admins = [ creator ];

      allow_joiners.push(inviter);

      //if not find channel, create it
      if (allow_joiners.length > 0)
      {
        const channel =  await channelService.create({admins, type, tags, description, name, path});
        await addChannelScopes({channel,scopes: allow_joiners});
        return channel;
      }

      return { code: 300, error: 'fail to create channel! please check input!'};
    },

    joinToChannel: async ( options ) => {

      const joiners = filterJoiners(options);

      if (joiners.length > 0 && options.channel){
        return await addChannelScopes({channel: options.channel,scopes: joiners});
      } else {
        return { code: 300, error: 'no joiners allowed to join channel!'};
      }
    },

    getChannel, findOrCreateChannel

  };
};


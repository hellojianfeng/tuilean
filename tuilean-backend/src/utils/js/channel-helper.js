

module.exports = async function(context, options) {

  const contextParser = require('./context-parser')(context,options);

  return {

    filterJoiners: async ( options ) => {
      const { inviter, joiners } = options;

      return joiners.map ( o => {
        if(o.channel.allow_inviters.include(inviter)){
          return o;
        }
      });
    },

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
      const user_self_channels = typeChannels(user,type);

      const user_all_channels = user_operation_channels.concat(user_self_channels);
      return { user_all_channels,user_operation_channels,user_self_channels};
    },

    createChannel: async ( options ) => {
      let { inviter, joiners, type, name, path, tags, description } = options;
      const channelService = context.app.service('channels');
      joiners  = this.filterScope({inviter,joiners});

      inviter.is_admin = true;
      const adminers = [ inviter ];

      const scopes = joiners.push(inviter);

      //if not find channel, create it
      if (scopes.length > 0)
      {
        const channel =  await channelService.create({adminers, type, tags, description, name, path});
        await this.addChannelScopes(channel,scopes);
        return channel;
      }

      return { code: 300, error: 'fail to create channel! please check input!'};
    },

    joinToChannel: async ( options ) => {

      const joiners = this.filterJoiners(options);

      if (joiners.length > 0 && options.channel){
        return await this.addChannelScopes({channel: options.channel,scopes: joiners});
      } else {
        return { code: 300, error: 'no joiners allowed to join channel!'};
      }
    },

    addChannelScopes: async ( options ) => {
      const userService = context.app.service('users');
      const operationService = context.app.service('operations');

      const { scopes, channel } = options;
      const channels = [];
      for ( const scope of scopes){
        const { page, operation, roles, permissions, users } = scope;

        if ( page || operation ){
          if (users && users.length > 0) {
            for ( const user of users ){
              const newChannel = { channel, scopes: { page, operation,roles, permissions} };
              user.channels = user.channels || {};
              user.channels.joined = user.channels.joined || [];
              user.channels.joined.push ( newChannel );
              newChannel.user = user;
              channels.push ( newChannel );

              await userService.patch({_id: user._id}, {channels: user.channels});
            }
            continue;
          }

          if ( operation)
          {
            const newChannel = { channel, scopes: { roles, permissions} };
              user.channels = user.channels || {};
              user.channels.joined = user.channels.joined || [];
              user.channels.joined.push ( newChannel );
            operation.channels.push( { channel, scopes:  });
            channels.push( { operation, channel });
            await operationService.patch(operation._id, {channels: operation.channels});
          }
        } else {
          channels.push({code: 201, error: 'must provide operation or page for channel scope!'});
        }
      }

      return channels;
    }

  };
};


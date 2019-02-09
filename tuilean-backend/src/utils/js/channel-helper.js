
const objectHash = require('object-hash');
module.exports = function(context, options) {

  const contextParser = require('./context-parser')(context,options);
  const channelService = context.app.service('channels');
  const user = context.params.user;

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
    const { channel } = options;

    const scopes = channel.scopes;

    for ( const scope of scopes){
      let { owner } = scope;
      if (owner && owner.user){
        const finds = await userService.find({query:{email: owner.user}});
        const user = finds.data[0];
        if (user){
          user.channels = user.channels || {};
          user.channels.joined = user.channels.joined || [];
          let isNewChannel = true;
          user.channels.joined.map ( o => {
            if ( o.oid.equals(channel._id)){
              //to-do: how to determind scope is exist?
              o.scopes.push(scope);
              isNewChannel = false;
            }
          });

          if(isNewChannel){
            user.channels.joined.push({ oid: channel._id, path: channel.path, scopes_hash: channel.scopes_hash, scopes: [scope]});
          }

          await userService.patch(user._id, {channels: user.channels});
        }
      }

      if (owner && owner.operation){
        const operation = await contextParser.getOperation(owner.operation);
        operation.channels = operation.channels || {};
        operation.channels.joined = operation.channels.joined || [];
        let isNewChannel = true;
        operation.channels.joined.map ( o => {
          if ( o.oid.equals(channel._id)){
            o.scopes.push(scope);
            isNewChannel = false;
          }
        });
        if(isNewChannel){
          operation.channels.joined.push({oid: channel._id, path: channel.path, scopes_hash: channel.scopes_hash, scopes: [scope]});
        }
        await operationService.patch(operation._id, {channels: operation.channels});
      }
    }
  };

  const getChannel = async ( options ) => {
    const channelData = options.channel || options;
    if (channelData && channelData._id && channelData.path && channelData.scopes && channelData.scopes_hash){
      return channelData;
    }
    if(channelData.scopes && channelData.path){
      const scopes_hash = objectHash(channelData.scopes);
      const finds = await channelService.find({query:{scopes_hash: scopes_hash, path: channelData.path}});
      if(finds.total === 1){
        return finds.data[0];
      }
    }
  };

  const findOrCreateChannel = async ( options ) => {
    const {scope, path} = options;
    if(scope && path && !path.startsWith('$')){
      const scope_hash = objectHash(scope);
      let query = { scope_hash, path};
      const finds = await channelService.find({query});
      if(finds.total === 1){
        return finds.data[0];
      }
      return await createChannel(options);
    } else {
      return { code: 301, error:'please provide scope and path for create channel!'};
    }
  };

  const createChannel = async options => {
    let { name, path, scopes, admin_scopes, tags, description, listens } = options;
    const channelService = context.app.service('channels');

    scopes = await formatScope(options);

    if ( name && !path){
      path = name;
    }

    if (!name && path){
      name = path;
    }

    if ( !path || !scopes ){
      return { code: 303, error: 'please provide path and scope to create channel!'};
    }

    if(admin_scopes && admin_scopes === '$same-as-scopes'){
      admin_scopes = scopes;
    }

    const channel =  await channelService.create({admin_scopes, scopes, tags, description, name, path, listens});
    await addChannelScopes({channel});
    return channel;
  };

  const getUserChannels = async ( options = {} ) => {

    const user = context.params.user;

    const { user_operations } = await contextParser.parse();

    const operation_channels = user_operations.map ( o => { return o.channels.joined; });
    const self_channels = user.channels.joined;

    let { org } = options;

    org = await contextParser.getOrg(org) || await contextParser.getCurrentOrg();

    const org_path = typeof org === 'string'? org : typeof org === 'object' && org.path;

    //all channels for org, can be channels belong to operation, channels belong to org or channels belong to role etc.
    const org_channels = [];

    if (org && org.channels && org.channels.joined){
      org_channels.concat(org.channels.joined);
    }

    //filter operation channels for org
    if (org && operation_channels && operation_channels.scopes){
      operation_channels.scopes.map( o => {
        if ( o.owner && o.owner.operation && o.owner.operation.org_path === org_path){
          org_channels.push(o);
        }
      });
    }

    return {self_channels, org_channels, operation_channels};
  };

  const joinToChannel = async ( options ) => {

    const joiners = filterJoiners(options);

    if (joiners.length > 0 && options.channel){
      return await addChannelScopes({channel: options.channel,scopes: joiners});
    } else {
      return { code: 300, error: 'no joiners allowed to join channel!'};
    }
  };

  const formatScope = async options => {
    let { scopes, org } = options;

    org = org || await contextParser.getCurrentOrg();

    scopes = scopes || [];

    for ( const scope of scopes) {
      if (scope.users && Array.isArray(scope.users)){
        scope.users.map ( u => {
          if ( u === '$email'){
            u = user.email;
          }
        });
      }

      if (scope.owner && scope.owner.operation && scope.owner.operation.org_path === '$current-org'){
        scope.owner.operation.org_path = org.path;
      }

      if (scope.owner && scope.owner.user && scope.owner.user === '$current-user'){
        scope.owner.user = user.email;
      }
    }

    return scopes;

  };

  return {

    filterJoiners, createChannel, getUserChannels, formatScope,

    getChannel, findOrCreateChannel, joinToChannel

  };
};


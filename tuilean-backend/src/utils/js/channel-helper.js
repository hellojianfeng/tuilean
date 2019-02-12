
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

  //check scopes is allowed by allow_scopes
  const checkAllowScopes = ( options ) => {

    const checkAllowUsers = ( options ) => {
      const check_users = options.check_users || [];
      const allow_users = options.allow_users || [];

      if (allow_users === '$any'){
        return true;
      }

      if (allow_users === '$one' && Array.isArray(check_users) && check_users.length === 1){
        return true;
      }

      if (Array.isArray(allow_users) && Array.isArray(check_users)){
        let isAllow = false;
        check_users.map ( c_user => {
          if ( allow_users.includes(c_user)){
            isAllow = true;
          }
        });
        return isAllow;
      }

      return false;
    };

    const checkAllowPages = ( options ) => {
      const checks = options.check_pages || [];
      const allows = options.allow_pages || [];

      if (allows === '$any'){
        return true;
      }

      if (Array.isArray(allows) && Array.isArray(checks)){
        let isAllow = false;
        checks.map ( check => {
          if ( allows.includes(check)){
            isAllow = true;
          }
        });
        return isAllow;
      }

      return false;
    };

    const check_scopes = options.check_scopes || [];
    const allow_scopes = options.allow_scopes || [];
    let isAllow = false;

    check_scopes.map ( c_scope => {
      if (c_scope.owner && c_scope.owner.operation){
        allow_scopes.map ( a_scope => {
          if (a_scope && a_scope.owner && a_scope.owner.operation){
            if ( c_scope.owner.operation.toString() === a_scope.owner.operation.toString() || a_scope.owner.operation === '$any'){
              isAllow = true;
              if (a_scope.users && ! c_scope.users){
                isAllow = false;
              }
              if (a_scope.users && c_scope.users && !checkAllowUsers({check_users: c_scope.users, allow_users: a_scope.users})){
                isAllow = false;
              }
            }
          }
        });
      }
      if (c_scope.owner && c_scope.owner.user){
        allow_scopes.map ( a_scope => {
          if (a_scope && a_scope.owner && a_scope.owner.user){
            if ( c_scope.owner.user === a_scope.owner.user || a_scope.owner.user === '$any'){
              isAllow = true;
              if (a_scope.pages && ! c_scope.pages){
                isAllow = false;
              }
              if (a_scope.pages && c_scope.pages && !checkAllowPages({check_pages: c_scope.pages, allow_pages: a_scope.pages})){
                isAllow = false;
              }
            }
          }
        });
      }
    });
    return isAllow;
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
            if ( o._id.equals(channel._id)){
              //to-do: how to determind scope is exist?
              o.scopes.push(scope);
              isNewChannel = false;
            }
          });

          if(isNewChannel){
            user.channels.joined.push({ _id: channel._id, path: channel.path, scopes_hash: channel.scopes_hash, scopes: [scope]});
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
          if ( o._id.equals(channel._id)){
            o.scopes.push(scope);
            isNewChannel = false;
          }
        });
        if(isNewChannel){
          operation.channels.joined.push({_id: channel._id, path: channel.path, scopes_hash: channel.scopes_hash, scopes: [scope]});
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
    const {scopes, path} = channelData;
    if(scopes && path && !path.startsWith('$')){
      const scopes_hash = objectHash(scopes);
      let query = { scopes_hash, path};
      const finds = await channelService.find({query});
      if(finds.total === 1){
        return finds.data[0];
      }
    }
  };

  const findOrCreateChannel = async ( options ) => {
    const {scopes, path} = options;
    if(scopes && path && !path.startsWith('$')){
      const scopes_hash = objectHash(scopes);
      let query = { scopes_hash, path};
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
    let { name, path, scopes, admin_scopes, tags, description, allow } = options;
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

    const channel =  await channelService.create({admin_scopes, scopes, tags, description, name, path, allow});
    await addChannelScopes({channel});
    return channel;
  };

  const getUserChannels = async ( options = {} ) => {

    const user = context.params.user;

    const { user_operations } = await contextParser.parse();

    let operation_channels = [];
    user_operations.map ( o => {
      operation_channels = operation_channels.concat(o.channels.joined);
    });
    const self_channels = user.channels.joined;

    let { org, operation } = options;

    org = await contextParser.getOrg(org) || await contextParser.getCurrentOrg();
    if(typeof operation === 'string'){
      operation = {
        org, path: operation
      };
    }
    operation = await contextParser.getOperation(operation);

    const org_path = typeof org === 'string'? org : typeof org === 'object' && org.path;

    //all channels for org, can be channels belong to operation, channels belong to org or channels belong to role etc.
    const org_channels = [];

    if (org && org.channels && org.channels.joined){
      org_channels.concat(org.channels.joined);
    }

    //filter operation channels for org
    if (org && operation_channels && Array.isArray(operation_channels)){
      operation_channels.map( channel => {
        if (channel.scopes && Array.isArray(channel.scopes)){
          channel.scopes.map ( scope => {
            if ( scope.owner && scope.owner.operation && scope.owner.operation.org_path === org_path){
              org_channels.push(channel);
            }
          });
        }
      });
    }

    if(operation){
      operation_channels =operation_channels.filter( o => {
        return o.path === operation.path && o.org_path === operation.org_path;
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

  const checkAllowListen = async options => {
    let {from_channel, to_channel, listen} = options;
    from_channel = await getChannel(from_channel);
    to_channel = await getChannel(to_channel);

    if ( from_channel && to_channel && listen ){
      let listens = to_channel && to_channel.allow && to_channel.allow.listens || [];

      listens = listens.map ( alisten => {
        if (alisten.type === listen.type ){
          if (alisten.path === listen.path && alisten.scopes_hash === from_channel.scopes_hash){
            return alisten;
          }
          if (alisten.path === listen.path && alisten.scopes && from_channel.scopes){
            return checkAllowScopes({check_scopes: from_channel.scopes, allow_scopes: listen.scopes});
          }
        }
      });
      return listens.length > 0;
    }
    return false;
  };

  return {

    filterJoiners, createChannel, getUserChannels, formatScope,

    getChannel, findOrCreateChannel, joinToChannel, checkAllowScopes, checkAllowListen

  };
};


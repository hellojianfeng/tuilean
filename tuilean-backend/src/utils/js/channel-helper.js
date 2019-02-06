
const objectHash = require('object-hash');
module.exports = function(context, options) {

  const contextParser = require('./context-parser')(context,options);
  const channelService = context.app.service('channels');

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

    const scope = channel.scope;

    //add page and page scope
    const scopes = scope.operations || scope.pages;
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
    const channelData = options.channel || options;
    if (channelData && channelData._id && channelData.path && channelData.scope){
      return channelData;
    }
    if(channelData.scope && channelData.path){
      const scope_hash = objectHash(channelData.scope);
      const finds = await channelService.find({query:{scope_hash: scope_hash, path: channelData.path}});
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
    let { name, path, scope, admins, tags, description, allow } = options;
    const channelService = context.app.service('channels');

    scope = await formatScope(options);

    if (path && path === '$operation-channel-path'){
      const operation = scope.operations && scope.operations[0];
      if(operation && operation.org_path && operation.path){
        path = 'operation.' + operation.org_path + '.' + operation.path;
      }
    }

    if (path && path === '$page-user-channel-path'){
      const page = scope.pages && scope.pages[0];
      const user = page && page.users && page.users[0];
      if(page && user){
        path = 'page.' + page + '.' + user;
      }
    }

    if ( name && !path){
      path = name;
    }

    if (!name && path){
      name = path;
    }

    if ( !path || !scope ){
      return { code: 303, error: 'please provide path and scope to create channel!'};
    }

    if(admins && admins === '$same-as-scope'){
      admins = scope;
    }

    const channel =  await channelService.create({admins, scope, tags, description, name, path, allow});
    await addChannelScopes({channel});
    return channel;
  };

  const getUserChannels = async ( options = {} ) => {

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
    let { scope, org } = options;

    org = org || contextParser.getCurrentOrg();

    if (scope && scope.operations && Array.isArray(scope.operations)){
      for(const operation of scope.operations){
        if (operation.org_path === '$current_org' && org){
          operation.org_path = org.path;
        }
      }
    }

    return scope;

  };

  return {

    filterJoiners, createChannel, getUserChannels, formatScope,

    getChannel, findOrCreateChannel, joinToChannel

  };
};


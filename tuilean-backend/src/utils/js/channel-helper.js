

module.exports = async function(context, options) {

  const contextParser = require('./context-parser')(context,options);
  
  return {
      
    formatOwner: async (scope ) => {
      //to-do: need to format scope according to model design of scope
      return scope;
    },

    formatJoiners: async ( data ) => {},

    filterJoiners: async ( owner, joiners ) => {},

    //get all channels below to operation or page
    getChannels: async ( options = {} ) => {
      const channelService = context.app.service('channels');
      const operation = options.operation && await contextParser.getOperation(options.operation) || null;
      const page = options.page || null;
      const user = context.params.user;
    
      // if(operation){
      //   const finds = channelService.find({
      //     query: {
      //       'from_scope':{
      //         $elemMatch:{
      //           $or: [
      //             {
      //               $and: [
      //                 { users: { $exist: true }},
      //                 { 'users.oid': user._id}
      //               ]
      //             },
      //             {
      //               'operation.oid': operation._id
      //             }
      //           ]
      //         }
      //       }
      //     }
      //   });
      //   return finds.data;
      // }
    
      // if(page){
      //   const finds = channelService.find({
      //     query: {
      //       'from_scope':{
      //         $elemMatch:{
      //           $or: [
      //             {
      //               $and: [
      //                 {
      //                   page,
      //                 },
      //                 { users: { $exist: true }},
      //                 { 'users.oid': user._id}
      //               ]
      //             },
      //             {
      //               $and: [
      //                 {
      //                   page,
      //                 },
      //                 {
      //                   users: { $exist: false }
      //                 }
      //               ]
      //             }
      //           ]
      //         }
      //       }
      //     }
      //   });
      //   return finds.data;
      // }
    },

    getUserChannels: async ( options = {}) => {

      const user = context.params.user;

      const typeChannels = ( owners, type ) => {
        const channels = [];
        owners.map ( o => {
          channels.concat(o.channels.map ( c => {
            return c.type === type;
          }));
        });
        return channels;
      };

      const type = options.type || 'notify';

      const { user_orgs, user_roles, user_permissions, user_operations } = await contextParser.parse();
      
      const user_org_channels = typeChannels(user_orgs,type);
      const user_role_channels = typeChannels(user_roles,type);
      const user_permission_channels = typeChannels(user_permissions, type);
      const user_operation_channels = typeChannels(user_operations,type);
      const user_self_channels = typeChannels(user,type);

      const user_channels = user_operation_channels.concat(user_org_channels,user_role_channels,user_permission_channels,user_self_channels);
      return { user_channels, user_org_channels,user_role_channels,user_permission_channels,user_operation_channels,user_self_channels};
    },

    findOrCreateChannel: async ( options ) => {
      let { from_scope, to_scopes, name, path } = options;
      const channelService = context.app.service('channels');
      from_scope  = this.formatScope(from_scope);
      to_scopes = this.formatScope(to_scopes);
      to_scopes = this.filterScope(to_scopes);

      const finded = await channelService.find({from_scope,path});
      if(finded.total > 0){
        return finded.data[0];
      }

      //if not find channel, create it
      if (to_scopes.length > 0)
      {
        return await channelService.create({from_scope, name, path});
      }

      return { code: 300, error: 'fail to create channel!'};
    },
  
    //get listeners for user under some operation and page
    getListeners: async ( options = {} ) => {
      const { current_page, current_operation, operation_user_roles, operation_user_permissions }= contextParser.parse();
      const channelService = context.app.service('channels');
      const user = context.params.user;
  
      let finds = [];
  
      const operation = options.operation && operation._id || current_operation && current_operation._id;
      const page = options.page && page.name || current_page && current_page.name;
  
      if (operation){
        const role_ids = operation_user_roles.map ( o => {
          return o._id;
        });
        const permission_ids = operation_user_permissions.map ( o => {
          return o._id;
        });
  
        finds = await channelService.find({
          query: {
            'from_scope.operation.oid':operation._id,
            'to_scope':{
              $elemMatch:{
                $and: [
                  {
                    $or: 
                        [
                          {'users': { $exist: false }},
                          {'users.oid': user._id}
                        ]
                  },
                  {
                    $or: 
                        [
                          {'roles': { $exist: false }},
                          {'roles.oid:': { $in: role_ids }}
                        ]
                  },
                  {
                    $or: 
                        [
                          {'permissions': { $exist: false }},
                          {'permissions.oid:': { $in: permission_ids }}
                        ]
                  }
                ]
              }
            }
          }
        });
      }
  
      if (page){
        finds = await channelService.find({
          query: {
            'from_scope.page.name':page.name,
            'to_scope':{
              $elemMatch:{
                $or: [
                  {'users': { $exist: false }},
                  {'users.oid': user._id }
                ]
              }
            }
          }
        });
      }
  
      if (finds && finds.data){
        return finds.data.map ( o => {
          const type = options.type || o.type;
          return type + '_'+ o.channel_id;
        });
      }
  
      return finds;
    },
  
    filterScopeByAllow: async (from_scope, to_scope) => {
      let scopes = [];
      if ( to_scope && from_scope){
        let from_org;
        if (from_scope.operation){
          from_org = from_scope.operation.org_path;
        }
        if (from_scope.page && from_scope.page.name === 'user-home'){
          // user-home page can send notifications to any scope
          scopes = to_scope;
          //to-do: should filter scope according to setting in to_scope, can complete it in future
        }
        to_scope.map ( async o => {
          //always allow notification to user-home page, to-do: user-home can only accept some scope notification
          // need to develop later
          if ( o.page && o.page.name === 'user-home'){
            scopes.push(o);
          }
          //if to operation org is same as from operation org, always allow notification each other
          else if (o.operation && o.operation.org_path && o.operation.org_path === from_org){
            scopes.push(o);
          } 
          //allow send notifcations to follow orgs
          else if ( o.operation.org_id && o.operation.org_path){
            const {user_follow_orgs} = await contextParser.parse();
            user_follow_orgs.map(f=>{
              if(f.path === o.operation.org_path){
                scopes.push(o);
              }
            });
          }
        });
      }
  
      return scopes;
    }

  };
};
  
  

/**
 * input format:
 *  {
 *    org:{ path(or _id) of org },
 *    follow: {
 *      roles: [ path(or _id) of role ],
 *      permissions: [ path(or _id) of permission]
 *    }
 *  }
 */
const _ = require('underscore');
module.exports = async function (context, options = {}) {

  //const mongooseClient = context.app.get('mongooseClient');

  const orgService = context.app.service('orgs');
  //const roleService = context.app.service('roles');
  //const permissionService = context.app.service('permissions');

  const followData = options && options.follow || context && context.data && context.data.data && context.data.data.follow;

  const contextParser = require('./context-parser')(context,options);
  const org = await contextParser.getOrg({org: followData.org_path});
  const current_org = await contextParser.getCurrentOrg();

  const newRoles = [];
  if (followData && followData.roles){
    for ( const r of followData.roles){
      if (typeof r === 'object' && r._id && r.path){
        newRoles.push(r);
        continue;
      }
      let role;
      if(typeof r === 'string'){
        role = await contextParser.getRole({ path: r, org: current_org });
      }
      if (typeof r === 'object' && r._id && r.path){
        role = r;
      }
      if(role && role._id && role.path){
        newRoles.push({_id: role._id, path: role.path});
      }
    }
  }

  const newPermissions = [];
  if (followData && followData.permissions){
    for ( const p of followData.permissions){
      if (typeof p === 'object' && p._id && p.path){
        newPermissions.push(p);
        continue;
      }
      let permission;
      if(typeof p === 'string'){
        permission = await contextParser.getPermission({ path: p, org });
      }
      if (typeof p === 'object' && p._id && p.path){
        permission = p;
      }
      if(permission && permission._id && permission.path){
        newPermissions.push({_id: permission._id, path: permission.path});
      }
    }
  }

  let changed = false;
  if (current_org && newPermissions.length > 0 && newRoles.length > 0){
    let finded = false;
    current_org.follows.map ( o => {
      if ( o.org_id.equals(org._id) ){
        finded = true;
        newRoles.map ( nr => {
          if(!_.contains(o.roles, nr))
          {
            o.roles.push(nr);
            changed = true;
          }
        });
        newPermissions.map ( np => {
          if(!_.contains(o.permissions, np))
          {
            o.permissions.push(np);
            changed = true;
          }
        });
        followData.tags.map ( t => {
          if (!o.tags.include(t)){
            o.tags.push(t);
          }
        });
      }
      return o;
    });

    if(!finded){
      changed = true;
      current_org.follows.push(
        {
          org_id: org._id,
          org_path: org.path,
          roles: newRoles,
          permissions: newPermissions,
          tags: followData.tags
        }
      );
    }
  }

  if (changed){
    await orgService.patch(current_org._id, { follows: current_org.follows });
  }

  return context.result = current_org;
};



module.exports = async function (context, options = {}) {

  //const operationData = context.data.data || {};
  //const operation = options.current_operation;
  const action = context.data.action || 'open';
  const contextParser = require('../../../utils/js/context-parser')(context,options);
  const buildResult = require('../../../utils/js/build-result')(context,options);
  const _ = require('lodash');
  
  //const mongooseClient = context.app.get('mongooseClient');
  const userService = context.app.service('users');
  
  //open action return org user list
  if (action === 'open'){
  
    const result = {};
  
    const {operation_org_users, operation_org_roles, operation_org_permissions, operation_org_operations} = await contextParser.parse();
  
    result.org_users = operation_org_users;
    result.org_permissions = operation_org_permissions.filter( r => {
      return r.path !== 'followone'; // not allow add user directly into this role
    });
    result.org_roles = operation_org_roles;
    result.org_operations = operation_org_operations.filter(o=>{
      return o.path !== 'org-initialize';
    });
  
    context.result = await buildResult.operation(result);
    
    return context;
  }
  
  //if not provide role for user, use everyone role
  /**
     * input: 
     */
  if (action === 'add-user-role' || action === 'add-org-user'){
    const result = {};
    let {role,roles,user,everyone_role} = await contextParser.parse();
    if(!user){
      context.result = await buildResult.page({error: 500, message:'use is not exist! please specify user in operation data'});
      return context;
    }
    if (role){
      roles.push(role);
    }
    roles = _.uniqBy(roles, r => { return r.path;});
  
    if (roles.length === 0){
      roles.push(everyone_role);
    }

    const user_roles = await contextParser.getOrgUserRoles({user});
  
    if(user && roles.length > 0){
      roles = roles.concat(user_roles);
      roles = _.uniqBy(roles, r => {
        return r.path;
      });
    
      user.roles = roles.map ( r => {
        return {
          oid: r._id,
          path: r.path,
          org_id: r.org_id,
          org_path: r.org_path
        };
      });
      await userService.patch(user._id,{roles: user.roles});
      result.user = user;
      context.result = await buildResult.operation(result);
    } else {
      throw new Error('no valid user or role(s)!');
    }
    return context;
  }
  
  if(action === 'create-org-user'){
    const result = {};
    const createUserData = context.data && context.data.data;
    const {everyone_role, role, roles} = await contextParser(context,options);
    if (typeof createUserData === 'object' && createUserData.email){
      createUserData.password = createUserData.password || 'password123';
      const finds = await userService.find({query:{email: createUserData.email}});
      if (finds.total > 0){
        context.result = await buildResult.operation({error: 500, message: 'user exist already!'});
        return context;
      }
      if(createUserData.roles) delete createUserData.roles;
      const user = await userService.create(createUserData);
      if (user){
        user.roles = [ { oid: everyone_role._id, path: everyone_role.path, org_id: everyone_role.org_id, org_path: everyone_role.org_path}];
        if (role){
          roles.push(role);
        }
        user.roles = user.roles.concat(roles.map( r => {
          return {
            oid: r._id,
            path: r.path,
            org_id: r.org_id,
            org_path: r.org_path
          };
        }));
        user.roles = _.uniqBy(user.roles, r => { return r.path; });
        await userService.patch(user._id, { roles: user.roles });
        result.user = await userService.get(user._id);
        context.result = await buildResult.operation(result);
        return context;
      }
    }
  
    context.result = await buildResult.operation({error: 500, message:'do nothing in create-org-user!'});
  }
  
  if (action === 'find-org-user' || action === 'org-user-find'){
    const { current_operation_org } = await contextParser(context,options);
    const orgPath = current_operation_org.path;
    const inputData = context.data.data;
  
    const limit = inputData.limit || 50;
    const skip = inputData.skip || 0;
  
    const finds = await userService.find({query: { 
      $limit: limit, $skip: skip,
      $or: [
        {'roles.org_path': orgPath},
        {'permissions.org_path':orgPath},
        {'operations.org_path': orgPath}
      ]}});
  
    context.result = finds.data.map ( u => {
      u.roles = u.roles.filter ( r => {
        return r.org_path === orgPath;
      });
      return u;
    });
    return context;
  }
  
  return context;
};
  
  
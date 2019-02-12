module.exports = function (context,options={}, refresh=false) {

  const orgService = context.app.service('orgs');
  const operationService = context.app.service('operations');
  const permissionService = context.app.service('permissions');
  const roleService = context.app.service('roles');
  const userService = context.app.service('users');

  const mongoose = require('mongoose');
  const ObjectId = mongoose.Types.ObjectId;

  context.model_parser = context.model_parser || {};

  const roleData = options.role || context.data && context.data.data && context.data.data.role;
  const rolesData = options.roles || context.data && context.data.data && context.data.data.roles || [];
  const permissionData = options.permission || context.data && context.data.data && context.data.data.permission;
  const permissionsData = options.permissions || context.data && context.data.data && context.data.data.permissions || [];
  const operationData = options.operation || context.data && context.data.data && context.data.data.operation;
  const operationsData = options.operations || context.data && context.data.data && context.data.data.operations || [];
  const orgData = options.org || context.data && context.data.org ||context.data && context.data.data && context.data.data.org;
  const followOrgData = options.follow || context.data && context.data.follow || context.data && context.data.data && context.data.data.follow;
  const userData = options.user || context.data && context.data.data && context.data.data.user;
  const usersData = options.user || context.data && context.data.data && context.data.data.users || [];
  const currentOperationData = options.org || context.data && context.data.operation;

  let user,users, org,role,roles,permission, permissions,operation, operations;
  let everyone_role, everyone_permission,current_operation,current_operation_org,current_org,follow_org;

  const getOrg = async ( orgData ) => {
    let orgPath;
    if ( typeof orgData === 'object'){
      if (orgData._id && orgData.path){
        return orgData;
      }
      if(orgData._id && ObjectId.isValid(orgData._id)){
        return await orgService.get(orgData._id);
      }
      if(orgData.path && typeof orgData.path === 'string'){
        orgPath = orgData.path;
      }
      if(orgData.org && typeof orgData.org === 'string'){
        if(ObjectId.isValid(orgData.org)){
          return await orgService.get(orgData.org);
        }
        orgPath = orgData.org;
      }
    }

    if (typeof orgData === 'string'){
      if(orgData && ObjectId.isValid(orgData)){
        return await orgService.get(orgData._id);
      }
      orgPath = orgData;
    }

    if (orgPath){
      const finds = await orgService.find({query: { path: orgPath}});
      if (finds.total === 1) {
        return finds.data[0];
      }
    }
  };

  const getCurrentOperation = async () => {
    let operation;
    if(typeof currentOperationData === 'string'){
      if (ObjectId.isValid(currentOperationData)){
        operation = operationService.get(currentOperationData);
      } else {
        let org = await getFollowOrg( followOrgData ) || await getOrg( orgData ) || await getCurrentOrg();
        if(org && org._id){
          context.model_parser.current_operation_org = org;
          const finds = await operationService.find({query:{path:currentOperationData,org_id: org._id, org_path: org.path}});
          if ( finds.total === 1){
            operation =  finds.data[0];
          }
        }
      }
    }
    if(operation && operation.path === 'org-home'){
      context.params.user.current_org = {_id: operation.org_id,path:operation.org_path};
      context.params.user.follow_org = null;
      delete context.model_parser.current_org;
      context.model_parser.current_org = await getCurrentOrg();
      await userService.patch(context.params.user._id, { current_org: context.params.user.current_org, follow_org: null});
    }
    if(operation && operation.path === 'org-follow'){
      context.params.user.follow_org = {_id: operation.org_id,path:operation.org_path};
      delete context.model_parser.follow_org;
      context.model_parser.follow_org = await getFollowOrg();
      await userService.patch(context.params.user._id, { follow_org: context.params.user.follow_org});
    }
    return operation;
  };

  const getCurrentOperationOrg = async () => {
    if(context.model_parser.current_operation_org && !refresh){
      return context.model_parser.current_operation_org;
    }
    const operation = await getCurrentOperation();
    if(operation && operation.org_id){
      return context.model_parser.current_operation_org = await orgService.get(operation.org_id);
    }
    return null;
  };

  const getRole = async ( roleData ) => {
    return await getModel(roleData,roleService);
  };

  const getRoles = async ( rolesData ) => {
    return getModelList(rolesData,roleService);
  };

  const getUser = async ( userData ) => {
    let email;
    if ( typeof userData === 'object'){
      if (userData._id && userData.path){
        return userData;
      }
      if(userData._id && ObjectId.isValid(userData._id)){
        return await userService.get(userData._id);
      }
      if(userData.email && typeof userData.email === 'string'){
        email = userData.email;
      }
    }

    if (typeof userData === 'string'){
      if(userData && ObjectId.isValid(userData)){
        return await userService.get(userData._id);
      }
      email = userData;
    }

    if (email){
      const finds = await userService.find({query: { email: email}});
      if (finds.total === 1) {
        return finds.data[0];
      }
    }
  };

  const getUsers = async ( usersData ) => {
    const users = [];
    let user, email;
    for (const u of usersData){
      if (typeof u === 'object') {
        if (u._id && u.path){
          users.push(u);
        }
        if(u._id && ObjectId.isValid(u._id)){
          user = await userService.get(u._id);
          users.push(user);
        }
        if(!u._id && u.path){
          email = u.email;
        }
      }
      if(typeof u === 'string'){
        if(ObjectId.isValid(u)){
          user = await userService.get(u);
          users.push(user);
        } else {
          email = u;
        }
      }
      if(email){
        const finds = await userService.find({query:{email: email}});
        if (finds.total === 1){
          users.push(finds.data[0]);
        }
      }
    }
    return users;
  };

  const getEveryoneRole = async ( org = null) => {
    org = org || await getCurrentOperationOrg() || await getCurrentOrg();
    if(org && org._id){
      const finds = await roleService.find({query:{path:'everyone',org_id:org._id}});
      if (finds.total === 1) {
        return context.model_parser.everyone_role = finds.data[0];
      }
    }
    return null;
  };

  const getEveryoneRolePermissions = async ( org = null ) => {
    const role = await getEveryoneRole( org );
    if ( role ){
      const idList = role.permissions.map ( p => {
        return p._id;
      });
      const finds = await permissionService.find({query: {_id: { $in: idList}}});
      return finds ? finds.data : [];
    }

    return [];
  };

  const getEveryoneRoleOperations = async ( org = null ) => {
    const role = await getEveryoneRole( org );
    const permissions = await getEveryoneRolePermissions( org ) || [];

    const idList = role && role.operations.map ( o => {
      return o._id;
    }) || [];

    permissions.map ( p => {
      p.operations.map ( o => {
        idList.push ( o._id);
      });
    });

    const finds = await operationService.find({query: {_id: { $in: idList}}});
    return finds ? finds.data : [];
  };

  const getEveryonePermission = async ( org = null ) => {
    org = org || await getCurrentOperationOrg() || await getCurrentOrg();
    if(org && org._id){
      const finds = await permissionService.find({query:{path:'everyone',org_id:org._id}});
      if (finds.total === 1) {
        return context.model_parser.everyone_permission = finds.data[0];
      }
    }
    return null;
  };

  const getEveryonePermissionOperations = async ( org = null) => {
    const permission = await getEveryonePermission(org);
    const idList = permission && permission.operations.map ( p => {
      return p._id;
    }) || [];
    const finds = await operationService.find({query: {_id: { $in: idList}}});
    return finds ? finds.data : [];
  };

  const getCurrentOrg = async () => {
    if (context.model_parser.current_org){
      return context.model_parser.current_org;
    } else {
      return context.model_parser.current_org = orgData && await getOrg( orgData ) || context.params.user && context.params.user.current_org && await getOrg ( context.params.user.current_org);
    }
  };

  const getFollowOrg = async ( followOrgData ) => {
    if (context.model_parser.follow_org){
      return context.model_parser.follow_org;
    }
    return context.model_parser.follow_org = followOrgData && await getOrg(followOrgData);
  };

  const getCurrentFollowOrg = async () => {
    return followOrgData && await getFollowOrg( followOrgData ) || context.params.user.follow_org && await getOrg ( context.params.user.follow_org);
  };

  const getModel = async (modelData, service) => {
    let path, org;
    if ( typeof modelData === 'object'){
      if (modelData._id && modelData.path){
        return modelData;
      }
      if(modelData._id && ObjectId.isValid(modelData._id)){
        return await service.get(modelData._id);
      }
      if(modelData.path && typeof modelData.path === 'string'){
        path = modelData.path;
      }
      if (modelData.org){
        org = await getOrg(modelData.org);
      }
    }

    if (typeof modelData === 'string'){
      if(modelData && ObjectId.isValid(modelData)){
        return await service.get(modelData._id);
      }
      path = modelData;
    }

    if (path){
      org = org || await getCurrentOperationOrg() || await getCurrentOrg();
      if (org && org._id){
        const finds = await service.find({query:{path:path, org_id:org._id}});
        if (finds.total === 1){
          return finds.data[0];
        }
      }
    }
    return null;
  };

  const getModelList = async (listData, service) => {
    const list = [];
    let model, path;
    const org = await getCurrentOperationOrg() || await getCurrentOrg();
    for (const e of listData){
      if (typeof e === 'object') {
        if (e._id && e.path){
          list.push(e);
        }
        if(e._id && ObjectId.isValid(e._id)){
          model = await service.get(e._id);
          list.push(model);
        }
        if(!e._id && e.path){
          path = e.path;
        }
      }
      if(typeof e === 'string'){
        if(ObjectId.isValid(e)){
          model = await service.get(e);
          list.push(model);
        } else {
          path = e;
        }
      }
      if(path){
        if (org && org._id){
          const finds = await service.find({query:{path: path, org_id: org._id}});
          if (finds.total === 1){
            list.push(finds.data[0]);
          }
        }
      }
    }
    return list;
  };

  const getPermission = async ( permissionData ) => {
    return await getModel(permissionData, permissionService);
  };

  const getPermissions = async ( permissionsData ) => {
    return await getModelList(permissionsData,permissionService);
  };

  const getOperation = async ( operationData ) => {
    return await getModel(operationData, operationService);
  };

  const getOperations = async ( operationsData ) => {
    return await getModelList(operationsData,operationService);
  };

  const getOrgUserRoles = async ( options = {} ) => {
    const user = options.user || context.params.user;
    const org = options.org || await getCurrentOperationOrg() || await getCurrentOrg();

    if (user && user.roles){
      const idList = user.roles.map ( r => {
        if (r.org_path === org.path)
        {return r._id;}
      });
      if (idList.length > 0){
        const finds = await roleService.find ( {query:{_id: { $in: idList}}});
        return finds.data;
      }
    }

    return [];
  };

  const getOrgUserPermissions = async ( options={} ) => {
    const user = options.user || context.params.user;
    const org = options.org || await getCurrentOperationOrg() || await getCurrentOrg();
    const permissions = user && user.permissions || [];
    const idList = permissions.map ( p => {
      if (p.org_path === org.path)
      {return p._id;}
    });
    const roles = await getOrgUserRoles( options );
    roles.map ( r => {
      r.permissions.map ( p => {
        idList.push(p._id);
      });
    });
    const finds = await permissionService.find({query:{_id:{$in:idList}}});
    return finds && finds.data || [];
  };

  const getOrgUserOperations = async ( options={} ) => {
    const user = options.user || context.params.user;
    const org = options.org || await getCurrentOperationOrg() || await getCurrentOrg();
    const idList = user.operations.map ( o => {
      if(o.org_path === org.path)
      {return o._id;}
    });
    const roles = await getOrgUserRoles( options );
    roles.map ( r => {
      r.operations.map ( o => {
        idList.push(o._id);
      });
    });
    const permissions = await getOrgUserPermissions( options ={} );
    permissions.map ( p => {
      p.operations.map ( o => {
        idList.push(o._id);
      });
    });
    const finds = await operationService.find({query:{_id:{$in:idList}}});
    return finds && finds.data || [];
  };

  const getOrgUserFollows = async (options = {}) => {
    const org = options.org || await getCurrentOrg();
    const userRoles = await getOrgUserRoles( { org } );
    const everyone_role = await getEveryoneRole( org );
    userRoles.push(everyone_role);
    const follows = [];
    if ( org && org.follows ){
      for( const f of org.follows){
        const follow_org = await getOrg(f.org_path);
        const roleListData = f.roles.map( o => {
          return { _id: o._id };
        });
        const roles = await getRoles(roleListData);
        const permissionListData = f.permissions.map( o => {
          return { _id: o._id };
        });
        const permissions = await getPermissions(permissionListData);
        const operationIds = [];
        permissions.map ( p=> {
          operationIds.push(p.operations.map(o=>{
            return o._id;
          }));
        });
        const finds = await operationService.find({query:{_id:{$in:operationIds}}});
        const operations = finds && finds.data;
        follows.push({ org: follow_org, roles, permissions, operations});
      }
    }

    return follows;
  };

  const getOrgUserFollowPermissions = async ( options = {} ) => {
    const operation_org = await getCurrentOperationOrg();
    const org = options.org || operation_org || await getCurrentOrg();
    const userRoles = await getOrgUserRoles( { org } );
    const urList = userRoles.map ( ur => {
      return ur.path;
    });
    const everyone_role = await getEveryoneRole( org );
    urList.push(everyone_role.path);
    let permissions = [];

    if(operation_org){
      for (const follow of org.follows) {
        if (follow.org_id && follow.org_id.equals(operation_org._id)){
          for(const fr of follow.roles){
            if (urList.includes(fr.path)){
              permissions = permissions.concat(follow.permissions);
              break;
            }
          }
        }
      }
    }

    if (permissions.length > 0){
      const idList = permissions.map ( p => {
        return p._id;
      });
      const finds = await permissionService.find({query:{_id:{$in: idList}}});
      permissions = finds.data;
    }
    return permissions;
  };

  const getOrgUserFollowOperations = async ( options = {} ) => {
    const followPermissions = await getOrgUserFollowPermissions( options );
    let opIds = [];
    for (const fp of followPermissions) {
      fp.operations.map( o => {
        return opIds.push(o._id);
      });
    }
    const finds = await operationService.find({query:{
      _id: {
        $in: opIds
      }
    }});

    return finds.data;
  };

  const getOrgUsers = async ( options = {} ) => {

    const operationOrg = await getCurrentOperationOrg();
    const orgPath = options.org && options.org.path || operationOrg && operationOrg.path;

    const finds = await userService.find({query: { $or: [
      {'roles.org_path': orgPath},
      {'permissions.org_path':orgPath},
      {'operations.org_path': orgPath}
    ]}});

    //only return roles in org for users
    return finds.data.map ( u => {
      u.roles = u.roles.filter ( r => {
        return r.org_path === orgPath;
      });
      return u;
    });
  };

  const getOrgRoles = async ( options = {} ) => {

    const operation_org = await getCurrentOperationOrg();

    const orgPath = options.org && options.org.path || operation_org && operation_org.path;

    if (orgPath){
      const finds = await roleService.find({query: { org_path: orgPath }});
      return finds.data;
    } else {
      return { code: 201, error: 'not specify org'};
    }
  };

  const getOrgPermissions = async ( options = {} ) => {

    const operation_org = await getCurrentOperationOrg();

    const orgPath = options.org && options.org.path || operation_org && operation_org.path;

    if ( orgPath){
      const finds = await permissionService.find({query: { org_path: orgPath }});
      return finds.data;
    } else {
      return { code: 201, error: 'not specify org'};
    }
  };

  const getOrgOperations = async ( options = {} ) => {

    const operation_org = await getCurrentOperationOrg();

    const orgPath = options.org && options.org.path || operation_org && operation_org.path;

    if(orgPath){
      const finds = await operationService.find({query: { org_path: orgPath }});
      return finds.data;
    } else {
      return { code: 201, error: 'not specify org'};
    }
  };

  const getUserOrgs = async ( options = {}) => {
    const user = options.user || context.params.user;

    const orgService = context.app.service('orgs');

    const orgList = {};

    await Promise.all(user.roles.map ( async o => {
      const org = await orgService.get(o.org_id);
      orgList[org.path] = org;
    }));
    return orgList;
  };

  const getChannel = async ( options = {} ) => {
    const channelService = context.app.service('channels');
    const channelData = options.channel || options;
    if ( typeof channelData === 'string'){
      if(channelData && ObjectId.isValid(channelData)){
        return await channelService.get(channelData);
      }
    }
    if (typeof channelData === 'object'){
      if(channelData && channelData._id && ObjectId.isValid(channelData._id)){
        return await channelService.get(channelData._id);
      }
      if(channelData && channelData._id && channelData.event_id){
        return channelData;
      }
    }
  };

  const parse = async ( ) => {
    current_operation_org = await getCurrentOperationOrg();
    everyone_role = await getEveryoneRole();
    //const everyone_role_permissions = await operationParser.everyone_role_permissions;
    const everyone_role_permissions = await getEveryoneRolePermissions();
    // everyone_role_operations = await operationParser.everyone_role_operations;
    const everyone_role_operations = await getEveryoneRoleOperations();
    everyone_permission = await getEveryonePermission();
    //const everyone_permission_operations = await operationParser.everyone_permission_operations;
    const everyone_permission_operations = await getEveryonePermissionOperations();
    const user_roles = await getOrgUserRoles();
    const user_permissions = await getOrgUserPermissions();
    const user_operations = await getOrgUserOperations();

    current_org = await getCurrentOrg();
    const operation_org_users = await getOrgUsers();
    const operation_org_roles = await getOrgRoles();
    const operation_org_permissions = await getOrgPermissions();
    const operation_org_operations = await getOrgOperations();
    follow_org = await getFollowOrg();
    const current_follow_org = await getCurrentFollowOrg();
    const user_follows = await getOrgUserFollows();
    const current_user_follow = user_follows.filter( o => {
      return o.org.path === current_follow_org && current_follow_org.path;
    }).shift();
    const user_follow_org = current_user_follow && current_user_follow.org || [];
    const user_follow_roles = current_user_follow && current_user_follow.roles || [];
    const user_follow_permissions = current_user_follow && current_user_follow.permissions || [];
    const user_follow_operations = current_user_follow && current_user_follow.operations || [];
    const user_orgs = await getUserOrgs();


    if (orgData){
      if(refresh){
        delete context.model_parser.org;
      }
      context.model_parser.org = org = context.model_parser.org ? context.model_parser.irg : await getOrg( orgData );
    }

    if (roleData){
      if(refresh){
        delete context.model_parser.role;
      }
      context.model_parser.role = role = context.model_parser.role ? context.model_parser.role : await getRole( roleData );
    }

    if (rolesData){
      if(refresh){
        delete context.model_parser.roles;
      }
      context.model_parser.roles = roles = context.model_parser.roles ? context.model_parser.roles : await getRoles( rolesData);
    }

    if (permissionData){
      if(refresh){
        delete context.model_parser.permission;
      }
      context.model_parser.permission = permission = context.model_parser.permission ? context.model_parser.permission : await getPermission(permissionData);
    }

    if (permissionsData){
      if(refresh){
        delete context.model_parser.permissions;
      }
      context.model_parser.permissions = permissions = context.model_parser.permissions ? context.model_parser.permissions : await getPermissions(permissionsData);
    }

    if (operationData){
      if(refresh){
        delete context.model_parser.operation;
      }
      context.model_parser.operation = operation = context.model_parser.operation ? context.model_parser.operation : await getOperation(operationData);
    }

    if (operationsData){
      if(refresh){
        delete context.model_parser.operations;
      }
      context.model_parser.operations = operations = context.model_parser.operations ? context.model_parser.operations : await getOperations(operationsData);
    }

    if (userData){
      if(refresh){
        delete context.model_parser.user;
      }
      context.model_parser.user = user = context.model_parser.user ? context.model_parser.user : await getUser( userData );
    }

    if (usersData){
      if(refresh){
        delete context.model_parser.users;
      }
      context.model_parser.users = users = context.model_parser.users ? context.model_parser.users : await getUsers( usersData );
    }


    if (currentOperationData){
      if (context.model_parser.current_operation && !refresh){
        current_operation = context.model_parser.current_operation;
      } else {
        current_operation = context.model_parser.current_operation = await getCurrentOperation();
      }
    }

    return {
      org, role, roles, permission, permissions, operation, operations,
      user, users, everyone_role, everyone_role_permissions, everyone_role_operations,
      everyone_permission, everyone_permission_operations, current_operation, current_operation_org,
      current_org, current_follow_org, operation_org_users,operation_org_roles, operation_org_permissions, operation_org_operations,
      follow_org, user_roles, user_permissions, user_operations,
      user_orgs, user_follows, current_user_follow, user_follow_org, user_follow_roles,user_follow_permissions, user_follow_operations
    };

  };

  return {
    parse,
    getOrg, getRole, getRoles, getPermission, getPermissions, getOperation, getOperations, getUser, getUsers,
    getCurrentOrg, getCurrentOperation, getCurrentOperationOrg, getFollowOrg, getCurrentFollowOrg,
    getEveryoneRole, getEveryonePermission, getEveryoneRolePermissions, getEveryoneRoleOperations, getEveryonePermissionOperations,
    getOrgUserRoles, getOrgUserPermissions, getOrgUserFollowOperations, getOrgUserFollowPermissions,
    getOrgUsers, getOrgRoles, getOrgPermissions, getOrgOperations,
    getChannel
  };
};

const buildResult = require("../../../utils/js/build-operation-result");

const orgInitialize = async function (context, options = {}) {
    const orgService = context.app.service('orgs');
    const roleService = context.app.service('roles');
    const operationService = context.app.service('operations');
    const permissionService = context.app.service('permissions');

    const contextParser = require('../../../utils/js/context-parser')(context,options);
  
    const user = context.params.user;

    const { current_operation, current_operation_org } = await contextParser.parse();
  
    const orgId = current_operation_org && current_operation_org._id || user.current_org && user.current_org.oid;
  
    const operation = current_operation;
  
    const org = current_operation_org;

    const operationConfig = context.params.configuration.operation;
    const operationData = context.data.data;
  
    const runData = operation.data;
  
    let stage = context.data.stage || 'start';
  
    let isInitialized = false;
  
    const checkInitialize = async function(){
      const runService = context.app.service('run-operation');
      const query = {
        'operation.oid':operation._id
      };
      const findResult = await runService.find({query});
      if (findResult.total > 0){
        return true;
      }
      return false;
    };
  
    isInitialized = await checkInitialize();
    if(isInitialized){
      context.result = {
        is_initialized: isInitialized,
        message: 'org is initialized, please do not initialize it again!'
      };
      return context;
    } else {
      if (stage === 'check'){
        context.result = {
          is_initialized: isInitialized,
          message: 'org is not initialized, please initialize it first!'
        };
        return context;
      }
    }
  
    if (action === 'open'){
      context.result = await buildResult(context,runData);
      return context;
    }
  
    if (action !== 'initialize'){
      context.result = await buildResult(context,{ message: 'support stages: start | initialize'});
      return context;
    }
  
    //if end stage, run real org initialize
  
    //add org profiles
  
    //add org operations
    const postAddRoleOperations = {};
    const postAddPermissionOperations = {};
    const postAddRolePermissions = {};
    let newOperations = [];
    const runOperations = runData.operations;
    if(runOperations && !Array.isArray(runOperations) && typeof runOperations === 'object'){
      Object.values(runOperations).map( o => {
        //o.org = { oid: orgId, path: org.path };
        o.org_id = orgId;
        o.org_path = org.path;
        if(o.roles && Array.isArray(o.roles)){
          o.roles.map ( role => {
            if (postAddRoleOperations.hasOwnProperty(role)){
              const value = postAddRoleOperations[role];
              if (!value.operations.includes(o.path || o.name ))
              {
                value.operations.push( o.path || o.name );
              }
              postAddRoleOperations[role] = { role: role, operations: value.operations };
            } else {
              postAddRoleOperations[role] = { role: role, operations: [ o.path || o.name ]};
            }
          });
        }
        if(o.permissions && Array.isArray(o.permissions)){
          o.permissions.map ( permission => {
            if (postAddPermissionOperations.hasOwnProperty(permission)){
              const value = postAddPermissionOperations[permission];
              if (!value.operations.includes(o.path || o.name))
              {
                value.operations.push(o.path || o.name);
              }
              postAddPermissionOperations[permission] = { permission: permission, opertions: value.operations };
            } else {
              postAddPermissionOperations[permission] = { permission: permission, operations: [ o.path || o.name ]};
            }
          });
        }
        newOperations.push(o);
      });
  
      if (newOperations.length > 0) {
        newOperations = await operationService.create(newOperations);
      }
    }
  
    //add permissions
    let newPermissions = [];
    const runPermissions = runData.permissions;
    if( runPermissions && typeof runPermissions === 'object' && !Array.isArray(runPermissions)){
      Object.values(runPermissions).map( o => {
        //o.org = orgId;
        o.org_id = orgId;
        o.org_path = org.path;
        if(o.operations && Array.isArray(o.operations)){
          const permitOperations = [];
          o.operations.map( path => {
            newOperations.map ( no => {
              if (no.path === path){
                permitOperations.push({
                  oid: no._id,
                  path: no.path
                });
              }
            });
          });
          o.operations = permitOperations;
        }
        if(o.roles && Array.isArray(o.roles)){
          o.roles.map ( role => {
            if (postAddRolePermissions.hasOwnProperty(role)){
              const value = postAddRolePermissions[role];
              if (!value.permissions.includes(o.path || o.name))
              {
                value.permissions.push(o.path || o.name);
              }
              postAddRolePermissions[role] = value.permissions;
            } else {
              postAddRolePermissions[role] = { role: role, permissions: [ o.path || o.name ]};
            }
          });
        }
        newPermissions.push(o);
      });
  
      if (newPermissions.length > 0) {
        newPermissions = await permissionService.create(newPermissions);
      }
    }
  
    //add org roles
    let newRoles = [];
    if(runData.roles && !Array.isArray(runData.roles) && typeof runData.roles === 'object'){
      const roles = Object.values(runData.roles).map( o => {
        //o.org = orgId;
        o.org_id = orgId;
        o.org_path = org.path;
        if(o.permissions && Array.isArray(o.permissions)){
          const rolePermissions = [];
          o.permissions.map( path => {
            newPermissions.map ( no => {
              if (no.path === path){
                rolePermissions.push({
                  oid: no._id,
                  path: no.path
                });
              }
            });
          });
          o.permissions = rolePermissions;
        }
        if(o.operations && Array.isArray(o.operations)){
          const roleOperations = [];
          o.operations.map( path => {
            newOperations.map ( no => {
              if (no.path === path){
                roleOperations.push({
                  oid: no._id,
                  path: no.path
                });
              }
            });
          });
          o.operations = roleOperations;
        }
        return o;
      });
  
      if (roles.length > 0){
        newRoles = await roleService.create(roles);
      }
    }
  
    //add sub-orgs
    if(runData.orgs && !Array.isArray(runData.orgs) && typeof runData.orgs === 'object'){
      const orgsData = Object.assign({},runData.orgs);
      for(const key in orgsData){
        const value = orgsData[key];
        value.path = value.path ? org.path + '#' + value.path : org.path + '#' + key;
      }
      const orgs = Object.values(orgsData);
  
      if (orgs.length > 0) {
        await orgService.create(orgs, context.params);
      }
    }
  
    //reset current org for user which is changed by add sub org
    context.params.user.current_org = {oid: orgId, path: org.path};
    const userService = context.app.service('users');
    await userService.patch(context.params.user._id, {
      current_org: {oid: orgId, path: org.path}
    });
  
    //process post add
    for ( const item of Object.values(postAddRoleOperations)){
      newRoles.map ( o => {
        if ( o.path === item.role ){
          item.role = o;
        }
      });
      newOperations.map ( o => {
        item.operations = item.operations.map ( oo => {
          if ( o.path === oo ){
            return o;
          } else {
            return oo;
          }
        });
      });
    }
  
    for ( const item of Object.values(postAddRolePermissions)){
      newRoles.map ( o => {
        if ( o.path === item.role ){
          item.role = o;
        }
      });
      newPermissions.map ( o => {
        item.permissions = item.permissions.map ( oo => {
          if ( o.path === oo ){
            return o;
          } else {
            return oo;
          }
        });
      });
    }
  
    for ( const item of Object.values(postAddPermissionOperations)){
      newPermissions.map ( o => {
        if ( o.path === item.permission ){
          item.permission = o;
        }
      });
      newOperations.map ( o => {
        item.operations = item.operations.map ( oo => {
          if ( o.path === oo ){
            return o;
          } else {
            return oo;
          }
        });
      });
    }
  
    const addRoleOperations = require('../../../APIs/js/role-operations-add');
    await addRoleOperations(context, postAddRoleOperations,false);
  
    const addRolePermissions = require('../../../APIs/js/role-permissions-add');
    await addRolePermissions(context, postAddRolePermissions,false);
  
    const addPermissionOperations = require('../../../APIs/js/permission-operations-add');
    await addPermissionOperations(context, postAddPermissionOperations,false);
  
    //add follows org
    const orgChildrenFind = require('../../../APIs/js/org-children-find');
    const orgAncestorFind = require('../../../APIs/js/org-ancestor-find');
    //const modelsParse = require('../../../APIs/js/models-parse');
    const addOrgFollows = require('../../../APIs/js/org-follows-add');
    const children = await orgChildrenFind(context,{org});
    const ancestors = await orgAncestorFind(context,{org});
    
    const runFollows = runData.follows;
    
    if(runFollows && runFollows.hasOwnProperty('$all_children')){
      const follows = [];
      const permissions = runFollows['$all_children']['permissions'];
      const roles = runFollows['$all_children']['roles'];
      const tags = runFollows['$all_children']['tags'];
      for (const child of children)
      {
        follows.push(
          {
            org_id: child._id,
            org_path: child.path,
            tags: tags,
            roles,
            permissions
          }
        );
      }
  
      if(follows.length>0){
        await addOrgFollows(context,{follows});
      }
    }
  
    if(runFollows && runFollows.hasOwnProperty('$all_ancestors')){
      const follows = [];
      const permissions = runFollows['$all_ancestors']['permissions'];
      const roles = runFollows['$all_ancestors']['roles'];
      const tags = runFollows['$all_ancestors']['tags'];
      for (const anc of ancestors)
      {
        follows.push(
          {
            org_id: anc._id,
            org_path: anc.path,
            tags: tags,
            roles,
            permissions
          }
        );
      }
  
      if(follows.length > 0){
        await addOrgFollows(context,{follows});
      }
    }
  
    //should add record for this operation
    delete context.result;
  
    return context;
  };
  
  module.exports = orgInitialize;
  

const _ = require('lodash');
const orgInitialize = async function (context, options = {}) {
  const orgService = context.app.service('orgs');
  const roleService = context.app.service('roles');
  const operationService = context.app.service('operations');
  const permissionService = context.app.service('permissions');

  const contextParser = require('../../../utils/js/context-parser')(context,options);
  const operationStatus = require('../../../utils/js/operation-status')(context,options);
  const buildResult = require('../../../utils/js/build-result')(context,options);

  const user = context.params.user;

  const { current_operation, current_operation_org } = await contextParser.parse();

  const orgId = current_operation_org && current_operation_org._id || user.current_org && user.current_org.oid;

  const operation = current_operation;

  const org = current_operation_org;

  const operationConfig = context.params.configuration.operation;
  const operationData = context.data.data;

  let runData = {};

  const orgType = org.type && org.type.path;

  if (orgType) {
    const typeKeys = orgType.split('.');
    typeKeys.map ( key => {
      const json = operationConfig && operationConfig.orgs && operationConfig.orgs.types && operationConfig.orgs.types[key];
      _.merge(runData,json);
    });
  }

  if(operationData){
    _.merge(runData, operationData);
  }

  let action = context.data.action || 'open';

  const isInitialized = await operationStatus.isInitialized(operation);
  if(isInitialized){
    context.result = await buildResult.operation(await operationStatus.checkInitializeWithResult(operation));
    return context;
  }

  if (action === 'open'){
    context.result = await buildResult.operation(runData);
    return context;
  }

  if ( action === 'initialize') {
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
        const newList = [];
        for ( const o of newOperations){
          newList.push(await operationService.create(o));
        }
        newOperations = newList;
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
        const newList = [];
        for ( const o of newPermissions){
          newList.push(await permissionService.create(o));
        }
        newPermissions = newList;
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

      if (roles.length > 0) {
        const newList = [];
        for ( const o of roles){
          newList.push(await roleService.create(o));
        }
        newRoles = newList;
      }
    }
    
    //add sub-orgs
    let newOrgs = [];
    if(runData.orgs && !Array.isArray(runData.orgs) && typeof runData.orgs === 'object'){
      const orgsData = Object.assign({},runData.orgs);
      for(const key in orgsData){
        const value = orgsData[key];
        value.path = value.path ? org.path + '#' + value.path : org.path + '#' + key;
      }
      const orgs = Object.values(orgsData);

      if (orgs.length > 0) {
        const newList = [];
        for ( const o of orgs){
          newList.push(await orgService.create(o,context.params));
        }
        newOrgs = newList;
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
    
    const addRoleOperations = require('../../../utils/js/add-role-operations');
    await addRoleOperations(context, postAddRoleOperations,false);

    const addRolePermissions = require('../../../utils/js/add-role-permissions');
    await addRolePermissions(context, postAddRolePermissions,false);

    const addPermissionOperations = require('../../../utils/js/add-permission-operations');
    await addPermissionOperations(context, postAddPermissionOperations,false);

    //add follows org
    const orgChildrenFind = require('../../../utils/js/find-org-children');
    const orgAncestorFind = require('../../../utils/js/find-org-ancestor');
    //const modelsParse = require('../../../APIs/js/models-parse');
    const addOrgFollows = require('../../../utils/js/add-org-follows');
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

    return {
      message: 'org-initialize is successfully!',
      org,
      newOperations,
      newRoles,
      newPermissions,
      newOrgs
    };
  }

  if (!['open','check','initialize'].includes(action)) {
    context.result = await buildResult.operation({'error':'support actions:  open | check | initialize '});
  }

  return context;

};

module.exports = orgInitialize;

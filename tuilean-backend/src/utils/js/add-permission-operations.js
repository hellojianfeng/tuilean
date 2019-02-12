
/**
 * options format 1: { role1: { role: role1, operations: []},....}
 * options format 2: [ { role: role1, operations: []},....]
 */
module.exports = async function (context, options = {}) {

  //const mongooseClient = context.app.get('mongooseClient');

  const permissionList = [];

  const permissionService = context.app.service('permissions');
  const operationService = context.app.service('operations');

  const contextParser = require('./context-parser')(context,options);

  const { org, current_org } = await contextParser.parse();

  let orgId = org && org._id || current_org && current_org._id;

  let list = [];
  if (Array.isArray(options)){
    list = options;
  } else if ( typeof options === 'object'){
    list = Object.values(options);
  } else {
    throw new Error('please provide array or object of options!');
  }

  for ( const item of list){
    let permission = null;
    if (typeof item.permission === 'string'){
      if(!orgId) break;
      const results = await permissionService.find ({ query: { path: item.permission, org: orgId }});
      if (results.total === 1){
        permission = results.data[0];
      }
    }

    if (typeof item.permission === 'object' && item.permission._id){
      permission = item.permission;
    }

    if (!permission || !permission._id || !permission.path){
      break;
    }

    orgId = orgId || permission.org_id;

    for (const o of item.operations){
      let operation = null;
      if ( typeof o === 'string'){
        if (!orgId) break;
        const results = await operationService.find({ query: { path: o, org_id: orgId }});
        if (results.total === 1) {
          operation = results.data[0];
        }
      }

      if (typeof o === 'object' && o._id){
        operation = o;
      }

      if( ! operation || ! operation._id){
        break;
      }

      let idList = [];
      permission.operations.map ( o => {
        idList.push(o._id);
      });
      if (!idList.includes(operation._id)){
        permission.operations.push({ _id: operation._id, path: operation.path });
      }
    }
    await permissionService.patch(permission._id, { operations: permission.operations});
    permissionList.push(permission);
  }

  context.result = permissionList;

  return permissionList;
};



/**
 * options format 1: { role1: { role: role1, operations: []},....}
 * options format 2: [ { role: role1, operations: []},....]
 */
module.exports = async function (context, options = {}) {

  //const mongooseClient = context.app.get('mongooseClient');

  const roleList = [];

  const roleService = context.app.service('roles');
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
    let role = null;
    if (typeof item.role === 'string'){
      if(!orgId) break;
      const results = await roleService.find ({ query: { path: item.role, org: orgId }});
      if (results.total === 1){
        role = results.data[0];
      }
    }

    if (typeof item.role === 'object' && item.role._id){
      role = item.role;
    }

    if (!role || !role._id || !role.path){
      break;
    }

    orgId = orgId || role.org_id;

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
      role.operations.map ( o => {
        idList.push(o._id);
      });
      if (!idList.includes(operation._id)){
        role.operations.push({ _id: operation._id, path: operation.path });
      }
    }
    await roleService.patch(role._id, { operations: role.operations});
    roleList.push(role);
  }

  context.result = roleList;

  return roleList;
};


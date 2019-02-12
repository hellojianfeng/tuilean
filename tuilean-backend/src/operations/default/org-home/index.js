
module.exports = async function (context, options = {}) {

  const contextParser = require('../../../utils/js/context-parser')(context,options);
  const operationStatus = require('../../../utils/js/operation-status')(context,options);
  const buildResult = require('../../../utils/js/build-result')(context,options);

  //const operationData = context.data.data || {};
  const action = context.data.action || 'open';

  //const mongooseClient = context.app.get('mongooseClient');

  const user = context.params.user;

  const {user_operations, everyone_role_operations, current_operation_org} = await contextParser.parse();

  const userService = context.app.service('users');
  await userService.patch(user._id, { current_org: {_id: current_operation_org._id, path: current_operation_org.path}});

  if (action === 'open'){

    let allOperations = Object.assign(user_operations,everyone_role_operations);
    //delete operation for org-home
    allOperations = allOperations.filter( o => {
      return o.path !== 'org-home';
    });

    const isInitialized = await operationStatus.isInitialized({ org: current_operation_org, path: 'org-initialize'});
    if ( isInitialized){
      allOperations = allOperations.filter( o => {
        return o.path !== 'org-initialize';
      });
    } else {
      allOperations = allOperations.filter( o => {
        return o.path === 'org-initialize';
      });
    }

    context.result = await buildResult.operation({operations: allOperations});

    return context;
  }

  return context;
};


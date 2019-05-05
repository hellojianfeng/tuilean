const fs = require('fs');
module.exports = function(context, options) {
  const doOperation = async data => {
    context.data.data = data;
    const contextParser = require('../utils/js/context-parser')(context,options);
    const { current_operation, everyone_role_operations, everyone_permission_operations, user_operations, user_follow_operations } = await contextParser.parse();

    if (current_operation){
      let isAllowOperation = false;
      everyone_permission_operations.map ( o => {
        if ( o._id.equals(current_operation._id)){
          isAllowOperation = true;
        }
      });

      everyone_role_operations.map ( o => {
        if ( o._id.equals(current_operation._id)){
          isAllowOperation = true;
        }
      });

      user_operations.map ( o => {
        if (current_operation._id.equals(o._id)){
          isAllowOperation = true;
        }
      });

      for (const followOperation of user_follow_operations){
        if (followOperation._id.equals(current_operation._id)){
          isAllowOperation = true;
        }
      }

      if(isAllowOperation === false){
        throw new Error('user is not allowed to run operation! operation = ' + current_operation.path);
      }

      context.params.operation = current_operation;
      const operationPath = current_operation.path;
      const operationApp = current_operation.app || 'default';
      if (fs.existsSync('src/operations/'+ operationApp + '/' + operationPath + '/data.json'))
      {
        const jsonData = require('../operations/' + operationApp + '/' + operationPath +'/data.json');
        context.params.configuration = context.params.configuration || {};
        context.params.configuration.operation = jsonData;
      }
      if (fs.existsSync('src/operations/' + operationApp + '/' + operationPath + '/index.js'))
      {
        const doOperation = require('../operations/'  + operationApp + '/' + operationPath + '/index.js');
        const doResult = await doOperation(context,options);
        //if not show doOperation result, should add record operation
        return {
          result: doResult,
          operation_id: current_operation._id,
          org_id: current_operation.org_id,
          org_path: current_operation.org_path,
          user: {_id: context.params.user._id, email: context.params.user.email}
        };
      } else {
        throw new Error('not find index.js for operation of '+ operationPath );
      }
    } else {
      throw new Error('not find valid operation!');
    }
  };
  const getConfiguration = () => {
    return context.params && context.params.configuration || {};
  };
  return {doOperation, getConfiguration};
};

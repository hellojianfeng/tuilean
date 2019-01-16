
module.exports = function (context) {

  const pageResult = async ( result ) => {

    const pageName = context.data.page;
    const action = context.data.action || 'open';

    //const mongooseClient = context.app.get('mongooseClient');

    const user = context.params.user;

    return  {
      page: pageName,
      action: action,
      user: {oid: user._id, email: user.email},
      result
    };
  };

  const operationResult = async ( result ) => {

    const contextParser = require('./context-parser')(context);

    const { current_operation } = await contextParser.parse();

    const action = context.data.action || 'open';

    //const mongooseClient = context.app.get('mongooseClient');

    const user = context.params.user;

    return  {
      operation: { oid: current_operation._id, path: current_operation.path, org_id: current_operation.org_id, org_path: current_operation.org_path},
      action: action,
      user: {oid: user._id, email: user.email},
      result
    };
  };

  return { page: pageResult, operation: operationResult};
};


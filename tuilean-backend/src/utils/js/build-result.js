
module.exports = function (context) {

  const contextParser = require('./context-parser')(context);

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

  const notify = async ( result ) => {
    const operationData = context.data.operation;
    const orgData = context.data.org;
    const pageData = context.data.page;
    const user = context.params.user;
    const contextResult = {};

    if(operationData && orgData){
      operationData.org = orgData;
      const operation = await contextParser.getOperation(operationData);
      contextResult.user = {oid: user._id, email: user.email};
      contextResult.operation = {oid: operation._id, path: operation.path, org_id: operation.org_id,org_path: operation.org_path};
      contextResult.result = result;
      //return contextResult;
    }

    if (pageData){
      contextResult.user = {oid: user._id, email: user.email};
      contextResult.page = pageData;
      contextResult.result = result;

      //return context;
    }

    return contextResult;
  };

  return { page: pageResult, operation: operationResult, notify};
};


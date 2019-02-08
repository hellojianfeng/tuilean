
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
    const notifyData = context.data.data;
    let {current_org, org, page, operation } = await contextParser.parse();
    const user = context.params.user;
    const contextResult = {};

    if(operation){
      contextResult.notifyData = notifyData;
      contextResult.user = {oid: user._id, email: user.email};
      contextResult.operation = {oid: operation._id, path: operation.path, org_id: operation.org_id,org_path: operation.org_path};
      contextResult.result = result;
      //return contextResult;
    }

    if (page){
      contextResult.notifyData = notifyData;
      contextResult.user = {oid: user._id, email: user.email};
      contextResult.page = page;
      contextResult.result = result;

      //return context;
    }

    if (org || current_org){
      org = org || current_org;
      contextResult.notifyData = notifyData;
      contextResult.user = {oid: user._id, email: user.email};
      contextResult.org = { oid: org._id, path: org.path};
      contextResult.result = result;
    }

    return contextResult;
  };

  return { page: pageResult, operation: operationResult, notify};
};


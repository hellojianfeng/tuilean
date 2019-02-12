
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
      user: {_id: user._id, email: user.email},
      result
    };
  };

  const operationResult = async ( result ) => {

    const { current_operation } = await contextParser.parse();

    const action = context.data.action || 'open';

    //const mongooseClient = context.app.get('mongooseClient');

    const user = context.params.user;

    return  {
      operation: { _id: current_operation._id, path: current_operation.path, org_id: current_operation.org_id, org_path: current_operation.org_path},
      action: action,
      user: {_id: user._id, email: user.email},
      result
    };
  };

  const notify = ( result ) => {
    const user = context.params.user;
    const contextResult = {
      url: '/notify',
      method: 'POST',
      action: context.data.action || 'open',
      user: {_id: user._id, email: user.email},
      data: context.data.data,
      result
    };

    return contextResult;
  };

  return { page: pageResult, operation: operationResult, notify};
};


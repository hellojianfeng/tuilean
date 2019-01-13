
module.exports = async function (context, result={}) {

  const contextParser = require('../../utils/js/context-parser')(context);

  const { current_operation } = contextParser.parse();

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


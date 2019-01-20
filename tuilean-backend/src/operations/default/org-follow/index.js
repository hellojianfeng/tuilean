
module.exports = async function (context, options = {}) {

  //const operationData = context.data.data || {};
  //const operation = options.operation;
  const action = context.data.action || 'open';

  //const mongooseClient = context.app.get('mongooseClient');
  const contextParser = require('../../../utils/js/context-parser')(context,options);
  const buildResult = require('../../../utils/js/build-result')(context,options);


  const { current_user_follow, current_org } = await contextParser.parse();

  if (action === 'open'){
    context.result = await buildResult.operation({current_user_follow, current_org});
  }

  return context;
};


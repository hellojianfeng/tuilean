//const validateEmail = require('../../../utils/tools/validate-email');
//const _ = require('lodash');
module.exports = async function (context, options = {}) {

  //const operationData = context.data.data || {};
  //const operation = options.operation;
  let action = context.data.action || 'open';

  //const mongooseClient = context.app.get('mongooseClient');
  //const contextParser = require('../../../utils/js/context-parser')(context,options);
  const buildResult = require('../../../utils/js/build-result')(context,options);
  const workflowHelper = require('../../../utils/js/workflow-helper')(context,options);
  const leaveHelper = require('../leave-helper')(context,options);
  //const configHelper = require('../../../utils/js/configuration-helper')(context,options);
  const user = context.params.user;

  //const work = context.data && context.data.data && context.data.data.work;
  const binder = {operation: context.params.operation, users: [ user.email ], workflow_type:'leave-request'};

  const result = await workflowHelper.binderWorks({binder});
  if(result){
    return context.result = await buildResult.operation(result);
  }

  if(action === 'open'){
    //open action show list or requests
    const works = await workflowHelper.getUserWorks();
    return context.result = await buildResult.operation({works});
  }

  if(action === 'add-configuration'){
    const configurations = context.data.data && context.data.data.configurations || context.data.data;
    const results = await leaveHelper.findOrUpdate(configurations);

    return context.result = await buildResult.operation({results});
  }



  return { error: 301, message: 'not run any action!'};
};


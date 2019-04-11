//const validateEmail = require('../../../utils/tools/validate-email');
module.exports = async function (context, options = {}) {

  //const operationData = context.data.data || {};
  //const operation = options.operation;
  let action = context.data.action || 'open';

  //const mongooseClient = context.app.get('mongooseClient');
  //const contextParser = require('../../../utils/js/context-parser')(context,options);
  const buildResult = require('../../../utils/js/build-result')(context,options);
  const workflowHelper = require('../../../utils/js/workflow-helper')(context,options);
  //const userHelper = require('../../../utils/js/user-helper')(context,options);
  const user = context.params.user;

  //const _ = require('lodash');
  const current_work = context.data.data.current_work;

  if(current_work && current_work.started){
    const actions = current_work.actions;
    actions.map ( a => {
      if (a.path === 'monitor'){
        action = 'watch-assignment';
      }
      if (a.path === 'confirm'){
        action = 'confirm-assignment';
      }
      if (a.path === 'update'){
        action = 'update-assignment';
      }
    });
  }

  if (action === 'open'){
    const assignment_works = await workflowHelper.getUserWorks({operation: context.params.operation, users: [ user.email ], workflow_type:'assignment'});
    context.result = await buildResult.operation({assignment_works});
  }

  if (action === 'update-assignment'){
    context.result = await buildResult.operation({current_work});
  }

  if(action === 'watch-assignment'){
    context.result = await buildResult.operation({current_work});
  }

  return context;
};


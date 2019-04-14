//const validateEmail = require('../../../utils/tools/validate-email');
const _ = require('lodash');
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

  if(current_work && current_work.actions){
    const actions = current_work.actions;
    actions.map ( a => {
      if (a.path === 'monitor'){
        action = 'watch-assignment';
      }
      if (a.path === 'confirm'){
        action = 'confirm-assignment';
      }
      if (['update','start'].includes(a.path)){
        action = 'update-assignment';
      }
    });
  }

  if (action === 'open'){
    const assignment_works = await workflowHelper.getUserWorks({operation: context.params.operation, users: [ user.email ], workflow_type:'class-assignment'});
    context.result = await buildResult.operation({assignment_works});
  }

  if (action === 'update-assignment'){
    if(current_work && current_work.work && current_work.work.status && current_work.actions){
      if (current_work.work.status === 'start' && _.some(current_work.actions, {path: 'start'})){
        await workflowHelper.next({workflow: current_work.workflow,next: { status: 'assigned'}});
      }
    }
    context.result = await buildResult.operation({current_work});
  }

  if(action === 'watch-assignment'){
    context.result = await buildResult.operation({current_work});
  }

  return context;
};


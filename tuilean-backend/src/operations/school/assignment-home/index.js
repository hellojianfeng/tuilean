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
  //const userHelper = require('../../../utils/js/user-helper')(context,options);
  const user = context.params.user;

  const result = await workflowHelper.binderWorks({binder:{operation: context.params.operation, users: [ user.email ], workflow_type:'class-assignment'}});
  if(result){
    return context.result = await buildResult.operation(result);
  }

  if (action === 'do-work'){
    const work = context.data && context.data.data && context.data.data.work;
    if (work.work && work.work.status && work.action.path === 'update'){
      await workflowHelper.next({workflow: work.workflow,current: work, next: { status: 'updated'}});
    }
    
    if (work.work && work.work.status && work.action.path === 'complete'){
      await workflowHelper.next({workflow: work.workflow, next: { status: 'completed'}});
    }

    if (work.work && work.work.status  && work.action.path === 'confirm'){
      await workflowHelper.next({workflow: work.workflow, next: { status: 'confirmed'}});
    }

    if (work.work && work.work.status && work.action.path === 'end'){
      await workflowHelper.next({workflow: work.workflow, next: { status: 'end'}});
    }
  
    const assignment_works = await workflowHelper.getUserWorks({operation: context.params.operation, users: [ user.email ], workflow_type:'class-assignment'});
    return context.result = await buildResult.operation(assignment_works);
  }

  return { error: 301, message: 'not run any action!'};
};


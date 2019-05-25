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
  const commentHelper = require('../../../utils/js/comment-helper')(context,options);
  //const userHelper = require('../../../utils/js/user-helper')(context,options);
  const user = context.params.user;

  const work = context.data && context.data.data && context.data.data.work;
  const binder = {operation: context.params.operation, users: [ user.email ], workflow_type:'class-assignment'};

  const result = await workflowHelper.binderWorks({binder});
  if(result){
    return context.result = await buildResult.operation(result);
  }

  if (action === 'do-work'){
    
    if (work.work && work.work.status && work.action.path === 'update'){
      await workflowHelper.next({work, next: { status: 'updated'}});
    }

    if (work.work && work.work.status && work.action.path === 'complete'){
      await workflowHelper.next({work, next: { status: 'completed'}});
    }

    if (work.work && work.work.status  && work.action.path === 'confirm'){
      await workflowHelper.next({work, next: { status: 'confirmed'}});
    }

    if (work.work && work.work.status && work.action.path === 'end'){
      await workflowHelper.next({work, next: { status: 'end'}});
    }

    const assignment_works = await workflowHelper.getUserWorks({operation: context.params.operation, users: [ user.email ], workflow_type:'class-assignment'});
    return context.result = await buildResult.operation(assignment_works);
  }

  if (action === 'add-comment'){
    const comment = context.data.data.comment;
    if (comment && comment.title && work && work.work && work.workflow){
      comment.owner = { workflow_id: work.workflow._id, work_id: work.work._id};
      await commentHelper.addComment(comment);
      return context.result = await buildResult.operation(await workflowHelper.getUserWorks(binder));
    }
    
    return { error: 201, message: 'fail to add comment for work, please check input!'};
  }

  return { error: 301, message: 'not run any action!'};
};


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
  //const userHelper = require('../../../utils/js/user-helper')(context,options);
  const user = context.params.user;

  const work = context.data && context.data.data && context.data.data.work;
  const binder = {operation: context.params.operation, users: [ user.email ], workflow_type:'leave-request'};

  const result = await workflowHelper.binderWorks({binder});
  if(result){
    return context.result = await buildResult.operation(result);
  }

  if(action === 'open'){
    //open action show list or requests
    const leave_history = await leaveHelper.findUserLeaves();
    const works = await workflowHelper.getUserWorks();
    return context.result = await buildResult.operation({leave_history, works});
  }

  //return options for creating leave
  if(action === 'create-leave-start'){
    //provide template data for create leave
    const today = new Date();

    return await buildResult.operation(
      {
        create_leave_example: {
          applicant: user.email,
          type: 'sick-leave',
          description: 'sick leave for class',
          start: {
            date: today,
            hour: '8:30'
          },
          end: {
            date: today,
            hour: '12:30'
          },
          scope: {
            class: '5F',
            suject: 'English'
          }
        },
        options: {
          types: await leaveHelper.getLeaveTypes,
          leave_managers: await leaveHelper.getListOfLeaveManager
        }
      }
    );
  }

  if(action === 'create-leave-check'){
    const leaveData = context.data.data.leave || context.data.data;

    if (leaveData && leaveData.applicant && leaveData.type && leaveData.scope && leaveData.start && leaveData.end){
      return context.result = buildResult.operation({
        message: 'check leave data successfully!',
        leave: leaveData
      });
    } else {
      return context.result = await buildResult.operation({code: 301, error: 'please provide valid leave data! applicant, type, scope, start and end are required!'});
    }
  }

  if(action === 'create-leave-send'){
    //create a leave
    const leaveData = context.data.data.leave || context.data.data;
    const result = await leaveHelper.createLeave(leaveData);
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

    const leave_works = await workflowHelper.getUserWorks({operation: context.params.operation, users: [ user.email ], workflow_type:'leave-request'});
    return context.result = await buildResult.operation(leave_works);
  }

  return { error: 301, message: 'not run any action!'};
};


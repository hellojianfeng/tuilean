module.exports = function(context, options) {

  const workflowHelper = require('../../utils/js/workflow-helper')(context,options);
  const leaveService = context.app.service('leaves');

  const user = context.params.user;
  
  const createLeave = async options => {
    //return options;
    //create a leave first
    const leaveData = options && options.leave_data;
    const start = leaveData && leaveData.start;
    const end = leaveData && leaveData.end;

    const parsedTime = parseLeaveTime(start, end);
    
    const scope = leaveData && leaveData.scope;
    const processor = leaveData && leaveData.processor;

    const workflowData = {
      owner: { operation: { path: 'leave-home'}, users: [ user.email]},
      type: 'leave-request',
      path: _.uniqueId('leave_'),
      description: 'leave request by ' + user.email,
      works: [
        {
          path: 'leave-created',
          status: 'created',
          actions: [
            {
              path: 'update',
              operation: 'leave-home',
              users: ['self']
            },
            {
              path: 'completed',
              operation: 'leave-home',
              users: ['self']
            }
          ]
        },
        {
          path: 'leave-updated',
          status: 'updated',
          actions: [
            {
              path: 'update',
              operation: 'leave-home',
              users: ['self']
            },
            {
              path: 'completed',
              operation: 'leave-home',
              users: ['self']
            }
          ]
        },
        {
          path: 'leave-completed',
          status: 'completed',
          actions: [
            {
              path: 'confirm',
              operation: 'leave-home',
              users: ['self']
            }
          ]
        },
        {
          path: 'leave-confirmed',
          status: 'confirmed',
          actions: [
            {
              path: 'process',
              operation: 'leave-home',
              users: ['leave-manager']
            }
          ]
        },
        {
          path: 'leave-approved',
          status: 'approved',
          actions: [
            {
              path: 'end',
              operation: 'leave-home',
              users: ['self']
            },
            {
              path: 'cancel',
              operation: 'leave-home',
              users: ['self']
            }
          ]
        },
        {
          path: 'leave-cancelled',
          status: 'cancelled',
          actions: [
            {
              path: 'create',
              operation: 'leave-home',
              users: ['self']
            },
            {
              path: 'end',
              operation: 'leave-home',
              users: ['self']
            }
          ]
        },
        {
          path: 'leave-rejected',
          status: 'rejected',
          actions: [
            {
              path: 'end',
              operation: 'leave-home',
              users: ['self']
            },
            {
              path: 'create',
              operation: 'leave-home',
              users: ['self']
            }
          ]
        }
      ]
    };
    const workflow = await workflowHelper.findOrCreateWorkflow(workflowData);
    await workflowHelper.start({workflow});
  };

  const parseLeaveTime = (start, end) => {
    return { start, end};
  };
  
  return { createLeave, parseLeaveTime };
};
  
const _ = require('lodash');
const objectHash = require('object-hash');
module.exports = function(context, options) {

  const workflowHelper = require('../../utils/js/workflow-helper')(context,options);
  const configHelper = require('../../utils/js/configuration-helper')(context,options);
  const leaveService = context.app.service('leaves');

  const user = context.params.user;

  const createLeave = async options => {
    //return options;
    //create a leave first
    let leaveData = options && options.leave_data || options;
    const start = leaveData && leaveData.start;
    const end = leaveData && leaveData.end;

    const parsedTime = parseLeaveTime(start, end);

    leaveData = Object.assign(leaveData, parsedTime);

    const created = await leaveService.create(leaveData);

    const workflowData = {
      owner: { operation: { path: 'leave-home'}, users: [ user.email]},
      type: 'leave-request',
      path: _.uniqueId('leave_'),
      description: 'leave request by ' + user.email,
      data: {leave: created},
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
              path: 'cancel',
              operation: 'leave-home',
              users: ['self']
            },
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

  const findUserLeaves = options => {
    if (options){
      return [];
    }
    return [];
  };

  const addOrUpdateConfig = async options => {
    const configs = Array.isArray(options)? options : [ options ];
    const operation = context.params.operation;
    configs.map ( o => {
      o.owner = { operation: _.pick(operation, ['path','org_path'])};
      return o;
    });
    return await configHelper.addOrUpdate(configs);
  };

  const getListOfLeaveManager = async options => {
    const configService = context.app.service('configurations');
    const scope = options & options.scope || scope;
    const query = {key: 'leave_manager', org_path: context.params.operation.org_path};
    if (scope){
      query.owner_hash = objectHash(scope);
    }

    const finds = await configService.find({query});
    return finds.data;
  };

  return { createLeave, parseLeaveTime, findUserLeaves, addOrUpdateConfig, getListOfLeaveManager };
};

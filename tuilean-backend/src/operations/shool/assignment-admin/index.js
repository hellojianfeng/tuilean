
module.exports = async function (context, options = {}) {

  //const operationData = context.data.data || {};
  //const operation = options.operation;
  const action = context.data.action || 'open';

  //const mongooseClient = context.app.get('mongooseClient');
  const contextParser = require('../../../utils/js/context-parser')(context,options);
  const buildResult = require('../../../utils/js/build-result')(context,options);
  const workflowHelper = require('../../../utils/js/workflow-helper')(context,options);
  const userHelper = require('../../../utils/js/user-helper')(context,options);

  const _ = require('lodash');


  const { current_org, current_operation } = await contextParser.parse();
  const user = context.params.user;

  /**
   *
   */
  if (action === 'open'){
    context.result = await buildResult.operation({current_org});
  }

  /**
   *
   */
  if (action === 'create-start'){
    const assignment = {
      type: 'assignment.school.homework',
      path: _.uniqueId('assignment_'),
      owner: { operation: {path: 'assigment-admin',org_path: current_org.path}, users: [ user.email ]},
    };

    context.result = await buildResult.operation({assignment});
  }

  if (action === 'create-add-items'){
    const assignment = {
      type: 'assignment.school.homework',
      path: _.uniqueId('assignment_'),
      owner: { operation: {path: 'assigment-admin',org_path: current_org.path}, users: [ user.email ]},
      items: [
        {
          'name':'assignment-item-1',
          'description':'description of assignment-item-1',
          'status':'assigned',
          'actions':[
            {
              action: 'update',
              users: ['each_student']
            },
            {
              action: 'monitor',
              users: ['each_parent','teacher_email']
            },
            {
              action: 'confirm',
              users: ['each_parent']
            }
          ]
        }
      ],
    };

    const action_selections = [
      'update','monitor','confirm'
    ];

    const action_user_selections = [
      '@each_student','@me','@each_parent'
    ];

    context.result = await buildResult.operation({assignment, action_selections, action_user_selections});
  }

  if (action === 'create-confirm'){
    const assignment = {
      type: 'assignment.school.homework',
      path: _.uniqueId('assignment_'),
      owner: { operation: {path: 'assigment-admin',org_path: current_org.path}, users: [ user.email ]},
      items: [
        {
          'name':'assignment-item-1',
          'description':'description of assignment-item-1',
          'status':'assigned',
          'actions':[
            {
              action: 'update',
              users: ['each_student']
            },
            {
              action: 'monitor',
              users: ['each_parent','teacher_email']
            },
            {
              action: 'confirm',
              users: ['each_parent']
            }
          ]
        }
      ],
    };

    context.result = await buildResult.operation({assignment});
  }

  if (action === 'create-end'){
    const assignment = {
      type: 'assignment.school.homework',
      path: _.uniqueId('assignment_'),
      owner: { operation: {path: 'assigment-admin',org_path: current_org.path}, users: [ 'teacher_email' ]},
      to: '@role: each_student',
      items: [
        {
          'name':'assignment-item-1',
          'description':'description of assignment-item-1',
          'status':'assigned',
          'actions':[
            {
              action: 'update',
              users: ['each_student']
            },
            {
              action: 'monitor',
              users: ['each_parent','teacher_email']
            },
            {
              action: 'confirm',
              users: ['each_parent']
            }
          ]
        }
      ],
    };

    const workflowData = _.pick(assignment,['type','path','name','description']);
    workflowData.owner = { operation: {path: 'assigment-admin',org_path: current_org.path}, users: [ user.email ]};

    if (assignment && assignment.to){
      const users = await userHelper.getUsers(assignment.to);
      for(const u of users){
        workflowData.path = _.uniqueId(workflowData.path + '-' + u.email + '-');
        const workflow = await workflowHelper.findOrCreate(workflowData);
        if (workflow){
          for(const item of assignment.items){
            const work = _.pick(item,['name','path','description','title','status']);
            const workAction = {
              action: item.action,
              operation: {path: current_operation.path, org_path: current_operation.org_path },
              users: []
            };
            if (item.actions )
            {
              for ( const action of item.actions){
                if (action.users === '@assign_to'){
                  workAction.users.push(u.email);
                }
              }
            }
            work.actions = [workAction];
            workflowHelper.registerWorkActions({workflow,work});
          }
        }
      }
    }

    context.result = await buildResult.operation({assignment});
  }



  return context;
};


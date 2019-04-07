const validateEmail = require('../../../utils/tools/validate-email');
module.exports = async function (context, options = {}) {

  //const operationData = context.data.data || {};
  //const operation = options.operation;
  const action = context.data.action || 'open';

  //const mongooseClient = context.app.get('mongooseClient');
  const contextParser = require('../../../utils/js/context-parser')(context,options);
  const buildResult = require('../../../utils/js/build-result')(context,options);
  const workflowHelper = require('../../../utils/js/workflow-helper')(context,options);
  //const userHelper = require('../../../utils/js/user-helper')(context,options);

  const _ = require('lodash');


  const { current_org } = await contextParser.parse();
  const user = context.params.user;

  /**
   *
   */
  if (action === 'open'){
    context.result = await buildResult.operation({current_org});
  }

  /**
   * first provide unique path and type
   */
  if (action === 'create-start'){
    const assignment_data = {
      name: 'give a name, option',
      path: 'give path, option',
      description: 'give some description, option'
    };

    const assigment_type_options = [
      {
        name: 'homework assignment',
        key: 'assignment.school.class.homework',
        data: {
          assign_to_options: [
            {
              name: 'every student',
              key: 'every_student'
            },
            {
              name: 'select student',
              key: 'select student'
            },
            {
              name: 'select users',
              key: 'select_users'
            },
            {
              name: 'select roles',
              key: 'select_roles'
            }
          ],
          assignment_work_status_options:[
            'assigned','updated','confirmed'
          ],
          assignment_work_action_options:[
            'update','monitor','confirm'
          ],
          assignment_work_action_by_options:[
            'assigned_user','select_student','select_teacher','select_user','select_role'
          ]
        }
      }
    ];

    context.result = await buildResult.operation({assignment_data, assigment_type_options});
  }

  if (action === 'create-add-works'){
    const assignment_data = context.data.data.assignment_data;

    assignment_data.works = [
      [
        {
          name:'assignment-work-1',
          description:'description of assignment-work-1',
          status:'assigned',
          actions:[
            {
              action: 'update',
              by: ['assigned_user']
            },
            {
              action: 'monitor',
              by: ['assigned_user_parent']
            }
          ]
        }
      ]
    ];

    context.result = await buildResult.operation({assignment_data});
  }

  if (action === 'create-confirm'){
    const assignment_data = context.data.data.assignment_data;

    context.result = await buildResult.operation({assignment_data});
  }

  if (action === 'create-end'){

    const assignment_data = context.data.data.assignment_data;

    const workflows = [];
    if(assignment_data && assignment_data.assign_to){
      const assign_to = assignment_data.assign_to;
      if(assign_to && assign_to.key && assign_to.key === 'every_student'){
        const workflowData = _.pick(assignment_data,['name','description']);
        workflowData.type = assignment_data.type;
        const students = await contextParser.getOrgUsers({role:'student'});
        for(const student of students){
          const workflowData = _.pick(assignment_data,['name','description']);
          workflowData.type = assignment_data.type;
          workflowData.path = 'assign_to_'+student._id;
          workflowData.owner = { operation: {path: 'assigment-admin',org_path: current_org.path}, users: [ user.email ]};
          workflowData.data = {assignment_data};
          const workflow = await workflowHelper.findOrCreate(workflowData);
          if(workflow && assignment_data.works){
            for(const workData of assignment_data.works){
              if (workData && workData.actions){
                const actions = [];
                const actionName = workData.actions.action;
                let operation;
                if (['update','monitor','confirm'].includes(actionName)){
                  operation = {path: 'assignment-home',org_path: context.params.operation.org_path};
                }
                const by = workData.actions.by;
                if (by && Array.isArray(by)){

                  for(const item of by){
                    if (item === 'assigned_user'){
                      actions.push({path: actionName, operation, users: [student.email]});
                      const work = _.pick(workData,['name','description','status']);
                      work.actions = actions;
                      await workflowHelper.addWorkActions({workflow,work});
                    }
                    if(validateEmail(item)){
                      actions.push({path: actionName, operation, users: [item]});
                      const work = _.pick(workData,['name','description','status']);
                      work.actions = actions;
                      await workflowHelper.addWorkActions({workflow,work});
                    }
                    if(item === 'student_parent'){
                      const parents = contextParser.getOrgUsers({role: 'parent', data: { child: student }});
                      if(parents){
                        for(const parent of parents){
                          actions.push({path: actionName, operation, users: [parent.email]});
                          const work = _.pick(workData,['name','description','status']);
                          work.actions = actions;
                          await workflowHelper.addWorkActions({workflow,work});
                        }
                      }
                    }
                  }
                }
              }
              workflows.push(workflow);
            }
          }
        }
      }
    }

    context.result = await buildResult.operation({workflows});
  }



  return context;
};


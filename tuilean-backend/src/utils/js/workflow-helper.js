const _ = require('lodash');
const objectHash = require('object-hash');
module.exports = function(context, options) {

  const contextParser = require('./context-parser')(context,options);
  const workflowService = context.app.service('workflows');
  const operationService = context.app.service('operations');
  const userService = context.app.service('users');
  const workactionsService = context.app.service('workactions');

  const next = async (options = {}) => {
    const results = [];
    const oWorkflow = options && options.workflow && await getWorkflow(options.workflow);
    if (oWorkflow){
      const history = oWorkflow.history;
      if(oWorkflow.current){
        history.push(oWorkflow.current);
        oWorkflow.previous = oWorkflow.current;
      }

      const currentData = options && options.current;
      const nextData = options && options.next || options;
      const taskPath = options && options.task;

      let current = oWorkflow.current;
      let next = nextData && await findOrCreateWork({workflow: oWorkflow, work: nextData});

      if (!next){
        if (oWorkflow && oWorkflow.tasks){
          const task = oWorkflow.tasks.filter( t => {
            return taskPath && taskPath === t.path || t.active === true;
          });
          if (task && task.status_sequence && task.position){
            task.position += 1;
            const nextStatus = task.status_sequence[task.position];
            next = oWorkflow.works.filter( w => {
              return w.status === nextStatus;
            });
          }
        }
      }

      if(current){
        if (current.progress){
          const incremental = currentData.progress && currentData.progress.incremental || 1;
          if (current.progress && current.progress.value){
            current.progress.value += incremental;
            await workflowService.patch(
              oWorkflow._id,
              {
                current
              }
            );
            results.push({message: 'increase progress successfully!', progress: { value: current.progress.value, outof: current.progress.outof}});
            return results;
          }
        }
        if(next){
          let allowNext = true;
          if(current.progress && current.progress.value && current.progress.outof){
            if (current.progress.value < current.progress.outof){
              allowNext = false;
            }
          }

          if(allowNext && oWorkflow){
            next.data = nextData && nextData.data;
            oWorkflow.previous = current;
            oWorkflow.current = next;
            if(oWorkflow.history){
              oWorkflow.history.push(oWorkflow.current);
            }

            await workflowService.patch(
              oWorkflow._id,
              {
                history: oWorkflow.history,previous:oWorkflow.previous, current:oWorkflow.current, tasks: oWorkflow.tasks
              }
            );
            //by default create a notify for workflow.next action
            let notify = true;

            if (options && options.notify === false){
              notify = false;
            }

            const eventData = _.pick(oWorkflow,['_id','type','path','status','current','tasks']);
            if (notify && notify.all){
              const eventId = 'workflow_'+ oWorkflow._id;
              context.service.emit(eventId, {data: eventData});
              const owner_eventId = 'workflow_'+ oWorkflow._id + '_owner_' + oWorkflow.owner._id;
              context.service.emit(owner_eventId, {data: eventData});
            }

            if (notify && notify.owner){
              const eventId = 'workflow_'+ oWorkflow._id + '_owner_' + oWorkflow.owner._id;
              context.service.emit(eventId, {data: eventData});
            }

            //by default, notify current work and previous work
            if (notify){
              const current_event_id = 'workflow_'+ oWorkflow._id + '_work_' + oWorkflow.previous._id;
              context.service.emit(current_event_id, {data: eventData});
              const next_event_id = 'workflow_'+ oWorkflow._id + '_work_' +  + oWorkflow.current._id;
              context.service.emit(next_event_id, {data: eventData});
            }
            results.push({message:'move to next work successfully!', result: {workflow: oWorkflow}});
          }
        } else {
          results.push({ code: 101, error: 'no valid next work to find!'});
        }
      } else {
        results.push({code: 100, error: 'no valid current work to find!'});
      }
      return results;
    }
  };

  const start = async (options = {}) => {
    //options.status = 'start';
    if(!options.work){
      const workflow = await findOrCreateWorkflow(options);
      if(workflow && workflow.works && Array.isArray(workflow.works)){
        if(workflow.tasks && Array.isArray(workflow.tasks)&&!_.isEmpty(workflow.tasks)){
          let activeTask = workflow.tasks.filter ( t => {
            return t.active;
          });
          if (!_.isEmpty(activeTask)){
            activeTask = workflow.tasks[0];
          }
          const activeWork = activeTask.position && activeTask.works && activeTask.works[activeTask.position] || activeTask.works && activeTask.works[0];
          options.work = workflow.works.filter ( w => {
            return w.status === activeWork.status;
          })[0];
        } else if(!options.work){
          options.work = workflow.works[0];
        }
      } else if (!options.work) {
        options.work = { status: 'start', actions: [workflow.owner]};
      }
    }
    return await current(options);
  };

  const end = async ( options = {}) => {
    options.status = 'end';
    return next(options);
  };

  const current = async ( options = {}) => {
    const oWorkflow = options && options.workflow && await findOrCreate(options.workflow);
    const actions = options && options.actions || options.work && options.work.actions || [];
    const action = options && options.action || options.work && options.work.action;
    if (action){
      actions.push(action);
    }
    const data = options && options.data;
    let work = options.work;

    if (options.status && !work && actions){
      work = { status: options.status, actions};
    }

    work = await findOrCreateWork({workflow: options.workflow, work});

    if (work && work._id){
      oWorkflow.current = work;
      await workflowService.patch(oWorkflow._id, {current: work});
      const eventId = 'workflow_'+ oWorkflow._id + '_work_' + work._id;
      context.service.emit(eventId, {data});
      return  work;
    }
    //otherwise return error
    return {code: 301, error: 'fail to set current, please check input!'};
  };

  const init = async ( options = {}) => {
    let { workflow, works, tasks, status} = options;

    if (workflow && works && tasks){
      workflow.works = works;
      workflow.tasks = tasks;
      if (!workflow.status){
        tasks.map( task => {
          if ( task.active === true && task.status_sequence && task.position){
            status = task.status_sequence[task.position];
          }
        });
      }

      if (status){
        workflow.status = status;
        const filters = works.filter ( o=> {
          return o.status === workflow.status;
        });
        if (filters){
          workflow.current = filters[0];
        }
        await workflowService.patch(workflow._id, {works, tasks, status, current: workflow.current});
        return workflow;
      }
      return { code: 502, error:'make sure tasks.status_sequence is array and works contain current status!'};
    } else {
      return { code: 501, error: 'must provide workflow, works and tasks for initialize!'};
    }
  };

  /**
   *
   * @param {} data
   * status: required, page||operation: required, type: required, action: required
   * data.users||data.orgs||data.roles||data.permissions: optional
   */
  const find = async data => {
    const { status, type, work, next } = data;
    let page, operation, query;

    if (type){
      query = {
        type,
      };

      if (status){
        query.status = status;
      }

      if (next && next.action){
        page = next && next.action && next.action.page;
        operation = next && next.action && next.action.operation && await contextParser.getOperation(next.action.operation);
        if (operation && operation._id){
          query['works.actions.operation._id'] = operation._id;
        } else {
          if (data.operation && data.operation.path){
            query['works.actions.operation.path'] = data.operation.path;
          }
          if (data.operation && data.operation.org_path){
            query['works.actions.operation.org_path'] = data.operation.org_path;
          }
        }
        if (page){
          query['works.actions.page'] = page;
        }
        if ( work.action.users){
          query['works.actions.users.email'] = { $in: work.action.users };
        }
      }

      if (work && work.action){
        page = work && work.action && work.action.page;
        operation = work && work.action && work.action.operation && await contextParser.getOperation(work.action.operation);
        if (operation && operation._id){
          query['works.actions.operation._id'] = operation._id;
        } else {
          if (data.operation && data.operation.path){
            query['works.actions.operation.path'] = data.operation.path;
          }
          if (data.operation && data.operation.org_path){
            query['works.actions.operation.org_path'] = data.operation.org_path;
          }
        }
        if (page){
          query['works.actions.page'] = page;
        }
        if ( work.action.users){
          query['works.actions.users.email'] = { $in: work.action.users };
        }
      }

      const finds = await workflowService.find({query});

      return finds.data;
    }

    return { code: 501, error: 'please provide valude input!'};
  };

  const findOrCreate = async options => {
    //
    let data = options && options.workflow || options;

    if ( data && data._id && data.type && data.path && data.owner){
      return data;
    }

    if (typeof data === 'string'){
      data = { _id: data};
    }

    if ( typeof data === 'object'){
      let query;
      if (data._id){
        query._id = data._id;
      }
      if (data.type && data.path){
        query = _.pick(data, ['type','path','owner_hash']);
      }
      if (data.owner){
        query.owner_hash = objectHash(data.owner);
      }
      if (query){
        const finds = await workflowService.find({query});
        if (finds && finds.total === 1){
          return finds.data[0];
        }
      }
    }

    //otherwise create a workflow

    return await create(data);
  };

  const create = async data => {
    const { type, path, owner, works } = data;
    if ( type && path && owner){
      const workflow = await workflowService.create(data);
      if (works){
        await registerWorks({workflow,works});
      }
      return workflow;
    }
    return { code: 201, error:'fail to create workflow, please make sure type|path|owner|works is ready!'};
  };

  const findOrCreateWorkflow = findOrCreate;

  const findOrCreateWork= async data => {
    let workData = data.work || data;
    if (workData && workData._id){
      return workData;
    }

    let work;
    let workflow = await getWorkflow(data);
    if(workflow && workflow.works){
      if (workData && workData.status){
        work = workflow.works.filter( w => { return w.status === workData.status; })[0];
      }
    }

    if (!work && workData.status){
      workflow.works.push(workData);
      await workflowService.patch(workflow._id, {works:workflow.works});
      workflow = await workflowService.get(workflow._id);
      work = workflow.works.filter( w => { return w.status === workData.status; })[0];
    }

    if (work && work._id){
      return work;
    }

    return { code: 301, error:'fail to find and add work, please check input!'};
  };

  const registerWorkactions = async options => {

    const workData = options && options.work || options;

    workData.actions = workData.actions || [];
    if(workData.action){
      workData.actions.push(workData.action);
    }

    const results = [];

    const workflow = options.workflow && await getWorkflow(options.workflow);

    if (workflow && workflow._id){
      const work = await findOrCreateWork({workflow,work: workData});
      if (work && work._id && workData.actions){
        for ( let a of workData.actions){
          const action = await formatAction(a);
          if (action.users){
            for ( const u of action.users){
              const user = await contextParser.getUser(u);
              const operation = action.operation && await contextParser.getOperation(action.operation);
              const query = {
                'workflow._id': workflow && workflow._id,
                'work._id': work && work._id,
                'work.status': work && work.status,
                user_id: user && user._id
              };
              if (action && action.path){
                query['action.path'] = action.path;
              }
              if (operation && operation._id){
                query['operation_id'] = operation._id;
              }
              const finds = await workactionsService.find({query});
              if(finds && finds.total < 1){
                const createData = {
                  workflow: _.pick(workflow, ['_id','type','path']),
                  work: _.pick(work, ['_id','path','status']),
                  action: action && _.pick(action,['path','status','progress']),
                  user_id: user && user._id,
                  status: 'joined'
                };
                if(action.page){
                  createData.page = action.page;
                }
                if(operation && operation._id){
                  createData.operation_id = operation._id;
                }
                const createdAction = await workactionsService.create(createData);
                results.push({createdUserAction: createdAction});
              } else {
                results.push({findUserAction: finds.data[0]});
              }
            }
          }
          else if (action && action.operation)
          {
            const operation = await contextParser.getOperation(action.operation);
            if (operation && operation._id){
              const query = {
                'workflow._id': workflow._id,
                'work._id': work._id,
                'work.status': work.status,
                operation_id: operation._id
              };
              if (action.path){
                query['action.path'] = action.path;
              }
              const finds = await workactionsService.find({query});
              if(finds && finds.total === 0){
                const createdAction = await workactionsService.create(
                  {
                    workflow: _.pick(workflow, ['_id','type','path']),
                    work: _.pick(work, ['_id','path','status']),
                    action: action && _.pick(action,['path','status','progress']),
                    operation_id: operation._id,
                    status: 'joined'
                  });
                results.push({createdOperationAction: createdAction});
              } else {
                results.push({findOpeerationAction: finds.data[0]});
              }
            }
          }
        }
        return results;
      }
    }
    return { code: 302, error: 'fail to register work, please check input!'};
  };

  const registerWork = registerWorkactions;

  const registerWorks = async options => {
    const works = options.works || options || [];
    const workflow = options.workflow;
    let results = [];

    if (workflow && works){
      for ( const work of works){
        results = Object.assign(results, await registerWorkactions({workflow, work}));
      }
    }

    return results;

  };

  const addWorkactions = registerWorkactions;

  const getListens = (workflow, work) => {
    return {
      workflow_listen: 'workflow_'+'notify_' + workflow._id,
      current_listen: 'workflow_'+'notify_' + workflow._id + '_current_' + work.path,
      next_listen: 'workflow_'+'notify_' + workflow._id + '_next_' +  + work.path,
      owner_listen: 'workflow_'+'notify_' + workflow._id + '_owner_' +  + work.path,
    };
  };

  const getUserWorks = async ( options = {}) => {
    const user = options && options.user && await contextParser.getUser(options.user) ||  context.params.user;
    const operation = options && options.operation && await contextParser.getOperation(options.operation);

    const org = options && options.org && await contextParser.getOrg(options.org);
    const page = options && options.page;
    const workflow_type = options && options.workflow_type;
    const workflow_path = options && options.workflow_path;

    const current_works = [];
    const previous_works = [];

    const populateWork = async ( work, options ) => {
      const { workflow_type, workflow_path } = options;
      const j = work;
      if ( j && j.work && j.workflow )
      {
        if(workflow_type && workflow_type !== j.workflow.type){
          return;
        }
        if(workflow_path && workflow_path !== j.workflow.path){
          return;
        }

        const operation = j.operation_id && await operationService.get(j.operation_id);
        const user = j.user_id && await userService.get(j.user_id);

        const workflow = await getWorkflow(j.workflow);
        const theWork = { workflow: j.workflow, status: j.status};
        if(operation){
          theWork.operation = _.pick(operation,['_id','path','org_path']);
        }
        if(user){
          theWork.user = _.pick(user,['_id','email']);
        }
        if(j.page){
          theWork.page = j.page;
        }
        if (j.action){
          theWork.action = j.action;
        }
        if (workflow && workflow.current && workflow.current.status && j.work.status === workflow.current.status){
          theWork.work = workflow.current;
          current_works.push(theWork);
        }
        if (workflow && workflow.previous && workflow.previous.status && j.work.status === workflow.previous.status){
          theWork.work = workflow.previous;
          previous_works.push(theWork);
        }
      }
    };

    if (operation && operation._id){
      const finds = await workactionsService.find({query: {operation_id: operation._id, status: 'joined'}});
      for( const j of finds.data ) {
        await populateWork(j,{workflow_path, workflow_type});
      }
    }

    if (org && org.path){
      const userOperations = await contextParser.getOrgUserOperations({org});
      const idList = userOperations.map( uo => {
        return uo._id;
      });
      const finds = await workactionsService.find({query: {operation_id: {$in: idList}, status: 'joined'}});
      for( const j of finds.data ) {
        await populateWork(j,{workflow_path, workflow_type});
      }
    }

    if (user){
      const finds = await workactionsService.find({query: {user_id: user._id, status: 'joined'}});
      for (const j of finds.data) {
        if (operation && operation.path && operation.org_path){
          if (_.some(j.actions, {operation:{path: operation.path, org_path: operation.org_path}})){
            await populateWork(j,{workflow_path, workflow_type});
          }
        } else if (page){
          if (_.some(j.actions, {page})){
            await populateWork(j,{workflow_path, workflow_type});
          }
        }
        else if (org && org.path){
          if (_.some(j.actions, {operation:{org_path: org.path}})){
            await populateWork(j,{workflow_path, workflow_type});
          }
        } else {
          await populateWork(j,{workflow_path, workflow_type});
        }
      }
    }

    return {current_works, previous_works};
  };

  const getWorksByAction = async ( options = {}) => {
    const { workflow, action } = options;
    let next_works = [], current_works = [], all_works = [];
    if (workflow && action){
      if (workflow.current && workflow.current.actions_hash){
        if (workflow.current.actions_hash.includes(objectHash(action))){
          current_works.push(workflow.current);
        }
      }

      if (workflow.next && workflow.next.actions_hash){
        if (workflow.next.actions_hash.includes(objectHash(action))){
          next_works.push(workflow.next);
        }
      }

      if (workflow.works){
        workflow.works.map ( w => {
          if ( w.actions_hash && w.actions_hash.includes(objectHash(action))){
            all_works.push(w);
          }
        });
      }
    }
    return { next_works, current_works, all_works};
  };

  const getWorkflow = async (options ={}) => {
    let data = options.workflow || options;
    if ( data && data._id && data.type && data.path && data.owner){
      return data;
    }

    if (typeof data === 'string'){
      data = { _id: data};
    }

    if ( typeof data === 'object'){
      let query = {};
      if (data._id){
        query._id = data._id;
      }
      if (data.type && data.path){
        query = Object.assign(query,_.pick(data, ['type','path','owner_hash']));
      }
      if (data.owner){
        query.owner_hash = objectHash(data.owner);
      }
      if (query && !_.isEmpty(query)){
        const finds = await workflowService.find({query});
        if (finds && finds.total === 1){
          return finds.data[0];
        }
      }
    }
  };

  const matchAction = async (options = {})  => {
    const actions = options.actions;
    const action = options.action;

    if (actions && action) {
      const findAction = _.find(actions, o => {
        if ( o.page && action.page && o.page === action.page){
          if ( o.users && action.user && o.users.includes(action.user)){
            return o;
          }
        }
        if ( o.operation && action.operation){
          if ( o.operation._id && action.operation._id && o.operation._id === action.operation._id){
            const matchUser = ! o.users || ( action.user && _.includes(o.users, action.user));
            const matchRole = ! o.roles || ( action.role && _.includes(o.roles, action.role));
            const matchPermission = ! o.permissions || ( action.permission && _.includes(o.permission, action.permission));
            if ( matchUser && matchRole && matchPermission)
            {
              return o;
            }
          }
        }
      });
      return findAction != null;
    }
  };

  const matchNextAction = async ( options = {}) => {
    const workflow = options.workflow && await getWorkflow(options.workflow);
    const action = options.action;

    if (workflow && workflow.next && workflow.next.actions && action){
      return matchAction({actions: workflow.next.actions, action});
    }
  };

  const formatAction = async ( action ) => {
    if ( action.user){
      if (typeof action.user === 'object' && action.user.email){
        action.user = action.user.email;
      }
    }

    if (action.operation){
      if (typeof action.operation === 'string' && action.org){
        action.operation = { operation: action.operation, org: action.org};
      }
      const operation = await contextParser.getOperation(action.operation);
      if (operation){
        action.operation = _.pick(operation,['path', 'org_path']);
      }
    }
    return _.pick(action,['name', 'path', 'operation','page','users', 'orgs','roles','permissions','data']);
  };

  const binderWorks = async ( options = {}) => {
    const user = options.user || context.params.user;
    const binder = options.binder;

    const action = context.data && context.data.action;

    if (user && user._id && action){
      if (action === 'show-works'){
        return await getUserWorks(binder);
      }
      if(['work-detail','detail-work'].includes(action.toLowerCase())){
        const work = context.data && context.data.data && context.data.data.work;
        return work;
      }
    }
  };

  return {start, end, init, current, next, find, findOrCreate, findOrCreateWorkflow,registerWorks, registerWork,
    getListens, registerWorkactions,getWorksByAction,
    matchAction, getWorkflow, matchNextAction, create, addWorkactions, formatAction, getUserWorks, binderWorks
  };
};

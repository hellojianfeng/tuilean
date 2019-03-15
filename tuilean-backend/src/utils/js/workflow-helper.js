const _ = require('lodash');
const objectHash = require('object-hash');
module.exports = function(context, options) {

  const contextParser = require('./context-parser')(context,options);
  const workflowService = context.app.service('workflows');
  const operationService = context.app.service('operations');
  const userService = context.app.service('users');

  const next = async (options = {}) => {
    const oWorkflow = options && options.workflow && await getWorkflow(options.workflow);
    if (oWorkflow){
      const history = oWorkflow.history;
      if(oWorkflow.current){
        history.push(oWorkflow.current);
        oWorkflow.previous = oWorkflow.current;
      }

      let actions = options && options.next && options.next.actions || options.actions || [];
      const action = options && options.next && options.next.action || options.action;
      if (action){
        actions.push(action);
      }
      const data = options && options.data;
      const status = options && options.status;
      let next = { status, actions, data};

      if(status)
      {
        const filters = oWorkflow.works.filter( w => {
          return w.status === status;
        });
        next = filters[0];
        if(data){
          next.data = next && next.data ? Object.assign(next.data, data): data;
        }
      } else if (next && next.status && next.actions){
        await addWork(oWorkflow,next);
      }

      if(next){
        oWorkflow.next = next;
        oWorkflow.status = next.status;

        const sequence = oWorkflow.sequence;
        sequence.position += 1;
        if (oWorkflow.sequence.status.length < sequence.position +1){
          oWorkflow.sequence.status.push(next.status);
        }

        await workflowService.patch(oWorkflow._id, {history,previous:oWorkflow.previous, current:oWorkflow.current, next, status, sequence,data});
        //by default create a notify for workflow.next action
        let notify = true;

        if (options && options.notify === false){
          notify = false;
        }

        const eventData = _.pick(oWorkflow,['_id','type','path','status','current','next','sequence']);
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

        //by default, notify current work and next work
        if (notify){
          const current_event_id = 'workflow_'+ oWorkflow._id + '_work_' + oWorkflow.current._id;
          context.service.emit(current_event_id, {data: eventData});
          const next_event_id = 'workflow_'+ oWorkflow._id + '_work_' +  + oWorkflow.next._id;
          context.service.emit(next_event_id, {data: eventData});
        }
        return data;
      }
    }
  };

  const start = async (options = {}) => {
    options.status = 'start';
    return await current(options);
  };

  const end = async ( options = {}) => {
    options.status = 'end';
    return next(options);
  };

  const current = async ( options = {}) => {
    const oWorkflow = options && options.workflow && await findOrCreate(options.workflow);
    const actions = options && options.actions || options.work && options.work.actions || [];
    const action = options && options.action || options.work && options.work.action || [];
    if (action){
      actions.push(action);
    }
    const data = options && options.data;
    let oCurrent;

    const status = options.status || 'start';
    if (oWorkflow && status){
      oCurrent = oWorkflow.works.filter( w => {
        return w.status === status;
      })[0];
      //if no start status, add it
      if(!oCurrent && actions.length > 0){
        oCurrent = await addWork({workflow: oWorkflow, work: {status, actions}});
      }
    }
    if (oCurrent){
      if (data){
        oCurrent.data = data;
      }

      oWorkflow.current = oCurrent;
      await workflowService.patch(oWorkflow._id, {current: oCurrent});
      const eventId = 'workflow_'+ oWorkflow._id + '_work_' + oCurrent._id;
      context.service.emit(eventId, {data});
    }
    //otherwise return error
    return {code: 301, error: 'fail to set current, please check input!'};
  };

  const init = async ( options = {}) => {
    const { workflow, works, sequence} = options;

    if (workflow && works && sequence){
      workflow.works = works;
      workflow.sequence = sequence;
      if (sequence.status && Array.isArray(sequence.status)){
        sequence.position = sequence.position || 0;
        const status = sequence.status[sequence.position];
        if (status){
          workflow.status = status;
          const filters = works.filter ( o=> {
            return o.status === status;
          });
          if (filters){
            workflow.current = filters[0];
          }
          await workflowService.patch(workflow._id, {works, sequence, status, current: workflow.current});
          return workflow;
        }
      }
      return { code: 502, error:'make sure sequence.status is array and works contain current status!'};
    } else {
      return { code: 501, error: 'must provide workflow, works and sequence for initialize!'};
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

  const findOrCreate = async data => {
    //
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

    return create(data);
  };

  const create = async data => {
    const { type, path, owner, works, sequence } = data;
    if ( type && path && owner && sequence && works){
      const status = sequence.status && sequence.position && sequence.status[sequence.position] || 'start';
      return await workflowService.create({type, path, owner, works, sequence, status});
    }
    return { code: 201, error:'fail to create workflow, please make sure type|path|owner|sequance|works is ready!'};
  };


  const findOrCreateWork= async data => {
    let workData = data.work || data;
    if (workData && workData._id && workData.actions_hash){
      return workData;
    }
    
    let work;
    const workflow = await getWorkflow(data);
    if(workflow && workflow.works){
      if (workData && workData.status){
        work = workflow.works.filter( w => { return w.status === workData.status; })[0];
      }
    }

    if (!work && workData.status && workData.actions){
      workflow.works.push(workData);
      await workflowService.patch(workflow._id, {works:workflow.works});
      work = workflow.works.filter( w => { return w.status === workData.status; })[0];
    }
    
    if (work && work._id){
      return work;
    }

    return { code: 301, error:'fail to find and add work, please check input!'};
  };

  const registerWork = async options => {

    const workData = options && options.work || options;

    workData.actions = workData.actions || [];
    if(workData.action){
      workData.actions.push(workData.action);
    }

    const workflow = options.workflow && await getWorkflow(options.workflow);

    if (workflow && workflow._id && workflow.works){
      const work = await findOrCreateWork({workflow,work: workData});
      if (work && work._id && workData.actions){
        for ( const action of workData.actions){
          if (action.users){
            let joinedWorks = [];
            for ( const u of action.users){
              const user = await contextParser.getUser(u);
              if (user && user.workflows && user.workflows.joined){
                user.workflows.joined.map( async wf => {
                  if (wf._id.equals(workflow._id)){
                    joinedWorks = wf.works && wf.works.filter( w => { w._id.equals(work._id);});
                    //if not find work in user, add it
                    if(joinedWorks.length < 1){
                      wf.works.push(work);
                      await userService.patch(user._id, {workflows: user.workflows});
                    }
                  }
                });
              }
            }
          } 
          else if (action && action.operation)
          {
            let operation = action.operation;
            if (typeof action.operation === 'string'){
              operation = { path: action.operation };
            }
            if ( action.org){
              operation.org = action.org;
            }
            operation = await contextParser.getOperation(operation);
            if (operation && operation._id){
              const joined = operation.workflows.joined.filter( wf => {
                return wf._id.equals(workflow._id);
              });
              if (joined.length === 0){
                operation.workflows.joined.push({_id: workflow._id, type: workflow.type, path: workflow.path, works: [{_id: work._id, status: work.status}]});
                await operationService.patch(operation._id, {workflows: operation.workflows});
              }
            }
          }
        }
        return work;
      }
    }
    return { code: 302, error: 'fail to register work, please check input!'};
  };

  const addWorks = async data => {
    const { workflow, works} = data;
    const results = [];
    for ( const work of works){
      results.push(await addWork({workflow, work}));
    }
    return results;
  };

  const joinWork = registerWork;
  const addWorkActions = registerWork;
  const addWork = registerWork;

  const getListens = (workflow, work) => {
    return {
      workflow_listen: 'workflow_'+'notify_' + workflow._id,
      current_listen: 'workflow_'+'notify_' + workflow._id + '_current_' + work.path,
      next_listen: 'workflow_'+'notify_' + workflow._id + '_next_' +  + work.path,
      owner_listen: 'workflow_'+'notify_' + workflow._id + '_owner_' +  + work.path,
    };
  };

  const getUserOrgWorkflows = async ( options ) => {
    let user_operations = options && await contextParser.getOrgUserOperations(options);
    if (options.operation){
      const operation = await contextParser.getOperation(options.operation);
      if (operation){
        user_operations = user_operations.filter( uop => {
          return uop._id.equals(operation._id);
        });
      }
    }
    const current_workflows = [];
    const next_workflows = [];
    user_operations.map ( async uop => {
      uop.workflows.joined.map ( async wf => {
        const workflow = await getWorkflow(wf);
        wf.works.map( w => {
          if (w.status === workflow.current.status){
            current_workflows.push(workflow);
          }
          if (w.status === workflow.next.status){
            next_workflows.push(workflow);
          }
        });
      });
    }); 
    return { current_workflows, next_workflows};
  };

  const getUserWorkflows = async (options = {}) => {
    const user = options && options.user && await contextParser.getUser(options.user) ||  context.params.user;
    const operation = options && options.operation && await contextParser.getOperation(options.operation);

    const org = options && options.org && await contextParser.getOrg(options.org);

    const current_workflows = [];
    const next_workflows = [];

    if (operation && operation.workflows && operation.workflows.joined){
      operation.workflows.joined.map ( async wf => {
        const workflow = await getWorkflow(wf);
        current_workflows.push(workflow.current);
        next_workflows.push(workflow.next);
      });
    }

    if ( org) {
      return getUserOrgWorkflows({org});
    }
    
    const userWorkflows = user.workflows && user.workflows.joined || [];

    const page = options.page;

    userWorkflows.map ( async wf => {
      const workflow = await getWorkflow(wf);
      if (page && _.find(workflow.current.actions, a => { return a.page && a.page === page;})){
        current_workflows.push(workflow);
      }
      if (page && _.find(workflow.next.actions, a => { return a.page && a.page === page;})){
        next_workflows.push(workflow);
      }
      if (operation && _.find(workflow.current.actions, a => { return a.operation && a.operation._id && a.operation._id.equals(operation._id);})){
        current_workflows.push(workflow);
      }
      if (operation && _.find(workflow.next.actions, a => { return a.operation && a.operation._id && a.operation._id.equals(operation._id);})){
        next_workflows.push(workflow);
      }
    });

    return {current_workflows, next_workflows};
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
        const finds = await workflowService.find({query: data});
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

  return {start, end, init, current, next, find, findOrCreate, addWork, addWorks, 
    getListens, getUserOrgWorkflows, getUserWorkflows,registerWork,
    matchAction, getWorkflow, matchNextAction, joinWork, create, addWorkActions
  };
};

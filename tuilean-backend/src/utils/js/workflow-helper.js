const _ = require('lodash');
const objectHash = require('object-hash');
module.exports = function(context, options) {

  const contextParser = require('./context-parser')(context,options);
  const workflowService = context.app.service('workflows');

  const next = async (options = {}) => {
    const oWorkflow = options && options.workflow && await getWorkflow(options.workflow);
    if (oWorkflow){
      const history = oWorkflow.history;
      history.push(oWorkflow.current);
      oWorkflow.previous = oWorkflow.current;
  
      let next = options && options.next;
      const data = options && options.data;
      const status = options && options.status;
  
      if(status)
      {
        const filters = oWorkflow.works.filter( w => {
          return w.status.includes(status);
        });
        next = filters[0];
      } else if (next && next.status && next.actions){
        await addWork(oWorkflow,next);
      }
  
      if(next){
        if(data){
          next.data = next && next.data ? Object.assign(next.data, data): data;
        }
        oWorkflow.next = next;
  
        const sequence = oWorkflow.sequence;
        sequence.position += 1;
        if (oWorkflow.sequence.status.length < sequence.position +1){
          oWorkflow.sequence.status.push(next.status);
        }
  
        await workflowService.patch(oWorkflow._id, {history,previous:oWorkflow.previous, current:oWorkflow.current, next, status, sequence,data});
        //by default create a notify for workflow.next action
        let notify = true;
  
        if (next.data && next.data.notify === false){
          notify = false;
        }
  
        const eventData = _.pick(oWorkflow,['_id','type','path','status','current','next','sequence']);
        if (notify && notify.all){
          const eventId = 'workflow_notify_'+ oWorkflow._id;
          context.service.emit(eventId, {data: eventData});
        }
  
        if (notify && notify.owner){
          const eventId = 'workflow_notify_'+ oWorkflow._id + '_owner_' + oWorkflow.owner.path;
          context.service.emit(eventId, {data: eventData});
        }
  
        //by default, notify current work and next work
        if (notify){
          const current_event_id = 'workflow_notify_'+ oWorkflow._id + '_current_' + oWorkflow.current.path;
          context.service.emit(current_event_id, {data: eventData});
          const next_event_id = 'workflow_notify_'+ oWorkflow._id + '_next_' +  + oWorkflow.next.path;
          context.service.emit(next_event_id, {data: eventData});
        }
        return data;
      }
    }
  };

  const current = async (options = {}) => {
    const oWorkflow = options && options.workflow && await findOrCreate(options.workflow);
    const status = options && options.status;
    if (oWorkflow && status){
      const oCurrent = oWorkflow.works.filter( w => {
        return w.status.includes(status);
      });
      if(oCurrent){
        oWorkflow.current = oCurrent;
        const data = options && options.data || options;
        if (data){
          oWorkflow.current.data = data;
        }
        return { workflow: oWorkflow, current: oCurrent};
      }
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

    if (data && data.type && data.path && data.owner){
      return await workflowService.create(data);
    }

    return { code: 105, error:'fail to find and create a workflow, please check your data for a valid query or valid for new workflow!'};

  };

  const addWork = async data => {
    const { workflow, status, actions } = data;
    if ( status && actions){
      if (workflow && workflow.works ){
        const work = workflow.works.filter ( w => {
          return w.status === status;
        });
        if(!work){
          workflow.works.push ( data);
          return await workflowService.patch(workflow._id, {works: workflow.works});
        } else {
          return { code: 200, error: 'find work already!'};
        }
      }
    }
    return { code: 201, error: 'fail to add work, please check input!'};
  };

  const addWorks = async data => {
    const results = [];
    for ( const work of data){
      results.push(await addWork(work));
    }
    return results;
  };

  const addSequence = async data => {
    const { workflow, status } = data;
    if(workflow && workflow.sequence && status){
      workflow.sequence.status.push(status);
      workflow.sequence.position += 1;
      return await workflowService.patch(workflow._id, {sequence: workflow.sequence});
    } else {
      return { code: 300, error:'please check input!'};
    }
  };

  const getListens = (workflow, work) => {
    return {
      workflow_listen: 'workflow_'+'notify_' + workflow._id,
      current_listen: 'workflow_'+'notify_' + workflow._id + '_current_' + work.path,
      next_listen: 'workflow_'+'notify_' + workflow._id + '_next_' +  + work.path,
      owner_listen: 'workflow_'+'notify_' + workflow._id + '_owner_' +  + work.path,
    };
  };

  const getUserOrgWorkflows = async ( options = {} ) => {
    const user = options && options.user && await contextParser.getUser(options.user) ||  context.params.user;
    const org = options && options.org && await contextParser.getOrg(options.org) || contextParser.getCurrentOrg();

    if (user && org){
      const userOperations = contextParser.getUserOrgOperations({user,org});
      const opList = userOperations.map ( o => {
        return o._id;
      });
      const userRoles = contextParser.getUserOrgRoles({user,org});
      const roleList = userRoles.map ( o => {
        return o._id;
      });
      const userPermissions = contextParser.getUserOrgPermission({user,org});
      const permitList = userPermissions.map ( o => {
        return o._id;
      });
      const finds = await workflowService.find({
        'works.operation._id': { $in: opList },
        $and: [
          {
            $or: [
              {'works.users': {$elemMatch: {_id: {$in: [user._id]}}}}, 
              {'works.users': {$exists: false}}
            ],
          },
          {
            $or: [
              {'works.roles': {$elemMatch: {_id: {$in: roleList}}}}, 
              {'works.roles': {$exists: false}}
            ],
          },
          {
            $or: [
              {'works.permissions': {$elemMatch: {_id: {$in: permitList}}}}, 
              {'works.permissions': {$exists: false}}
            ],
          }
        ]
      });
      return finds.data;
    }

    return { code: 502, error: 'fail to find workflows, please check input!'};
  };

  const getUserWorkflows = async (options = {}) => {
    const user = options && options.user && await contextParser.getUser(options.user) ||  context.params.user;
    const page = options && options.page;

    const query = {
      'works.users':{$elemMatch:{_id: {$in: user._id}}},
      'works.operation':{$exists: false}
    };

    if (page){
      query['works.page'] = page;
    }

    const finds = await workflowService.find({query});

    return finds.data;

  };

  const getWorkflow = async (data ={}) => {
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

  const registerListener = async ( options = {}) => {
    let eventId = 'workflow_';
    const action = options.action;
    if (action && action.operation){
      const operation = await contextParser.getOperation(operation);
      const refinedAction = _.pick(operation,['_id','path','org_path','org_id']);
    }
    if(action && action.page){
      
    }
  };

  return {init, current, next, find, findOrCreate, addWork, addWorks, 
    addSequence, getListens, getUserOrgWorkflows, getUserWorkflows,
    matchAction, getWorkflow, matchNextAction
  };
};

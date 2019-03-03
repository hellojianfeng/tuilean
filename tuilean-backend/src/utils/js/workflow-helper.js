const _ = require('lodash');
const objectHash = require('object-hash');
module.exports = function(context, options) {

  const contextParser = require('./context-parser')(context,options);
  const workflowService = context.app.service('workflows');

  const next = async (workflow, options = {}) => {
    const oWorkflow = await findOrCreate(workflow);
    const history = oWorkflow.history;
    history.push(oWorkflow.current);
    oWorkflow.previous = oWorkflow.current;

    let {status, next, data} = options;

    if(status)
    {
      next = oWorkflow.works.filter( w => {
        return w.status.includes(status);
      });
    } else if (next && next.status && next.actions){
      await addWork(next);
    }

    if(next){
      if(data){
        next.data = next && next.data ? Object.assign(next.data, data): data;
      }
      oWorkflow.next = next;

      const sequence = oWorkflow.sequence;
      sequence.position += 1;
      if (oWorkflow.sequence.status.length <= sequence.position +1){
        oWorkflow.sequence.status.push(next.status);
      }

      await workflowService.patch(workflow._id, {history,previous:oWorkflow.previous, current:oWorkflow.current, next, status, sequence,data});
      //by default create a notify for workflow.next action
      let notify = true;

      if (next.data && next.data.notify === false){
        notify = false;
      }

      const eventData = _.pick(oWorkflow,['_id','type','path','current','next','sequence']);
      if (notify && notify.all){
        const eventId = 'workflow_notify_'+ oWorkflow._id;
        context.service.emit(eventId, {data: eventData});
      }

      if (notify && notify.owner){
        const eventId = 'workflow_notify_'+ oWorkflow._id + '_owner_' + objectHash(_.pick(oWorkflow.owner,['path','action']));
        context.service.emit(eventId, {data: eventData});
      }

      //by default, notify current work and next work
      if (notify){
        const current_event_id = 'workflow_notify_'+ oWorkflow._id + '_current_' + objectHash(_.pick(oWorkflow.current,['path','action']));
        context.service.emit(current_event_id, {data: eventData});
        const next_event_id = 'workflow_notify_'+ oWorkflow._id + '_next_' + objectHash(_.pick(oWorkflow.next,['path','action']));
        context.service.emit(next_event_id, {data: eventData});
      }

      return data;
    }


  };

  /**
   *
   * @param {} data
   * status: required, page||operation: required, type: required, action: required
   * data.users||data.orgs||data.roles||data.permissions: optional
   */
  const find = async data => {
    const { status, type, page, action } = data;
    const operation = data.operation && await contextParser.getOperation(data.operation);
    const query = {
      'works.status': { $elemMatch: { $in: [status]} },
      action, type
    };
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
    if ( data.current && data.current.users){
      query['works.actions.users.email'] = { $in: data.current.users };
    }
    const finds = await workflowService.find({query});

    return finds.data;
  };

  const findOrCreate = async data => {
    //
    if ( data && data._id && data.type && data.path && data.current){
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
      current_listen: 'workflow_'+'notify_' + workflow._id + '_current_' + objectHash(work),
      next_listen: 'workflow_'+'notify_' + workflow._id + '_next_' +  + objectHash(work),
      owner_listen: 'workflow_'+'notify_' + workflow._id + '_owner_' +  + objectHash(work),
    };
  };

  return {next, find, findOrCreate, addWork, addSequence, getListens};
};

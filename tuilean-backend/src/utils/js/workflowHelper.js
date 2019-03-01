const _ = require('lodash');
const objectHash = require('object-hash');
module.exports = function(context, options) {

  const contextParser = require('./context-parser')(context,options);
  const workflowService = context.app.service('workflows');
  const notifyHelper = require('./notify-helper')(context,options);

  const next = async (workflow, status, data) => {
    const history = workflow.history;
    history.push({ status: workflow.status, data: workflow.data});

    if (data.notifications){
      data.notification_results = await notifyHelper.send(data.notifications);
    }

    await workflowService.patch(workflow._id, {history, status, data});
    return data;
  };

  /**
   * 
   * @param { status: required, current: required } data 
   * current.action: required
   * one of current.operation||current.page: required
   * current.users||current.orgs||current.roles||current.permissions: optional
   */
  const find = async data => {

    const { status, type } = data;
    const { page, action } = data && data.current;
    const operation = data.current && data.current.operation && await contextParser.getOperation(data.current.operation);
    const query = {
      'status': { $elemMatch: { $in: [status]} },
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
    return data;
  };

  return {next, find, findOrCreate, addWork};
};
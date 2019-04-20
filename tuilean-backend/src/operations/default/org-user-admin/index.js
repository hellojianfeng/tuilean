
module.exports = async function (context, options = {}) {

  //const operationData = context.data.data || {};
  //const operation = options.current_operation;
  let action = context.data.action || 'open';
  const contextParser = require('../../../utils/js/context-parser')(context,options);
  const buildResult = require('../../../utils/js/build-result')(context,options);
  const userHelper = require('../../../utils/js/user-helper')(context,options);
  //const notifyHelper = require('../../../utils/js/notify-helper')(context,options);
  const workflowHelper = require('../../../utils/js/workflow-helper')(context,options);
  const operationHelper = require('../../../utils/js/operation-helper')(context,options);
  const _ = require('lodash');

  //const mongooseClient = context.app.get('mongooseClient');
  const userService = context.app.service('users');

  //const { operation_org } = await contextParser.parse();

  const current_work = context.data.data && context.data.data.current_work;
  const current_operation = context.params.operation;

  if (current_work){
    if(current_work.operation && current_operation._id.equals(current_work.operation._id)){
      if(current_work.work.status === 'applying' ){
        action = 'process-join-org';
      }
    }
  }

  //open action return org user list
  if (action === 'open'){

    const result = {};

    const {operation_org_users, operation_org_roles, operation_org_permissions, operation_org_operations} = await contextParser.parse();

    result.org_users = operation_org_users;
    result.org_permissions = operation_org_permissions.filter( r => {
      return r.path !== 'followone'; // not allow add user directly into this role
    });
    result.org_roles = operation_org_roles;
    result.org_operations = operation_org_operations.filter(o=>{
      return o.path !== 'org-initialize';
    });

    const works = await workflowHelper.getUserWorks({operation: context.params.operation});
    result.works = works;

    context.result = await buildResult.operation(result);

    return context;
  }

  //if not provide role for user, use everyone role
  /**
     * input:
     */
  if (action === 'add-user-role' || action === 'add-org-user'){
    const result = {};
    let {role,roles,user,everyone_role} = await contextParser.parse();
    if(!user){
      context.result = await buildResult.page({error: 500, message:'use is not exist! please specify user in operation data'});
      return context;
    }
    if (role){
      roles.push(role);
    }
    roles = _.uniqBy(roles, r => { return r.path;});

    if (roles.length === 0){
      roles.push(everyone_role);
    }

    const user_roles = await contextParser.getOrgUserRoles({user});

    if(user && roles.length > 0){
      roles = roles.concat(user_roles);
      roles = _.uniqBy(roles, r => {
        return r.path;
      });

      user.roles = roles.map ( r => {
        return {
          _id: r._id,
          path: r.path,
          org_id: r.org_id,
          org_path: r.org_path
        };
      });
      await userService.patch(user._id,{roles: user.roles});
      result.user = user;
      if(result.user && result.user.password) delete result.user.password;
      context.result = await buildResult.operation(result);
    } else {
      throw new Error('no valid user or role(s)!');
    }
    return context;
  }

  if(action === 'create-org-user'){
    const errors = [];
    let createUserData = context.data && context.data.data;
    const {everyone_role} = await contextParser.parse();
    const users = [];
    if (!Array.isArray(createUserData)){
      createUserData = [ createUserData];
    }
    for ( const o of createUserData) {
      let userData = o.user;
      if(typeof userData === 'string'){
        userData = { email: userData};
      }
      const roles = o.roles && await contextParser.getRoles(o.roles) || [];
      userData.password = userData.password || 'password123';
      if (userData.email){
        const finds = await userService.find({query:{email: userData.email}});
        if (finds.total > 0){
          errors.push({error:100,message:'user exist already!', user: userData});
        } else {
          const user = await userService.create(userData);
          if (user){
            user.roles = [ { _id: everyone_role._id, path: everyone_role.path, org_id: everyone_role.org_id, org_path: everyone_role.org_path}];
            user.roles = user.roles.concat(roles.map( r => {
              return {
                _id: r._id,
                path: r.path,
                org_id: r.org_id,
                org_path: r.org_path
              };
            }));
            user.roles = _.uniqBy(user.roles, r => { return r.path; });
            await userService.patch(user._id, { roles: user.roles });
            const oUser = await userService.get(user._id);
            if (oUser && oUser.password) delete oUser.password;
            users.push(oUser);
          }
        }
      } else {
        errors.push({error: 100, message:'not find email in user data!', user: userData});
      }
    }

    context.result = await buildResult.operation({created_users: users, errors});
  }

  if (action === 'find-org-user' || action === 'org-user-find'){
    const { current_operation_org } = await contextParser.parse();
    const orgPath = current_operation_org.path;
    const inputData = context.data.data;

    const limit = inputData.limit || 20;
    const skip = inputData.skip || 0;

    const finds = await userService.find({query: {
      $limit: limit, $skip: skip,
      $or: [
        {'roles.org_path': orgPath},
        {'permissions.org_path':orgPath},
        {'operations.org_path': orgPath}
      ]}});

    context.result = await buildResult.operation(finds.data.map ( u => {
      u.roles = u.roles.filter ( r => {
        return r.org_path === orgPath;
      });
      if(u.password) delete u.password;
      return u;
    }));
    return context;
  }

  if (action === 'find-join-org-works'){

    const workflows = await workflowHelper.find({
      type: 'join-org',
      status: 'applying',
      next: { action: {operation: { _id: context.params.operation._id}}}
    });

    const works = [];

    workflows.map ( wf => {
      works.push({
        type: 'join-org',
        current: wf.current,
        previous: _.pick(wf.previous,['actions','status']),
        workflow: wf
      });
    });

    return context.result = await buildResult.operation({ join_org_works: works });
  }

  if (action === 'process-join-org'){
    const {process_result, current_work}= context.data.data;
    const userData = context.data.data && context.data.data.user || current_work && current_work.work && current_work.work.data && current_work.work.data.user;
    const orgData = context.data.data && context.data.data.org || current_work && current_work.work && current_work.work.data && current_work.work.data.org;

    const user = await contextParser.getUser(userData);
    const org = await contextParser.getOrg(orgData);

    if (user && org){
      const configuration = operationHelper.getConfiguration();
      const allowJoinOrg = configuration && configuration.allow && configuration.allow.join_org && configuration.allow.join_org || 'need_approve';
      const { everyone_role } = await contextParser.parse();

      if (allowJoinOrg === 'always'){
        // add user into org immediately
        userHelper.add_user_role(everyone_role);
        if(current_work){
          await workflowHelper.next({workflow:current_work.workflow, status: 'processed', data: {'result': 'approved'}});
        }
      }

      if (allowJoinOrg === 'need_approve'){
        if (process_result){
          if(['approved','rejected','processing','approve','reject'].includes(process_result)){
            await userHelper.add_user_role({role: everyone_role, user});
            if(current_work){
              await workflowHelper.next({workflow:current_work.workflow, status: 'processed', data: {'result': process_result}});
            }
            return context.result = await buildResult.operation({status: 'processed', data: {'result': process_result}});
          }
        }
      }
    }
    return context.result = await buildResult.operation({ code: 201, error:'not execute process-join-org, please check input!'  });
  }
};

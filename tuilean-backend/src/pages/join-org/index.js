
/**
 * action: open: list joined orgs and a search control to search orgs to join
 * action: search: search orgs to join
 * action: join: join one org, during join action, will create a channel
 * and then send notification to org-user-admin
 */
//const _ = require('lodash');
module.exports = async function (context, options) {

  let pageData = context.data.data;
  let action = context.data.action || 'open';

  const orgService = context.app.service('orgs');
  //const channelHelper = require('../../utils/js/channel-helper')(context,options);
  //const notifyHelper = require('../../utils/js/notify-helper')(context,options);
  const workflowHelper = require('../../utils/js/workflow-helper')(context,options);

  const buildResult = require('../../utils/js/build-result')(context, options);
  const contextParser = require('../../utils/js/context-parser')(context,options);
  const user = context.params.user;

  const result = await workflowHelper.binderWorks({binder:{page:'join-org'}});
  if(result){
    return context.result = result;
  }

  if (action === 'open'){
    const { user_orgs } = await contextParser.parse();
    
    const result = { user_orgs};

    return context.result = await buildResult.page(result);
  }

  if (action === 'find-org'){
    let { user_orgs } = await contextParser.parse();
    user_orgs = Object.values(user_orgs);
    const listOfPath = user_orgs.map ( o => {
      return o.path;
    });
    const finds = await orgService.find({query:pageData});
    if (finds.total > 0){
      return context.result = await buildResult.page( finds.data.filter( o => {
        return !listOfPath.includes(o.path);
      }));
    } else {
      return context.result = await buildResult.page({code: 202, error: 'not find orgs!'});
    }
  }

  if (action === 'apply-join'){

    let org = await contextParser.getOrg(pageData);

    if (org){
      const workflow = await workflowHelper.findOrCreate({
        type:'join-org',
        path:'apply-join-'+org.path,
        owner: { page: 'join-org', users: [user.email]},
        tasks: [
          {
            path: 'apply-join',
            status_sequence: ['start','applying','processed','end'],
            position: 0,
            active: true
          }
        ],
        works: [
          { status:'start',action:{ page: 'join-org',users:[user.email] }},
          { status:'applying',action:{ operation: 'org-user-admin',org }},
          { status:'processed',action:{ page: 'join-org',users:[user.email] }},
          { status:'end',action:{ page: 'join-org',users:[user.email] }}
        ]
      });

      if (workflow){
        await workflowHelper.start({workflow});
        return await workflowHelper.next({workflow,next: {status:'applying', data:{ user: user.email, org }}});
      }
    }

    return { code: 301, error: 'fail to apply join org, please check input!'};
  }

  return { code: 300, error: 'no action is executed!'};
};


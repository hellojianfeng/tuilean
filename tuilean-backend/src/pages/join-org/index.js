
/**
 * action: open: list joined orgs and a search control to search orgs to join
 * action: search: search orgs to join
 * action: join: join one org, during join action, will create a channel
 * and then send notification to org-user-admin
 */
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
  const workflow = context.data.data && context.data.data.workflow;

  if (workflow){
    if ( workflowHelper.matchNextAction ({
      workflow,action: { page: 'join-org', user: user.email}})){
      if (workflow.status === 'processed'){
        action = 'confirm-processed';
      }
    }
  }

  if (action === 'open'){
    const { user_orgs } = await contextParser.parse();
    const next_workflows = await workflowHelper.find({
      type: 'join-org',
      status: 'processed',
      next: { action: { page: 'join-org', users: [ user.email ]}}
    });
    return context.result = await buildResult.page({ user_orgs, next_workflows});
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

    let { org } = pageData;

    const workflow = await workflowHelper.findOrCreate({
      type:'join-org',
      path:'page#join-org#user#'+ user.email,
      owner: { page: 'join-org', users: [user.email]}
    });

    if (workflow){
      await workflowHelper.init(
        {
          workflow,
          works: [{
            status: 'initial', 
            actions:[
              {
                page: 'join-org',
                users: [ user.email]
              }
            ]
          },
          {
            status: 'applying', 
            actions:[
              {
                operation: { path: 'org-user-admin', org_path: org},
              }
            ]
          }],
          sequence:{
            status: ['initial','applying'],
            position: 0
          }
        }
      );

      await workflowHelper.next({workflow,status:'applying', data:{ user: user.email, org}});
    }

    // if (org){
    //   org = await contextParser.getOrg(org);
    //   const to_channel_path = 'org#'+org.path+'#operation#org-user-admin-channel';
    //   const to_channel = await channelHelper.getChannel({
    //     path: to_channel_path,
    //     scopes:
    //       [
    //         {
    //           owner: {
    //             operation: { path: 'org-user-admin', org_path: org.path}
    //           }
    //         }
    //       ]
    //   });
  
    //   const from_channel = await channelHelper.findOrCreateChannel({
    //     path:'page#join-org#user#'+ user.email,
    //     scopes: [
    //       {
    //         owner: {
    //           user: user.email
    //         },
    //         pages: ['join-org'],
    //       }
    //     ],
    //     allow: {
    //       listens: [
    //         {
    //           type: 'notify',
    //           path: 'join-org',
    //           scopes:[
    //             {
    //               owner: {
    //                 operation: { org, operation: 'org-user-admin'}
    //               }
    //             }
    //           ],
    //           data:[
    //             {
    //               type: 'notification',
    //               path: {
    //                 value: 'admin-join-org',
    //                 description: 'must provide path as this value',
    //                 required: true
    //               },
    //               title: { type: 'string' },
    //               description: { type: 'string' },
    //               contents:[
    //                 {
    //                   name:'process-join-org-result',
    //                   type: 'data.join-org-result',
    //                   value: {type: 'enum', values: ['approved','rejected','processing']},
    //                   required: true
    //                 }
    //               ]
    //             }
    //           ]
    //         }
    //       ]
    //     }
    //   });
  
    //   if ( from_channel && to_channel) {
    //     return await notifyHelper.send({
    //       path: 'apply-join-org',
    //       tags: [ 'apply-join-org'],
    //       from_channel, to_channel, 
    //       listen: 'join-org',
    //       contents: [
    //         { name: 'message', type: 'string', value:'apply-join-org, please process this request!'},
    //         { name: 'org', type: 'data.org',  value: {_id: org._id, path: org.path}}
    //       ]
    //     });
    //   }
    // } else {
    //   return { code: 301, message:'please provide org!'};
    // }
  }

  return { code: 300, error: 'no action is executed!'};
};


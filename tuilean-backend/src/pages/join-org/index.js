
/**
 * action: open: list joined orgs and a search control to search orgs to join
 * action: search: search orgs to join
 * action: join: join one org, during join action, will create a channel
 * and then send notification to org-user-admin
 */

module.exports = async function (context, options) {

  const pageData = context.data.data;
  const action = context.data.action || 'open';

  const orgService = context.app.service('orgs');
  const notifyService = context.app.service('notify');
  const channelHelper = require('../utils/js/channel-helper')(context,options);

  const buildResult = require('../../utils/js/build-result')(context, options);
  const contextParser = require('../../utils/js/context-parser')(context,options);
  const user = context.params.user;

  if (action === 'open'){
    const { user_orgs } = await contextParser.parse();
    return context.result = await buildResult.page({ user_orgs });
  }

  if (action === 'search'){
    const { user_orgs } = await contextParser.parse();
    const listOfPath = user_orgs.map ( o => {
      return o.path;
    });
    const finds = await orgService.find(pageData);
    if (finds.total > 0){
      return context.result = await buildResult.page( finds.data.filter( o => {
        return !listOfPath.includes(o.path);
      }));
    } else {
      return context.result = await buildResult.page({code: 202, error: 'not find orgs!'});
    }
  }

  if (action === 'apply-join'){

    const { org } = pageData;

    const to_channel = await channelHelper.getChannel({
      scope: {
        operations: [
          {
            operation: { org, operation: 'org-user-admin'}
          }
        ]
      },
    });

    const from_channel = await channelHelper.findOrCreateChannel({
      path:'$page-user-channel-path',
      scope: {
        pages: [
          {
            page: 'join-org',
            users: [ user.email ]
          }
        ]
      },
    });

    if ( from_channel && to_channel) {
      return await notifyService.create(
        {
          action: 'send',
          data:{
            from: {
              channel: from_channel,
              contents: [
                { name: 'message', body:'apply-join-org, please waiting for approving!'},
                { org }
              ]
            },
            to: {
              channel:to_channel,
              contents: [
                { name: 'message', body:'apply-join-org, please process this request!'},
                { org }
              ]
            }
          }
        });
    }
  }

  return context;
};


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
  const channelHelper = require('../../utils/js/channel-helper')(context,options);
  const notifyHelper = require('../../utils/js/notify-helper')(context,options);

  const buildResult = require('../../utils/js/build-result')(context, options);
  const contextParser = require('../../utils/js/context-parser')(context,options);
  const user = context.params.user;

  if (action === 'open'){
    const { user_orgs } = await contextParser.parse();
    return context.result = await buildResult.page({ user_orgs });
  }

  if (action === 'find-orgs'){
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

    const { org } = pageData;

    const to_channel = await channelHelper.getChannel({
      path: 'org-user-admin-channel',
      scopes:
        [
          {
            owner: {
              operation: { path: 'org-user-admin', org_path: org}
            }
          }
        ]
    });

    const from_channel = await channelHelper.findOrCreateChannel({
      path:'page#join-org#user#'+ user.email,
      scopes: [
        {
          owner: {
            user: user.email
          },
          pages: ['join-org'],
        }
      ],
      allow: {
        listens: [
          {
            type: 'notify',
            path: 'join-org',
            owner: {
              operation: { org, operation: 'org-user-admin'}
            }
          }
        ]
      }
    });

    if ( from_channel && to_channel) {
      return await notifyHelper.send({
        path: 'apply-join-org',
        tags: [ 'apply-join-org'],
        from_channel, to_channel, 
        listen: 'join-org',
        contents: [
          { name: 'message', body:'apply-join-org, please process this request!'},
          { org }
        ]
      });
    }
  }

  return { code: 300, error: 'no action is executed!'};
};


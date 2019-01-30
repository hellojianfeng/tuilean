
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

  const buildResult = require('../../utils/js/build-result')(context, options);
  const contextParser = require('../../utils/js/context-parser')(context,options);
  const channelHelper = require('../../utils/js/channel-helper')(context,options);
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

  if (action === 'join'){

    const { org } = pageData;
    const { user_self_channels } = await channelHelper.getUserChannels({page: 'join-org'});
    const operation = await contextParser.getOperation({ path: 'org-user-admin', org});

    user_self_channels.filter( o => {
      return o.operation.oid.equals(operation._id);
    });

    let channel = user_self_channels.length > 0 &&  user_self_channels[0];
    if (!channel){
      channel = await channelHelper.createChannel({
        path:'join-org',
        tags:['join-org'],
        type: 'notify',
        creator: { page: 'join-org', users: [user.email]},
        joiners: [{operation}]
      });
    }

    return await notifyService.create(
      {
        page: 'join-org', 
        action: 'send', 
        channel: channel, 
        data: {
          from: {
            user: { oid: user._id, email: user.email },
            page: 'join-org',
          },
          to: {
            operation: { 
              oid: operation._id,
              path: operation.path,
              org_id: operation.org_id,
              org_path: operation.org_path
            }
          },
          path: 'apply-join-org',
          tags: ['apply-join-org'],
          contents: [ { name: 'message', path: 'message', body:'apply join org!'}]
        }
      });
  }

  return context;
};


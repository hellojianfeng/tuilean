
const userOrgFind = require('../../utils/js/user-org-find');
const buildResult = require('../../utils/js/build-page-result');
module.exports = async function (context, options={}) {

  //const pageData = context.data.data;
  const page = context.data.page;
  const action = context.data.action || 'open';

  //const mongooseClient = context.app.get('mongooseClient');

  if (page === 'user-home' && action === 'open'){
    const orgs = await userOrgFind(context,options);
    const orgList = Object.values(orgs);

    context.result = await buildResult(context,{ orgs: orgList });
  }

  return context;
};


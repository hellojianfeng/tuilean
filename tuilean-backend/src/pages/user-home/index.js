
const userOrgFind = require('../../utils/js/user-org-find');

module.exports = async function (context, options={}) {

  //const pageData = context.data.data;
  const page = context.data.page;
  const action = context.data.action || 'open';

  const buildResult = require('../../utils/js/build-result')(context,options);
  const workflowHelper = require('../../utils/js/workflow-helper')(context,options);

  //const mongooseClient = context.app.get('mongooseClient');

  if (page === 'user-home' && action === 'open'){
    const orgs = await userOrgFind(context,options);
    const orgList = Object.values(orgs);

    context.result = await buildResult.page({ orgs: orgList });
  }

  const result = await workflowHelper.binderWorks();
  if (result){
    context.result = result;
  }

  return context;
};


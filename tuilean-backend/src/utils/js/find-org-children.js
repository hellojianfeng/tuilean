
/**
 * input format:
 * {
 *    one of {
 *      org: org object with _id or path or both, or _id
 *      org is string for id or path
 *    }
 * }
 *
 * result array of children orgs
 */
module.exports = async function (context, options = {}) {

  //const mongooseClient = context.app.get('mongooseClient');

  const orgService = context.app.service('orgs');

  const contextParser = require('./context-parser')(context,options);

  let { org, current_org } = await contextParser.parse();

  if (!org && current_org){
    org = current_org;
  }

  if (!org){
    throw new Error('no valid org!');
  }

  const childrenMatch = new RegExp('^'+org.path+'#');

  const finds = await orgService.find({
    query: {
      path: childrenMatch
    }
  });

  context.result = {
    api: 'org-children-find',
    result: finds.data
  };

  return finds.data;
};


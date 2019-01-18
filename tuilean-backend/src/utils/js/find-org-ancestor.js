
/**
 * input format: 
 * {
 *    one of {
 *      org: org object with _id or path or both, or oid
 *      org is string for id or path
 *    }
 * }
 * 
 * result array of children orgs
 */
module.exports = async function (context, options = {}) {
  
  const orgService = context.app.service('orgs');
  
  const contextParser = require('./context-parser')(context,options);
  
  let { org, current_org } = await contextParser.parse();
  
  if (!org && current_org){
    org = current_org;
  }
  
  if (!org){
    throw new Error('api org-ancestor-find: no valid org!');
  }
  
  const items = org.path.split('#');
  items.pop();
  
  let startString;
  const ancestorItems = items.map ( s => {
    if (!startString){
      startString = s;
    } else {
      startString += '#' + s;
    }
    return startString;
  });
  
  //const ancestorMatch = new RegExp('#'+ancestorStart+'$');
  
  const finds = await orgService.find({
    query: {
      path: {
        $in: ancestorItems
      }
    }
  });
  
  context.result = {
    api: 'org-ancestor-find',
    result: finds.data
  };
  
  return finds.data;
};
  
  
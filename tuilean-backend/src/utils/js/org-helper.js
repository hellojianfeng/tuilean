module.exports = function(context, options) {

  const contextParser = require('./context-parser')(context,options);
  const userService = context.app.service('users');

  const findOrgUsers = async (options = {}) => {

    const operationOrg = await contextParser.getCurrentOperationOrg();
    const orgPath = options.org && options.org.path || operationOrg && operationOrg.path;
    const roles = options.roles || [];
    if (options.role){
      roles.push(options.role);
    }

    const finds = await userService.find({query: { $or: [
      {'roles.org_path': orgPath},
      {'permissions.org_path':orgPath},
      {'operations.org_path': orgPath}
    ]}});

    //only return roles in org for users
    return finds.data.filter ( u => {
      u.roles = u.roles.filter ( r => {
        if (r.org_path === orgPath){
          if (roles.length === 0 || roles.includes(r.path)){
            return true;
          }
        }
      });
      return u.roles.length > 0;
    });
  };

  return { findOrgUsers};
};

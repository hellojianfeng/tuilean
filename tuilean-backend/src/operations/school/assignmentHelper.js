module.exports = function(context, options) {

  const orgHelper = require('../../utils/js/org-helper')(context,options);
  const userService = context.app.service('users');
  const contextParser = require('../../utils/js/context-parser')(context,options);

  const populateAssignments = async (options = {}) => {
    const { assign_to, assign_to_allocation='each_user' } = options;

    if (assign_to){
      if ( assign_to_allocation === 'each_user'){
        const users = [];
        if (assign_to.role){
          assign_to.roles = assign_to.roles || [];
          assign_to.roles.push(assign_to.role);
        }
        if (assign_to.roles){
          users.concat(await orgHelper.findOrgUsers({roles: assign_to.roles}));
        }

        return users;
      }
    }

    return [];
  };

  const findStudentParent = async ( student ) => {

    if (student && student.email){
      const org = await contextParser.getCurrentOrg();
      const query = {
        'role.path':'parent',
        'role.org_path': org.path,
        '$and':[
          {
            'tags':student.email
          },
          {
            'tags':'children'
          }
        ]
      };
      return await userService.find({query});
    }
    return [];
  };

  return { populateAssignments, findStudentParent };
};

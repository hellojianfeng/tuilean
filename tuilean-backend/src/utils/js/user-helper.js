module.exports = function(context, options) {

  const contextParser = require('./context-parser')(context,options);
  const userService = context.app.service('users');

  const add_user_role = async options => {

    let { role } = options;

    const user = options.user || context.params.user;

    role = await contextParser.getRole(role);

    let isNewRole = true;
    user.roles.map ( r => {
      if (r._id.equals(role._id)){
        isNewRole = false;
      }
    });
    if(isNewRole){
      user.roles.push(role);
      const patched = await userService.patch(user._id, {roles: user.roles} );
      if (patched){
        return { message: 'add a role into user already!', role, user_roles: patched.roles};
      }
    } else {
      return { error: 101, message: 'user has role already!', role, user_roles: user.roles};
    }

    return { error: 102, message: 'not execute add_user_role, please check input!'};
  };

  return { add_user_role};
};

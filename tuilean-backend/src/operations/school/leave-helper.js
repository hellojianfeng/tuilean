module.exports = function(context, options) {

  const orgHelper = require('../../utils/js/org-helper')(context,options);
  const userService = context.app.service('users');
  const contextParser = require('../../utils/js/context-parser')(context,options);
  
  const createLeave = async options => {
    return options;
  };
  
  return { createLeave };
};
  
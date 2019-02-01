

module.exports = function(context, options) {

  const contextParser = require('./context-parser')(context,options);

  const isAllowNotify = async options => {
    return options;
  };
  
  return { isAllowNotify, contextParser };
};
  
  
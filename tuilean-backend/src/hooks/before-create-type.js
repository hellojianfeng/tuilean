// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
/**
 * tasks:
 * 1. if not provide path and only provide name, set path = name, vice verse
 */
module.exports = function () {
  return async context => {

    if (context.data.name && ! context.data.path){
      context.data.path = context.data.name;
    }

    if (context.data.path && ! context.data.name){
      context.data.name = context.data.path;
    }

    return context;
  };
};

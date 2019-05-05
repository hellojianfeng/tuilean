// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
const objectHash = require('object-hash');
module.exports = function () {
  return async context => {
    if (context.data){
      if (context.data.owner){
        context.data.owner_hash = objectHash(context.data.owner);
      }
    }
    return context;
  };
};

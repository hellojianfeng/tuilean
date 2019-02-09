// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
const objectHash = require('object-hash');
module.exports = function () {
  return async context => {
    if (context.data.scopes){
      context.data.scopes_hash = objectHash(context.data.scopes);
    }
    return context;
  };
};

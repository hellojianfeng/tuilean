// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
const objectHash = require('object-hash');
module.exports = function () {
  return async context => {
    if (context.data){
      const works = context.data && context.data.works || [];
      works.map ( w => {
        const actions = w && w.actions || [];
        actions.map ( a => {
          w.actions_hash.push(objectHash(a));
        });
      });
      if (context.data.owner){
        context.data.owner_hash = objectHash(context.data.owner);
      }
      if(context.data.sequence && context.data.sequence.status && Array.isArray(context.data.sequence.status)){
        if (context.data.sequence.position){
          context.data.status = context.data.sequence.status[context.data.sequence.position];
        }
      }
    }
    return context;
  };
};

// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
const objectHash = require('object-hash');
module.exports = function () {
  return async context => {
    // const service = context.service;
    // const id = context.result._id;
    // if (context.data.listens && Array.isArray(context.data.listens)){
    //   context.data.listens.map ( o => {
    //     o.type = o.type || 'notify';
    //     if ( o.scopes){
    //       o.scopes_hash = objectHash(o.scopes);
    //     }
    //     o.listen_id = o.type + '_' + id;
    //     if ( o.path ){
    //       o.listen_id = o.listen_id + '_' + o.path;
    //     }
    //     return o;
    //   });
    // }
    // await service.patch(context.result._id, { listens: context.data.listens });
    return context;
  };
};

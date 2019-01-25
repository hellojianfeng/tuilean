// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const channelHelper = require('../utils/js/channel-helper');
    const objectHash = require('object-hash');
    //const buildResult = require('../utils/js/build-result');
    const channelService = context.app.service('channels');
    if (context.data.to_scope && context.data.from_scope){
      let to_scope = channelHelper.formatScope(context.data.to_scope);
      const from_scope = channelHelper.formatScope(context.data.from_scope);
      to_scope = channelHelper.filterScopeByAllow(context.data.to_scope);
      if (!Array.isArray(to_scope) || to_scope.length <= 0){
        context.result = Object.assign(context.result, { 
          code: 500,
          error:'create_channel_to_scope_error',
          message: 'no allow to_scopes to find!'});
      }
      const to_hash = objectHash(to_scope);
      const from_hash = objectHash(from_scope);
      const results = await channelService.find({query: { to_hash, from_hash }});
      let channels = [];
      if (results.total < 1){
        const created = await channelService.create({type:'notification',from_scope, to_scope});
        channels.push(created);
      }
      else {
        channels = channels.concat(results.data);
      }
      context.data.channel = channels[0]._id;
      return context;
    }
  };
};

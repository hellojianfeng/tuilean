//const _ = require('lodash');
const objectHash = require('object-hash');
module.exports = function(context) {

  //const contextParser = require('./context-parser')(context,options);
  const configService = context.app.service('configurations');

  const addOrUpdate = async options => {
    let configs = [];
    if ( !Array.isArray(options)){
      configs.push(options);
    } else {
      configs = options;
    }

    const results =[];

    for(const config of configs){
      if (config && config.owner && config.key){
        const owner_hash = objectHash(config.owner);
        const finds = await configService.find({query: {owner_hash,key: config.key}});
        if (finds && finds.total && finds.total > 0){
          const one = finds.data[0];
          results.push({message: 'update configuration successfully!', upated: await configService.patch(one._id, config)});
        } else {
          results.push({message: 'create configuration successfully!', created: await configService.create(config)});
        }
      } else {
        results.push({code: 0, error: 'please provide valid config data!', config});
      }
    }
  };

  return { addOrUpdate };
};

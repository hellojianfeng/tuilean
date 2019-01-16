
module.exports = function (context, options={}) {

  const buildResult = require('./build-result')(context,options);

  const isInitialize = async ( operation ) => {
    if ( operation && operation._id){
      const runService = context.app.service('go-operation');
      const query = {
        'operation.oid':operation._id
      };
      const findResult = await runService.find({query});
      if (findResult.total > 0){
        return true;
      }
      return false;
    } else {
      throw new Error('no valid operation for isInitialize!');
    }
    
  };

  const checkInitialize = async ( operation, showResultWhenInitialized = true ) => {

    const checked = await isInitialize(operation);

    if(checked && showResultWhenInitialized){
      context.result = await buildResult.operation({
        is_initialized: true,
        message: 'operation is initialized, please do not initialize it again!'
      });
    } 

    if(!checked && !showResultWhenInitialized){
      context.result = await buildResult.operation({
        is_initialized: false,
        message: 'operation is not initialized, please initialize it first!'
      });
    }
    
    return context;
  };

  return  {
    isInitialize,
    checkInitialize
  };
};


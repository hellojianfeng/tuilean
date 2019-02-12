
module.exports = function (context, options={}) {

  const buildResult = require('./build-result')(context,options);
  const contextParser = require('./context-parser')(context,options);

  const isInitialized = async ( operation ) => {

    operation = await contextParser.getOperation(operation);

    if ( operation && operation._id){
      const runService = context.app.service('do-operation');
      const query = {
        'operation_id':operation._id
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

  const checkInitializeWithResult = async ( operation ) => {

    let result;
    operation = await contextParser.getOperation(operation);
    const checked = await isInitialized(operation);

    if(checked){
      result = await buildResult.operation({
        is_initialized: true,
        message: 'operation is initialized, please do not initialize it again!'
      });
    } else {
      result = await buildResult.operation({
        is_initialized: false,
        message: 'operation is not initialized, please initialize it first!'
      });
    }
    
    return result;
  };

  return  {
    isInitialized,
    checkInitializeWithResult
  };
};


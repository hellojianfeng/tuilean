
module.exports = async function (context, options={}) {

  const buildResult = require('../../../utils/js/build-result')(context,options);

  const isInitialize = async ( operation ) => {
    if ( operation && operation._id){
      const runService = context.app.service('go-operation');
      const query = {
        'operation.oid':options.operation._id
      };
      const findResult = await runService.find({query});
      if (findResult.total > 0){
        return true;
      }
      return false;
    }
    return false;
  };

  const checkInitialize = async ( operation ) => {

    const action = context.data.action || 'open';

    const checked = await isInitialize(operation);

    if(checked){
      context.result = await buildResult.operationResult({
        is_initialized: checked,
        message: 'operation is initialized, please do not initialize it again!'
      });
      return context;
    } else {
      if (action === 'check'){
        context.result = await buildResult.operationResult({
          is_initialized: checked,
          message: 'operation is not initialized, please initialize it first!'
        });
        return context;
      }
    }
  };

  return  {
    isInitialize,
    checkInitialize
  };
};


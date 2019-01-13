// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
const fs = require('fs');
module.exports = function (options = {}) {
  return async context => {
    const page = context.data.page;
    if (page){
      context.params.page = page;
      if (fs.existsSync('src/pages/' + page + '/data.json'))
      {
        const jsonData = require('../pages/'+ page +'/data.json');
        context.params.configuration.page = jsonData;
      }
      if (fs.existsSync('src/pages/' + page + '/do.js'))
      {
        const doPage = require('../pages/' + page + '/do.js');
        const doResult = await doPage(context,options);
        //if not show doOperation result, should add record operation
        if (!context.result){
          context.data.result = doResult;
          context.data.page = page,
          context.data.user = { oid: context.params.user._id, email: context.params.user.email };
        }
      } else {
        throw new Error('do.js not exist for page of '+ page );
      }
    } else {
      throw new Error('not find valid page!');
    }
    return context;
  };
};


/**

 */

module.exports = async function (context) {

  const pageData = context.data.data;
  const action = context.data.action || 'open';

  const typeService = context.app.service('types');
  const orgService = context.app.service('orgs');

  const buildResult = require('../../utils/js/build-result')(context);

  if (action === 'open'){
    const finds = await typeService.find({query:{owner:'orgs'}});
    context.result = await buildResult.page({ types: finds.data });
    return context;
  }

  if (action === 'summary-before-create'){
    if(!pageData){
      throw new Error('please provide org data to create!');
    }
    if(!pageData.name){
      throw new Error('org name is required!');
    }
    if(!pageData.type){
      throw new Error('org type is required!');
    }

    context.result = await buildResult.page({ create_data: pageData });
    return context;
  }

  if (action === 'create'){

    if(!pageData){
      throw new Error('please provide org data to create!');
    }
    if(!pageData.name){
      throw new Error('org name is required!');
    }
    if(!pageData.type){
      throw new Error('org type is required!');
    }

    return await orgService.create(pageData, context.params);

    //return await buildResult(context,{ created: createResult });
  }

  return context;
};


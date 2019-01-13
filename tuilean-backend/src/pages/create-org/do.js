
/**

 */
module.exports = async function (context) {

  const pageData = context.data.data;
  const pageName = context.data.page || context.data.name;
  const action = context.data.action || 'start';

  const orgTypeService = context.app.service('org-types');
  const orgService = context.app.service('orgs');

  if (action === 'start'){
    const findResult = await orgTypeService.find();
    context.result = {
      page: pageName,
      action,
      data: {
        types: findResult.data
      }
    };
  }

  if (action === 'before-create-summary'){
    if(!pageData){
      throw new Error('please provide org data to create!');
    }
    if(!pageData.name){
      throw new Error('org name is required!');
    }
    if(!pageData.type){
      throw new Error('org type is required!');
    }

    context.result = {
      page: pageName,
      action,
      data: {
        create_data: pageData
      }
    };
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

    const createResult = await orgService.create(pageData, context.params);

    context.data.data = {
      create_result: createResult
    };
  }

  return context;
};


// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
/**
 * tasks:
 * 1. check add type of org to types model
 * 2. if only provide name and not provide org path, use name as org path
 */
module.exports = function () {
  return async context => {

    let orgs = [];

    const data = context.data;

    if (Array.isArray(data)){
      orgs = data;
    } else {
      orgs.push(data);
    }

    for ( const org of orgs) {

      if (org.type && typeof org.type === 'string'){

        const typeService = context.app.service('types');

        const finds = await typeService.find({
          query: {
            path: org.type,
            owner: 'orgs'
          }
        });

        let oType;

        if (finds.total > 0){
          oType = finds.data[0];
        } else {
          oType = await typeService.create({path:data.type, owner: 'orgs'});
        }

        org.type = {
          _id: oType._id,
          path: oType.path
        };
      }
    }

    if (orgs.length === 1){
      context.data = orgs[0];
    } else {
      context.data = orgs;
    }

    return context;
  };
};

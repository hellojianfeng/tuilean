module.exports = async function (context, options = {}) {

  const orgFollowAdd = require('./add-org-follow');

  const inputData = options && options.follows || context && context.data && context.data.data && context.data.data.follows;

  const results = [];
  for (const f of inputData){
    const result = await orgFollowAdd(context, { follow: f });
    results.push(result);
  }

  return context.result = results;
};


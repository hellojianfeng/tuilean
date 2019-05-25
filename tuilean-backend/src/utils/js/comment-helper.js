
module.exports = function(context) {

  //const contextParser = require('./context-parser')(context,options);
  const commentService = context.app.service('comments');

  const objectHasher = require('object-hash');

  const addComment = async options => {
    const owner = options && options.owner;
    options.owner_hash = owner && objectHasher(JSON.stringify(owner));

    if (options.owner_hash && options.title){
      return await commentService.create(options);
    } else {
      return { error: 100, message: 'please provide owner and title!'};
    }
  };

  const findComments = async options => {
    const owner = options && options.owner;
    const owner_hash = owner && objectHasher(JSON.stringify(owner));

    if ( owner_hash){
      const finds = await commentService.find({query:{owner_hash}});
      return finds && finds.data;
    }

    return [];
  };

  return { addComment, findComments};
};

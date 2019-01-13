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

    let elements = [];

    const data = context.data;

    if (Array.isArray(data)){
      elements = data;
    } else {
      elements.push(data);
    }

    for ( const e of elements) {
      if (e.name && ! e.path){
        e.path = e.name;
      }

      if (e.path && ! e.name){
        e.name = e.path;
      }
    }

    if (elements.length === 1){
      context.data = elements[0];
    } else {
      context.data = elements;
    }

    return context;
  };
};

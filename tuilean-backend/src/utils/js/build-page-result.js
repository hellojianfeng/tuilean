
module.exports = async function (context, result={}) {

  //const pageData = context.data.data;
  const pageName = context.data.page;
  const action = context.data.action || 'open';

  //const mongooseClient = context.app.get('mongooseClient');

  const user = context.params.user;

  return  {
    page: pageName,
    action: action,
    user: {oid: user._id, email: user.email},
    result
  };
};


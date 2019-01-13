
/**
 * this function use to find all user's orgs
 * parameters:
 * data: it is data from create run-api
 * return:
 * org list with user's roles
 */
module.exports = async function (context) {

  const user = context.params.user;

  const orgService = context.app.service('orgs');

  const orgList = {};

  await Promise.all(user.roles.map ( async o => {
    const org = await orgService.get(o.org_id);
    orgList[org.path] = org;
  }));

  context.result = orgList;

  return context.result;
};


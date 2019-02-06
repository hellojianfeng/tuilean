

module.exports = function(context, options) {

  const contextParser = require('./context-parser')(context,options);
  const channelHelper = require('./channel-helper');

  const validateEmail = (email) => {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const checkAllowNotify = async options => {
    let {from_channel, to_channel} = options;
    from_channel = await channelHelper.getChannel(from_channel);
    to_channel = await channelHelper.getChannel(to_channel);

    const to_allow_notify = to_channel.allow && to_channel.allow.notify;

    const allow_operations = to_allow_notify.operations || [];
    const allow_pages = to_allow_notify.pages || [];
    const from_operations = from_channel.scope && from_channel.scope.operations || [];
    const from_pages = from_channel.scope && from_channel.scope.pages || [];

    for(const ap of allow_operations){
      const filters = from_operations.filters( fp => {
        const matchOperation = fp.org_path === ap.org_path && fp.path === ap.path;
        if ( matchOperation === false){
          return false;
        }
        if (ap.users && Array.isArray(ap.users)){
          const userFilters = ap.users.map( apu => {
            //allow one user
            if ( apu === '$one'){
              return apu === '$one' && fp.users && Array.isArray(fp.users) && fp.users.length === 1;
            }
            //allow user by email
            if(validateEmail(apu) && fp.users && Array.isArray(fp.users)){
              const fromUserFilters = fp.users ( fpu => {
                return fpu === apu;
              });
              return fromUserFilters.length > 0;
            }
            return false;
          });
          return userFilters.length > 0;
        }
        //allow operation
        return matchOperation;
      });
      return filters.length > 0;
    }

    for(const ap of allow_pages){
      const filters = from_pages.filters( fp => {
        const matchPage = fp.path === ap.path;
        if ( matchPage === false){
          return false;
        }
        if (ap.users && Array.isArray(ap.users)){
          const userFilters = ap.users.map( apu => {
            //allow one user
            if ( apu === '$one'){
              return apu === '$one' && fp.users && Array.isArray(fp.users) && fp.users.length === 1;
            }
            //allow user by email
            if(validateEmail(apu) && fp.users && Array.isArray(fp.users)){
              const fromUserFilters = fp.users ( fpu => {
                return fpu === apu;
              });
              return fromUserFilters.length > 0;
            }
            return false;
          });
          return userFilters.length > 0;
        }
        //allow operation
        return matchPage;
      });
      return filters.length > 0;
    }

    return false;
  };

  return { checkAllowNotify, contextParser };
};


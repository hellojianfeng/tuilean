// channels-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const orgObj = new Schema({
    oid: {type: Schema.Types.ObjectId},
    path: String,
    org_id: {type: Schema.Types.ObjectId},
    org_path: String
  }, { _id: false });
  // const userObj = new Schema({
  //   oid: {type: Schema.Types.ObjectId},
  //   email: String,
  //   name: String
  // });
  const orgSchema = new Schema({
    oid: {type: Schema.Types.ObjectId},
    path: String
  }, { _id: false });

  const scopeSchema = new Schema({
    operation: orgObj,
    page: String,
    action: String,
    orgs: [ orgSchema ],
    roles:[ orgObj ],
    permissions: [ orgObj ],
    users:[ String ],
    data: { type: Schema.Types.Mixed }
  });

  const channel_operation_scope = new Schema({
    operation: orgObj,
    action: String,
    orgs: [ orgSchema ],
    roles:[ orgObj ],
    permissions: [ orgObj ],
    users:[ String ],
    data: { type: Schema.Types.Mixed }
  },{ _id: false });

  const channel_page_scope = new Schema({
    page: String,
    action: String,
    orgs: [ orgSchema ],
    roles:[ orgObj ],
    permissions: [ orgObj ],
    users:[ String ],
    data: { type: Schema.Types.Mixed }
  }, { _id: false });

  const channelSchema = new Schema({
    oid: { type: Schema.Types.ObjectId }, 
    type: String, 
    path: String, 
    tags: [ String ],
    scope_hash: String
  }, {_id: false });

  const ownerChannelSchema = new Schema({
    channel: channelSchema,
    scopes: [ scopeSchema ],
    data: { type: Schema.Types.Mixed }
  });

  return {
    channel_obj: channelSchema, 
    owner_channel: ownerChannelSchema, 
    channel_scope: scopeSchema, 
    compact_org_obj: orgObj, 
    compact_org: orgSchema.page,
    channel_operation_scope,
    channel_page_scope
  };
};

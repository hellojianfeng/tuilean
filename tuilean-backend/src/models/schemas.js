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
  });
  const userObj = new Schema({
    oid: {type: Schema.Types.ObjectId},
    email: String
  });
  const orgSchema = new Schema({
    oid: {type: Schema.Types.ObjectId},
    path: String
  });
  const scopeSchema = new Schema({
    operation: orgObj,
    page: { name: String },
    orgs: [ orgSchema ],
    roles:[ orgObj ],
    permissions: [ orgObj ],
    users:[ userObj ],
    data: { type: Schema.Types.Mixed }
  });

  const ownerChannelSchema = new Schema({
    channel: { oid: { type: Schema.Types.ObjectId}, type: String, path: String, tags: [ String ]},
    scopes: [ scopeSchema ],
    data: { type: Schema.Types.Mixed }
  });

  return { owner_channel: ownerChannelSchema, channel_scope: scopeSchema, compact_org_obj: orgSchema, compact_org: orgObj };
};

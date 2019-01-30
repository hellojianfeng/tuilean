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
  // const userObj = new Schema({
  //   oid: {type: Schema.Types.ObjectId},
  //   email: String,
  //   name: String
  // });
  const orgSchema = new Schema({
    oid: {type: Schema.Types.ObjectId},
    path: String
  });
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

  const channelSchema = new Schema({
    oid: { type: Schema.Types.ObjectId }, 
    type: String, 
    path: String, 
    tags: [ String ]
  });

  const ownerChannelSchema = new Schema({
    channel: channelSchema,
    scopes: [ scopeSchema ],
    data: { type: Schema.Types.Mixed }
  });

  return {channel_obj: channelSchema, owner_channel: ownerChannelSchema, channel_scope: scopeSchema, compact_org_obj: orgObj, compact_org: orgSchema };
};

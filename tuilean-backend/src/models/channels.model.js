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
  const channels = new Schema({
    name: { type: String},
    path: { type: String},
    type: String ,
    channel_id: { type: String, unique: true },
    description: { type: String },
    owner: scopeSchema ,
    joiners: [ scopeSchema ] ,
    owner_hash:{ type: String, required: true },
    data: { type: Schema.Types.Mixed }
  }, {
    timestamps: true
  });

  channels.index({ type: 1, path: 1, owner_hash: 1 },  { unique: true });

  return mongooseClient.model('channels', channels);
};

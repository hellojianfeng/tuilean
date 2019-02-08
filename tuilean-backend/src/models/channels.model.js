// channels-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const { channel_scope } = require('./schemas')(app);
  const listens = new Schema({
    type: String,
    path: String,
    scopes: [ channel_scope ],
    scopes_hash: String,
    listen_id: String, //type_channel_id_path
    description: String,
    data: { type: Schema.Types.Mixed }
  }, {_id: false });
  const channels = new Schema({
    name: { type: String},
    path: { type: String},
    type: String ,
    tags: [ String ],
    description: { type: String },
    scopes: [ channel_scope ],
    scopes_hash: String,
    admin_scopes: [ channel_scope ],
    listens:[ listens ],
    data: { type: Schema.Types.Mixed }
  }, {
    timestamps: true
  });

  channels.index({ path: 1, scopes_hash: 1 },  { unique: true });

  return mongooseClient.model('channels', channels);
};

// channels-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const { channel_scope } = require('./schemas')(app);
  const channels = new Schema({
    name: { type: String},
    path: { type: String},
    type: String ,
    tags: [ String ],
    description: { type: String },
    scope: { admins: [ channel_scope ]} ,
    data: { type: Schema.Types.Mixed }
  }, {
    timestamps: true
  });

  channels.index({ type: 1, path: 1 });

  return mongooseClient.model('channels', channels);
};

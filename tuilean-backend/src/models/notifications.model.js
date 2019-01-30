// notifications-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const contentSchema = new Schema({
    name: { type: String },
    path: { type: String }, 
    tags: { type: String },
    description: { type: String },
    title: String,
    header: { type: String },
    body: { type: Schema.Types.Mixed },
    footer: { type: String },
    data: { type: Schema.Types.Mixed }
  });

  const { channel_scope } = require('./schemas')(app);

  const notifications = new Schema({
    name: String,
    path: { type: String, required: true },
    tags: { type: String },
    description: { type: String },
    channel: { oid: { type: Schema.Types.ObjectId }, path: String, type: String },
    from: {type: channel_scope, required: true } ,
    to:  [ channel_scope ] ,
    contents: [contentSchema],
    data: { type: Schema.Types.Mixed },
  }, {
    timestamps: true
  });

  return mongooseClient.model('notifications', notifications);
};

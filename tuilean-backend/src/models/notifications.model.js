// notifications-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;

  const contentSchema = new Schema({
    type: String,
    name: { type: String },
    path: { type: String }, 
    tags: { type: String },
    title: String,
    description: { type: String },
    header: { type: String },
    body: { type: Schema.Types.Mixed },
    footer: { type: String },
  });

  const { channel_obj } = require('./schemas')(app);

  const notifications = new Schema({
    listen: String,
    type: { type: String },
    name: String,
    path: String,
    tags: { type: String },
    title: { type: String },
    description: { type: String },
    from_channel: channel_obj,
    to_channel: channel_obj,
    contents: [ contentSchema ],
    sender: {
      _id: { type: Schema.Types.ObjectId },
      email: String
    },
    data: { type: Schema.Types.Mixed },
  }, {
    timestamps: true
  });

  return mongooseClient.model('notifications', notifications);
};

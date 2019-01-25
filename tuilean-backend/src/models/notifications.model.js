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
    header: { type: String },
    body: { type: String, required: true },
    footer: { type: String },
    contents: [ contentSchema ],
    data: { type: Schema.Types.Mixed }
  });

  const notifications = new Schema({
    title: { type: String },
    description: { type: String },
    path: { type: String, required: true },
    contents: [ contentSchema ],
    tags: { type: String },
    channel: { type: Schema.Types.ObjectId },
    user: { email: String, oid: { type: Schema.Types.ObjectId }},
    data: { type: Schema.Types.Mixed }
  }, {
    timestamps: true
  });

  return mongooseClient.model('notifications', notifications);
};

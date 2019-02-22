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
    value: { type: Schema.Types.Mixed },
    footer: { type: String },
  });

  const { channel_obj, compact_user, user_scope } = require('./schemas')(app);

  const statusSchema = new Schema({
    name: { type: String },
    path: { type: String }, 
    tags: { type: String },
    title: String,
    description: { type: String },
    processer: {
      user: compact_user,
      scopes: [ user_scope ],
    },
    processer_hash: String, //easy for search
    value: { type: Schema.Types.Mixed },
    data: { type: Schema.Types.Mixed }
  });

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
    status:{
      current: statusSchema,
      history: [ statusSchema ]
    },
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

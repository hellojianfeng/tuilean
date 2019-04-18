// work-action-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schemas = require('./schemas')(app);
  const { progress } = schemas;
  const workAction = new Schema({
    workflow:{
      _id: String,
      path: String,
      type: String,
    },
    work: {
      _id: String,
      path: String,
      status: String
    },
    action: {
      path: String,
      status: String,
      progress,
    },
    user_id: { type: Schema.Types.ObjectId },
    operation_id: { type: Schema.Types.ObjectId },
    role_id: { type: Schema.Types.ObjectId },
    data: { type: Schema.Types.Mixed }
  }, {
    timestamps: true
  });

  return mongooseClient.model('workAction', workAction);
};

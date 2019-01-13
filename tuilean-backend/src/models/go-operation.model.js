// go-operation-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const goOperation = new Schema({
    operation: {
      oid: { type: Schema.Types.ObjectId },
      path: String,
      org_id: { type: Schema.Types.ObjectId },
      org_path: { String }
    },
    action: String,
    user: {
      oid: { type: Schema.Types.ObjectId },
      email: String
    },
    result: { type: Schema.Types.Mixed },
    data: { type: Schema.Types.Mixed }
  }, {
    timestamps: true
  });

  return mongooseClient.model('goOperation', goOperation);
};

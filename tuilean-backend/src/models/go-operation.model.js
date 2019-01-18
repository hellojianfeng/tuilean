// go-operation-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const user = new Schema({
    oid: { type: Schema.Types.ObjectId },
    email: String
  });
  const goOperation = new Schema({
    operation: String,
    operation_id: { type: Schema.Types.ObjectId },
    org_id: { type: Schema.Types.ObjectId },
    org_path: String,
    action: String,
    data: { type: Schema.Types.Mixed },
    result: { type: Schema.Types.Mixed },
    user,
  }, {
    timestamps: true
  });

  return mongooseClient.model('goOperation', goOperation);
};

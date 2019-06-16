// configurations-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const configurations = new Schema({
    key: { type: String, required: true },
    value: { type: Schema.Types.Mixed },
    description: String,
    owner: { type: Schema.Types.Mixed },
    owner_hash: String,
    data: { type: Schema.Types.Mixed }
  }, {
    timestamps: true
  });

  return mongooseClient.model('configurations', configurations);
};

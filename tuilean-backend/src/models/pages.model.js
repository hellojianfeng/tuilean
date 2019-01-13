// pages-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const pages = new Schema({
    page: { type: String, required: true },
    action: { type: String },
    user: { type: Schema.Types.Mixed, required: true },
    result: { type: Schema.Types.Mixed },
    data: { type: Schema.Types.Mixed }
  }, {
    timestamps: true
  });

  return mongooseClient.model('pages', pages);
};

// types-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const types = new Schema({
    path: { type: String },
    owner: { type: String }, // model name which need type, like 'orgs', 'roles'
    name: { type: String },
    description: { type: String },
    data: { type: Schema.Types.Mixed }
  }, {
    timestamps: true
  });

  types.index({ path: 1, owner: 1 },  { unique: true });

  return mongooseClient.model('types', types);
};

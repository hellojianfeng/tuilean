// types-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const types = new Schema({
    path: { type: String, unique: true },
    owner: { type: String, unique: true }, // model name which need type, like 'orgs', 'roles'
    name: { type: String },
    description: { type: String },
    data: { type: Schema.Types.Mixed }
  }, {
    timestamps: true
  });

  return mongooseClient.model('types', types);
};

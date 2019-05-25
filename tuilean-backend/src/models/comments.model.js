// comments-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const comments = new Schema({
    name: { type: String },
    title: { type: String, required: true },
    text: { type: String  },
    tags: [ String ],
    owner: { type: Schema.Types.Mixed, required: true },
    owner_hash: { type: String, required: true },
    images: [{ type: Schema.Types.Mixed }],
    data: { type: Schema.Types.Mixed }
  }, {
    timestamps: true
  });

  return mongooseClient.model('comments', comments);
};

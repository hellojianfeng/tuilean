// workflows-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const schemas = require('./schemas')(app);
  const { workflow_work, workflow_action } = schemas;
  const { Schema } = mongooseClient;
  const workflows = new Schema({
    name: { type: String },
    path: { type: String, required: true },
    type: { type: String, required: true },
    owner: { type: workflow_action, required: true },
    owner_hash: { type: String, required: true },
    works: [ workflow_work ],
    previous: workflow_work,
    current: workflow_work,
    next: workflow_work,
    status: String,
    sequence: [
      {
        path: String,
        status:[ String ],
        position: { type: Number, default: 0 }
      },
    ],
    history: [ workflow_work ],
    data: { type: Schema.Types.Mixed }
  }, {
    timestamps: true
  });

  return mongooseClient.model('workflows', workflows);
};

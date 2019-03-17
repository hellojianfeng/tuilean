// workflows-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const schemas = require('./schemas')(app);
  const { workflow_work, workflow_action } = schemas;
  const { Schema } = mongooseClient;
  const workSchema = new Schema({
    name: String,
    path: String,
    status: { type: String, required: true},
    allow_actions: { type: Schema.Types.Mixed },
    data: { type: Schema.Types.Mixed}
  });
  const workflows = new Schema({
    name: { type: String },
    path: { type: String, required: true },
    type: { type: String, required: true },
    owner: { type: workflow_action, required: true },
    owner_hash: { type: String, required: true },
    works: [ workSchema ],
    previous: workSchema,
    current: workSchema,
    next: workSchema,
    status: String,
    tasks: [
      {
        path: String,
        status_sequence:[ String ],
        position: { type: Number, default: 0 },
        active: { type: Boolean, default: false }
      }
    ],
    history: [ workflow_work ],
    data: { type: Schema.Types.Mixed }
  }, {
    timestamps: true
  });

  return mongooseClient.model('workflows', workflows);
};

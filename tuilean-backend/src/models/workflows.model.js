// workflows-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const schemas = require('./schemas')(app);
  const { workflow_action, progress, compact_user, compact_workaction } = schemas;
  const { Schema } = mongooseClient;
  const workSchema = new Schema({
    name: String,
    path: String,
    progress: progress,
    executed: {
      workactions: [ compact_workaction ],
      users:[ compact_user ]
    },
    status: { type: String, required: true},
    allow_actions: { type: Schema.Types.Mixed },
    data: { type: Schema.Types.Mixed}
  });
  const workSchema2 = new Schema({
    name: String,
    path: String,
    progress: progress,
    status: { type: String, required: true},
    data: { type: Schema.Types.Mixed}
  },{_id: false});

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
        name: String,
        works:[ workSchema2 ],
        position: { type: Number, default: 0 },
        active: { type: Boolean, default: false }
      }
    ],
    history: [ workSchema ],
    data: { type: Schema.Types.Mixed }
  }, {
    timestamps: true
  });

  return mongooseClient.model('workflows', workflows);
};

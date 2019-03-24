// operations-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const operationStage = new Schema({
    name: { type: String }, //for example, ready, start, end, ....
    display_name: { type: String },
    seq: { type: Number }, //seq no of stage,
    start: { type: Schema.Types.Mixed }, //usually it is a expression for start
    end: { type: Schema.Types.Mixed },//usually it is a expression for start
    expire: { type: Schema.Types.Mixed },//usually it is a expression for start
    data: { type: Schema.Types.Mixed }
  });

  const { owner_channel, workflow_work } = require('./schemas')(app);

  const operations = new Schema({
    name: { type: String, required: true },
    path: { type: String, required: true },//dot seperate name of operation, unique in app
    display_name: { type: String },
    description: { type: String },
    tags: { type: String },
    data: { type: Schema.Types.Mixed },
    app: { type: String, default: 'default' },
    org_id: { type: Schema.Types.ObjectId, required: true  },
    org_path: { type: String, required: true  },
    stages: [ operationStage ],
    concurrent: {
      allow: { type: Number },
      current: { type: Number }
    },
    channels: {
      allow: [ owner_channel ],
      joined: [ owner_channel ],
      joining: [ owner_channel],
      inviting: [ owner_channel ],
      rejected: [ owner_channel ]
    },
    works: {
      allow: [ workflow_work ],
      joined: [ workflow_work ],
      joining: [ workflow_work],
      inviting: [ workflow_work ],
      rejected: [ workflow_work ]
    },
  }, {
    timestamps: true
  });

  operations.index({ path: 1, org_id: 1, app: 1 },  { unique: true });
  operations.index({ path: 1, org_path: 1, app: 1 },  { unique: true });

  return mongooseClient.model('operations', operations);
};

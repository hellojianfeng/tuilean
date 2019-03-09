// workflows-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const schemas = require('./schemas')(app);
  const { compact_org_obj, compact_org } = schemas;
  const { Schema } = mongooseClient;
  const actionSchema = new Schema({
    name: { type: String },
    path: { type: String },
    page: String,
    operation: { type: compact_org_obj },
    users: [ String ],
    permissions: [ compact_org_obj ],
    roles: [ compact_org_obj ],
    orgs: [ compact_org ],
    data: { type: Schema.Types.Mixed }
  });
  const ownerSchema = new Schema({
    name: { type: String },
    path: { type: String },
    page: String,
    operation: compact_org_obj,
    users: [ String ],
    permissions: [ compact_org_obj ],
    roles: [ compact_org_obj ],
    orgs: [ compact_org ],
    data: { type: Schema.Types.Mixed }
  });
  const workSchema = new Schema({
    name: { type: String },
    path: { type: String },
    status: [ String ],
    actions:[ actionSchema ],
    actions_hash: [ String ],
    data: { type: Schema.Types.Mixed }
  });
  const workflows = new Schema({
    name: { type: String },
    path: { type: String, required: true },
    type: { type: String, required: true },
    owner: { type: ownerSchema, required: true },
    owner_hash: { type: String, required: true },
    works: [ workSchema ],
    previous: workSchema,
    current: workSchema,
    next: workSchema,
    status: String,
    sequence: {
      status:[ String ],
      position: 0
    },
    history: [ workSchema ],
    data: { type: Schema.Types.Mixed }
  }, {
    timestamps: true
  });

  return mongooseClient.model('workflows', workflows);
};

// workflows-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const schemas = require('./schemas');
  const { compact_user, compact_org_obj, compact_org } = schemas;
  const { Schema } = mongooseClient;
  // const historySchema = new Schema({
  //   status: String,
  //   data: { type: Schema.type.Mixed }
  // });
  const actionSchema = new Schema({
    name: { type: String },
    path: { type: String, required: true },
    page: String,
    operation: compact_org_obj,
    action: String,
    users: [ compact_user ],
    permissions: [ compact_org_obj ],
    roles: [ compact_org_obj ],
    orgs: [ compact_org ],
    data: { type: Schema.type.Mixed }
  });
  const ownerSchema = new Schema({
    name: { type: String },
    path: { type: String, required: true },
    page: String,
    operation: compact_org_obj,
    users: [ compact_user ],
    permissions: [ compact_org_obj ],
    roles: [ compact_org_obj ],
    orgs: [ compact_org ],
    data: { type: Schema.type.Mixed }
  });
  const workSchema = new Schema({
    name: { type: String },
    path: { type: String, required: true },
    status: [ String ],
    actions:[ actionSchema ],
    data: { type: Schema.type.Mixed }
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
    sequence: {
      status:[ String ],
      position: 0
    },
    history: [ workSchema ],
    data: { type: Schema.type.Mixed }
  }, {
    timestamps: true
  });

  return mongooseClient.model('workflows', workflows);
};

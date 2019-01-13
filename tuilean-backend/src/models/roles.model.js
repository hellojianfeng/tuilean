// roles-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const theSchema = new Schema({
    oid: { type: Schema.Types.ObjectId },
    path: { type: String },
    include: {
      children: [{ path: { type: String }, recursive: { type: Boolean } }],
      parent: [{ path: { type: String }, recursive: { type: Boolean } }],
    },
    exclude: {
      children: [{ path: { type: String }, recursive: { type: Boolean } }],
      parent: [{ path: { type: String }, recursive: { type: Boolean } }],
    },
    data: { type: Schema.Types.Mixed }
  });
  const roles = new Schema({
    name: { type: String },
    display_name: { type: String },
    description: { type: String },
    path: { type: String }, // dot sperated string, for example, company1#department1#office1, default is same as name
    org_id: { type: Schema.Types.ObjectId, required: true  },
    org_path: { type: String, required: true  },
    status: {
      join_org: { type: String, enum: ['joinable', 'default_join_role'], }
    },
    permissions: [ theSchema ],
    operations: [ theSchema ],
    data: { type: Schema.Types.Mixed }
  }, {
    timestamps: true
  });

  roles.index({ path: 1, org_id: 1 },  { unique: true });
  roles.index({ path: 1, org_path: 1 },  { unique: true });

  return mongooseClient.model('roles', roles);
};

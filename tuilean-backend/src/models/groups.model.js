// roles-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const { compact_user, compact_org_obj} = require('./schemas')(app);
  const groups = new Schema({
    name: { type: String, required: true },
    display_name: { type: String },
    description: { type: String },
    path: { type: String, required: true }, // dot sperated string, for example, company1#department1#office1, default is same as name
    org_id: { type: Schema.Types.ObjectId, required: true  },
    org_path: { type: String, required: true  },
    join: { type: String, enum: ['joinable', 'auto_join','approvable']},
    users: [ compact_user ],
    roles: [ compact_org_obj ],
    permissions: [ compact_org_obj ],
    operations: [ compact_org_obj ],
    data: { type: Schema.Types.Mixed }
  }, {
    timestamps: true
  });

  //roles.index({ path: 1, org_id: 1 },  { unique: true });
  //roles.index({ path: 1, org_path: 1 },  { unique: true });

  return mongooseClient.model('groups', groups);
};

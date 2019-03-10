// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;

  const { compact_org_obj, owner_channel, compact_workflow } = require('./schemas')(app);

  const users = new mongooseClient.Schema({
    mobile: {type: String},
    email: {type: String, unique: true, lowercase: true},
    username:{type: String, lowercase: true},
    fullname: {
      surname: { type: String },
      familyname: { type: String },
      middlename: { type: String }
    },
    verified: {
      mobile: { type: Boolean },
      email: { type: Boolean },
      data: { type: Schema.Types.Mixed }
    },
    password: { type: String, required: true },
    roles: [ compact_org_obj ],
    permissions: [ compact_org_obj ],
    operations: [ compact_org_obj ],
    channels: {
      allow: [ owner_channel ],
      joined: [ owner_channel ],
      joining: [ owner_channel],
      inviting: [ owner_channel ],
      rejected: [ owner_channel ]
    },
    workflows: {
      allow: [ compact_workflow ],
      joined: [ compact_workflow ],
      joining: [ compact_workflow],
      inviting: [ compact_workflow ],
      rejected: [ compact_workflow ]
    },
    current_org: {
      _id: { type: Schema.Types.ObjectId },
      path: String,
      data: { type: Schema.Types.Mixed }
    },
    follow_org: {
      _id: { type: Schema.Types.ObjectId },
      path: String,
      data: { type: Schema.Types.Mixed }
    },
    data: {type: Schema.Types.Mixed}
  }, {
    timestamps: true
  });

  return mongooseClient.model('users', users);
};

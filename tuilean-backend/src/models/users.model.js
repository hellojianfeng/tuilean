// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;

  const { org_obj, owner_channel } = require('./schemas');

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
    roles: [ org_obj ],
    permissions: [ org_obj ],
    operations: [ org_obj ],
    channels: {
      joined: [ owner_channel ],
      joining: [ owner_channel],
      inviting: [ owner_channel ],
      rejected: [ owner_channel ]
    },
    current_org: {
      oid: { type: Schema.Types.ObjectId },
      path: String,
      data: { type: Schema.Types.Mixed }
    },
    follow_org: {
      oid: { type: Schema.Types.ObjectId },
      path: String,
      data: { type: Schema.Types.Mixed }
    },
    data: {type: Schema.Types.Mixed}
  }, {
    timestamps: true
  });

  return mongooseClient.model('users', users);
};

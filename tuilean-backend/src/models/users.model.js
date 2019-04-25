// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;

  const { compact_org_obj } = require('./schemas')(app);

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

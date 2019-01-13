// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;

  const theSchema = new Schema({
    oid: { type: Schema.Types.ObjectId },
    path: { type: String }, // dot sperated string, for example, default is same as name
    org_id: { type: Schema.Types.ObjectId },
    org_path: { type: String },
    data: { type: Schema.Types.Mixed }
  });

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
    roles: [ theSchema ],
    permissions: [ theSchema ],
    operations: [ theSchema ],
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

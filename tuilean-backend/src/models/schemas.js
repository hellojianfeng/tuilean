// channels-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const orgObj = new Schema({
    _id: {type: Schema.Types.ObjectId},
    path: String,
    org_id: {type: Schema.Types.ObjectId},
    org_path: String,
    data: { type: Schema.Types.Mixed }
  }, { _id: false });
  // const userObj = new Schema({
  //   _id: {type: Schema.Types.ObjectId},
  //   email: String,
  //   name: String
  // });
  const orgSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    path: String
  }, { _id: false });

  const compact_org = orgSchema;

  const scopeOwner = new Schema({
    user: String,
    operation: orgObj,
    role: orgObj,
    permission: orgObj,
    org: orgObj,
    page: String,
    action: String,
  },{_id: false});

  const scopeSchema = new Schema({
    owner: scopeOwner,
    orgs: [ orgSchema ],
    roles:[ orgObj ],
    permissions: [ orgObj ],
    operations: [ orgObj ],
    users:[ String ],
    pages: [ String ],
    data: { type: Schema.Types.Mixed }
  }, { _id: false });

  const channel_operation_scope = new Schema({
    operation: orgObj,
    action: String,
    orgs: [ orgSchema ],
    roles:[ orgObj ],
    permissions: [ orgObj ],
    users:[ String ],
    data: { type: Schema.Types.Mixed }
  },{ _id: false });

  const channel_page_scope = new Schema({
    page: String,
    action: String,
    orgs: [ orgSchema ],
    roles:[ orgObj ],
    permissions: [ orgObj ],
    users:[ String ],
    data: { type: Schema.Types.Mixed }
  }, { _id: false });

  const channelSchema = new Schema({
    _id: { type: Schema.Types.ObjectId },
    type: String,
    path: String,
    tags: [ String ],
    scopes_hash: String,
    scopes: [ scopeSchema ]
  }, {_id: false });

  const compact_user = new Schema({
    _id: { type: Schema.Types.ObjectId },
    email: String
  }, {_id: false });

  const user_scope = new Schema({
    org: compact_org,
    operation: orgObj,
    role: orgObj,
    permission: orgObj,
    page: String
  }, {_id: false });

  const workflow_action = new Schema({
    name: { type: String },
    path: { type: String },
    page: String,
    operation: { type: orgObj },
    users: [ String ],
    permissions: [ orgObj ],
    roles: [ orgObj ],
    orgs: [ compact_org ],
    data: { type: Schema.Types.Mixed }
  },{_id: false});

  const compact_workflow = new Schema({
    _id: Schema.Types.ObjectId,
    type: String,
    path: String,
    status: String,
    data: { type: Schema.Types.Mixed }
  },{_id: false});

  const compact_work = new Schema({
    _id: Schema.Types.ObjectId,
    path: String,
    status: String,
    data: { type: Schema.Types.Mixed }
  },{_id: false});

  const workflow_work = new Schema({
    workflow: compact_workflow,
    work: compact_work,
    actions:  [workflow_action] ,
    actions_hash: [String] ,
    data: { type: Schema.Types.Mixed }
  });

  const progress = new Schema({
    value: { type: Number, default: 0 },
    outof: { type: Number, default: 100 },
    data: { type: Schema.Types.Mixed }
  });

  const compact_workaction = new Schema({
    _id: Schema.Types.ObjectId,
  });

  return {
    channel_obj: channelSchema,
    owner_channel: channelSchema,
    channel_scope: scopeSchema,
    compact_org_obj: orgObj,
    compact_org: orgSchema,
    channel_operation_scope,
    channel_page_scope,
    compact_user,
    workflow_action,
    workflow_work,
    user_scope,
    progress,
    compact_workflow,
    compact_work,
    compact_workaction
  };
};

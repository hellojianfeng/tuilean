// channels-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const { channel_operation_scope, channel_page_scope } = require('./schemas')(app);
  const channels = new Schema({
    name: { type: String},
    path: { type: String},
    event_id: String,
    type: String ,
    tags: [ String ],
    description: { type: String },
    scope: {
      operations: [ channel_operation_scope ],
      pages: [ channel_page_scope ]
    },
    scope_hash: String,
    admin_scope: {
      operations: [ channel_operation_scope ],
      pages: [ channel_page_scope ]
    },
    allow: {
      notify:{
        operations: [ channel_operation_scope ],
        pages: [ channel_page_scope ]
      }
    },
    data: { type: Schema.Types.Mixed }
  }, {
    timestamps: true
  });

  channels.index({ path: 1, scope_hash: 1 },  { unique: true });

  return mongooseClient.model('channels', channels);
};

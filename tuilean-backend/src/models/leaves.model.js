// leaves-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const leaves = new Schema({
    type: { type: String },
    name: { type: String },
    description: { type: String },
    start: { type: Schema.Types.DateTime },
    end: { type: Schema.Types.DateTime },
    period: {
      years: Number,
      months: Number,
      weeks: Number,
      days: Number,
      hours: Number,
      minutes: Number,
      seconds: Number
    },
    scope: { type: Schema.Types.Mixed},
    scope_hash: String,
    status: { type: String, emum: ['pending', 'approved', 'rejected']},
    applicant: {
      _id: { type: Schema.Types.ObjectId },
      email: String
    },
    processor: {
      _id: { type: Schema.Types.ObjectId },
      email: String
    },
    org_id: { type: Schema.Types.ObjectId },
    org_path: String,
    timeslot: { type: String },
    date: { type: Schema.Types.Mixed}
  }, {
    timestamps: true
  });

  return mongooseClient.model('leaves', leaves);
};

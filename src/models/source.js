/* eslint-disable func-names */
const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

mongoose.pluralize(null);

/*
Schema for source:
name, type, url, login, passcode, vhost, owner, date of creation
*/
const SourceSchema = new mongoose.Schema(
  {
    name: {
      index: true,
      type: String,
      required: [true, 'Source name is required']
    },
    type: {type: String},
    url: {type: String},
    login: {type: String},
    passcode: {type: String},
    vhost: {type: String},
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {type: Date}
  }
);

// Plugin for Mongoose that turns duplicate errors into regular Mongoose validation errors.

SourceSchema.plugin(beautifyUnique);

// Pre save hook that hashes passwords

SourceSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.createdAt = Date.now();
  }
  return next();
});

module.exports = mongoose.model('sources', SourceSchema);

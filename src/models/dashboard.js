/* eslint-disable func-names */
const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const {passwordDigest, comparePassword} = require('../utilities/authentication/helpers');

mongoose.pluralize(null);

// build the dashboard model based on mongoose schema
const DashboardSchema = new mongoose.Schema(
  {
    // initialization form
    name: {
      index: true,
      type: String,
      required: [true, 'Dashboard name is required']
    },
    layout: {
      type: Array,
      default: []
    },
    items: {
      type: Object,
      default: {}
    },
    nextId: {
      type: Number,
      min: 1,
      default: 1
    },
    password: {
      type: String,
      select: false,
      default: null
    },
    shared: {
      type: Boolean,
      default: false
    },
    views: {
      type: Number,
      default: 0,
      min: 0
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {type: Date}
  }
);

// Plugin for Mongoose that turns duplicate errors into regular Mongoose validation errors.

DashboardSchema.plugin(beautifyUnique);

// Pre save hook that hashes passwords

DashboardSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    this.password = passwordDigest(this.password);
  }
  if (this.isModified('name')) {
    this.createdAt = Date.now();
  }
  return next();
});

// Model method that compares hashed passwords

DashboardSchema.methods.comparePassword = function (password) {
  return comparePassword(password, this.password);
};

module.exports = mongoose.model('dashboards', DashboardSchema);

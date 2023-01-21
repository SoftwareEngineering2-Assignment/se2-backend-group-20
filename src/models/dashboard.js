/* eslint-disable func-names */
const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const {passwordDigest, comparePassword} = require('../utilities/authentication/helpers');

mongoose.pluralize(null);

const DashboardSchema = new mongoose.Schema(
  {
    // Ensures that the dashboard name is required
    name: {
      index: true,
      type: String,
      required: [true, 'Dashboard name is required']
    },
    // Layout for Arrays.
    layout: {
      type: Array,
      default: []
    },
    // Returns a list of items.
    items: {
      type: Object,
      default: {}
    },
    // Returns next id.
    nextId: {
      type: Number,
      min: 1,
      default: 1
    },
    // Generates a password for the user.
    password: {
      type: String,
      select: false,
      default: null
    },
    // A shared boolean value.
    shared: {
      type: Boolean,
      default: false
    },
    // Creates views number.
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

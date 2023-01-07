/*
  Connect to mongoose | mongoose configuration
*/
const mongoose = require('mongoose');

// set mongoose parameters
const mongooseOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  poolSize: 100,
  keepAlive: true,
  keepAliveInitialDelay: 300000
};
const mongodbUri = process.env.MONGODB_URI;

// connect to mongoose
module.exports = () => {
  // eslint-disable-next-line no-console
  mongoose.connect(mongodbUri, mongooseOptions).catch(console.error);
};

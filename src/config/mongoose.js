const mongoose = require('mongoose');

// Set default options for mongoose.
const mongooseOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  poolSize: 100,
  keepAlive: true,
  keepAliveInitialDelay: 300000
};
// Connect to a mongoose server and connect to it.
const mongodbUri = process.env.MONGODB_URI;
  
module.exports = () => {
  // eslint-disable-next-line no-console
  mongoose.connect(mongodbUri, mongooseOptions).catch(console.error);
};

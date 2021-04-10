const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true
});

mongoose.Promise = global.Promise;
module.exports = mongoose.connection

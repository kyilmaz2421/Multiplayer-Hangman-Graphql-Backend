const authResolver = require("./authentication");

const rootResolver = {
  ...authResolver,
};

module.exports = rootResolver;

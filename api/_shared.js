const { requestHandler } = require("../server");

module.exports = function sharedHandler(req, res) {
  return requestHandler(req, res);
};

const ClientError = require("./ClientError");

class ServerError extends ClientError {
  constructor(message) {
    super(message, 500);
    this.name = "ServerError";
  }
}

module.exports = ServerError;

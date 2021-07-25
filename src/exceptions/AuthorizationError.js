const ClientError = require('./ClientError');

class AuthorizationError extends ClientError {
  constructor(message) {
    super(message, 403);
    this.name = 'AuthorizationError';
    this.message = 'Maaf, anda tidak berhak mengakses resource ini.';
  }
}

module.exports = AuthorizationError;

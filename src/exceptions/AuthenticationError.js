const ClientError = require('./ClientError');

class AuthenticationError extends ClientError {
  constructor(message) {
    super(message, 401);
    this.name = 'AuthenticationError';
    this.message = 'Autentikasi gagal. Silahkan coba kembali.'
  }
}

module.exports = AuthenticationError;

const ClientError = require('./ClientError');

class NotFoundError extends ClientError {
  constructor(message) {
    super(message, 404);
    this.name = 'NotFoundError';
    this.message = 'Item yang anda cari tidak ada.';
  }
}

module.exports = NotFoundError;

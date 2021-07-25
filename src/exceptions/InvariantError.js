const ClientError = require('./ClientError');

class InvariantError extends ClientError {
  constructor(message) {
    super(message);
    this.name = 'InvariantError';
    this.message = 'Maaf, permintaan anda gagal diproses.';
  }
}

module.exports = InvariantError;

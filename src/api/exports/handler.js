/* eslint-disable no-underscore-dangle */
const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(service, playlistService, validator) {
    this._service = service;
    this._playlistService = playlistService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportPlaylistHandler(request, h) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);

    this._validator.validateExportPlaylistPayload(request.payload);
    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._service.sendMessage('export: playlist', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan anda sedang diproses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;

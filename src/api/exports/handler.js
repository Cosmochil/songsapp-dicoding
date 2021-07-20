const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(ProducerService, validator, playlistsService) {
    this._ProducerService = ProducerService;
    this._validator = validator;
    this._playlistsService = playlistsService;

    autoBind(this);
  }

  async postExportSongsHandler(request, h) {
      this._validator.validateExportSongsPayload(request.payload);
      const { id: userId } = request.auth.credentials;
      const { playlistId } = request.params;

      await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
      const message = {
        userId,
        targetEmail: request.payload.targetEmail,
      };

      await this._ProducerService.sendMessage(
        "export: songs",
        JSON.stringify(message)
      );

      const response = h.response({
        status: "success",
        message: "Permintaan Anda dalam antrean",
      });
      response.code(201);
      return response;
  }
}

module.exports = ExportsHandler;

/* eslint-disable no-underscore-dangle */
const ClientError = require('../../exceptions/ClientError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.addPlaylistHandler = this.addPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    // this.getPlaylistByIdHandler = this.getPlaylistByIdHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.addPlaylistSongHandler = this.addPlaylistSongHandler.bind(this);
    this.getPlaylistSongsHandler = this.getPlaylistSongsHandler.bind(this);
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
  }

  async addPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);
      const {
        name,
      } = request.payload;
      const { id: credentialId } = request.auth.credentials;
      const playlistId = await this._service.addPlaylist({
        name, owner: credentialId,
      });

      const response = h.response({
        status: 'success',
        message: 'Playlist berhasil ditambahkan',
        data: {
          playlistId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  /*
  async getPlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;
      await this._service.verifyPlaylistAccessColl(id, credentialId);

      const playlist = await this._service.getPlaylistById(id);
      return {
        status: 'success',
        data: {
          playlist,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
  */

  async deletePlaylistByIdHandler(request, h) {
    try {
      const { playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;
      await this._service.verifyPlaylistOwner(playlistId, credentialId);
      await this._service.deletePlaylistById(playlistId);
      return {
        status: 'success',
        message: 'Playlist berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async addPlaylistSongHandler(request, h) {
    try {
      const { id: userId } = request.auth.credentials;
      const { playlistId, any } = request.params;
      if (any !== 'songs') {
        throw new NotFoundError('Lagu tidak ditemukan');
      }
      this._validator.validatePlaylistSongPayload(request.payload);
      const { songId } = request.payload;
      await this._service.verifyPlaylistAccess(playlistId, userId);
      const playlistSongId = await this._service.addSongToPlaylist(
        playlistId,
        songId,
      );

      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke playlist',
        data: {
          playlistSongId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getPlaylistSongsHandler(request, h) {
    try {
      const { id: userId } = request.auth.credentials;
      const { playlistId, any } = request.params;
      if (any !== 'songs') {
        throw new NotFoundError('Resource not found');
      }
      await this._service.verifyPlaylistAccess(playlistId, userId);
      const songs = await this._service.getPlaylistSongs(playlistId);
      return {
        status: 'success',
        data: {
          songs,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deletePlaylistSongHandler(request, h) {
    try {
      const { id: userId } = request.auth.credentials;
      const { playlistId, any } = request.params;
      if (any !== 'songs') {
        throw new NotFoundError('Resource not found');
      }
      this._validator.validatePlaylistSongPayload(request.payload);
      const { songId } = request.payload;
      await this._service.verifyPlaylistAccess(playlistId, userId);
      await this._service.deleteSongFromPlaylist(playlistId, songId);

      return {
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}
module.exports = PlaylistsHandler;

/* eslint-disable no-underscore-dangle */
const ClientError = require("../../exceptions/ClientError");
const NotFoundError = require("../../exceptions/NotFoundError");

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.addPlaylistHandler = this.addPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.addPlaylistSongHandler = this.addPlaylistSongHandler.bind(this);
    this.getPlaylistSongsHandler = this.getPlaylistSongsHandler.bind(this);
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
  }

  async addPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const playlistId = await this._service.addPlaylist({
      name,
      owner: credentialId,
    });

    const response = h.response({
      status: "success",
      message: "Playlist berhasil ditambahkan",
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);
    return {
      status: "success",
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request, h) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistOwner(playlistId, credentialId);
    await this._service.deletePlaylistById(playlistId);
    return {
      status: "success",
      message: "Playlist berhasil dihapus",
    };
  }

  async addPlaylistSongHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { playlistId } = request.params;

    this._validator.validatePlaylistSongPayload(request.payload);
    const { songId } = request.payload;
    await this._service.verifyPlaylistAccess(playlistId, userId);
    const playlistSongId = await this._service.addSongToPlaylist(
      playlistId,
      songId
    );

    const response = h.response({
      status: "success",
      message: "Lagu berhasil ditambahkan ke playlist",
      data: {
        playlistSongId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { playlistId, any } = request.params;
    if (any !== "songs") {
      throw new NotFoundError("Resource not found");
    }
    await this._service.verifyPlaylistAccess(playlistId, userId);
    const songs = await this._service.getPlaylistSongs(playlistId);
    return {
      status: "success",
      data: {
        songs,
      },
    };
  }

  async deletePlaylistSongHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { playlistId } = request.params;
    const { songId } = request.payload;
    await this._service.verifyPlaylistAccess(playlistId, userId);
    await this._service.deleteSongFromPlaylist(playlistId, songId);

    return {
      status: "success",
      message: "Lagu berhasil dihapus dari playlist",
    };
  }
}

module.exports = PlaylistsHandler;

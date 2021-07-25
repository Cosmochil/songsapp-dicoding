/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationService, cacheService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
    this._cacheService = cacheService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError();
    }
    await this._cacheService.delete(`playlists:${owner}`);
    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    try {
      const cacheResult = await this._cacheService.get(`playlists:${owner}`);
      return JSON.parse(cacheResult);
    } catch (error) {
      const query = {
        text: 'SELECT playlists.id, playlists.name, users.username FROM playlists JOIN users on playlists.owner=users.id LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id WHERE playlists.owner = $1 OR collaborations.user_id = $1',
        values: [owner],
      };
      const result = await this._pool.query(query);
      await this._cacheService.set(
        `playlists:${owner}`,
        JSON.stringify(result.rows),
      );
      return result.rows;
    }
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError();
    }
    const { owner } = result.rows[0];
    await this._cacheService.delete(`playlists:${owner}`);
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError();
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses playlist ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError();
    }
    await this._cacheService.delete(`playlists:${playlistId}`);
    return result.rows[0].id;
  }

  async getPlaylistSongs(playlistId) {
    try {
      const cacheResult = await this._cacheService.get(
        `playlists:${playlistId}`,
      );
      return JSON.parse(cacheResult);
    } catch (error) {
      const query = {
        text: 'SELECT songs.id, songs.title, songs.performer FROM playlistsongs JOIN songs ON songs.id = playlistsongs.song_id WHERE playlistsongs.playlist_id = $1 GROUP BY playlistsongs.song_id, songs.id',
        values: [playlistId],
      };
      const result = await this._pool.query(query);
      await this._cacheService.set(
        `playlists:${playlistId}`,
        JSON.stringify(result.rows),
      );
      return result.rows;
    }
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError();
    }
    await this._cacheService.delete(`playlists:${playlistId}`);
  }
}

module.exports = PlaylistsService;

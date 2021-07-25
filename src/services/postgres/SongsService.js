/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModel } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addSong({
    title, year, performer, genre, duration,
  }) {
    const id = `song-${nanoid(16)}`;
    const insertedAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, insertedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError();
    }
    await this._cacheService.delete('songs:allSongs');
    return result.rows[0].id;
  }

  async getSongs() {
    try {
      const cacheResult = await this._cacheService.get('songs:allSongs');
      return JSON.parse(cacheResult);
    } catch (error) {
      const query = {
        text: 'SELECT songs.id, songs.title, songs.performer FROM songs',
      };
      const result = await this._pool.query(query);
      await this._cacheService.set(
        'songs:allSongs',
        JSON.stringify(result.rows),
      );
      return result.rows.map(mapDBToModel);
    }
  }

  async getSongById(id) {
    try {
      const cacheResult = await this._cacheService.get(`songs:${id}`);
      return JSON.parse(cacheResult);
    } catch (error) {
      const query = {
        text: 'SELECT * FROM songs WHERE id = $1',
        values: [id],
      };
      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new NotFoundError();
      }
      await this._cacheService.set(`songs:${id}`, JSON.stringify(result.rows));
      return result.rows.map(mapDBToModel)[0];
    }
  }

  async editSongById(id, {
    title, year, performer, genre, duration,
  }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, updated_at = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError();
    }
    await this._cacheService.delete(`songs:${id}`);
    await this._cacheService.delete('songs:allSongs');
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError();
    }
    await this._cacheService.delete(`songs:${id}`);
    await this._cacheService.delete('songs:allSongs');
  }
}

module.exports = SongsService;

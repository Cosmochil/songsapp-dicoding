const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists',
    handler: handler.addPlaylistHandler,
    options: {
      auth: 'songsapp_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: handler.getPlaylistsHandler,
    options: {
      auth: 'songsapp_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{playlistId}',
    handler: handler.deletePlaylistByIdHandler,
    options: {
      auth: 'songsapp_jwt',
    },
  },
  {
    method: 'POST',
    path: '/playlists/{playlistId}/{any}',
    handler: handler.addPlaylistSongHandler,
    options: {
      auth: 'songsapp_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{playlistId}/{any}',
    handler: handler.getPlaylistSongsHandler,
    options: {
      auth: 'songsapp_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{playlistId}/{any}',
    handler: handler.deletePlaylistSongHandler,
    options: {
      auth: 'songsapp_jwt',
    },
  },
];

module.exports = routes;

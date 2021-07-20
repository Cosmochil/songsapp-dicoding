const routes = (handler) => [
  {
    method: "POST",
    path: "/export/playlists/{playlistId}",
    handler: handler.postExportSongsHandler,
    options: {
      auth: "songsapp_jwt",
    },
  },
];

module.exports = routes;

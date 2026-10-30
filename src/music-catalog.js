(function () {
  'use strict';

  function track(id, title, version, folder, duration) {
    return Object.freeze({ id, title, version, src: `audio/${folder}/${id}.mp3`, ...(duration ? {duration} : {}) });
  }

  function backgroundVersions(id, title) {
    return Object.freeze([1, 2].map(version => track(`${id}-v${version}`, title, version, 'room-music')));
  }

  // The mirrored Roomwave tree does not contain the optional background music
  // files. Keep the catalog empty until those files are supplied so rooms do
  // not request missing MP3s and turn a recoverable omission into console 404s.
  const background = Object.freeze({});

  // These are the complete vocal recordings. Lyrics are intentionally not displayed.
  const karaoke = Object.freeze([
    track('come-on-in', 'Come On In', 1, 'karaoke', 134.412993),
    track('i-almost-called-you-v2', 'I Almost Called You', 2, 'karaoke', 178.66898),
    track('no-plans-today-v2', 'No Plans Today', 2, 'karaoke', 178.812993),
    track('your-recipe-v2', 'Your Recipe', 2, 'karaoke', 180.012993),
    track('a-little-less-each-night', 'A Little Less Each Night', 1, 'karaoke', 198.540998),
    track('sweet-little-disaster', 'Sweet Little Disaster', 1, 'karaoke', 199.932993),
  ]);

  const root = typeof window === 'object' ? window : globalThis;
  root.RoomMusicCatalog = Object.freeze({ background, karaoke });
})();

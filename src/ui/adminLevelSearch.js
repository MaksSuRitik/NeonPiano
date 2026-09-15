// Shared by the admin selector and its tests; never mutates the track catalogue.
export function filterAdminLevels(songs, filterQuery = '') {
  const normalize = value => String(value ?? '').toLowerCase().trim().replace(/\s+/g, ' ');
  const query = normalize(filterQuery);
  return songs.filter(song => song?.title && (!query ||
    normalize(song.title).includes(query) || normalize(song.artist).includes(query)));
}

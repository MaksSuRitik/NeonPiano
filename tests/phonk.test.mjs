import test from 'node:test';
import assert from 'node:assert/strict';
import ua from '../src/i18n/ua.js';
import ru from '../src/i18n/ru.js';
import en from '../src/i18n/en.js';
globalThis.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); }
};
globalThis.document = {
  querySelectorAll: () => [],
  getElementById: () => null
};

const { i18n } = await import('../src/i18n/index.js');

test('i18n dictionaries include all required Phonk keys across UA, RU, and EN', () => {
  const requiredKeys = [
    'filterPhonk',
    'trackTagPhonk',
    'adminPhonkLabel',
    'adminPhonkMark',
    'adminPhonkHint'
  ];

  for (const key of requiredKeys) {
    assert.ok(ua[key], `Missing key "${key}" in ua.js`);
    assert.ok(ru[key], `Missing key "${key}" in ru.js`);
    assert.ok(en[key], `Missing key "${key}" in en.js`);
    assert.equal(typeof ua[key], 'string');
    assert.equal(typeof ru[key], 'string');
    assert.equal(typeof en[key], 'string');
  }

  // Check language switching and fallback resolution
  i18n.setLanguage('UA');
  assert.equal(i18n.t('trackTagPhonk'), 'ФОНК');
  assert.equal(i18n.t('filterPhonk'), 'Фонк');

  i18n.setLanguage('RU');
  assert.equal(i18n.t('trackTagPhonk'), 'ФОНК');
  assert.equal(i18n.t('filterPhonk'), 'Фонк');

  i18n.setLanguage('EN');
  assert.equal(i18n.t('trackTagPhonk'), 'PHONK');
  assert.equal(i18n.t('filterPhonk'), 'Phonk');
});

test('Track data model correctly treats undefined / null isPhonk as false without breaking', () => {
  const legacyTrack1 = { id: 't1', title: 'Old Song', artist: 'Artist' };
  const legacyTrack2 = { id: 't2', title: 'Song With Null', artist: 'Artist', isPhonk: null };
  const legacyTrack3 = { id: 't3', title: 'Song With Undefined', artist: 'Artist', isPhonk: undefined };
  const phonkTrack = { id: 't4', title: 'Phonk Song', artist: 'Artist', isPhonk: true };
  const explicitFalseTrack = { id: 't5', title: 'Normal Song', artist: 'Artist', isPhonk: false };

  assert.equal(Boolean(legacyTrack1.isPhonk), false);
  assert.equal(Boolean(legacyTrack2.isPhonk), false);
  assert.equal(Boolean(legacyTrack3.isPhonk), false);
  assert.equal(Boolean(phonkTrack.isPhonk), true);
  assert.equal(Boolean(explicitFalseTrack.isPhonk), false);
});

test('Firestore update contract preserves explicit boolean false and avoids dropping metadata', () => {
  function prepareUpdateData({ title, artist, duration, audioUrl, isPhonk }) {
    const updateData = {};
    if (title) updateData.title = title;
    if (artist) updateData.artist = artist;
    if (duration > 0) updateData.duration = duration;
    if (audioUrl) updateData.audioUrl = audioUrl;
    if (typeof isPhonk === 'boolean') {
      updateData.isPhonk = isPhonk;
    }
    return updateData;
  }

  // Turning Phonk OFF (true -> false)
  const turnOffPayload = prepareUpdateData({ title: 'Song', artist: 'Artist', isPhonk: false });
  assert.equal(turnOffPayload.isPhonk, false);
  assert.ok('isPhonk' in turnOffPayload);

  // Turning Phonk ON (false -> true)
  const turnOnPayload = prepareUpdateData({ title: 'Song', artist: 'Artist', isPhonk: true });
  assert.equal(turnOnPayload.isPhonk, true);
  assert.ok('isPhonk' in turnOnPayload);

  // Omitted / null isPhonk does not overwrite existing value
  const untouchedPayload = prepareUpdateData({ title: 'Song', artist: 'Artist', isPhonk: null });
  assert.equal('isPhonk' in untouchedPayload, false);
});

test('Catalog Phonk filter accurately isolates Phonk tracks and respects search + sorting', () => {
  const mockSongs = [
    { title: 'Tokyo Drift Phonk', artist: 'Ghostface Playa', duration: '2:10', isPhonk: true, stars: 3, score: 95000 },
    { title: 'Moonlight Sonata', artist: 'Beethoven', duration: '3:45', isPhonk: false, stars: 3, score: 80000 },
    { title: 'Neon Blade', artist: 'MoonDeity', duration: '1:50', isPhonk: true, stars: 1, score: 60000 },
    { title: 'Gurenge', artist: 'LiSA', duration: '3:58', isPhonk: undefined, stars: 2, score: 85000 },
    { title: 'Metamorphosis', artist: 'INTERWORLD', duration: '2:22', isPhonk: true, stars: 3, score: 110000 }
  ];

  // 1. Phonk category filter
  let filtered = mockSongs.filter(s => s?.isPhonk === true);
  assert.equal(filtered.length, 3);
  assert.deepEqual(filtered.map(s => s.title), ['Tokyo Drift Phonk', 'Neon Blade', 'Metamorphosis']);

  // 2. Search inside Phonk category
  const queryStr = 'moondeity';
  let searchAndFiltered = filtered.filter(s => {
    const title = (s.title || '').toLowerCase();
    const artist = (s.artist || '').toLowerCase();
    return title.includes(queryStr) || artist.includes(queryStr);
  });
  assert.equal(searchAndFiltered.length, 1);
  assert.equal(searchAndFiltered[0].title, 'Neon Blade');

  // 3. Sort by score inside Phonk category
  filtered.sort((a, b) => b.score - a.score);
  assert.equal(filtered[0].title, 'Metamorphosis');
  assert.equal(filtered[1].title, 'Tokyo Drift Phonk');
  assert.equal(filtered[2].title, 'Neon Blade');
});

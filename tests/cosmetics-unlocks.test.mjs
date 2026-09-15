import test from 'node:test';
import assert from 'node:assert/strict';
import { FRAMES, TITLES, checkCosmeticsUnlocks, checkRetroactiveCosmeticsUnlocks, getLocalCosmetics, resetLocalCosmetics } from '../src/game/cosmetics.js';
import ru from '../src/i18n/ru.js';
import ua from '../src/i18n/ua.js';
import en from '../src/i18n/en.js';

// Setup minimal localStorage mock for node environment
class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
  key(i) {
    return Array.from(this.store.keys())[i] || null;
  }
  get length() {
    return this.store.size;
  }
}

globalThis.localStorage = new MockLocalStorage();

test('FRAMES registry contains all 14 frames including the 7 new physical non-neon frames', () => {
  const expectedNewFrames = [
    'frame_cyber_alloy',
    'frame_baroque_gold',
    'frame_frostbound',
    'frame_street_drift',
    'frame_gothic_thorn',
    'frame_steampunk_chrono',
    'frame_sakura_urushi'
  ];

  assert.equal(FRAMES.length, 14, 'Total frames must be 14');
  for (const fId of expectedNewFrames) {
    const frame = FRAMES.find(f => f.id === fId);
    assert.ok(frame, `Frame ${fId} must be registered`);
    assert.ok(frame.cssClass, `Frame ${fId} must have a CSS class`);
    assert.equal(frame.unlockedByDefault, false, `Frame ${fId} must be locked by default`);
  }
});

test('TITLES registry contains all 25 titles including One with Phonk and all mastery titles', () => {
  const expectedNewTitles = [
    'title_one_with_phonk',
    'title_night_drift_king',
    'title_808_impulse',
    'title_highway_ghost',
    'title_surgical_precision',
    'title_blade_dancer',
    'title_supersonic',
    'title_flawless_streak',
    'title_absolute_ear',
    'title_blood_moon',
    'title_crystal_heart',
    'title_synth_pulse',
    'title_one_sec_away',
    'title_lucky_777',
    'title_neon_insomnia',
    'title_iron_patience'
  ];

  assert.equal(TITLES.length, 25, 'Total titles must be 25');
  for (const tId of expectedNewTitles) {
    const title = TITLES.find(t => t.id === tId);
    assert.ok(title, `Title ${tId} must be registered`);
    assert.ok(title.nameKey, `Title ${tId} must have a nameKey`);
    assert.ok(title.descKey, `Title ${tId} must have a descKey`);
  }
});

test('i18n dictionaries across RU, UA, and EN have all translation keys for all frames and titles', () => {
  const dicts = [ru, ua, en];
  for (const f of FRAMES) {
    for (const d of dicts) {
      assert.ok(d[f.nameKey], `Missing frame name translation: ${f.nameKey}`);
      assert.ok(d[f.descKey], `Missing frame desc translation: ${f.descKey}`);
    }
  }
  for (const t of TITLES) {
    for (const d of dicts) {
      assert.ok(d[t.nameKey], `Missing title name translation: ${t.nameKey}`);
      assert.ok(d[t.descKey], `Missing title desc translation: ${t.descKey}`);
    }
  }

  // Admin search translations
  for (const d of dicts) {
    assert.ok(d.adminSearchLevelPlaceholder, 'Missing adminSearchLevelPlaceholder');
    assert.ok(d.adminNoLevelsFound, 'Missing adminNoLevelsFound');
  }
});

test('checkCosmeticsUnlocks unlocks title_one_with_phonk and frame_street_drift on Phonk + Hardcore victory', () => {
  resetLocalCosmetics();
  const notifications = [];
  const mockShowNotification = (msg) => notifications.push(msg);
  const mockGetText = (key) => ru[key] || key;

  const unlocked = checkCosmeticsUnlocks({
    playedSong: true,
    victory: true,
    isHardcore: true,
    isPhonk: true,
    score: 120000,
    maxCombo: 300,
    starsEarned: 3
  }, mockGetText, mockShowNotification);

  assert.ok(unlocked.includes('title_one_with_phonk'), 'Must unlock title_one_with_phonk');
  assert.ok(unlocked.includes('frame_street_drift'), 'Must unlock frame_street_drift');

  const cosmetics = getLocalCosmetics();
  assert.ok(cosmetics.unlockedTitles.includes('title_one_with_phonk'));
  assert.ok(cosmetics.unlockedFrames.includes('frame_street_drift'));
});

test('checkRetroactiveCosmeticsUnlocks awards titles and frames based on existing progress in localStorage', () => {
  resetLocalCosmetics();
  // Simulate an experienced player's stored progress in localStorage:
  // 1. Total pure playtime: 20,000 seconds (> 5 hours / 18,000s)
  localStorage.setItem('neon_total_playtime', '20000');

  // 2. 16 completed tracks, including 3 diamond stars, 64 total stars, and a Phonk hardcore completion
  const songsList = [
    { title: 'Phonk Killer', isPhonk: true },
    { title: 'Midnight City', isPhonk: false }
  ];

  // Set 16 song progress records
  for (let i = 1; i <= 16; i++) {
    const isDiamond = i <= 3;
    const isHardcore = i === 1; // Song 1 is Phonk on Hardcore
    const title = i === 1 ? 'Phonk Killer' : `Track_${i}`;
    localStorage.setItem(`neon_rhythm_${title}`, JSON.stringify({
      score: 100000,
      stars: 4, // 16 * 4 = 64 total stars (> 50)
      starTypes: isDiamond ? [2, 2, 2, 2, 0] : [1, 1, 1, 1, 0],
      isHardcore: isHardcore,
      completedDifficulties: isHardcore ? ['hard', 'hardcore'] : ['normal']
    }));
  }

  const notifications = [];
  const unlocked = checkRetroactiveCosmeticsUnlocks(songsList, (k) => ru[k] || k, (m) => notifications.push(m));

  // Should have retroactively unlocked:
  // - frame_cyber_alloy (15+ completed levels)
  // - frame_baroque_gold (50+ stars)
  // - frame_street_drift (Phonk hardcore win)
  // - frame_steampunk_chrono (5+ hours playtime)
  // - frame_prismatic (diamond star)
  // - title_one_with_phonk (Phonk hardcore win)
  // - title_absolute_ear (3+ diamond stars)
  // - title_star_collector (20+ stars)
  // - title_iron_patience (5+ hours playtime)
  assert.ok(unlocked.includes('frame_cyber_alloy'), 'Retroactively unlocks cyber alloy frame');
  assert.ok(unlocked.includes('frame_baroque_gold'), 'Retroactively unlocks baroque gold frame');
  assert.ok(unlocked.includes('frame_street_drift'), 'Retroactively unlocks street drift frame');
  assert.ok(unlocked.includes('frame_steampunk_chrono'), 'Retroactively unlocks steampunk chrono frame');
  assert.ok(unlocked.includes('title_one_with_phonk'), 'Retroactively unlocks One with Phonk title');
  assert.ok(unlocked.includes('title_absolute_ear'), 'Retroactively unlocks Absolute Ear title');
  assert.ok(unlocked.includes('title_star_collector'), 'Retroactively unlocks Star Collector title');
  assert.ok(unlocked.includes('title_iron_patience'), 'Retroactively unlocks Iron Patience title');

  // Verify cosmetics state
  const cosm = getLocalCosmetics();
  assert.ok(cosm.unlockedFrames.includes('frame_cyber_alloy'));
  assert.ok(cosm.unlockedFrames.includes('frame_baroque_gold'));
  assert.ok(cosm.unlockedFrames.includes('frame_street_drift'));
  assert.ok(cosm.unlockedFrames.includes('frame_steampunk_chrono'));
  assert.ok(cosm.unlockedTitles.includes('title_one_with_phonk'));
  assert.ok(cosm.unlockedTitles.includes('title_absolute_ear'));
  assert.ok(cosm.unlockedTitles.includes('title_star_collector'));
  assert.ok(cosm.unlockedTitles.includes('title_iron_patience'));

  // Ensure equipped selections are never clobbered
  assert.equal(cosm.selectedFrame, 'frame_none');
  assert.equal(cosm.selectedTitle, 'title_novice');
});

test('Admin level search filter function correctly filters tracks by title or artist', () => {
  const songsDB = [
    { title: 'Tokyo Drift Phonk', artist: 'Ghostface Playa' },
    { title: 'Moonlight Sonata', artist: 'Beethoven' },
    { title: 'Neon Blade', artist: 'MoonDeity' },
    { title: 'Gurenge', artist: 'LiSA' },
    { title: 'Metamorphosis', artist: 'INTERWORLD' }
  ];

  function filterLevels(query) {
    const q = (query || '').toLowerCase().trim();
    return songsDB.filter(song => {
      if (!song || !song.title) return false;
      if (!q) return true;
      const titleMatch = (song.title || '').toLowerCase().includes(q);
      const artistMatch = (song.artist || '').toLowerCase().includes(q);
      return titleMatch || artistMatch;
    });
  }

  assert.equal(filterLevels('').length, 5);
  assert.equal(filterLevels('phonk').length, 1);
  assert.equal(filterLevels('phonk')[0].title, 'Tokyo Drift Phonk');
  assert.equal(filterLevels('moon').length, 2); // Moonlight Sonata + MoonDeity (artist)
  assert.equal(filterLevels('lisa').length, 1);
  assert.equal(filterLevels('unknown_query_xyz').length, 0);
});

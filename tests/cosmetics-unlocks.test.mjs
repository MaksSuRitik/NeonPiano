import { readFileSync } from 'node:fs';
import { filterAdminLevels } from '../src/ui/adminLevelSearch.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { FRAMES, TITLES, checkCosmeticsUnlocks, checkRetroactiveCosmeticsUnlocks, getLocalCosmetics, resetLocalCosmetics, recordCosmeticsMatch, getCosmeticsProgress, mergeCosmeticsProgress, seedCosmeticsProgress, groupCosmetics, createCosmeticsRun, recordCosmeticsJudgment, recordCosmeticsMiss, observeCosmeticsCombo, CURRENT_COSMETICS_REVISION } from '../src/game/cosmetics.js';
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

test('FRAMES registry contains all 24 frames including physical and themed collections', () => {
  const expectedNewFrames = [
    'frame_cyber_alloy',
    'frame_baroque_gold',
    'frame_frostbound',
    'frame_street_drift',
    'frame_gothic_thorn',
    'frame_steampunk_chrono',
    'frame_sakura_urushi',
    'frame_moon_rime',
    'frame_crimson_dawn',
    'frame_ice_moon_throne',
    'frame_silence_blades',
    'frame_blossom_charm',
    'frame_abyss_portal',
    'frame_cassette_808',
    'frame_leader_crown',
    'frame_silver_crown',
    'frame_neon_archive',
    'frame_star_forge',
    'frame_eared_melon'
  ];

  assert.equal(FRAMES.length, 26, 'Total frames must be 26');
  for (const fId of expectedNewFrames) {
    const frame = FRAMES.find(f => f.id === fId);
    assert.ok(frame, `Frame ${fId} must be registered`);
    assert.ok(frame.cssClass, `Frame ${fId} must have a CSS class`);
    assert.equal(frame.unlockedByDefault, false, `Frame ${fId} must be locked by default`);
  }
});

test('TITLES registry contains all 55 titles including collection titles', () => {
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
    'title_iron_patience',
    'title_ice_rhythm',
    'title_last_petal',
    'title_white_comet',
    'title_frost_concert',
    'title_moon_blade',
    'title_blizzard_heart',
    'title_calm_before_storm',
    'title_crystal_keeper',
    'title_snow_endures',
    'title_ice_symphony',
    'title_turbo_808',
    'title_night_racer',
    'title_no_brakes',
    'title_tire_ash',
    'title_dark_subwoofer',
    'title_city_ghost',
    'title_redline',
    'title_tokyo_turn',
    'title_rhythm_architect',
    'title_unbroken_pulse',
    'title_diamond_collector',
    'title_thousand_touches',
    'title_beyond_bpm',
    'title_perfect_finale',
    'title_rhythm_in_blood',
    'title_unknown_legend',
    'title_against_silence',
    'title_stage_owner',
    'title_world_collector',
    'title_timeless'
  ];

  assert.equal(TITLES.length, 55, 'Total titles must be 55');
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


test.beforeEach(() => localStorage.clear());
const run = (ctx) => checkCosmeticsUnlocks({ playedAt: new Date(2026, 0, 1, 12).getTime(), ...ctx });
const won = { victory: true, totalMisses: 0, track: { isPhonk: true }, isHardcore: true };

test('unique stable IDs across all 26 frames and 55 titles', () => {
  assert.equal(new Set(FRAMES.map(x => x.id)).size, 26);
  assert.equal(new Set(TITLES.map(x => x.id)).size, 55);
  assert.ok(!TITLES.some(x => x.id.includes('grandmaster')));
});

test('strict live conditions and their negative boundaries', () => {
  const cases = [
    ['title_one_with_phonk', won, {...won, track: {isPhonk: false}, isPhonk: true}],
    ['frame_street_drift', won, {...won, victory: false}],
    ['frame_cyber_alloy', {victory: true, speed: 1.4}, {completedLevelsCount: 15, speed: 1.399, victory: true}],
    ['frame_cyber_alloy', {hardCompletedLevelsCount: 15}, {hardCompletedLevelsCount: 14}],
    ['frame_baroque_gold', {totalGoldStars: 50}, {totalStarsInGame: 50, totalGoldStars: 49}],
    ['frame_baroque_gold', {globalRank: 3}, {globalRank: 4}],
    ['frame_gothic_thorn', {hardcoreVictoryCount: 10}, {hardcoreVictoryCount: 9}],
    ['frame_gothic_thorn', {...won, isSecret: true}, {...won, isSecret: false}],
    ['frame_frostbound', {themeId: 'sanhua', maxCombo: 700}, {themeId: 'classic', maxCombo: 900}],
    ['frame_sakura_urushi', {...won, accuracy: 100}, {...won, accuracy: 99.9}],
    ['title_night_drift_king', {...won, speed: 1.3, holdsDropped: 0}, {...won, speed: 1.299, holdsDropped: 0}],
    ['title_night_drift_king', {...won, speed: 1.3, holdsDropped: 0}, {...won, speed: 1.3}],
    ['title_808_impulse', {track: {isPhonk: true}, maxCombo: 600}, {track: {title: 'Phonk'}, maxCombo: 900}],
    ['title_surgical_precision', {...won, perfectHits: 19, totalJudgedNotes: 20}, {...won, perfectHits: 9499, totalJudgedNotes: 10000}],
    ['title_surgical_precision', {...won, perfectHits: 95, totalJudgedNotes: 100}, {victory: false, perfectHits: 100, totalJudgedNotes: 100}],
    ['title_blade_dancer', {...won, speed: 1.4}, {...won, speed: 1.399}],
    ['title_supersonic', {...won, difficulty: 'hard', speed: 1.4}, {...won, difficulty: 'hard', speed: 1.399}],
    ['title_absolute_ear', {diamondTracksCount: 3}, {diamondsEarned: 3, diamondTracksCount: 1}],
    ['title_blood_moon', {themeId: 'sanhua', maxCombo: 800}, {themeId: 'hiyuki', maxCombo: 800}],
    ['title_crystal_heart', {...won, themeId: 'sanhua', totalHolds: 3, completedHolds: 3}, {...won, themeId: 'sanhua', totalHolds: 3, holdsDropped: 0}],
    ['title_synth_pulse', {completedLevelsCount: 25}, {completedLevelsCount: 24}],
    ['title_one_sec_away', {victory: false, songProgress: .95}, {victory: false, songProgress: .9499}],
    ['title_lucky_777', {hitCombo777: true, maxCombo: 800}, {maxCombo: 778, score: 777, perfectHits: 777}],
    ['title_iron_patience', {totalPlaytimeSeconds: 18000}, {totalPlaytimeSeconds: 17999}],
    ['frame_steampunk_chrono', {totalPlaytimeSeconds: 18000}, {totalPlaytimeSeconds: 17999}],
    ['title_ice_rhythm', {themeId: 'sanhua', maxCombo: 500}, {themeId: 'sanhua', maxCombo: 499}],
    ['title_last_petal', {...won, themeId: 'sanhua'}, {...won, themeId: 'sanhua', totalMisses: 1}],
    ['title_white_comet', {...won, themeId: 'sanhua', speed: 1.4}, {...won, themeId: 'sanhua', speed: 1.399}],
    ['title_frost_concert', {...won, themeId: 'sanhua', totalHolds: 2, completedHolds: 2}, {...won, themeId: 'sanhua', totalHolds: 2, completedHolds: 1}],
    ['title_moon_blade', {...won, themeId: 'sanhua', diamondsEarned: 1, track: {title: 'T1'}, sanhuaDiamondTrackTitles: ['T1', 'T2', 'T3']}, {...won, themeId: 'sanhua', diamondsEarned: 1, track: {title: 'T1'}, sanhuaDiamondTrackTitles: ['T1', 'T2']}],
    ['title_blizzard_heart', {...won, themeId: 'sanhua', isHardcore: false, enteredCriticalDanger: true}, {...won, themeId: 'sanhua', isHardcore: true, enteredCriticalDanger: true}],
    ['title_calm_before_storm', {themeId: 'sanhua', maxPerfectStreak: 100}, {themeId: 'sanhua', maxPerfectStreak: 99}],
    ['title_crystal_keeper', {sanhuaTrackTitles: Array.from({length: 10}, (_, i) => 'T' + i)}, {sanhuaTrackTitles: Array.from({length: 9}, (_, i) => 'T' + i)}],
    ['title_snow_endures', {...won, themeId: 'sanhua', isHardcore: false, hadLateMiss: true}, {...won, themeId: 'sanhua', isHardcore: true, hadLateMiss: true}],
    ['title_ice_symphony', {...won, themeId: 'sanhua', accuracy: 100}, {...won, themeId: 'sanhua', accuracy: 99.9}],
    ['title_turbo_808', {track: {isPhonk: true}, maxCombo: 1000}, {track: {isPhonk: true}, maxCombo: 999}],
    ['title_night_racer', {...won, playedAt: new Date(2026, 0, 1, 2).getTime()}, {...won, playedAt: new Date(2026, 0, 1, 6).getTime()}],
    ['title_no_brakes', {...won, speed: 1.4}, {...won, speed: 1.399}],
    ['title_tire_ash', {...won, totalHolds: 2, completedHolds: 2}, {...won, totalHolds: 2, completedHolds: 1}],
    ['title_dark_subwoofer', {track: {isPhonk: true}, diamondsEarned: 1}, {track: {isPhonk: true}, diamondsEarned: 0}],
    ['title_city_ghost', {phonkTrackTitles: Array.from({length: 10}, (_, i) => 'P' + i)}, {phonkTrackTitles: Array.from({length: 9}, (_, i) => 'P' + i)}],
    ['title_redline', {track: {isPhonk: true}, maxComboAfterMiss: 300}, {track: {isPhonk: true}, maxComboAfterMiss: 299}],
    ['title_tokyo_turn', {...won, isHardcore: true, speed: 1.4}, {...won, isHardcore: true, speed: 1.399}],
    ['title_rhythm_architect', {completedTrackTitles: Array.from({length: 50}, (_, i) => 'T' + i)}, {completedTrackTitles: Array.from({length: 49}, (_, i) => 'T' + i)}],
    ['title_unbroken_pulse', {bestVictoryStreak: 10}, {bestVictoryStreak: 9}],
    ['title_diamond_collector', {diamondTracksCount: 10}, {diamondTracksCount: 9}],
    ['title_thousand_touches', {totalPerfectHits: 1000}, {totalPerfectHits: 999}],
    ['title_beyond_bpm', {victory: true, speed: 1.4}, {victory: true, speed: 1.399}],
    ['title_perfect_finale', {victory: true, finalPerfectStreak: 100}, {victory: true, finalPerfectStreak: 99}],
    ['title_rhythm_in_blood', {totalPlaytimeSeconds: 180000}, {totalPlaytimeSeconds: 179999}],
    ['title_unknown_legend', {secretTrackTitles: ['S1', 'S2', 'S3']}, {secretTrackTitles: ['S1', 'S2']}],
    ['title_against_silence', {victory: true, mutedWholeRun: true}, {victory: true, mutedWholeRun: false}],
    ['title_stage_owner', {globalRank: 1}, {globalRank: 2}],
    ['title_world_collector', {availableThemeIds: ['a', 'b'], unlockedThemeIds: ['a', 'b']}, {availableThemeIds: ['a', 'b'], unlockedThemeIds: ['a']}],
    ['title_timeless', {playedHours: Array.from({length: 24}, (_, i) => i)}, {playedHours: Array.from({length: 23}, (_, i) => i)}],
    ['frame_moon_rime', {sanhuaVictoryCount: 10}, {sanhuaVictoryCount: 9}],
    ['frame_crimson_dawn', {themeId: 'sanhua', maxCombo: 800}, {themeId: 'sanhua', maxCombo: 799}],
    ['frame_ice_moon_throne', {themeId: 'sanhua', diamondsEarned: 1}, {themeId: 'sanhua', diamondsEarned: 0}],
    ['frame_silence_blades', {themeId: 'sanhua', maxPerfectStreak: 100}, {themeId: 'sanhua', maxPerfectStreak: 99}],
    ['frame_blossom_charm', {...won, themeId: 'sanhua'}, {...won, themeId: 'sanhua', totalMisses: 1}],
    ['frame_abyss_portal', {themeId: 'cosmic', maxCombo: 1000}, {themeId: 'cosmic', maxCombo: 999}],
    ['frame_cassette_808', {phonkVictoryCount: 10}, {phonkVictoryCount: 9}],
    ['frame_leader_crown', {globalRank: 1}, {globalRank: 2}],
    ['frame_silver_crown', {globalRank: 2}, {globalRank: 3}],
    ['frame_star_forge', {totalDiamondStars: 10}, {totalDiamondStars: 9}],
    ['frame_eared_melon', {hardHardcoreTrackTitles: ['T0']}, {hardHardcoreTrackTitles: []}],
  ];
  for (const [id, positive, negative] of cases) {
    localStorage.clear();
    assert.ok(!run(negative).includes(id), `${id} negative`);
    localStorage.clear();
    assert.ok(run(positive).includes(id), `${id} positive`);
  }
  localStorage.clear();
  assert.ok(!run({...won, perfectHits: 0, totalJudgedNotes: 0}).includes('title_surgical_precision'));
});

test('Highway Ghost uses local run time across midnight and requires victory plus gold', () => {
  for (const hour of [23, 0, 3, 4, 22]) {
    localStorage.clear();
    const ctx = {...won, goldStarsEarned: 3, playedAt: new Date(2026, 0, 1, hour).getTime()};
    assert.equal(run(ctx).includes('title_highway_ghost'), hour >= 23 || hour < 4);
    localStorage.clear();
    assert.ok(!run({...ctx, victory: false}).includes('title_highway_ghost'));
  }
});

test('match counters persist; evaluation alone never increments; streak resets on loss or miss', () => {
  const ctx = {...won, difficulty: 'hard', playedAt: new Date(2026, 0, 1, 4, 59).getTime()};
  for (let i = 0; i < 3; i++) recordCosmeticsMatch(ctx);
  assert.ok(run({}).includes('title_flawless_streak'));
  assert.ok(getLocalCosmetics().unlockedTitles.includes('title_neon_insomnia'));
  const before = getCosmeticsProgress();
  run(ctx); run(ctx); checkRetroactiveCosmeticsUnlocks();
  assert.deepEqual(getCosmeticsProgress(), before);
  recordCosmeticsMatch({...ctx, victory: false, playedAt: new Date(2026, 0, 1, 5).getTime()});
  assert.equal(getCosmeticsProgress().neonInsomniaMatches, 3);
  assert.equal(getCosmeticsProgress().flawlessVictoryStreak, 0);
  recordCosmeticsMatch(ctx);
  recordCosmeticsMatch({...ctx, totalMisses: 1});
  assert.equal(getCosmeticsProgress().flawlessVictoryStreak, 0);
});

test('retroactive evidence, distinct diamonds, exact metadata and idempotent notifications', () => {
  localStorage.setItem('neon_total_playtime', '20000');
  const songs = [{title: 'Bass', isPhonk: true}];
  for (let i = 0; i < 25; i++) {
    localStorage.setItem('neon_rhythm_' + (i ? `Track ${i}` : 'Bass'), JSON.stringify({
      score: 100, stars: 3, starTypes: i < 3 ? [2,2,2] : [1,1,1],
      completedDifficulties: ['hard'], isHardcore: i === 0, maxCombo: i === 0 ? 650 : 0
    }));
  }
  const notifications = [];
  const delta = checkRetroactiveCosmeticsUnlocks(songs, k => en[k], text => notifications.push(text));
  for (const id of ['title_one_with_phonk','frame_street_drift','title_absolute_ear','title_synth_pulse','title_iron_patience','frame_steampunk_chrono','title_808_impulse','frame_cyber_alloy','frame_baroque_gold']) assert.ok(delta.includes(id), id);
  const count = notifications.length;
  assert.deepEqual(checkRetroactiveCosmeticsUnlocks(songs, k => en[k], text => notifications.push(text)), []);
  assert.equal(notifications.length, count);
  for (const id of ['title_lucky_777','title_blade_dancer','title_night_drift_king','title_one_sec_away','title_surgical_precision','title_blood_moon']) assert.ok(!delta.includes(id), id);
});

test('partial scores, Phonk names, malformed values and missing historical fields prove nothing', () => {
  for (let i = 0; i < 25; i++) localStorage.setItem('neon_rhythm_Phonk '+i, JSON.stringify({score: 500, stars: 0}));
  localStorage.setItem('neon_rhythm_Phonk', JSON.stringify({isHardcore: true, maxCombo: 800}));
  localStorage.setItem('neon_rhythm_broken', '{');
  const delta = checkRetroactiveCosmeticsUnlocks([{title: 'Phonk', genre: 'phonk', isPhonk: false}]);
  assert.ok(!delta.includes('title_one_with_phonk'));
  assert.ok(!delta.includes('title_synth_pulse'));
  assert.ok(!delta.includes('frame_cyber_alloy'));
  assert.ok(!delta.includes('title_night_pianist'));
  localStorage.setItem('neon_cosmetics_progress', 'null');
  assert.equal(getCosmeticsProgress().completedLevelsCount, 0);
  mergeCosmeticsProgress(null);
  mergeCosmeticsProgress({completedLevelsCount: 'invalid'});
  assert.equal(getCosmeticsProgress().completedLevelsCount, 0);
});

test('historical baseline counts once; newer zero streak replaces older positive streak', () => {
  localStorage.setItem('neon_rhythm_A', JSON.stringify({completedDifficulties: ['hard']}));
  seedCosmeticsProgress();
  assert.equal(getCosmeticsProgress().completedLevelsCount, 1);
  recordCosmeticsMatch(won);
  seedCosmeticsProgress();
  assert.equal(getCosmeticsProgress().completedLevelsCount, 2);
  mergeCosmeticsProgress({flawlessVictoryStreak: 0, updatedAt: Date.now() + 1000});
  assert.equal(getCosmeticsProgress().flawlessVictoryStreak, 0);
});

test('admin search uses production filter for titles, artists, normalized whitespace and no results', () => {
  const songs = Object.freeze([
    {artist: 'MoonDeity', title: 'Neon Blade'},
    {artist: 'Kordhell', title: 'Murder In My Mind'},
    {artist: 'Unknown', title: 'Piano Song'}
  ]);
  for (const [query, title] of [['moon','Neon Blade'], ['kord','Murder In My Mind'], ['piano','Piano Song'], ['  MURDER   in  ', 'Murder In My Mind']]) {
    assert.deepEqual(filterAdminLevels(songs, query).map(s => s.title), [title]);
  }
  assert.equal(filterAdminLevels(songs, '').length, 3);
  assert.equal(filterAdminLevels(songs, 'not found').length, 0);
});

test('legacy match history proves combos and night plays, but not victories or exact 777', () => {
  const history = Array.from({length: 3}, (_, i) => ({id: String(i), trackTitle: 'Bass', maxCombo: 800,
    perfectCount: 110, playedAt: new Date(2026, 0, 1 + i, 4, 59).toISOString()}));
  const delta = checkRetroactiveCosmeticsUnlocks([{title: 'Bass', isPhonk: true}], null, null, [...history, history[0]]);
  for (const id of ['title_808_impulse','title_neon_insomnia','title_steel_fingers','title_night_pianist']) assert.ok(delta.includes(id), id);
  for (const id of ['title_lucky_777','title_surgical_precision','title_highway_ghost','title_one_with_phonk']) assert.ok(!delta.includes(id), id);
  assert.deepEqual(checkRetroactiveCosmeticsUnlocks([{title: 'Bass', isPhonk: true}], null, null, history), []);
});


test('production admin renderer preserves selection, selects first match, and disables empty option', () => {
  const source = readFileSync(new URL('../src/danceCore.js', import.meta.url), 'utf8');
  const start = source.indexOf('        function renderAdminLevelOptions(');
  const end = source.indexOf('        if (adminLevelSearch)', start);
  const select = {
    options: [], selectedIndex: 0,
    set innerHTML(value) { this.options = []; this.selectedIndex = 0; },
    get value() { return this.options[this.selectedIndex]?.value || ''; },
    set value(value) { this.selectedIndex = this.options.findIndex(o => o.value === value); },
    appendChild(option) { this.options.push(option); }
  };
  const songs = [{title: 'Neon Blade', artist: 'MoonDeity'}, {title: 'Piano Song', artist: 'Unknown'}];
  const render = new Function('adminSelectLevel', 'songsDB', 'filterAdminLevels', 'getText', 'document',
    source.slice(start, end) + '; return renderAdminLevelOptions;')(select, songs, filterAdminLevels, k => en[k], {createElement: () => ({})});
  render(); select.value = 'Piano Song'; render('piano');
  assert.equal(select.value, 'Piano Song');
  render('moon'); assert.equal(select.value, 'Neon Blade');
  render('missing'); assert.equal(select.value, '');
  assert.equal(select.options.length, 1);
  assert.equal(select.options[0].disabled, true);
  assert.equal(select.options[0].textContent, 'No tracks found');
  render(); assert.equal(select.options.length, 2);
});

test('groupCosmetics arranges items in order of defined collections', () => {
  const groupedFrames = groupCosmetics(FRAMES);
  assert.equal(groupedFrames.length, FRAMES.length);
  const groups = groupedFrames.map(f => f.collectionKey || 'collectionOriginal');
  const expectedOrder = ['collectionOriginal', 'collectionSanhua', 'collectionPhonk', 'collectionCosmic', 'collectionPrestige'];
  let lastGroupIdx = 0;
  for (const g of groups) {
    const idx = expectedOrder.indexOf(g);
    assert.ok(idx >= lastGroupIdx, `Group ${g} out of expected order`);
    lastGroupIdx = idx;
  }
});

test('createCosmeticsRun observes streaks, misses, combos after miss and audio state', () => {
  const run = createCosmeticsRun(true);
  assert.equal(run.heardAudio, false);
  recordCosmeticsJudgment(run, 'perfect');
  recordCosmeticsJudgment(run, 'perfect');
  assert.equal(run.perfectStreak, 2);
  assert.equal(run.maxPerfectStreak, 2);
  recordCosmeticsJudgment(run, 'good');
  assert.equal(run.perfectStreak, 0);
  assert.equal(run.maxPerfectStreak, 2);

  recordCosmeticsMiss(run, 0.95);
  assert.equal(run.hadMiss, true);
  assert.equal(run.hadLateMiss, true);

  observeCosmeticsCombo(run, 350);
  assert.equal(run.maxComboAfterMiss, 350);
});

test('cosmetics progress counters and array collections record and merge properly', () => {
  localStorage.clear();
  const match = {
    victory: true,
    difficulty: 'hard',
    isHardcore: true,
    themeId: 'sanhua',
    track: { title: 'Drift Queen', isPhonk: true, isSecret: true },
    perfectHits: 150,
    totalMisses: 0,
    playedAt: new Date(2026, 0, 1, 14).getTime()
  };
  recordCosmeticsMatch(match);
  const p1 = getCosmeticsProgress();
  assert.equal(p1.victoryStreak, 1);
  assert.equal(p1.sanhuaVictoryCount, 1);
  assert.equal(p1.phonkVictoryCount, 1);
  assert.equal(p1.totalPerfectHits, 150);
  assert.deepEqual(p1.completedTrackTitles, ['Drift Queen']);
  assert.deepEqual(p1.sanhuaTrackTitles, ['Drift Queen']);
  assert.deepEqual(p1.phonkTrackTitles, ['Drift Queen']);
  assert.deepEqual(p1.secretTrackTitles, ['Drift Queen']);
  assert.deepEqual(p1.playedHours, [14]);

  mergeCosmeticsProgress({
    victoryStreak: 5,
    phonkTrackTitles: ['Another Phonk'],
    playedHours: [15, 16],
    updatedAt: Date.now() + 1000
  });
  const p2 = getCosmeticsProgress();
  assert.equal(p2.victoryStreak, 5);
  assert.ok(p2.phonkTrackTitles.includes('Another Phonk'));
  assert.ok(p2.playedHours.includes(15));
  assert.ok(p2.playedHours.includes(16));
});

// ============================================================
// Tests A through I: Ice Theme terminology & retroactive logic
// ============================================================

test('A: Ice-theme collection localization exists in RU, UA, EN', () => {
  // collectionSanhua must be the Ice Theme collection name
  assert.equal(ru.collectionSanhua, 'Ледяная тема', 'RU collectionSanhua');
  assert.equal(ua.collectionSanhua, 'Крижана тема', 'UA collectionSanhua');
  assert.equal(en.collectionSanhua, 'Ice Theme', 'EN collectionSanhua');
  // Alias keys should also exist
  assert.equal(ru.cosmeticsCollectionIceTheme, 'Ледяная тема', 'RU cosmeticsCollectionIceTheme');
  assert.equal(ua.cosmeticsCollectionIceTheme, 'Крижана тема', 'UA cosmeticsCollectionIceTheme');
  assert.equal(en.cosmeticsCollectionIceTheme, 'Ice Theme', 'EN cosmeticsCollectionIceTheme');
  // Descriptions
  assert.ok(ru.cosmeticsCollectionIceThemeDesc, 'RU desc exists');
  assert.ok(ua.cosmeticsCollectionIceThemeDesc, 'UA desc exists');
  assert.ok(en.cosmeticsCollectionIceThemeDesc, 'EN desc exists');
  // No user-facing description must mention character names in collectionSanhua
  for (const [lang, d] of [['RU', ru], ['UA', ua], ['EN', en]]) {
    assert.ok(!d.collectionSanhua.includes('Hiyuki'), `${lang} collectionSanhua must not say Hiyuki`);
    assert.ok(!d.collectionSanhua.includes('Sanhua'), `${lang} collectionSanhua must not say Sanhua`);
  }
});

test('B: All Ice-theme achievements use the same internal theme ID (sanhua)', () => {
  // Internal check: all collectionSanhua cosmetics are evaluated via themeId === 'sanhua'
  // Validate by evaluating with themeId 'sanhua' vs a different id
  localStorage.clear();
  const baseCtx = { victory: true, totalMisses: 0, maxCombo: 700, track: { title: 'IceTrack' }, playedAt: Date.now() };
  const cold = { ...baseCtx, themeId: 'sanhua' };
  const notCold = { ...baseCtx, themeId: 'hiyuki' }; // must NOT unlock ice achievements
  const iceAchievements = ['title_ice_rhythm', 'title_last_petal', 'frame_frostbound'];
  const coldd = checkCosmeticsUnlocks(cold);
  for (const id of iceAchievements) assert.ok(coldd.includes(id), `${id} should unlock with themeId=sanhua`);
  localStorage.clear();
  const notColdd = checkCosmeticsUnlocks(notCold);
  for (const id of iceAchievements) assert.ok(!notColdd.includes(id), `${id} must NOT unlock with themeId=hiyuki`);
});

test('C: Achievement logic uses stable ID not translated strings', () => {
  // The logic must compare ctx.themeId === 'sanhua', never translated label
  // Verify CURRENT_COSMETICS_REVISION is a number
  assert.equal(typeof CURRENT_COSMETICS_REVISION, 'number');
  assert.ok(CURRENT_COSMETICS_REVISION >= 2, 'Revision must be at least 2');
  // Verify no i18n string appears in cosmetics.js logic by checking that themeId comparison works
  // with any language. Passing the UA translated string as themeId must not unlock.
  localStorage.clear();
  const ctx = { victory: true, totalMisses: 0, maxCombo: 600, themeId: 'Крижана тема', track: { title: 'T' }, playedAt: Date.now() };
  const result = checkCosmeticsUnlocks(ctx);
  assert.ok(!result.includes('title_ice_rhythm'), 'Should not unlock with translated themeId string');
});

test('D: Historical match with themeId=sanhua + maxCombo=850 retroactively awards Ice-theme combo achievements', () => {
  localStorage.clear();
  const songs = [{ title: 'IceTrack', id: 'track-ice' }];
  const history = [{
    id: 'h1', trackId: 'track-ice', trackTitle: 'IceTrack',
    themeId: 'sanhua', maxCombo: 850, victory: true, totalMisses: 0,
    playedAt: new Date(2026, 0, 1, 12).toISOString()
  }];
  const delta = checkRetroactiveCosmeticsUnlocks(songs, null, null, history, {});
  assert.ok(delta.includes('title_ice_rhythm'), 'title_ice_rhythm should unlock (500+ combo with Ice Theme)');
  assert.ok(delta.includes('frame_frostbound'), 'frame_frostbound should unlock (700+ combo with Ice Theme)');
  assert.ok(delta.includes('title_blood_moon'), 'title_blood_moon should unlock (800+ combo with Ice Theme)');
  assert.ok(delta.includes('frame_crimson_dawn'), 'frame_crimson_dawn should unlock (800+ combo with Ice Theme)');
});

test('E: Historical match with maxCombo=850 but NO themeId does NOT award Ice-theme achievement', () => {
  localStorage.clear();
  const songs = [{ title: 'IceTrack', id: 'track-ice' }];
  const history = [{
    id: 'h2', trackId: 'track-ice', trackTitle: 'IceTrack',
    maxCombo: 850, victory: true, totalMisses: 0,
    playedAt: new Date(2026, 0, 1, 12).toISOString()
    // themeId intentionally absent
  }];
  const delta = checkRetroactiveCosmeticsUnlocks(songs, null, null, history, {});
  assert.ok(!delta.includes('title_ice_rhythm'), 'title_ice_rhythm must NOT unlock without themeId');
  assert.ok(!delta.includes('title_blood_moon'), 'title_blood_moon must NOT unlock without themeId');
  assert.ok(!delta.includes('frame_frostbound'), 'frame_frostbound must NOT unlock without themeId');
});

test('F: 3 different Diamond Star records with Ice Theme unlock Moon Blade', () => {
  localStorage.clear();
  const songs = [
    { title: 'Track A', id: 'ta' },
    { title: 'Track B', id: 'tb' },
    { title: 'Track C', id: 'tc' }
  ];
  const history = [
    { id: '1', trackId: 'ta', trackTitle: 'Track A', themeId: 'sanhua', maxCombo: 300, diamondsEarned: 1, victory: true, playedAt: new Date(2026,0,1,12).toISOString() },
    { id: '2', trackId: 'tb', trackTitle: 'Track B', themeId: 'sanhua', maxCombo: 300, diamondsEarned: 1, victory: true, playedAt: new Date(2026,0,2,12).toISOString() },
    { id: '3', trackId: 'tc', trackTitle: 'Track C', themeId: 'sanhua', maxCombo: 300, diamondsEarned: 1, victory: true, playedAt: new Date(2026,0,3,12).toISOString() }
  ];
  const delta = checkRetroactiveCosmeticsUnlocks(songs, null, null, history, {});
  assert.ok(delta.includes('title_moon_blade'), 'Moon Blade should unlock with 3 distinct Ice Theme Diamond Star tracks');
});

test('G: 3 Diamond Star records for the SAME track do NOT count as 3 for Moon Blade', () => {
  localStorage.clear();
  const songs = [{ title: 'Track A', id: 'ta' }];
  const history = [
    { id: '1', trackId: 'ta', trackTitle: 'Track A', themeId: 'sanhua', maxCombo: 300, diamondsEarned: 1, victory: true, playedAt: new Date(2026,0,1,12).toISOString() },
    { id: '2', trackId: 'ta', trackTitle: 'Track A', themeId: 'sanhua', maxCombo: 400, diamondsEarned: 1, victory: true, playedAt: new Date(2026,0,2,12).toISOString() },
    { id: '3', trackId: 'ta', trackTitle: 'Track A', themeId: 'sanhua', maxCombo: 500, diamondsEarned: 1, victory: true, playedAt: new Date(2026,0,3,12).toISOString() }
  ];
  const delta = checkRetroactiveCosmeticsUnlocks(songs, null, null, history, {});
  assert.ok(!delta.includes('title_moon_blade'), 'Moon Blade must NOT unlock — only 1 distinct track, not 3');
});

test('H: Retroactive function can run twice without duplicate rewards or notifications', () => {
  localStorage.clear();
  const songs = [{ title: 'IceTrack', id: 'track-ice' }];
  const history = [{
    id: 'dup1', trackId: 'track-ice', trackTitle: 'IceTrack',
    themeId: 'sanhua', maxCombo: 850, victory: true, totalMisses: 0,
    playedAt: new Date(2026, 0, 1, 12).toISOString()
  }];
  const notifications1 = [];
  const delta1 = checkRetroactiveCosmeticsUnlocks(songs, null, t => notifications1.push(t), history, {});
  assert.ok(delta1.length > 0, 'First call should award something');
  const notifications2 = [];
  const delta2 = checkRetroactiveCosmeticsUnlocks(songs, null, t => notifications2.push(t), history, {});
  assert.deepEqual(delta2, [], 'Second call must return empty delta');
  assert.equal(notifications2.length, 0, 'Second call must produce no new notifications');
});

test('I: Cosmic theme achievement (frame_abyss_portal) is evaluated when historical themeId=cosmic exists', () => {
  localStorage.clear();
  const songs = [{ title: 'CosmicTrack', id: 'ct' }];
  const history = [{
    id: 'c1', trackId: 'ct', trackTitle: 'CosmicTrack',
    themeId: 'cosmic', maxCombo: 1000, victory: true,
    playedAt: new Date(2026, 0, 1, 12).toISOString()
  }];
  const delta = checkRetroactiveCosmeticsUnlocks(songs, null, null, history, {});
  assert.ok(delta.includes('frame_abyss_portal'), 'frame_abyss_portal should unlock with cosmic themeId + 1000+ combo');
  // Also verify: without themeId it should NOT unlock
  localStorage.clear();
  const historyNoTheme = [{
    id: 'c2', trackId: 'ct', trackTitle: 'CosmicTrack',
    maxCombo: 1000, victory: true,
    playedAt: new Date(2026, 0, 2, 12).toISOString()
  }];
  const delta2 = checkRetroactiveCosmeticsUnlocks(songs, null, null, historyNoTheme, {});
  assert.ok(!delta2.includes('frame_abyss_portal'), 'frame_abyss_portal must NOT unlock without themeId');
});

test('J: Eared Melon (frame_eared_melon) unlocks retroactively with 1 Hard + Hardcore track', () => {
  localStorage.clear();
  const songs = [{ title: 'Track_0', id: 't_0' }];
  const history = [{
    id: 'h_0', trackId: 't_0', trackTitle: 'Track_0',
    difficulty: 'hard', isHardcore: true, victory: true,
    playedAt: new Date(2026, 0, 1, 12).toISOString()
  }];
  const delta = checkRetroactiveCosmeticsUnlocks(songs, null, null, history, {});
  assert.ok(delta.includes('frame_eared_melon'), 'frame_eared_melon must unlock with 1 Hard + Hardcore victory');
});

test('K: Eared Melon localization is complete in RU, UA, EN', () => {
  assert.equal(ru.frameEaredMelon, 'Ушастая дыня');
  assert.ok(ru.frameEaredMelonDesc.includes('1') && ru.frameEaredMelonDesc.includes('Hard'));
  assert.equal(ua.frameEaredMelon, 'Вухата диня');
  assert.ok(ua.frameEaredMelonDesc.includes('1') && ua.frameEaredMelonDesc.includes('Hard'));
  assert.equal(en.frameEaredMelon, 'Eared Melon');
  assert.ok(en.frameEaredMelonDesc.includes('1') && en.frameEaredMelonDesc.includes('Hard'));
});

test('L: Leader Crown (Rank 1) and Silver Crown (Rank 1-2) unlock behavior', () => {
  localStorage.clear();
  const res1 = run({ globalRank: 1 });
  assert.ok(res1.includes('frame_leader_crown'), 'Rank 1 must unlock frame_leader_crown');
  assert.ok(res1.includes('frame_silver_crown'), 'Rank 1 must unlock frame_silver_crown');
  assert.ok(res1.includes('frame_baroque_gold'), 'Rank 1 must unlock frame_baroque_gold');

  localStorage.clear();
  const res2 = run({ globalRank: 2 });
  assert.ok(!res2.includes('frame_leader_crown'), 'Rank 2 must NOT unlock frame_leader_crown');
  assert.ok(res2.includes('frame_silver_crown'), 'Rank 2 must unlock frame_silver_crown');
  assert.ok(res2.includes('frame_baroque_gold'), 'Rank 2 must unlock frame_baroque_gold');

  localStorage.clear();
  const res3 = run({ globalRank: 3 });
  assert.ok(!res3.includes('frame_leader_crown'), 'Rank 3 must NOT unlock frame_leader_crown');
  assert.ok(!res3.includes('frame_silver_crown'), 'Rank 3 must NOT unlock frame_silver_crown');
  assert.ok(res3.includes('frame_baroque_gold'), 'Rank 3 must unlock frame_baroque_gold');
});

test('M: Leader Crown and Silver Crown localization is complete in RU, UA, EN', () => {
  assert.equal(ru.frameLeaderCrown, 'Корона лидера');
  assert.ok(ru.frameLeaderCrownDesc.includes('1'));
  assert.equal(ru.frameSilverCrown, 'Серебряная корона');
  assert.ok(ru.frameSilverCrownDesc.includes('2'));

  assert.equal(ua.frameLeaderCrown, 'Корона лідера');
  assert.ok(ua.frameLeaderCrownDesc.includes('1'));
  assert.equal(ua.frameSilverCrown, 'Срібна корона');
  assert.ok(ua.frameSilverCrownDesc.includes('2'));

  assert.equal(en.frameLeaderCrown, "Leader's Crown");
  assert.ok(en.frameLeaderCrownDesc.includes('1st'));
  assert.equal(en.frameSilverCrown, 'Silver Crown');
  assert.ok(en.frameSilverCrownDesc.includes('2nd'));
});

import { normalizeResultMetadata } from './resultMetadata.js';
// ==========================================
// COSMETICS SYSTEM: AVATARS, FRAMES, TITLES & BIO
// Client-side 128x128 WebP compression, unlock evaluation, storage & rendering
// ==========================================

export const CURRENT_COSMETICS_REVISION = 2;

const collectionItem = (id, nameKey, collectionKey, cssClass = '') => ({
  id, nameKey, descKey: `${nameKey}Desc`, collectionKey, cssClass, unlockedByDefault: false
});

export const FRAMES = [
  {
    id: 'frame_none',
    nameKey: 'frameNone',
    descKey: 'frameNoneDesc',
    cssClass: '',
    unlockedByDefault: true
  },
  {
    id: 'frame_neon_start',
    nameKey: 'frameNeonStart',
    descKey: 'frameNeonStartDesc',
    cssClass: 'frame-neon-start',
    unlockedByDefault: false
  },
  {
    id: 'frame_gold_prestige',
    nameKey: 'frameGoldPrestige',
    descKey: 'frameGoldPrestigeDesc',
    cssClass: 'frame-gold-prestige',
    unlockedByDefault: false
  },
  {
    id: 'frame_crimson_fire',
    nameKey: 'frameCrimsonFire',
    descKey: 'frameCrimsonFireDesc',
    cssClass: 'frame-crimson-fire',
    unlockedByDefault: false
  },
  {
    id: 'frame_cosmic_nebula',
    nameKey: 'frameCosmicNebula',
    descKey: 'frameCosmicNebulaDesc',
    cssClass: 'frame-cosmic-nebula',
    unlockedByDefault: false
  },
  {
    id: 'frame_cyber_glitch',
    nameKey: 'frameCyberGlitch',
    descKey: 'frameCyberGlitchDesc',
    cssClass: 'frame-cyber-glitch',
    unlockedByDefault: false
  },
  {
    id: 'frame_prismatic',
    nameKey: 'framePrismatic',
    descKey: 'framePrismaticDesc',
    cssClass: 'frame-prismatic',
    unlockedByDefault: false
  },
  {
    id: 'frame_cyber_alloy',
    nameKey: 'frameCyberAlloy',
    descKey: 'frameCyberAlloyDesc',
    cssClass: 'frame-cyber-alloy',
    unlockedByDefault: false
  },
  {
    id: 'frame_baroque_gold',
    nameKey: 'frameBaroqueGold',
    descKey: 'frameBaroqueGoldDesc',
    cssClass: 'frame-baroque-gold',
    unlockedByDefault: false
  },
  {
    id: 'frame_frostbound',
    nameKey: 'frameFrostbound',
    descKey: 'frameFrostboundDesc',
    cssClass: 'frame-frostbound',
    unlockedByDefault: false
  },
  {
    id: 'frame_street_drift',
    nameKey: 'frameStreetDrift',
    descKey: 'frameStreetDriftDesc',
    cssClass: 'frame-street-drift',
    unlockedByDefault: false
  },
  {
    id: 'frame_gothic_thorn',
    nameKey: 'frameGothicThorn',
    descKey: 'frameGothicThornDesc',
    cssClass: 'frame-gothic-thorn',
    unlockedByDefault: false
  },
  {
    id: 'frame_steampunk_chrono',
    nameKey: 'frameSteampunkChrono',
    descKey: 'frameSteampunkChronoDesc',
    cssClass: 'frame-steampunk-chrono',
    unlockedByDefault: false
  },
  {
    id: 'frame_sakura_urushi',
    nameKey: 'frameSakuraUrushi',
    descKey: 'frameSakuraUrushiDesc',
    cssClass: 'frame-sakura-urushi',
    unlockedByDefault: false
  },
  ...[
    ['moon_rime', 'frameMoonRime', 'collectionSanhua'],
    ['crimson_dawn', 'frameCrimsonDawn', 'collectionSanhua'],
    ['ice_moon_throne', 'frameIceMoonThrone', 'collectionSanhua'],
    ['silence_blades', 'frameSilenceBlades', 'collectionSanhua'],
    ['blossom_charm', 'frameBlossomCharm', 'collectionSanhua'],
    ['abyss_portal', 'frameAbyssPortal', 'collectionCosmic'],
    ['cassette_808', 'frameCassette808', 'collectionPhonk'],
    ['champion_crown', 'frameChampionCrown', 'collectionPrestige'],
    ['silver_crown', 'frameSilverCrown', 'collectionPrestige'],
    ['leader_crown', 'frameLeaderCrown', 'collectionPrestige'],
    ['neon_archive', 'frameNeonArchive', 'collectionPrestige'],
    ['star_forge', 'frameStarForge', 'collectionPrestige'],
    ['eared_melon', 'frameEaredMelon', 'collectionPrestige']
  ].map(([slug, key, group]) => collectionItem(`frame_${slug}`, key, group, `frame-collection frame-${slug.replaceAll('_', '-')}`))
];

export const TITLES = [
  {
    id: 'title_novice',
    nameKey: 'titleNovice',
    descKey: 'titleNoviceDesc',
    unlockedByDefault: true
  },
  {
    id: 'title_steel_fingers',
    nameKey: 'titleSteelFingers',
    descKey: 'titleSteelFingersDesc',
    unlockedByDefault: false
  },
  {
    id: 'title_speed_demon',
    nameKey: 'titleSpeedDemon',
    descKey: 'titleSpeedDemonDesc',
    unlockedByDefault: false
  },
  {
    id: 'title_no_mercy',
    nameKey: 'titleNoMercy',
    descKey: 'titleNoMercyDesc',
    unlockedByDefault: false
  },
  {
    id: 'title_night_pianist',
    nameKey: 'titleNightPianist',
    descKey: 'titleNightPianistDesc',
    unlockedByDefault: false
  },
  {
    id: 'title_perfectionist',
    nameKey: 'titlePerfectionist',
    descKey: 'titlePerfectionistDesc',
    unlockedByDefault: false
  },
  {
    id: 'title_combo_master',
    nameKey: 'titleComboMaster',
    descKey: 'titleComboMasterDesc',
    unlockedByDefault: false
  },
  {
    id: 'title_star_collector',
    nameKey: 'titleStarCollector',
    descKey: 'titleStarCollectorDesc',
    unlockedByDefault: false
  },
  {
    id: 'title_neon_legend',
    nameKey: 'titleNeonLegend',
    descKey: 'titleNeonLegendDesc',
    unlockedByDefault: false
  },
  {
    id: 'title_one_with_phonk',
    nameKey: 'titleOneWithPhonk',
    descKey: 'titleOneWithPhonkDesc',
    unlockedByDefault: false
  },
  {
    id: 'title_night_drift_king',
    nameKey: 'titleNightDriftKing',
    descKey: 'titleNightDriftKingDesc',
    unlockedByDefault: false
  },
  {
    id: 'title_808_impulse',
    nameKey: 'title808Impulse',
    descKey: 'title808ImpulseDesc',
    unlockedByDefault: false
  },
  {
    id: 'title_highway_ghost',
    nameKey: 'titleHighwayGhost',
    descKey: 'titleHighwayGhostDesc',
    unlockedByDefault: false
  },
  {
    id: 'title_surgical_precision',
    nameKey: 'titleSurgicalPrecision',
    descKey: 'titleSurgicalPrecisionDesc',
    unlockedByDefault: false
  },
  {
    id: 'title_blade_dancer',
    nameKey: 'titleBladeDancer',
    descKey: 'titleBladeDancerDesc',
    unlockedByDefault: false
  },
  {
    id: 'title_supersonic',
    nameKey: 'titleSupersonic',
    descKey: 'titleSupersonicDesc',
    unlockedByDefault: false
  },
  {
    id: 'title_flawless_streak',
    nameKey: 'titleFlawlessStreak',
    descKey: 'titleFlawlessStreakDesc',
    unlockedByDefault: false
  },
  {
    id: 'title_absolute_ear',
    nameKey: 'titleAbsoluteEar',
    descKey: 'titleAbsoluteEarDesc',
    unlockedByDefault: false
  },
  {
    id: 'title_blood_moon',
    nameKey: 'titleBloodMoon',
    descKey: 'titleBloodMoonDesc',
    unlockedByDefault: false
  },
  {
    id: 'title_crystal_heart',
    nameKey: 'titleCrystalHeart',
    descKey: 'titleCrystalHeartDesc',
    unlockedByDefault: false
  },
  {
    id: 'title_synth_pulse',
    nameKey: 'titleSynthPulse',
    descKey: 'titleSynthPulseDesc',
    unlockedByDefault: false
  },
  {
    id: 'title_one_sec_away',
    nameKey: 'titleOneSecAway',
    descKey: 'titleOneSecAwayDesc',
    unlockedByDefault: false
  },
  {
    id: 'title_lucky_777',
    nameKey: 'titleLucky777',
    descKey: 'titleLucky777Desc',
    unlockedByDefault: false
  },
  {
    id: 'title_neon_insomnia',
    nameKey: 'titleNeonInsomnia',
    descKey: 'titleNeonInsomniaDesc',
    unlockedByDefault: false
  },
  {
    id: 'title_iron_patience',
    nameKey: 'titleIronPatience',
    descKey: 'titleIronPatienceDesc',
    unlockedByDefault: false
  },
  ...[
    ['ice_rhythm', 'titleIceRhythm', 'collectionSanhua'],
    ['last_petal', 'titleLastPetal', 'collectionSanhua'],
    ['white_comet', 'titleWhiteComet', 'collectionSanhua'],
    ['frost_concert', 'titleFrostConcert', 'collectionSanhua'],
    ['moon_blade', 'titleMoonBlade', 'collectionSanhua'],
    ['blizzard_heart', 'titleBlizzardHeart', 'collectionSanhua'],
    ['calm_before_storm', 'titleCalmBeforeStorm', 'collectionSanhua'],
    ['crystal_keeper', 'titleCrystalKeeper', 'collectionSanhua'],
    ['snow_endures', 'titleSnowEndures', 'collectionSanhua'],
    ['ice_symphony', 'titleIceSymphony', 'collectionSanhua'],
    ['turbo_808', 'titleTurbo808', 'collectionPhonk'],
    ['night_racer', 'titleNightRacer', 'collectionPhonk'],
    ['no_brakes', 'titleNoBrakes', 'collectionPhonk'],
    ['tire_ash', 'titleTireAsh', 'collectionPhonk'],
    ['dark_subwoofer', 'titleDarkSubwoofer', 'collectionPhonk'],
    ['city_ghost', 'titleCityGhost', 'collectionPhonk'],
    ['redline', 'titleRedline', 'collectionPhonk'],
    ['tokyo_turn', 'titleTokyoTurn', 'collectionPhonk'],
    ['rhythm_architect', 'titleRhythmArchitect', 'collectionPrestige'],
    ['unbroken_pulse', 'titleUnbrokenPulse', 'collectionPrestige'],
    ['diamond_collector', 'titleDiamondCollector', 'collectionPrestige'],
    ['thousand_touches', 'titleThousandTouches', 'collectionPrestige'],
    ['beyond_bpm', 'titleBeyondBpm', 'collectionPrestige'],
    ['perfect_finale', 'titlePerfectFinale', 'collectionPrestige'],
    ['rhythm_in_blood', 'titleRhythmInBlood', 'collectionPrestige'],
    ['unknown_legend', 'titleUnknownLegend', 'collectionPrestige'],
    ['against_silence', 'titleAgainstSilence', 'collectionPrestige'],
    ['stage_owner', 'titleStageOwner', 'collectionPrestige'],
    ['world_collector', 'titleWorldCollector', 'collectionPrestige'],
    ['timeless', 'titleTimeless', 'collectionPrestige']
  ].map(([slug, key, group]) => collectionItem(`title_${slug}`, key, group))
];

// Hiyuki and Sanhua are one collection and use the same real theme ID: sanhua.
for (const item of [...FRAMES, ...TITLES]) {
  if (['frame_frostbound', 'title_blood_moon', 'title_crystal_heart'].includes(item.id)) item.collectionKey = 'collectionSanhua';
  if (['frame_street_drift', 'title_one_with_phonk', 'title_night_drift_king', 'title_808_impulse', 'title_highway_ghost'].includes(item.id)) item.collectionKey = 'collectionPhonk';
}

export function groupCosmetics(items) {
  const groups = ['collectionOriginal', 'collectionSanhua', 'collectionPhonk', 'collectionCosmic', 'collectionPrestige'];
  return groups.flatMap(group => items.filter(item => (item.collectionKey || 'collectionOriginal') === group));
}

// Observation only: no hit windows, scores, note positions or timing are changed.
export function createCosmeticsRun(muted = false) {
  return { perfectStreak: 0, maxPerfectStreak: 0, hadLateMiss: false, maxComboAfterMiss: 0,
    heardAudio: !muted, hadMiss: false };
}

export function recordCosmeticsJudgment(run, rating) {
  run.perfectStreak = rating === 'perfect' ? run.perfectStreak + 1 : 0;
  run.maxPerfectStreak = Math.max(run.maxPerfectStreak, run.perfectStreak);
}

export function recordCosmeticsMiss(run, progress = 0) {
  run.hadMiss = true;
  if (progress >= 0.9 && progress <= 1) run.hadLateMiss = true;
  recordCosmeticsJudgment(run, 'miss');
}

export function observeCosmeticsCombo(run, combo) {
  if (run.hadMiss) run.maxComboAfterMiss = Math.max(run.maxComboAfterMiss, combo);
}

/**
 * Client-side Canvas Image Compression
 * Crops image center-square and scales down to 128x128 WebP (or JPEG fallback).
 * Guarantees small payload (~4-8 KB Base64) from any 10-20MB camera photo.
 */
export async function compressImage(file, maxSize = 128, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = maxSize;
          canvas.height = maxSize;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            return reject(new Error('Canvas context unavailable'));
          }

          // Smart center-crop to 1:1 aspect ratio
          const srcWidth = img.naturalWidth || img.width;
          const srcHeight = img.naturalHeight || img.height;
          const srcSize = Math.min(srcWidth, srcHeight);
          const sx = (srcWidth - srcSize) / 2;
          const sy = (srcHeight - srcSize) / 2;

          ctx.clearRect(0, 0, maxSize, maxSize);
          ctx.drawImage(img, sx, sy, srcSize, srcSize, 0, 0, maxSize, maxSize);

          let dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl || !dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Get local cosmetics data from localStorage
 */
export function getLocalCosmetics() {
  let unlockedFrames = ['frame_none'];
  try {
    const raw = localStorage.getItem('neon_unlocked_frames');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) unlockedFrames = Array.from(new Set(['frame_none', ...parsed]));
    }
  } catch (e) {}

  let unlockedTitles = ['title_novice'];
  try {
    const raw = localStorage.getItem('neon_unlocked_titles');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) unlockedTitles = Array.from(new Set(['title_novice', ...parsed]));
    }
  } catch (e) {}

  let selectedFrame = localStorage.getItem('neon_selected_frame') || 'frame_none';
  if (!unlockedFrames.includes(selectedFrame)) {
    selectedFrame = 'frame_none';
  }

  let selectedTitle = localStorage.getItem('neon_selected_title') || 'title_novice';
  if (!unlockedTitles.includes(selectedTitle)) {
    selectedTitle = 'title_novice';
  }

  return {
    avatarUrl: localStorage.getItem('neon_user_avatar') || '',
    selectedFrame,
    unlockedFrames,
    selectedTitle,
    unlockedTitles,
    userStatus: (localStorage.getItem('neon_user_status') || '').slice(0, 60),
    favoriteTrack: localStorage.getItem('neon_favorite_track') || ''
  };
}

/**
 * Save cosmetics data to localStorage
 */
export function saveLocalCosmetics(updates = {}) {
  if (updates.avatarUrl !== undefined) {
    if (updates.avatarUrl) {
      localStorage.setItem('neon_user_avatar', updates.avatarUrl);
    } else {
      localStorage.removeItem('neon_user_avatar');
    }
  }

  if (updates.selectedFrame !== undefined) {
    localStorage.setItem('neon_selected_frame', updates.selectedFrame || 'frame_none');
  }

  if (updates.unlockedFrames !== undefined && Array.isArray(updates.unlockedFrames)) {
    const set = new Set(['frame_none', ...updates.unlockedFrames]);
    localStorage.setItem('neon_unlocked_frames', JSON.stringify(Array.from(set)));
  }

  if (updates.selectedTitle !== undefined) {
    localStorage.setItem('neon_selected_title', updates.selectedTitle || 'title_novice');
  }

  if (updates.unlockedTitles !== undefined && Array.isArray(updates.unlockedTitles)) {
    const set = new Set(['title_novice', ...updates.unlockedTitles]);
    localStorage.setItem('neon_unlocked_titles', JSON.stringify(Array.from(set)));
  }

  if (updates.userStatus !== undefined) {
    localStorage.setItem('neon_user_status', (updates.userStatus || '').slice(0, 60));
  }

  if (updates.favoriteTrack !== undefined) {
    localStorage.setItem('neon_favorite_track', updates.favoriteTrack || '');
  }
}

/**
 * Completely resets local cosmetics to default values (used on logout/switching accounts)
 */
export function resetLocalCosmetics() {
  localStorage.removeItem('neon_cosmetics_progress');
  localStorage.removeItem('neon_flawless_streak');
  localStorage.removeItem('neon_insomnia_plays');
  localStorage.removeItem('neon_user_avatar');
  localStorage.setItem('neon_selected_frame', 'frame_none');
  localStorage.setItem('neon_unlocked_frames', JSON.stringify(['frame_none']));
  localStorage.setItem('neon_selected_title', 'title_novice');
  localStorage.setItem('neon_unlocked_titles', JSON.stringify(['title_novice']));
  localStorage.removeItem('neon_user_status');
  localStorage.removeItem('neon_favorite_track');
}

/**
 * Safely applies cloud cosmetics to local storage for the currently authenticated user,
 * preventing any bleed from previous accounts or stale local data.
 * FIXED: We UNION local+cloud unlocked titles/frames so earned achievements are never lost.
 */
export function applyCloudCosmetics(cloudData = {}) {
  // Read what is currently stored locally BEFORE overwriting anything
  const local = getLocalCosmetics();

  const avatarUrl = cloudData.avatarUrl || local.avatarUrl || '';

  // For selected frame: prefer cloud if it is a real unlock, else keep local selection
  const selectedFrame = (cloudData.selectedFrame && cloudData.selectedFrame !== 'frame_none')
    ? cloudData.selectedFrame
    : local.selectedFrame || 'frame_none';

  // For selected title: prefer cloud if it is a real non-novice title, else keep local selection
  const selectedTitle = (cloudData.selectedTitle && cloudData.selectedTitle !== 'title_novice')
    ? cloudData.selectedTitle
    : (local.selectedTitle && local.selectedTitle !== 'title_novice' ? local.selectedTitle : 'title_novice');

  // UNION of local and cloud unlocked frames — never lose locally-earned frames
  const cloudFrames = Array.isArray(cloudData.unlockedFrames) ? cloudData.unlockedFrames : [];
  const unlockedFrames = Array.from(new Set(['frame_none', ...local.unlockedFrames, ...cloudFrames]));

  // UNION of local and cloud unlocked titles — never lose locally-earned titles
  const cloudTitles = Array.isArray(cloudData.unlockedTitles) ? cloudData.unlockedTitles : [];
  const unlockedTitles = Array.from(new Set(['title_novice', ...local.unlockedTitles, ...cloudTitles]));

  const userStatus = (cloudData.userStatus || local.userStatus || '').slice(0, 60);
  const favoriteTrack = cloudData.favoriteTrack || local.favoriteTrack || '';

  // Validate that selected frame/title is actually in the unlocked set
  const finalSelectedFrame = unlockedFrames.includes(selectedFrame) ? selectedFrame : 'frame_none';
  const finalSelectedTitle = unlockedTitles.includes(selectedTitle) ? selectedTitle : 'title_novice';

  saveLocalCosmetics({
    avatarUrl,
    selectedFrame: finalSelectedFrame,
    selectedTitle: finalSelectedTitle,
    unlockedFrames,
    unlockedTitles,
    userStatus,
    favoriteTrack
  });

  return {
    avatarUrl,
    selectedFrame: finalSelectedFrame,
    selectedTitle: finalSelectedTitle,
    unlockedFrames,
    unlockedTitles,
    userStatus,
    favoriteTrack
  };
}

/**
 * Unlock a specific frame
 */
export function unlockFrame(frameId, getText = null, showNotification = null) {
  const local = getLocalCosmetics();
  if (local.unlockedFrames.includes(frameId)) return false;

  local.unlockedFrames.push(frameId);
  saveLocalCosmetics({ unlockedFrames: local.unlockedFrames });

  const def = FRAMES.find(f => f.id === frameId);
  if (def && showNotification) {
    const frameName = getText ? (getText(def.nameKey) || def.id) : def.id;
    const template = getText ? (getText('unlockedFrameNotification') || '🎉 Розблоковано нову рамку: {name}!') : '🎉 Розблоковано нову рамку: {name}!';
    showNotification(template.replace('{name}', frameName));
  }
  return true;
}

/**
 * Unlock a specific title
 */
export function unlockTitle(titleId, getText = null, showNotification = null) {
  const local = getLocalCosmetics();
  if (local.unlockedTitles.includes(titleId)) return false;

  local.unlockedTitles.push(titleId);
  saveLocalCosmetics({ unlockedTitles: local.unlockedTitles });

  const def = TITLES.find(t => t.id === titleId);
  if (def && showNotification) {
    const titleName = getText ? (getText(def.nameKey) || def.id) : def.id;
    const template = getText ? (getText('unlockedTitleNotification') || '🎉 Отримано новий титул: {name}!') : '🎉 Отримано новий титул: {name}!';
    showNotification(template.replace('{name}', titleName));
  }
  return true;
}

export const RANK_FRAMES = [
  'frame_champion_crown',
  'frame_silver_crown',
  'frame_leader_crown'
];

/**
 * Synchronize dynamic leaderboard rank cosmetics.
 * Frame privileges:
 * - Rank 1: Champion Crown, Silver Crown, Leader's Crown
 * - Rank 2: Silver Crown, Leader's Crown (Champion Crown revoked)
 * - Rank 3: Leader's Crown (Champion & Silver Crowns revoked)
 * - Rank 4+ or unranked: All 3 rank crowns revoked
 * If an equipped frame is revoked, it is reset to 'frame_none'.
 */
export function syncRankCosmetics(globalRank, getText = null, showNotification = null) {
  const allowed = [];
  const r = Number.isInteger(globalRank) && globalRank > 0 ? globalRank : null;
  if (r === 1) {
    allowed.push('frame_champion_crown', 'frame_silver_crown', 'frame_leader_crown');
  } else if (r === 2) {
    allowed.push('frame_silver_crown', 'frame_leader_crown');
  } else if (r === 3) {
    allowed.push('frame_leader_crown');
  }

  const cosm = getLocalCosmetics();
  const currentFrames = cosm.unlockedFrames;
  const revoked = RANK_FRAMES.filter(f => currentFrames.includes(f) && !allowed.includes(f));
  const unlocked = [];

  if (revoked.length > 0) {
    const updatedFrames = currentFrames.filter(f => !revoked.includes(f));
    const shouldResetEquipped = revoked.includes(cosm.selectedFrame);
    saveLocalCosmetics({
      unlockedFrames: updatedFrames,
      ...(shouldResetEquipped ? { selectedFrame: 'frame_none' } : {})
    });
  }

  for (const frameId of allowed) {
    if (unlockFrame(frameId, getText, showNotification)) {
      unlocked.push(frameId);
    }
  }

  return { unlocked, revoked };
}

/**
 * Evaluate game results and award unlocked frames/titles
 */
export function checkCosmeticsUnlocks(ctx = {}, getText = null, showNotification = null) {
  const unlocked = [];

  if ('globalRank' in ctx) {
    const rankSync = syncRankCosmetics(ctx.globalRank, getText, showNotification);
    unlocked.push(...rankSync.unlocked);
  }

  // 1. Frame: Neon Start (Any 1 track played)
  if (ctx.playedSong || ctx.victory || (ctx.score && ctx.score > 0)) {
    if (unlockFrame('frame_neon_start', getText, showNotification)) {
      unlocked.push('frame_neon_start');
    }
  }

  // 2. Frame: Gold Prestige (3 gold stars earned on a track)
  if (ctx.starsEarned >= 3) {
    if (unlockFrame('frame_gold_prestige', getText, showNotification)) {
      unlocked.push('frame_gold_prestige');
    }
  }

  // 3. Frame: Crimson Fire & Title: No Mercy (Pass track in Hardcore mode)
  if (ctx.victory && ctx.isHardcore) {
    if (unlockFrame('frame_crimson_fire', getText, showNotification)) {
      unlocked.push('frame_crimson_fire');
    }
    if (unlockTitle('title_no_mercy', getText, showNotification)) {
      unlocked.push('title_no_mercy');
    }
  }

  // 4. Frame: Cosmic Nebula (400+ combo)
  if (ctx.maxCombo >= 400) {
    if (unlockFrame('frame_cosmic_nebula', getText, showNotification)) {
      unlocked.push('frame_cosmic_nebula');
    }
  }

  // 5. Frame: Cyber Glitch & Title: Speed Demon (Pass track at 1.4x speed)
  if (ctx.victory && ctx.speed >= 1.35) {
    if (unlockFrame('frame_cyber_glitch', getText, showNotification)) {
      unlocked.push('frame_cyber_glitch');
    }
    if (unlockTitle('title_speed_demon', getText, showNotification)) {
      unlocked.push('title_speed_demon');
    }
  }

  // 6. Frame: Prismatic Legend (800+ combo OR Diamond star)
  if (ctx.maxCombo >= 800 || ctx.diamondsEarned > 0) {
    if (unlockFrame('frame_prismatic', getText, showNotification)) {
      unlocked.push('frame_prismatic');
    }
  }

  // 7. Title: Steel Fingers (100+ Perfect hits in a single run)
  if ((ctx.perfectHits || 0) >= 100) {
    if (unlockTitle('title_steel_fingers', getText, showNotification)) {
      unlocked.push('title_steel_fingers');
    }
  }

  // 8. Title: Night Pianist (Play between 00:00 and 05:00)
  const currentHour = ctx.retrospective ? NaN : new Date(ctx.playedAt ?? Date.now()).getHours();
  if (currentHour >= 0 && currentHour < 5) {
    if (unlockTitle('title_night_pianist', getText, showNotification)) {
      unlocked.push('title_night_pianist');
    }
  }

  // 9. Title: Perfectionist (100% Perfect run: accuracy 100% and 0 misses on victory)
  if (ctx.victory && ctx.totalMisses === 0 && (ctx.accuracy >= 99.9 || (ctx.perfectHits > 0 && ctx.perfectHits === ctx.totalHits))) {
    if (unlockTitle('title_perfectionist', getText, showNotification)) {
      unlocked.push('title_perfectionist');
    }
  }

  // 10. Title: Combo Master (500+ combo)
  if (ctx.maxCombo >= 500) {
    if (unlockTitle('title_combo_master', getText, showNotification)) {
      unlocked.push('title_combo_master');
    }
  }

  // 11. Title: Star Collector (20+ total stars)
  if ((ctx.totalStarsInGame || 0) >= 20) {
    if (unlockTitle('title_star_collector', getText, showNotification)) {
      unlocked.push('title_star_collector');
    }
  }

  // 12. Title: Neon Legend (Diamond star earned OR secret track victory)
  if (ctx.diamondsEarned > 0 || (ctx.victory && ctx.isSecret)) {
    if (unlockTitle('title_neon_legend', getText, showNotification)) {
      unlocked.push('title_neon_legend');
    }
  }

  const earn = (id, condition) => {
    if (condition && (id.startsWith('frame_') ? unlockFrame : unlockTitle)(id, getText, showNotification)) unlocked.push(id);
  };
  const phonk = ctx.track?.isPhonk === true;
  const cold = ctx.themeId === 'sanhua';
  const victory = ctx.victory === true;
  const judged = ctx.totalJudgedNotes;
  const progress = getCosmeticsProgress();
  const totals = { ...progress, ...ctx };
  earn('frame_cyber_alloy', totals.hardCompletedLevelsCount >= 15 || (victory && ctx.speed >= 1.4));
  earn('frame_baroque_gold', ctx.totalGoldStars >= 50 || (ctx.globalRank >= 1 && ctx.globalRank <= 3));
  earn('frame_frostbound', cold && ctx.maxCombo >= 700);
  earn('title_one_with_phonk', phonk && victory && ctx.isHardcore);
  earn('frame_street_drift', getLocalCosmetics().unlockedTitles.includes('title_one_with_phonk'));
  earn('frame_gothic_thorn', totals.hardcoreVictoryCount >= 10 || (victory && ctx.isHardcore && ctx.isSecret));
  const playtime = ctx.totalPlaytimeSeconds ?? Number(localStorage.getItem('neon_total_playtime') || 0);
  earn('frame_steampunk_chrono', playtime >= 18000);
  earn('title_iron_patience', playtime >= 18000);
  earn('frame_sakura_urushi', victory && ctx.accuracy === 100 && ctx.totalMisses === 0);
  earn('title_night_drift_king', phonk && victory && ctx.speed >= 1.3 && ctx.holdsDropped === 0);
  earn('title_808_impulse', phonk && ctx.maxCombo >= 600);
  earn('title_highway_ghost', phonk && victory && ctx.goldStarsEarned >= 3 && (currentHour >= 23 || currentHour < 4));
  earn('title_surgical_precision', victory && judged > 0 && ctx.perfectHits / judged >= 0.95);
  earn('title_blade_dancer', victory && ctx.isHardcore && ctx.speed >= 1.4);
  earn('title_supersonic', victory && ctx.difficulty === 'hard' && ctx.speed >= 1.4);
  earn('title_flawless_streak', totals.flawlessVictoryStreak >= 3);
  earn('title_absolute_ear', ctx.diamondTracksCount >= 3);
  earn('title_blood_moon', cold && ctx.maxCombo >= 800);
  earn('title_crystal_heart', cold && victory && ctx.totalHolds > 0 && ctx.completedHolds === ctx.totalHolds);
  earn('title_synth_pulse', totals.completedLevelsCount >= 25);
  earn('title_one_sec_away', ctx.victory === false && ctx.songProgress >= 0.95);
  earn('title_lucky_777', ctx.hitCombo777 === true);
  earn('title_neon_insomnia', totals.neonInsomniaMatches >= 3);

  const fullHolds = victory && ctx.totalHolds > 0 && ctx.completedHolds === ctx.totalHolds;
  const cleanWin = victory && ctx.totalMisses === 0;
  const perfectChain = ctx.maxPerfectStreak >= 100;
  earn('title_ice_rhythm', cold && ctx.maxCombo >= 500);
  earn('title_last_petal', cold && cleanWin);
  earn('title_white_comet', cold && victory && ctx.speed >= 1.4);
  earn('title_frost_concert', cold && fullHolds);
  const iceDiamondTracks = new Set(totals.sanhuaDiamondTrackTitles || []);
  if (cold && ctx.diamondsEarned > 0 && ctx.track?.title) iceDiamondTracks.add(ctx.track.title);
  earn('title_moon_blade', iceDiamondTracks.size >= 3);
  earn('title_blizzard_heart', cold && victory && !ctx.isHardcore && ctx.enteredCriticalDanger === true);
  earn('title_calm_before_storm', cold && perfectChain);
  earn('title_crystal_keeper', totals.sanhuaTrackTitles?.length >= 10);
  earn('title_snow_endures', cold && victory && !ctx.isHardcore && ctx.hadLateMiss === true);
  earn('title_ice_symphony', cold && cleanWin && ctx.accuracy === 100);
  earn('title_turbo_808', phonk && ctx.maxCombo >= 1000);
  earn('title_night_racer', phonk && victory && currentHour >= 0 && currentHour < 5);
  // The launch menu's maximum is currently 1.4x; do not introduce an unreachable 1.5x condition.
  earn('title_no_brakes', phonk && victory && ctx.speed >= 1.4);
  earn('title_tire_ash', phonk && fullHolds);
  earn('title_dark_subwoofer', phonk && ctx.diamondsEarned > 0);
  earn('title_city_ghost', totals.phonkTrackTitles?.length >= 10);
  earn('title_redline', phonk && ctx.maxComboAfterMiss >= 300);
  earn('title_tokyo_turn', phonk && victory && ctx.isHardcore && ctx.speed >= 1.4);
  earn('title_rhythm_architect', totals.completedTrackTitles?.length >= 50);
  earn('title_unbroken_pulse', totals.bestVictoryStreak >= 10);
  earn('title_diamond_collector', ctx.diamondTracksCount >= 10);
  earn('title_thousand_touches', totals.totalPerfectHits >= 1000);
  earn('title_beyond_bpm', victory && ctx.speed >= 1.4);
  earn('title_perfect_finale', victory && ctx.finalPerfectStreak >= 100);
  earn('title_rhythm_in_blood', playtime >= 180000);
  earn('title_unknown_legend', totals.secretTrackTitles?.length >= 3);
  earn('title_against_silence', victory && ctx.mutedWholeRun === true);
  earn('title_stage_owner', ctx.globalRank === 1);
  earn('title_world_collector', Array.isArray(ctx.availableThemeIds) && ctx.availableThemeIds.length > 0 &&
    ctx.availableThemeIds.every(id => Array.isArray(ctx.unlockedThemeIds) && ctx.unlockedThemeIds.includes(id)));
  earn('title_timeless', totals.playedHours?.length === 24);

  earn('frame_moon_rime', totals.sanhuaVictoryCount >= 10);
  earn('frame_crimson_dawn', cold && ctx.maxCombo >= 800);
  earn('frame_ice_moon_throne', cold && ctx.diamondsEarned > 0);
  earn('frame_silence_blades', cold && perfectChain);
  earn('frame_blossom_charm', cold && cleanWin);
  earn('frame_abyss_portal', ctx.themeId === 'cosmic' && ctx.maxCombo >= 1000);
  earn('frame_cassette_808', totals.phonkVictoryCount >= 10);
  earn('frame_neon_archive', getLocalCosmetics().unlockedTitles.filter(id => TITLES.some(t => t.id === id && !t.unlockedByDefault)).length >= 20);
  earn('frame_star_forge', ctx.totalDiamondStars >= 10);
  earn('frame_eared_melon', (totals.hardHardcoreTrackTitles || []).length >= 1);
  return unlocked;
}

const counterKeys = ['completedLevelsCount', 'hardCompletedLevelsCount', 'hardcoreVictoryCount', 'flawlessVictoryStreak', 'neonInsomniaMatches',
  'victoryStreak', 'bestVictoryStreak', 'sanhuaVictoryCount', 'phonkVictoryCount', 'totalPerfectHits'];
const arrayKeys = ['completedTrackTitles', 'phonkTrackTitles', 'sanhuaTrackTitles', 'sanhuaDiamondTrackTitles', 'secretTrackTitles', 'playedHours', 'hardHardcoreTrackTitles'];
const validArray = (key, value) => [...new Set((Array.isArray(value) ? value : []).filter(v =>
  key === 'playedHours' ? Number.isInteger(v) && v >= 0 && v < 24 : typeof v === 'string' && v.length > 0))];
const number = value => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;

export function getCosmeticsProgress() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('neon_cosmetics_progress')) || {}; } catch {}
  return { ...Object.fromEntries([...counterKeys, 'updatedAt'].map(key => [key, number(saved[key])])),
    ...Object.fromEntries(arrayKeys.map(key => [key, validArray(key, saved[key])])) };
}

export function mergeCosmeticsProgress(cloud = {}) {
  if (!cloud || typeof cloud !== 'object') cloud = {};
  const local = getCosmeticsProgress();
  for (const key of counterKeys) {
    local[key] = ['flawlessVictoryStreak', 'victoryStreak'].includes(key)
      ? (number(cloud.updatedAt) > local.updatedAt ? number(cloud[key]) : local[key])
      : Math.max(local[key], number(cloud[key]));
  }
  for (const key of arrayKeys) local[key] = validArray(key, [...local[key], ...validArray(key, cloud[key])]);
  local.updatedAt = Math.max(local.updatedAt, number(cloud.updatedAt));
  localStorage.setItem('neon_cosmetics_progress', JSON.stringify(local));
  return local;
}

// This is called once at run start, before the result can change per-track records.
export function seedCosmeticsProgress(songs = []) {
  return mergeCosmeticsProgress(readCosmeticsHistory(songs).totals);
}

export function recordCosmeticsMatch(ctx) {
  const progress = getCosmeticsProgress();
  if (ctx.victory) {
    progress.completedLevelsCount++;
    if (ctx.difficulty === 'hard') progress.hardCompletedLevelsCount++;
    if (ctx.isHardcore) progress.hardcoreVictoryCount++;
    if (ctx.themeId === 'sanhua') progress.sanhuaVictoryCount++;
    if (ctx.track?.isPhonk === true) progress.phonkVictoryCount++;
    const title = ctx.track?.title;
    if (title) {
      if (ctx.difficulty === 'hard' && ctx.isHardcore === true) progress.hardHardcoreTrackTitles = validArray('hardHardcoreTrackTitles', [...progress.hardHardcoreTrackTitles, title]);
      progress.completedTrackTitles = validArray('completedTrackTitles', [...progress.completedTrackTitles, title]);
      if (ctx.themeId === 'sanhua') progress.sanhuaTrackTitles = validArray('sanhuaTrackTitles', [...progress.sanhuaTrackTitles, title]);
      if (ctx.track.isPhonk === true) progress.phonkTrackTitles = validArray('phonkTrackTitles', [...progress.phonkTrackTitles, title]);
      if (ctx.track.isSecret === true) progress.secretTrackTitles = validArray('secretTrackTitles', [...progress.secretTrackTitles, title]);
    }
  }
  // Track distinct Ice Theme Diamond Star tracks (regardless of victory)
  if (ctx.themeId === 'sanhua' && ctx.diamondsEarned > 0 && ctx.track?.title) {
    progress.sanhuaDiamondTrackTitles = validArray('sanhuaDiamondTrackTitles',
      [...(progress.sanhuaDiamondTrackTitles || []), ctx.track.title]);
  }
  progress.victoryStreak = ctx.victory ? progress.victoryStreak + 1 : 0;
  progress.bestVictoryStreak = Math.max(progress.bestVictoryStreak, progress.victoryStreak);
  progress.totalPerfectHits += number(ctx.perfectHits);
  progress.flawlessVictoryStreak = ctx.victory && ctx.totalMisses === 0 ? progress.flawlessVictoryStreak + 1 : 0;
  const hour = new Date(ctx.playedAt).getHours();
  progress.playedHours = validArray('playedHours', [...progress.playedHours, hour]);
  if (hour >= 3 && hour < 5) progress.neonInsomniaMatches++;
  progress.updatedAt = Date.now();
  localStorage.setItem('neon_cosmetics_progress', JSON.stringify(progress));
  return progress;
}

// Scores and stars can be saved on failures. Only completion fields prove victories.
export function readCosmeticsHistory(songs = []) {
  const tracks = new Map((Array.isArray(songs) ? songs : []).filter(Boolean).map(s => [s.title, s]));
  const records = [];
  const totals = { completedLevelsCount: 0, hardCompletedLevelsCount: 0, hardcoreVictoryCount: 0,
    totalGoldStars: 0, totalStarsInGame: 0, diamondTracksCount: 0, totalDiamondStars: 0,
    completedTrackTitles: [], phonkTrackTitles: [], secretTrackTitles: [], hardHardcoreTrackTitles: [], phonkVictoryCount: 0 };
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith('neon_rhythm_')) continue;
    let data;
    try { data = JSON.parse(localStorage.getItem(key)); } catch { continue; }
    if (!data || typeof data !== 'object' || Array.isArray(data)) continue;
    data = normalizeResultMetadata(data);
    const track = tracks.get(key.slice('neon_rhythm_'.length));
    const diffs = Array.isArray(data.completedDifficulties) ? data.completedDifficulties : [];
    const hardcore = data.hardcoreCompleted;
    const victory = hardcore || ['easy', 'normal', 'hard'].includes(data.difficulty) || diffs.some(d => ['easy', 'normal', 'hard'].includes(d));
    const hard = data.difficulty === 'hard' || diffs.includes('hard') || (data.legacyDifficulty === 'hardcore' && !diffs.includes('easy') && !diffs.includes('normal'));
    const types = Array.isArray(data.starTypes) ? data.starTypes : [];
    const gold = types.length ? types.filter(t => t === 1).length : number(data.stars);
    totals.totalGoldStars += gold;
    totals.totalStarsInGame += number(data.stars);
    totals.diamondTracksCount += types.includes(2) ? 1 : 0;
    totals.totalDiamondStars += types.filter(t => t === 2).length;
    if (victory) {
      const title = key.slice('neon_rhythm_'.length);
      totals.completedTrackTitles.push(title);
      if (data.hardHardcoreCompleted || ((hard || diffs.includes('hard')) && (hardcore || data.isHardcore))) totals.hardHardcoreTrackTitles.push(title);
      if (track?.isPhonk === true) { totals.phonkTrackTitles.push(title); totals.phonkVictoryCount++; }
      if (track?.isSecret === true) totals.secretTrackTitles.push(title);
    }
    totals.completedLevelsCount += victory ? 1 : 0;
    totals.hardCompletedLevelsCount += victory && hard ? 1 : 0;
    totals.hardcoreVictoryCount += hardcore ? 1 : 0;
    records.push({ retrospective: true, playedSong: number(data.score) > 0, victory,
      track, isSecret: track?.isSecret === true, isHardcore: hardcore,
      starsEarned: number(data.stars), diamondsEarned: types.includes(2) ? 1 : 0,
      // A stored max combo proves only combo thresholds, never exact-777 or a theme.
      maxCombo: number(data.maxCombo) });
  }
  return { records, totals };
}

/** Award only provable historical achievements; repeated calls return an empty delta. */
export function checkRetroactiveCosmeticsUnlocks(songsList = [], getText = null, showNotification = null, matchHistory = [], context = {}) {
  const { records, totals } = readCosmeticsHistory(songsList);
  const unlocked = [];
  for (const record of records) unlocked.push(...checkCosmeticsUnlocks(record, getText, showNotification));

  // Process matchHistory entries that may carry themeId evidence
  let nightMatches = 0;
  let historicalPerfectHits = 0;
  const historicalHours = [];
  const seenMatches = new Set();
  // Cumulative Ice-theme historical accumulators
  let historicalIceVictories = 0;
  const historicalIceTracks = new Set();
  const historicalIceDiamondTracks = new Set();

  for (const match of Array.isArray(matchHistory) ? matchHistory : []) {
    if (!match || (match.id && seenMatches.has(match.id))) continue;
    if (match.id) seenMatches.add(match.id);
    const track = songsList.find(s => s && ((s.id && s.id === match.trackId) || s.title === match.trackTitle));
    const isMatchHardHardcore = match.victory === true &&
      (match.difficulty === 'hard' || track?.difficulty === 'hard') &&
      (match.isHardcore === true || match.hardcoreCompleted === true);
    if (isMatchHardHardcore && (track?.title || match.trackTitle)) {
      totals.hardHardcoreTrackTitles.push(track?.title || match.trackTitle);
    }
    const date = new Date(match.playedAt || NaN);
    const hour = date.getHours();
    historicalHours.push(hour);
    historicalPerfectHits += number(match.perfectCount);
    if (hour >= 3 && hour < 5) nightMatches++;

    // Build a historical ctx with actual themeId where present; null if absent
    const themeId = (match.themeId && typeof match.themeId === 'string') ? match.themeId : null;
    const matchCtx = {
      retrospective: true, track, playedSong: true,
      maxCombo: number(match.maxCombo), perfectHits: number(match.perfectCount),
      themeId,
      victory: match.victory === true,
      totalMisses: typeof match.totalMisses === 'number' ? match.totalMisses : undefined,
      accuracy: typeof match.accuracy === 'number' ? match.accuracy : undefined,
      speed: typeof match.speed === 'number' ? match.speed : undefined,
      isHardcore: match.isHardcore === true,
      diamondsEarned: match.diamondsEarned > 0 ? match.diamondsEarned : 0,
      totalHolds: typeof match.totalHolds === 'number' ? match.totalHolds : undefined,
      completedHolds: typeof match.completedHolds === 'number' ? match.completedHolds : undefined,
      hadLateMiss: match.hadLateMiss === true,
      enteredCriticalDanger: match.enteredCriticalDanger === true,
      maxPerfectStreak: number(match.maxPerfectStreak)
    };

    unlocked.push(...checkCosmeticsUnlocks(matchCtx, getText, showNotification));

    // Ice-theme cumulative evidence
    if (themeId === 'sanhua') {
      const trackKey = match.trackId || match.trackTitle;
      if (match.victory === true) {
        historicalIceVictories++;
        if (trackKey) historicalIceTracks.add(trackKey);
      }
      if (match.diamondsEarned > 0 && trackKey) historicalIceDiamondTracks.add(trackKey);
    }

    if (hour >= 0 && hour < 5 && unlockTitle('title_night_pianist', getText, showNotification)) unlocked.push('title_night_pianist');
  }

  // Merge historical Ice-theme cumulative data into progress
  const progress0 = getCosmeticsProgress();
  const mergedSanhuaVictoryCount = Math.max(progress0.sanhuaVictoryCount, historicalIceVictories);
  const mergedSanhuaTrackTitles = validArray('sanhuaTrackTitles', [...(progress0.sanhuaTrackTitles || []), ...historicalIceTracks]);
  const mergedSanhuaDiamondTracks = validArray('sanhuaDiamondTrackTitles', [...(progress0.sanhuaDiamondTrackTitles || []), ...historicalIceDiamondTracks]);

  mergeCosmeticsProgress({
    ...totals,
    neonInsomniaMatches: nightMatches,
    totalPerfectHits: historicalPerfectHits,
    playedHours: historicalHours,
    sanhuaVictoryCount: mergedSanhuaVictoryCount,
    sanhuaTrackTitles: mergedSanhuaTrackTitles,
    sanhuaDiamondTrackTitles: mergedSanhuaDiamondTracks
  });

  const progress = getCosmeticsProgress();
  unlocked.push(...checkCosmeticsUnlocks({ ...totals, ...progress, ...context, retrospective: true,
    hardHardcoreTrackTitles: mergeCosmeticsProgress({ hardHardcoreTrackTitles: totals.hardHardcoreTrackTitles }).hardHardcoreTrackTitles,
    neonInsomniaMatches: Math.max(progress.neonInsomniaMatches, nightMatches),
    completedLevelsCount: Math.max(totals.completedLevelsCount, progress.completedLevelsCount),
    hardCompletedLevelsCount: Math.max(totals.hardCompletedLevelsCount, progress.hardCompletedLevelsCount),
    hardcoreVictoryCount: Math.max(totals.hardcoreVictoryCount, progress.hardcoreVictoryCount),
    sanhuaVictoryCount: Math.max(progress.sanhuaVictoryCount, historicalIceVictories),
    sanhuaTrackTitles: mergedSanhuaTrackTitles,
    sanhuaDiamondTrackTitles: mergedSanhuaDiamondTracks
  }, getText, showNotification));

  // Persist revision marker so new checks can be re-triggered on future updates
  localStorage.setItem('neon_cosmetics_revision', String(CURRENT_COSMETICS_REVISION));

  return [...new Set(unlocked)];
}

/**
 * Get CSS frame class name by ID
 */
export function getFrameCssClass(frameId) {
  const f = FRAMES.find(item => item.id === frameId);
  return f ? f.cssClass : '';
}

/**
 * Helper to render avatar inner markup (image or initial letter)
 */
export function getAvatarContent(name = 'Player', avatarUrl = '') {
  if (avatarUrl && typeof avatarUrl === 'string' && (avatarUrl.startsWith('data:image/') || avatarUrl.startsWith('http'))) {
    return `<img src="${avatarUrl}" class="avatar-photo" alt="${escapeHtml(name)}" />`;
  }
  const initial = (name || 'P').trim().slice(0, 1).toUpperCase();
  return `<span class="avatar-letter">${escapeHtml(initial)}</span>`;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

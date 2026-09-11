// ==========================================
// COSMETICS SYSTEM: AVATARS, FRAMES, TITLES & BIO
// Client-side 128x128 WebP compression, unlock evaluation, storage & rendering
// ==========================================

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
  }
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
  }
];

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
 */
export function applyCloudCosmetics(cloudData = {}) {
  const avatarUrl = cloudData.avatarUrl || '';
  const selectedFrame = (cloudData.selectedFrame && cloudData.selectedFrame !== 'frame_none') 
    ? cloudData.selectedFrame 
    : 'frame_none';
  const selectedTitle = (cloudData.selectedTitle && cloudData.selectedTitle !== 'title_novice') 
    ? cloudData.selectedTitle 
    : 'title_novice';
  const unlockedFrames = (Array.isArray(cloudData.unlockedFrames) && cloudData.unlockedFrames.length > 0)
    ? Array.from(new Set(['frame_none', ...cloudData.unlockedFrames]))
    : ['frame_none'];
  const unlockedTitles = (Array.isArray(cloudData.unlockedTitles) && cloudData.unlockedTitles.length > 0)
    ? Array.from(new Set(['title_novice', ...cloudData.unlockedTitles]))
    : ['title_novice'];
  const userStatus = (cloudData.userStatus || '').slice(0, 60);
  const favoriteTrack = cloudData.favoriteTrack || '';

  saveLocalCosmetics({
    avatarUrl,
    selectedFrame,
    selectedTitle,
    unlockedFrames,
    unlockedTitles,
    userStatus,
    favoriteTrack
  });

  return {
    avatarUrl,
    selectedFrame,
    selectedTitle,
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

/**
 * Evaluate game results and award unlocked frames/titles
 */
export function checkCosmeticsUnlocks(ctx = {}, getText = null, showNotification = null) {
  const unlocked = [];

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

  // 5. Frame: Cyber Glitch & Title: Speed Demon (Pass track at 1.6x speed)
  if (ctx.victory && ctx.speed >= 1.55) {
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
  const currentHour = new Date().getHours();
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

  return unlocked;
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

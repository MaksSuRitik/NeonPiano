// ==========================================
// FIELD THEMES & COINS ECONOMY MODULE
// Supports: Classic, Phrolova (Wuthering Waves), Dark Angel, Cosmic Galaxy
// ==========================================
import { 
  FIELD_THEMES, 
  CLASSIC_THEME, 
  PHROLOVA_THEME, 
  DARK_ANGEL_THEME, 
  COSMIC_THEME, 
  IUNO_THEME,
  HADO99_THEME,
  getThemeById 
} from "./themes/index.js?v=71.6";

export { 
  FIELD_THEMES, 
  CLASSIC_THEME, 
  PHROLOVA_THEME, 
  DARK_ANGEL_THEME, 
  COSMIC_THEME, 
  IUNO_THEME,
  HADO99_THEME,
  getThemeById 
};

/**
 * Calculates total coins earned from all levels in songsDB.
 * Rules:
 * - Up to 3 coins for 3 stars earned on a level.
 * - +3 bonus coins if level was cleared with Diamond (0 misses).
 * - Max coins per level = 6 coins.
 * - Coins from a level can only be earned ONCE (replaying does not award coins again).
 * - Existing stars & diamonds are automatically counted retroactively!
 */
export function calculateEarnedCoins(songsDB = []) {
  let earned = 0;
  const processedTitles = new Set();

  if (Array.isArray(songsDB)) {
    for (const song of songsDB) {
      if (!song || !song.title) continue;
      processedTitles.add(song.title);

      let saved = null;
      try {
        const raw = localStorage.getItem(`neon_rhythm_${song.title}`);
        if (raw) saved = JSON.parse(raw);
      } catch (e) {}

      if (saved && saved.stars > 0) {
        const starCoins = Math.min(3, Math.max(0, saved.stars || 0));
        let hasDiamond = false;
        if (Array.isArray(saved.starTypes)) {
          hasDiamond = saved.starTypes.some(t => t === 2);
        }
        const diamondCoins = hasDiamond ? 3 : 0;
        earned += (starCoins + diamondCoins);
      }
    }
  }

  // Also include any other valid track results in localStorage (e.g. secret songs, custom audio)
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('neon_rhythm_')) {
        const title = key.replace('neon_rhythm_', '');
        if (processedTitles.has(title)) continue;
        processedTitles.add(title);

        let saved = null;
        try {
          const raw = localStorage.getItem(key);
          if (raw) saved = JSON.parse(raw);
        } catch (e) {}

        if (saved && saved.stars > 0) {
          const starCoins = Math.min(3, Math.max(0, saved.stars || 0));
          let hasDiamond = false;
          if (Array.isArray(saved.starTypes)) {
            hasDiamond = saved.starTypes.some(t => t === 2);
          }
          const diamondCoins = hasDiamond ? 3 : 0;
          earned += (starCoins + diamondCoins);
        }
      }
    }
  } catch (e) {}

  return earned;
}

/**
 * Gets admin/bonus coins granted to the player.
 */
export function getBonusCoins() {
  const bonus = parseInt(localStorage.getItem('neon_bonus_coins') || '0', 10);
  return (isNaN(bonus) || bonus < 0) ? 0 : bonus;
}

/**
 * Sets admin/bonus coins granted to the player.
 */
export function setBonusCoins(amount) {
  const bonus = Math.max(0, parseInt(amount, 10) || 0);
  localStorage.setItem('neon_bonus_coins', String(bonus));
  return bonus;
}

/**
 * Gets user's coins balance, earned, bonus, and spent amounts.
 */
export function getCoinsData(songsDB = []) {
  const earned = calculateEarnedCoins(songsDB);
  const bonus = getBonusCoins();
  let spent = parseInt(localStorage.getItem('neon_spent_coins') || '0', 10);
  if (isNaN(spent) || spent < 0) spent = 0;
  const balance = Math.max(0, earned + bonus - spent);
  return { earned, bonus, spent, balance };
}

/**
 * Gets list of unlocked theme IDs.
 */
export function getUnlockedThemes() {
  let themes = ['classic'];
  try {
    const raw = localStorage.getItem('neon_unlocked_field_themes');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) themes = Array.from(new Set(['classic', ...parsed]));
    }
  } catch (e) {}
  return themes;
}

let previewThemeOverride = null;

/**
 * Sets or clears in-memory preview theme override for test drive mode.
 */
export function setPreviewThemeOverride(themeId) {
  previewThemeOverride = themeId || null;
}

export function getPreviewThemeOverride() {
  return previewThemeOverride;
}

/**
 * Gets currently active theme ID.
 */
export function getActiveThemeId() {
  if (previewThemeOverride) return previewThemeOverride;
  const unlocked = getUnlockedThemes();
  const active = localStorage.getItem('neon_active_field_theme') || 'classic';
  return unlocked.includes(active) ? active : 'classic';
}

/**
 * Gets currently active theme object.
 */
export function getActiveTheme() {
  const id = getActiveThemeId();
  return getThemeById(id);
}

/**
 * Sets active field theme.
 */
export function setActiveThemeId(themeId) {
  const unlocked = getUnlockedThemes();
  if (unlocked.includes(themeId)) {
    localStorage.setItem('neon_active_field_theme', themeId);
    return true;
  }
  return false;
}

/**
 * Buys a theme with coins.
 */
export function purchaseTheme(themeId, songsDB = []) {
  const theme = getThemeById(themeId);
  if (!theme) throw new Error("Тему не знайдено");

  const unlocked = getUnlockedThemes();
  if (unlocked.includes(themeId)) return { success: true, alreadyOwned: true };

  const { balance, spent } = getCoinsData(songsDB);
  if (balance < theme.price) {
    throw new Error("Недостатньо монет");
  }

  const newSpent = spent + theme.price;
  localStorage.setItem('neon_spent_coins', String(newSpent));

  const newUnlocked = [...unlocked, themeId];
  localStorage.setItem('neon_unlocked_field_themes', JSON.stringify(newUnlocked));
  localStorage.setItem('neon_active_field_theme', themeId);

  return { 
    success: true, 
    alreadyOwned: false, 
    newBalance: Math.max(0, balance - theme.price),
    unlockedThemes: newUnlocked
  };
}

/**
 * Applies cloud theme and bonus coins data to local storage.
 * FIXED: UNION local+cloud unlocked themes so purchased themes are never lost.
 */
export function applyCloudThemes(cloudData = {}) {
  // Read local themes first to merge (union), never overwrite locally-purchased themes
  const localUnlocked = getUnlockedThemes(); // always includes 'classic'

  let cloudUnlocked = ['classic'];
  if (Array.isArray(cloudData.unlockedFieldThemes) && cloudData.unlockedFieldThemes.length > 0) {
    cloudUnlocked = cloudData.unlockedFieldThemes;
  }

  // Union: keep all locally-unlocked AND all cloud-unlocked themes
  const merged = Array.from(new Set(['classic', ...localUnlocked, ...cloudUnlocked]));
  localStorage.setItem('neon_unlocked_field_themes', JSON.stringify(merged));

  if (cloudData.activeFieldTheme && merged.includes(cloudData.activeFieldTheme)) {
    localStorage.setItem('neon_active_field_theme', cloudData.activeFieldTheme);
  }

  if (typeof cloudData.spentCoins === 'number' && cloudData.spentCoins >= 0) {
    localStorage.setItem('neon_spent_coins', String(cloudData.spentCoins));
  }

  if (typeof cloudData.bonusCoins === 'number' && cloudData.bonusCoins >= 0) {
    localStorage.setItem('neon_bonus_coins', String(cloudData.bonusCoins));
  }
}

/**
 * Resets local themes and bonus coins on logout.
 */
export function resetLocalThemes() {
  localStorage.setItem('neon_unlocked_field_themes', JSON.stringify(['classic']));
  localStorage.setItem('neon_active_field_theme', 'classic');
  localStorage.removeItem('neon_spent_coins');
  localStorage.removeItem('neon_bonus_coins');
}

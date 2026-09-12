// ==========================================
// FIELD THEMES REGISTRY & HELPERS
// ==========================================
import { CLASSIC_THEME } from "./classic.js";
import { PHROLOVA_THEME } from "./phrolova.js?v=72.8";
import { DARK_ANGEL_THEME } from "./darkAngel.js";
import { COSMIC_THEME } from "./cosmic.js";
import { IUNO_THEME } from "./iuno.js";
import { HADO99_THEME } from "./hado99.js";

export { CLASSIC_THEME, PHROLOVA_THEME, DARK_ANGEL_THEME, COSMIC_THEME, IUNO_THEME, HADO99_THEME };

export const FIELD_THEMES = [
  CLASSIC_THEME,
  PHROLOVA_THEME,
  DARK_ANGEL_THEME,
  COSMIC_THEME,
  IUNO_THEME,
  HADO99_THEME
];

/**
 * Gets theme object by ID with fallback to classic.
 */
export function getThemeById(themeId) {
  return FIELD_THEMES.find(t => t.id === themeId) || CLASSIC_THEME;
}

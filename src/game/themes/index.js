// ==========================================
// FIELD THEMES REGISTRY & HELPERS
// ==========================================
import { CLASSIC_THEME } from "./classic.js?v=75.8";
import { PHROLOVA_THEME } from "./phrolova.js?v=75.8";
import { DARK_ANGEL_THEME } from "./darkAngel.js?v=75.8";
import { COSMIC_THEME } from "./cosmic.js?v=75.8";
import { IUNO_THEME } from "./iuno.js?v=75.8";
import { HADO99_THEME } from "./hado99.js?v=75.8";

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

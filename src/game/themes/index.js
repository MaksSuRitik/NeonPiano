// ==========================================
// FIELD THEMES REGISTRY & HELPERS
// ==========================================
import { CLASSIC_THEME } from "./classic.js?v=77.0";
import { PHROLOVA_THEME } from "./phrolova.js?v=77.0";
import { DARK_ANGEL_THEME } from "./darkAngel.js?v=77.0";
import { COSMIC_THEME } from "./cosmic.js?v=77.0";
import { IUNO_THEME } from "./iuno.js?v=77.0";
import { HADO99_THEME } from "./hado99.js?v=77.0";
import { SANHUA_THEME } from "./sanhua.js?v=97.0";

export { CLASSIC_THEME, PHROLOVA_THEME, DARK_ANGEL_THEME, COSMIC_THEME, IUNO_THEME, HADO99_THEME, SANHUA_THEME };

export const FIELD_THEMES = [
  CLASSIC_THEME,
  PHROLOVA_THEME,
  DARK_ANGEL_THEME,
  COSMIC_THEME,
  IUNO_THEME,
  HADO99_THEME,
  SANHUA_THEME
];

/**
 * Gets theme object by ID with fallback to classic.
 */
export function getThemeById(themeId) {
  return FIELD_THEMES.find(t => t.id === themeId) || CLASSIC_THEME;
}

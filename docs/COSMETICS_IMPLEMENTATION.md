# Physical frames and cosmetics implementation

## Scope and counts

The checkout already contained partial definitions for the requested items. This implementation corrects and completes those definitions and integrations without duplicating them.

Exactly **7 physical frames** and **16 new titles** relative to the original cosmetics set: **14 frames and 25 titles total**, including defaults. No Octave Grandmaster.

### Frame IDs

- `frame_cyber_alloy`
- `frame_baroque_gold`
- `frame_frostbound`
- `frame_street_drift`
- `frame_gothic_thorn`
- `frame_steampunk_chrono`
- `frame_sakura_urushi`

### Title IDs

- `title_one_with_phonk`
- `title_night_drift_king`
- `title_808_impulse`
- `title_highway_ghost`
- `title_surgical_precision`
- `title_blade_dancer`
- `title_supersonic`
- `title_flawless_streak`
- `title_absolute_ear`
- `title_blood_moon`
- `title_crystal_heart`
- `title_synth_pulse`
- `title_one_sec_away`
- `title_lucky_777`
- `title_neon_insomnia`
- `title_iron_patience`

## Retroactive support

Existing per-track completion metadata, star types, playtime, current leaderboard rank, and decrypted legacy `game_stats` are evaluated. Positive scores alone do not prove completion. Phonk qualification requires the catalogue's exact `isPhonk === true` flag.

- Cyber Alloy: 15 proven Hard completions.
- Imperial Gold: 50 owned Gold Stars or a current Top 3 position.
- Street Drift / One with Phonk: proven Phonk Hardcore completion, or existing title ownership for the frame.
- Gothic Thorn: 10 proven Hardcore completions or a Hardcore secret-track completion.
- Chrono Mechanics / Iron Patience: at least 18,000 seconds.
- 808 Pulse: recorded 600+ combo tied to a Phonk track.
- Perfect Pitch: diamond ownership on three distinct tracks.
- Synthetic Pulse: 25 proven completions.
- Neon Insomniacs: three dated historical matches in the local 03:00–05:00 window, or the new persistent counter.
- Existing Neon Start, Gold Prestige, Crimson Fire, Cosmic Nebula, Prismatic, No Mercy, Steel Fingers, Night Pianist, Combo Master, Star Collector and Neon Legend receive awards when corresponding reliable evidence exists.

Future cumulative counters also qualify during retroactive checks. Evaluation is idempotent, preserves equipment, and notifies only for newly owned IDs. Cloud ownership updates use `arrayUnion` for the delta. Legacy history and current Top 3 are fetched once per signed-in user per session; customization opening does not repeatedly query Firestore.

## Future-run evidence required

Old records do not prove the required conjunctions for Frostbound, Sakura & Urushi, Night Drift King, Highway Ghost, Surgical Precision, Blade Dancer, Supersonic, Flawless Streak, Blood Moon, Crystal Heart, One Second Away or Lucky 777. Cyber Alloy's speed alternative also requires a future run.

The actual theme ID is `sanhua`. Hardcore fails on the first miss, so a surviving critical-danger Hardcore victory is currently unreachable. Blade Dancer requires both conditions; no health system or gameplay exception was invented.

Combo can advance by 10 on holds. Lucky 777 records an exact observed value, including before a break; it never infers that 777 happened from a higher maximum.

## Persistence and runtime fields

`neon_cosmetics_progress` / Firestore `user_progress.cosmeticsProgress` contains:

- `completedLevelsCount`
- `hardCompletedLevelsCount`
- `hardcoreVictoryCount`
- `flawlessVictoryStreak`
- `neonInsomniaMatches`
- `updatedAt` (for resolving the latest streak, including resets to zero)

Proven historical totals seed the counters before a match. Cumulative values merge by maximum, consistent with the existing playtime approach; they are not additive across simultaneously active devices. Missing or malformed fields normalize safely. Counters reset on account logout through the existing reset path.

Run-only additions: `completedHolds`, `hitCombo777`, `cosmeticsResultRecorded`, `cosmeticsPlayedAt`. Existing `survivedCritical`, `holdsDropped`, total holds and judged-hit counters are reused. The hold auto-capture path now includes its existing Perfect judgment in the cosmetics Perfect count. Scoring and hit windows are unchanged.

## Admin search

Both HTML entry points contain the localized search field above `admin-select-level`. `renderAdminLevelOptions(filterQuery = '')` uses the shared in-memory filter in `src/ui/adminLevelSearch.js`.

The filter normalizes whitespace and case, matches titles/artists, preserves surviving selection, selects the first remaining track, and renders one selected disabled empty option. Search events use the already loaded player-progress snapshot; they make no Firestore request per keystroke. Stale asynchronous responses cannot overwrite a newly selected track. A single `oninput` handler follows the existing lifecycle.

## Localization

All **48 specified keys per language** are complete: 7 frame names + 7 unlock instructions, 16 title names + 16 unlock instructions, and the two admin search keys. Following the user's correction, the text beneath each new cosmetic explains how to obtain it instead of describing its appearance or story. Existing semantic keys are retained. The i18n language-change subscription refreshes dynamic cosmetics and level options immediately; the placeholder uses the existing DOM translation mechanism.

## Changed files

- `src/game/cosmetics.js`
- `src/danceCore.js`
- `src/config/firebase.js` (exports the existing Firebase SDK's `arrayUnion` helper)
- `src/ui/adminLevelSearch.js`
- `css/style.css`
- `index.html`, `dance.html`
- `src/i18n/ua.js`, `src/i18n/ru.js`, `src/i18n/en.js`, `src/i18n/index.js`
- `tests/cosmetics-unlocks.test.mjs`
- `tests/fixtures/cosmetics-preview.html` (local visual fixture using production CSS, registries and dictionaries; no Firebase)
- `docs/COSMETICS_IMPLEMENTATION.md`

## Validation

- `node --test tests/*.test.mjs`: all 6 test files pass.
- Direct cosmetics test execution: 13 tests pass, including exact thresholds, negative cases, malformed data, retroactive idempotence, localization parity, counters, and the production admin option renderer.
- JavaScript syntax checks and `git diff --check` pass.
- Browser: actual customization modal displays the registered frames and translated descriptions. Visual fixture inspected all seven materials at customization/profile/leaderboard sizes in dark and light themes, plus all 16 title translations across EN/UA/RU and localized empty search state.
- Signed-in admin Firestore workflows and equipping a locked frame on a real account were not manually exercised in the signed-out preview session. Rendering at those avatar sizes was verified in the isolated fixture.

Existing cosmetics IDs, ownership and equipped selections are preserved. No unrelated gameplay timing, scoring, beatmap generation, audio, hit detection, note rendering, or Hiyuki/Sanhua/theme rendering systems were modified. Only achievement observation was added to the existing run lifecycle.

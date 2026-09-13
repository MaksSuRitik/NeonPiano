// ==========================================
// I18N SERVICE: LANGUAGE MANAGER
// ==========================================
import ua from "./ua.js?v=39.0";
import en from "./en.js?v=39.0";
import ru from "./ru.js?v=39.0";

const dictionaries = { UA: ua, EN: en, RU: ru };
const STORAGE_KEY = "siteLang";

let currentLang = localStorage.getItem(STORAGE_KEY) || "RU";
if (!dictionaries[currentLang]) {
  // Normalize legacy keys like 'MEOW'
  currentLang = "RU";
  localStorage.setItem(STORAGE_KEY, "RU");
}

let listeners = [];

export const i18n = {
  getLanguage() {
    return currentLang;
  },

  setLanguage(lang) {
    const cleanLang = (lang || "").toUpperCase();
    if (dictionaries[cleanLang]) {
      currentLang = cleanLang;
      localStorage.setItem(STORAGE_KEY, cleanLang);
      this.updateDOM();
      listeners.forEach(fn => {
        try { fn(currentLang); } catch (e) { console.error("i18n listener error:", e); }
      });
    }
  },

  t(key, fallback = "") {
    const dict = dictionaries[currentLang] || dictionaries.UA;
    if (dict && dict[key] !== undefined) {
      return dict[key];
    }
    // Fallback to UA if missing
    if (dictionaries.UA && dictionaries.UA[key] !== undefined) {
      return dictionaries.UA[key];
    }
    if (fallback) return fallback;
    const defaultFallbacks = {
      filterAll: "Всі треки",
      filterCompleted: "Пройдені",
      filterUnplayed: "Не пройдені",
      filterHardcore: "Хардкор",
      filterSecret: "Секретні",
      sortLabel: "Сортування:",
      sortDefault: "За замовчуванням",
      sortScore: "За рекордом",
      sortTitle: "За назвою (А-Я)",
      sortDuration: "За тривалістю",
      sortDurationAsc: currentLang === "RU" ? "Сначала короткие" : (currentLang === "EN" ? "Shortest first" : "Спочатку короткі"),
      sortDurationDesc: currentLang === "RU" ? "Сначала долгие" : (currentLang === "EN" ? "Longest first" : "Спочатку довгі"),
      tracksCountLabel: "Треків: {count}",
      tracksCompletedCount: "Пройдено: {completed} з {total}",
      lbLimitLabel: "Ліміт:",
      friendsTitle: "Друзі",
      profileAddFriend: "Додати в друзі",
      profileInFriends: "У друзях",
      adminSpotifyLabel: currentLang === "RU" ? "Автозаполнение (Spotify / YouTube Music):" : (currentLang === "EN" ? "Autofill (Spotify / YouTube Music):" : "Автозаповнення (Spotify / YouTube Music):"),
      adminSpotifyFetchBtn: currentLang === "RU" ? "Получить данные" : (currentLang === "EN" ? "Fetch Data" : "Отримати дані"),
      adminSpotifyPlaceholder: currentLang === "RU" ? "Вставьте ссылку Spotify или YouTube Music..." : (currentLang === "EN" ? "Paste Spotify or YouTube Music link..." : "Вставте посилання Spotify або YouTube Music..."),
      adminSpotifyFetching: currentLang === "RU" ? "Получение данных из Spotify..." : (currentLang === "EN" ? "Fetching Spotify metadata..." : "Отримання даних зі Spotify..."),
      adminYouTubeFetching: currentLang === "RU" ? "Получение данных из YouTube Music..." : (currentLang === "EN" ? "Fetching YouTube Music metadata..." : "Отримання даних із YouTube Music..."),
      adminSpotifySuccess: currentLang === "RU" ? "Данные трека успешно заполнены!" : (currentLang === "EN" ? "Track metadata filled successfully!" : "Дані треку успішно заповнено!"),
      adminSpotifyError: currentLang === "RU" ? "Не удалось получить данные трека. Проверьте ссылку." : (currentLang === "EN" ? "Could not fetch track data. Please check link." : "Не вдалося отримати дані треку. Перевірте посилання."),
      adminSpotifyRedirectHint: currentLang === "RU" ? "Ссылка Spotify / YouTube распознана! Метаданные заполнены. Для аудио укажите прямую ссылку на .mp3 файл (Catbox.moe)." : (currentLang === "EN" ? "Spotify / YouTube link detected! Metadata filled. For audio playback, provide a direct link (e.g. Catbox.moe)." : "Посилання Spotify / YouTube розпізнано! Метадані заповнено. Для аудіо вкажіть пряме посилання на .mp3 файл (Catbox.moe)."),
      trackAlreadyExists: currentLang === "RU" ? "Этот трек уже есть в фонотеке!" : (currentLang === "EN" ? "This track is already in the library!" : "Цей трек вже є у фонотеці!"),
      trackAlreadyExistsUrl: currentLang === "RU" ? "Трек с такой аудио-ссылкой уже добавлен в фонотеку!" : (currentLang === "EN" ? "A track with this audio URL is already in the library!" : "Трек з таким аудіо-посиланням уже є у фонотеці!"),
      trackAlreadyExistsName: currentLang === "RU" ? "Трек с таким названием и автором уже есть в фонотеке!" : (currentLang === "EN" ? "A track with this title and artist already exists in the library!" : "Трек з такою назвою та автором уже є у фонотеці!")
    };
    return defaultFallbacks[key] || key;
  },

  onLanguageChange(callback) {
    listeners.push(callback);
    return () => {
      listeners = listeners.filter(cb => cb !== callback);
    };
  },

  updateDOM() {
    // Translate text content (NEVER overwrite with raw key name!)
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const translation = this.t(key);
      if (translation && translation !== key) {
        el.textContent = translation;
      }
    });

    // Translate input placeholders (NEVER overwrite with raw key name!)
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      const translation = this.t(key);
      if (translation && translation !== key) {
        el.placeholder = translation;
      }
    });

    // Translate inner HTML (NEVER overwrite with raw key name!)
    document.querySelectorAll("[data-i18n-html]").forEach(el => {
      const key = el.getAttribute("data-i18n-html");
      const translation = this.t(key);
      if (translation && translation !== key) {
        el.innerHTML = translation;
      }
    });

    // Translate tooltips and titles (NEVER overwrite with raw key name!)
    document.querySelectorAll("[data-i18n-title]").forEach(el => {
      const key = el.getAttribute("data-i18n-title");
      const translation = this.t(key);
      if (translation && translation !== key) {
        el.title = translation;
      }
    });

    // Update current language indicator badge in UI
    const langBadge = document.getElementById("current-lang-text");
    if (langBadge) {
      langBadge.textContent = currentLang;
    }
  }
};

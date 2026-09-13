/* ==========================================
   NEON PIANO: ULTIMATE EDITION + FIREBASE
   Рендерер: Canvas 2D (Оптимізовано для GPU/Пам'яті)
   Розробник: Максим Сухарєв, студент гр. 302-TH
   Навчальний заклад: Національний університет «Полтавська політехніка імені Юрія Кондратюка»
   ========================================== */

// ==========================================
// POLYFILL: CanvasRenderingContext2D.prototype.roundRect
// Required for Android < 12 / Chrome < 99 (e.g. Redmi Note 9 with Chrome 88 WebView).
// Without this polyfill, any call to ctx.roundRect() throws TypeError and crashes the render loop.
// ==========================================
(function patchRoundRect() {
  if (typeof CanvasRenderingContext2D === 'undefined') return;
  if (typeof CanvasRenderingContext2D.prototype.roundRect === 'function') return;

  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
    let r = 0;
    if (typeof radii === 'number') {
      r = radii;
    } else if (Array.isArray(radii) && radii.length > 0) {
      r = radii[0];
    } else if (radii && typeof radii === 'object') {
      r = radii.topLeft || 0;
    }
    r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.arcTo(x + w, y,     x + w, y + r,     r);
    this.lineTo(x + w, y + h - r);
    this.arcTo(x + w, y + h, x + w - r, y + h, r);
    this.lineTo(x + r, y + h);
    this.arcTo(x,     y + h, x,     y + h - r, r);
    this.lineTo(x, y + r);
    this.arcTo(x,     y,     x + r, y,          r);
    this.closePath();
  };
})();

// Also patch OffscreenCanvasRenderingContext2D if present (some browsers)
if (typeof OffscreenCanvasRenderingContext2D !== 'undefined' &&
    typeof OffscreenCanvasRenderingContext2D.prototype.roundRect !== 'function') {
  OffscreenCanvasRenderingContext2D.prototype.roundRect =
    CanvasRenderingContext2D.prototype.roundRect;
}

// Імпорт модулів Firebase та локальних сервісів
import {
    db, collection, addDoc, getDoc, getDocs, query, orderBy, limit, where, updateDoc, doc, setDoc, serverTimestamp
} from "./config/firebase.js";
import { saveAudioToIndexedDB, getAudioFromIndexedDB, deleteAudioFromIndexedDB } from "./services/localAudioStorage.js";
import { addTrackByUrl, uploadTrack, updateTrackAdmin, calculateAudioDuration, deleteTrack, deletePlayerAdmin, updatePlayerNameAdmin, getAllTracks, requireAdmin, calculateAudioDurationFromUrl, fetchSpotifyTrackMetadata, findDuplicateTrack, calculateFileHash, getThemeSettings, saveThemeSettings } from "./services/admin.js?v=75.4";
import { getCurrentUser, loginUser, registerUser, logoutUser, onAuthStateChanged, updateUserUsername, updateUserPassword, deleteCurrentUserAccount } from "./services/auth.js?v=40.0";
import { encryptGameStats } from "./services/crypto.js?v=39.0";
import * as FieldThemes from "./game/fieldThemes.js?v=75.4";
import { pixiRenderer } from "./game/render/PixiRenderer.js?v=75.4";

// ==========================================
// Системні константи та базова конфігурація гри.
// ==========================================

const KEYS = ['KeyS', 'KeyD', 'KeyJ', 'KeyK'];

const CONFIG = {
    speedStart: 800,
    speedEnd: 800, // Фіксована стабільна швидкість: прибрано поступове прискорення треку
    speedStartSecret: 700,
    speedEndSecret: 700,
    hitPosition: 0.89,
    noteHeight: 210,
    showHitbox: false, // Хітбокси приховані за запитом користувача
    hitScale: 1.15,
    missLimit: 3,
    scorePerfect: 50,
    scoreGood: 20,
    scoreHoldTick: 5,
    // Я зберіг ці кольори для точної відповідності пікселям, щоб забезпечити правильний контраст на різних екранах.
    colorsDark: {
        tap: ['#00d2ff', '#3a7bd5'],
        long: ['#ff0099', '#493240'],
        dead: ['#555', '#222'],
        released: ['#666', '#444'],
        stroke: "rgba(255,255,255,0.8)",
        laneLine: "rgba(255,255,255,0.1)"
    },
    colorsLight: {
        tap: ['#0077aa', '#005588'],
        long: ['#aa0066', '#770044'],
        dead: ['#999', '#777'],
        released: ['#888', '#666'],
        stroke: "#000000",
        laneLine: "rgba(0,0,0,0.2)"
    }
};

const PALETTES = {
    // Палітри для різних рівнів комбо. М'які, комфортні для очей пастельно-неонові відтінки (Eye-Care)
    STEEL: { 
        light: '#38bdf8', main: '#0284c7', dark: '#0369a1', glow: 'rgba(56, 189, 248, 0.45)', border: '#38bdf8',
        long1: '#6366f1', long2: '#0284c7'
    },
    ELECTRIC: { 
        tap1: '#06b6d4', tap2: '#0e7490', glow: 'rgba(6, 182, 212, 0.45)', border: '#22d3ee',
        long1: '#0891b2', long2: '#0284c7'
    },
    GOLD: { 
        black: '#d97706', choco: '#b45309', amber: '#f59e0b', light: '#fbbf24', glow: 'rgba(217, 119, 6, 0.45)', border: '#f59e0b',
        long1: '#92400e', long2: '#d97706'
    },
    COSMIC: { 
        core: '#a855f7', accent: '#7e22ce', glitch: '#818cf8', glow: 'rgba(168, 85, 247, 0.45)', border: '#c084fc',
        long1: '#6b21a8', long2: '#9333ea'
    },
    LEGENDARY: { 
        body: '#10b981', accent: '#047857', glow: 'rgba(16, 185, 129, 0.45)', aura: 'rgba(16, 185, 129, 0.2)', tap1: '#10b981', tap2: '#047857', 
        border: '#34d399',
        long1: '#065f46', long2: '#059669'
    }
};

import { i18n } from "./i18n/index.js?v=39.0";
import { icons } from "./ui/icons.js?v=39.0";
import * as Cosmetics from "./game/cosmetics.js?v=59.0";
import { loadUserFriends, getCachedFriends, getCachedIncomingRequests, getCachedOutgoingRequests, isFriend, hasOutgoingRequest, hasIncomingRequest, sendFriendRequest, acceptFriendRequest, declineFriendRequest, cancelFriendRequest, removeFriend, searchPlayerGlobal } from "./services/friends.js?v=39.0";

// ==========================================
// Локалізація (i18n) та SVG іконки винесені у відповідні модулі:
// ./i18n/index.js (ua.js, en.js, ru.js) та ./ui/icons.js
// ==========================================

let songsDB = [];
let renderMenu = () => {};
let updateFriendsBadge = () => {};
let renderFriendsList = () => {};
let openPlayerProfileModal = () => {};
let currentLeaderboardLimit = 100;

// ==========================================
// КЕРУВАННЯ АВТОРИЗАЦІЄЮ ТА ІЗОЛЯЦІЄЮ АКАУНТІВ
// ==========================================
let isAuthRegisterMode = false;

function setAuthMode(isRegister) {
    isAuthRegisterMode = Boolean(isRegister);
    const authForm = document.getElementById('auth-form-element');
    const authTitle = document.getElementById('auth-title');
    const authSubmit = document.getElementById('auth-submit');
    const authToggleMode = document.getElementById('auth-toggle-mode');
    const authErrEl = document.getElementById('auth-error-msg');
    const tabLogin = document.getElementById('auth-tab-login');
    const tabReg = document.getElementById('auth-tab-register');

    if (authForm) authForm.dataset.mode = isAuthRegisterMode ? 'register' : 'login';
    if (authTitle) {
        authTitle.textContent = isAuthRegisterMode 
            ? (i18n.t('authRegisterTitle') || 'Реєстрація акаунта') 
            : (i18n.t('authLoginTitle') || 'Вхід у гру');
    }
    if (authSubmit) {
        authSubmit.textContent = isAuthRegisterMode 
            ? (i18n.t('authRegisterSubmit') || 'Створити акаунт') 
            : (i18n.t('authLoginSubmit') || 'Увійти');
    }
    if (authToggleMode) {
        authToggleMode.textContent = isAuthRegisterMode 
            ? (i18n.t('authToLogin') || 'Вже маєте акаунт? Увійти') 
            : (i18n.t('authToRegister') || 'Немає акаунта? Зареєструватися');
    }
    if (tabLogin) tabLogin.classList.toggle('active', !isAuthRegisterMode);
    if (tabReg) tabReg.classList.toggle('active', isAuthRegisterMode);
    if (authErrEl) {
        authErrEl.textContent = '';
        authErrEl.classList.add('hidden');
    }
}
window.setAuthMode = setAuthMode;

function clearLocalUserData() {
    // 1. Очищення ідентифікатора та імені попереднього гравця
    localStorage.removeItem('playerName');
    localStorage.removeItem('playerId');
    localStorage.removeItem('neon_active_user_id');
    localStorage.removeItem('user_progress_synced');

    // 2. Скидання косметики до чистих дефолтних значень
    Cosmetics.resetLocalCosmetics();

    // 2.1. Скидання тем ігрового поля
    FieldThemes.resetLocalThemes();
    if (typeof applyActiveThemeVisuals === 'function') {
        applyActiveThemeVisuals();
    }
    if (typeof updateShopCoins === 'function') {
        updateShopCoins();
    }

    // 3. Скидання часу в грі
    localStorage.removeItem('neon_total_playtime');

    // 4. Очищення всіх збережених результатів треків (зірки, очки, складності)
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('neon_rhythm_') || k.startsWith('neon_song_'))) {
            localStorage.removeItem(k);
        }
    }
}
window.clearLocalUserData = clearLocalUserData;

async function loadCloudSongs() {
    try {
        const snap = await getDocs(collection(db, "tracks"));
        songsDB = [];
        snap.forEach(docSnap => {
            const data = docSnap.data();
            const dur = Number(data.duration) || 0;
            const mins = Math.floor(dur / 60);
            const secs = Math.floor(dur % 60).toString().padStart(2, "0");
            songsDB.push({
                id: docSnap.id,
                title: data.title || "Без назви",
                artist: data.artist || "Невідомий автор",
                duration: `${mins}:${secs}`,
                rawDuration: dur,
                audioUrl: data.audioUrl,
                storagePath: data.storagePath || null,
                fileHash: data.fileHash || null,
                fileSize: Number(data.fileSize) || 0,
                isSecret: Boolean(data.isSecret),
                isLocal: Boolean(data.audioUrl && data.audioUrl.startsWith("indexeddb://")),
                createdAt: data.createdAt || 0
            });
        });
        // Сортуємо нові треки спочатку
        songsDB.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } catch (e) {
        console.warn("Помилка завантаження треків з Firestore:", e);
    }
    if (typeof renderMenu === 'function') {
        renderMenu();
    }
    if (typeof updateShopCoins === 'function') {
        updateShopCoins();
    }
}

// Кеш декодованих аудіобуферів та згенерованих нотних карт (забезпечує миттєвий старт без повторного декодування)
const audioBufferCache = new Map();
const tileMapCache = new Map();

const State = {
    audioCtx: null,
    sourceNode: null,
    masterGain: null,
    audioBuffer: null,
    animationFrameId: null,
    currentSessionId: 0,
    isPlaying: false,
    isPaused: false,
    isMuted: localStorage.getItem('isMuted') === 'true',
    isBotEnabled: localStorage.getItem('neon_autobot_enabled') === 'true', // Автоматичний бот для тестування та проходження
    currentLang: localStorage.getItem('siteLang') || 'RU',
    isMobile: window.innerWidth < 768 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0 && window.innerWidth <= 1024),
    playtimeAccumulator: 0,
    lastPlaytimeTick: 0,

    // Режим 20-секундного тест-драйву теми з авто-ботом
    isPreviewMode: false,
    previewTimerId: null,
    previewIntervalId: null,
    previewOriginalTheme: null,
    previewOriginalBotState: false,
    previewThemeId: null,
    previewReturnModal: null, // 'shop' | 'customization'
    
    score: 0,
    maxPossibleScore: 0,
    combo: 0,
    maxCombo: 0,
    consecutiveMisses: 0,
    totalMisses: 0, // ЗМІНА: Змінна для підрахунку загальної кількості промахів гравця за всю гру.
    totalHits: 0, // Підрахунок влучань для розрахунку точності та рангу (S/A/B/C/D)
    perfectHits: 0, // Підрахунок ідеальних влучань для розблокування титулів та косметики
    starStatus: [], // ЗМІНА: Масив стану зірок (0-нема, 1-золото, 2-діамант). Я скидаю його на початку кожної сесії.
    // Змінні, що відповідають за основну логіку гри.
    startTime: 0,
    lastComboUpdateTime: 0,
    currentSongIndex: 0,
    lastHitTime: 0,
    currentSpeed: 1000,
    dynamicSpeedMultiplier: 1.0,
    bgPulse: 0,
    bgStars: [],
    lastFrameTime: 0,
    
    // Змінні для керування візуальним відображенням.
    gameWidth: 0,
    gameHeight: 0,
    comboScale: 1.0,
    currentComboTier: 'none',
    activeRatings: [], // Array of objects
    
    // Стан системи вводу.
    keyState: [false, false, false, false],
    holdingTiles: [null, null, null, null],
    laneLastInputTime: [0, 0, 0, 0],
    laneBeamAlpha: [0, 0, 0, 0],
    laneLastType: ['tap', 'tap', 'tap', 'tap'],
    
    // Масиви для рендерингу елементів на екрані.
    mapTiles: [],
    nextSpawnIndex: 0,
    activeTiles: [],
    
    // Масив для зберігання фізики хвиль (візуальні збурення на лінії удару), які я використовую для створення ефекту віддачі.
    ripples: [],
    
    // Таблиця попередньо обчислених випадкових значень для ефекту тремтіння. Я використовую цей підхід замість постійного виклику Math.random() у циклі малювання, щоб значно знизити навантаження на процесор.
    shakeTable: new Float32Array(256),
    screenShake: 0,
    lastEmptyMissTime: 0,
    _missFlashTimer: null,

    // НОВОВВЕДЕННЯ: Попередньо відмальований спрайт радіального світіння. Він зберігається в пам'яті для оптимізованого рендерингу.
    glowSprite: null,

    // Модифікатори гри: швидкість (ноти 1.0x, 1.2x, 1.4x), хардкор-режим та множник очків.
    selectedSpeed: 1.0,       // 1.0 | 1.2 | 1.4
    isHardcore: false,        // 1 промах = смерть
    scoreMultiplier: 1.0      // Обчислюється з модифікаторів
};
if (typeof window !== 'undefined') window.GameState = State;
// Тут я генерую таблицю випадкових значень під час ініціалізації. Під час рендерингу я звертаюся до неї за індексом, що економить ресурси.
for(let i = 0; i < State.shakeTable.length; i++) {
    State.shakeTable[i] = (Math.random() - 0.5);
}
function getDeterministicShake(offset = 0, magnitude = 1) {
    const idx = (Date.now() + offset) & 255; // Швидке обчислення залишку від ділення на 256.
    return State.shakeTable[idx] * magnitude;
}

// Патерн Object Pooling для частинок. Я заздалегідь створюю масив з максимальної кількості об'єктів частинок. Замість того, щоб постійно виділяти та звільняти пам'ять під нові частинки під час гри (що викликає збирання сміття та фризи), я просто перевикористовую неактивні об'єкти з цього пулу.
const MAX_PARTICLES = 300;
const particlePool = new Array(MAX_PARTICLES).fill(null).map(() => ({
    active: false,
    x: 0, y: 0,
    vx: 0, vy: 0,
    life: 0,
    color: '#fff',
    angle: 0,
    spin: 0,
    theme: 'classic'
}));
let particlePoolIndex = 0;

// Кешування градієнтів. Щоб не перераховувати градієнти на кожному кадрі для кожної ноти, я генерую їх один раз і зберігаю тут.
const GRADIENT_CACHE = {
    tap: {},
    longHead: {},
    longTail: {} 
};

// Посилання на елементи DOM-дерева.
let canvas, ctx, gameContainer, menuLayer, loader, holdEffectsContainer, progressBar, bgMusicEl, scoreEl;
let starsElements = [];
let laneElements = [null, null, null, null];
let laneKeyElements = [null, null, null, null];
let gameRect = null; 
let updateShopCoins = () => {};
let renderShop = () => {}; 
let renderCustomizationModal = () => {};
let openThemePreviewChooser = () => {};
let startThemePreview = () => {};
let startPreviewCountdown = () => {};
let exitThemePreview = () => {};
let openCustomizationModal = () => {};
let closeCustomizationModal = () => {};
let openShopModal = () => {};
let closeShopModal = () => {};

// ==========================================
// Ядро обробки аудіо. Цей модуль я розробив для аналізу аудіоданих та автоматичної генерації карти нот на основі ритму та енергії треку.
// ==========================================

function normalizeBufferAggressive(buffer) {
    const newData = new Float32Array(buffer.length);
    let maxAmp = 0;
    for (let i = 0; i < buffer.length; i += 50) {
        const val = Math.abs(buffer[i]);
        if (val > maxAmp) maxAmp = val;
    }
    const mult = 1.0 / (maxAmp || 0.01);
    for (let i = 0; i < buffer.length; i++) {
        let val = Math.abs(buffer[i] * mult);
        newData[i] = Math.pow(val, 0.95);
    }
    return newData;
}

function getLocalAverage(data, index, sampleRate, windowSec) {
    const windowSamples = Math.floor(sampleRate * windowSec);
    const start = Math.max(0, index - windowSamples / 2);
    const end = Math.min(data.length, index + windowSamples / 2);
    let sum = 0, count = 0;
    for (let k = start; k < end; k += 2000) {
        sum += Math.abs(data[k]);
        count++;
    }
    return count > 0 ? sum / count : 0.001;
}

// Оцінка домінуючої частоти (пітчу) за швидкістю перетину нуля (Zero Crossing Rate) на оригінальному аудіо
function estimatePitchAt(rawData, index, sampleRate, windowSize = 512) {
    let crossings = 0;
    const end = Math.min(rawData.length, index + windowSize);
    if (end - index < 64) return 440;
    
    let prevSign = rawData[index] >= 0;
    for (let i = index + 1; i < end; i++) {
        const sign = rawData[i] >= 0;
        if (sign !== prevSign) {
            crossings++;
            prevSign = sign;
        }
    }
    const durationSec = (end - index) / sampleRate;
    const freq = crossings / (2 * Math.max(0.001, durationSec));
    return Math.max(60, Math.min(3500, freq));
}

function checkSustain(data, rawData, index, sampleRate, attackEnergy, localAvg) {
    const lookAheadSamples = Math.floor(sampleRate * 0.40);
    const startScan = index + Math.floor(sampleRate * 0.05);
    const endScan = Math.min(data.length, index + lookAheadSamples);
    if (endScan <= startScan) return { isLong: false, duration: 0 };

    let sum = 0, count = 0;
    let minVal = 999, maxVal = 0;
    for (let k = startScan; k < endScan; k += 80) {
        const v = data[k];
        sum += v;
        if (v < minVal) minVal = v;
        if (v > maxVal) maxVal = v;
        count++;
    }
    const sustainLevel = count > 0 ? sum / count : 0;
    const variation = maxVal - minVal;

    // Звук вважається протяжним, якщо після початкової атаки він утримує стабільну амплітуду
    // вище фонового середнього рівня і не затухає миттєво
    const isStable = variation < Math.max(0.12, sustainLevel * 1.6);
    const minSustainFloor = Math.max(0.018, Math.min(0.04, localAvg * 0.5));
    const isAboveBackground = sustainLevel > Math.max(minSustainFloor, localAvg * 0.58);
    const hasEnoughEnergy = sustainLevel > (attackEnergy * 0.25);

    const isLong = isAboveBackground && (hasEnoughEnergy || isStable);

    if (!isLong) return { isLong: false, duration: 0 };

    // Визначаємо точну тривалість утримання звуку
    let endIndex = index;
    const maxDurSamples = Math.floor(sampleRate * 2.2);
    const stepScan = Math.floor(sampleRate * 0.05);
    const stopThreshold = Math.max(minSustainFloor * 0.8, Math.min(sustainLevel * 0.45, localAvg * 0.55));

    for (let k = startScan; k < index + maxDurSamples; k += stepScan) {
        if (k >= data.length) break;
        if (data[k] < stopThreshold) {
            endIndex = k;
            break;
        }
        endIndex = k;
    }

    const durSec = (endIndex - index) / sampleRate;
    return { isLong: durSec >= 0.35, duration: Math.min(2.2, durSec) };
}

// Кільцевий буфер останніх виділених доріжок для балансування навантаження лівої та правої руки
// Статистика використання доріжок для забезпечення абсолютно однакової частоти (~25% на кожну з 4 доріжок)
let laneUsageStats = [0, 0, 0, 0];
let lastAllocatedLane = -1;
let keyboardFlowDirection = 1;
let currentMotif = 0;
let motifNotesCount = 0;
let motifLength = 8;

// Розумний фортепіанний мультимотивний розподільник доріжок:
// 1. Забезпечує однакову частоту появи для всіх 4 доріжок (~25% кожна)
// 2. Чергує 4 музичні мотиви: чергування рук (грув), хвилі по клавіатурі (арпеджіо), стрибки через клавішу, подвійні удари на збивках
// 3. Запобігає нудному циклічному перебору клавіш підряд (0->1->2->3)
// 4. Підтримує всі варіації акордів (як сусідні [0,1], [1,2], [2,3], так і рознесені [0,2], [1,3], [0,3])
function musicalLaneAllocator(laneFreeTimes, count, currentTime, pitchFreq, lastPitch, lastLane, hitRole, prng) {
    const available = [];
    for (let l = 0; l < 4; l++) {
        if (currentTime >= laneFreeTimes[l]) available.push(l);
    }
    if (available.length < count) count = available.length;
    if (count === 0) return [];

    const total = Math.max(1, laneUsageStats.reduce((a, b) => a + b, 0));
    const avg = total / 4;

    if (count === 1) {
        motifNotesCount++;
        if (motifNotesCount >= motifLength) {
            currentMotif = (currentMotif + 1) % 4;
            motifNotesCount = 0;
            const randVal = (typeof prng === 'function') ? prng() : Math.random();
            motifLength = 6 + Math.floor(randVal * 4); // 6-9 нот на мотив
        }

        available.sort((a, b) => {
            // Базове вирівнювання: рівні ~25% на кожну клавішу
            let scoreA = (laneUsageStats[a] - avg) * 2.2;
            let scoreB = (laneUsageStats[b] - avg) * 2.2;

            if (currentMotif === 0) {
                // Мотив 0: Чергування рук [0, 1] <-> [2, 3] (піанінний ритмічний грув / біт)
                const lastHand = (lastAllocatedLane <= 1) ? 0 : 1;
                const targetHand = 1 - lastHand;
                const aHand = (a <= 1) ? 0 : 1;
                const bHand = (b <= 1) ? 0 : 1;
                if (aHand === targetHand) scoreA -= 0.85;
                if (bHand === targetHand) scoreB -= 0.85;
                if (a === lastAllocatedLane) scoreA += 3.5;
                if (b === lastAllocatedLane) scoreB += 3.5;
            } else if (currentMotif === 1) {
                // Мотив 1: Арпеджіо/хвиля по клавіатурі (плавний перехід як пальцями по піаніно)
                const targetStep = lastAllocatedLane >= 0 ? lastAllocatedLane + keyboardFlowDirection : 1;
                scoreA += Math.abs(a - targetStep) * 0.7;
                scoreB += Math.abs(b - targetStep) * 0.7;
                if (a === lastAllocatedLane) scoreA += 3.5;
                if (b === lastAllocatedLane) scoreB += 3.5;
            } else if (currentMotif === 2) {
                // Мотив 2: Синкоповані стрибки через клавішу (0->2, 1->3, 3->1)
                if (Math.abs(a - lastAllocatedLane) === 2) scoreA -= 0.9;
                if (Math.abs(b - lastAllocatedLane) === 2) scoreB -= 0.9;
                if (a === lastAllocatedLane) scoreA += 3.5;
                if (b === lastAllocatedLane) scoreB += 3.5;
            } else if (currentMotif === 3) {
                // Мотив 3: Дріб / повтори на біті (дабл-тапи на барабанних збивках)
                if (motifNotesCount % 2 === 1 && lastAllocatedLane >= 0) {
                    if (a === lastAllocatedLane) scoreA -= 0.8;
                    if (b === lastAllocatedLane) scoreB -= 0.8;
                } else {
                    if (a === lastAllocatedLane) scoreA += 3.5;
                    if (b === lastAllocatedLane) scoreB += 3.5;
                }
            }

            // Мелодійний рух за висотою звуку: якщо тон різко змінюється
            if (pitchFreq && lastPitch) {
                const ratio = pitchFreq / Math.max(1, lastPitch);
                if (ratio > 1.10) {
                    if (a > lastAllocatedLane) scoreA -= 0.5;
                    if (b > lastAllocatedLane) scoreB -= 0.5;
                } else if (ratio < 0.90) {
                    if (a < lastAllocatedLane) scoreA -= 0.5;
                    if (b < lastAllocatedLane) scoreB -= 0.5;
                }
            }

            return scoreA - scoreB;
        });

        const chosen = available[0];
        laneUsageStats[chosen]++;
        if (chosen >= 3) keyboardFlowDirection = -1;
        else if (chosen <= 0) keyboardFlowDirection = 1;
        lastAllocatedLane = chosen;
        return [chosen];
    }

    if (count === 2) {
        // Подвійні ноти (акорди): балансуємо використання пар
        const possiblePairs = [];
        for (let i = 0; i < available.length; i++) {
            for (let j = i + 1; j < available.length; j++) {
                possiblePairs.push([available[i], available[j]]);
            }
        }
        if (possiblePairs.length === 0) return available.slice(0, 2);

        possiblePairs.sort((pA, pB) => {
            const scoreA = (laneUsageStats[pA[0]] - avg) + (laneUsageStats[pA[1]] - avg);
            const scoreB = (laneUsageStats[pB[0]] - avg) + (laneUsageStats[pB[1]] - avg);
            return scoreA - scoreB;
        });

        const chosen = possiblePairs[0];
        laneUsageStats[chosen[0]]++;
        laneUsageStats[chosen[1]]++;
        lastAllocatedLane = chosen[1];
        return chosen;
    }

    return available.slice(0, count);
}

// ==========================================
// Ініціалізація гри та обробники подій.
// ==========================================

function bootGame() {

    // Отримання посилань на HTML-елементи.
    canvas = document.getElementById('rhythmCanvas');
    ctx = canvas ? canvas.getContext('2d', { alpha: true, desynchronized: true }) : null;
    gameContainer = document.getElementById('game-container');

    // Ініціалізація високопродуктивного графічного шару Pixi.js (Фаза 1: гібридний режим)
    if (gameContainer) {
        const initW = gameContainer.clientWidth || window.innerWidth || 400;
        const initH = gameContainer.clientHeight || window.innerHeight || 800;
        const initDpr = Math.min(window.devicePixelRatio || 1, 1.5);
        pixiRenderer.init({
            container: gameContainer,
            width: initW,
            height: initH,
            dpr: initDpr
        }).catch(err => console.warn("[PixiRenderer] init error:", err));
    }
    menuLayer = document.getElementById('menu-layer');
    loader = document.getElementById('loader');
    holdEffectsContainer = document.getElementById('hold-effects-container');
    progressBar = document.getElementById('game-progress-bar');
    scoreEl = document.getElementById('score-display');
    
    starsElements = [
        document.getElementById('star-1'), document.getElementById('star-2'),
        document.getElementById('star-3'), document.getElementById('star-4'),
        document.getElementById('star-5')
    ].filter(el => el !== null);

    // Завантаження звукових ефектів.
    const sfxClick = new Audio('audio/click.mp3');
    const sfxHover = new Audio('audio/hover.mp3');

    bgMusicEl = document.getElementById('bg-music');

    // Синхронізація налаштувань користувача з локального сховища.
    const savedTheme = localStorage.getItem('siteTheme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    const themeContainer = document.getElementById('theme-icon-container');
    if (themeContainer) themeContainer.innerHTML = savedTheme === 'dark' ? icons.moon(18) : icons.sun(18);

    const savedLang = localStorage.getItem('siteLang') || 'RU';
    State.currentLang = savedLang;
    i18n.setLanguage(savedLang);
    document.body.setAttribute('data-lang', State.currentLang);
    updateGameText();

    const soundContainer = document.getElementById('sound-icon-container');
    if (soundContainer) soundContainer.innerHTML = State.isMuted ? icons.volumeX(18) : icons.volume(18);

    if (!State.isMuted && bgMusicEl) {
        const savedTime = localStorage.getItem('bgMusicTime');
        if (savedTime) bgMusicEl.currentTime = parseFloat(savedTime);
        bgMusicEl.play().catch(() => {});
    }

    window.addEventListener('beforeunload', () => {
        if (bgMusicEl && !bgMusicEl.paused) localStorage.setItem('bgMusicTime', bgMusicEl.currentTime);
    });

    function playClick() { if (!State.isMuted) { sfxClick.currentTime = 0; sfxClick.volume = 0.4; sfxClick.play().catch(() => { }); } }
    function playHover() { if (!State.isMuted) { sfxHover.currentTime = 0; sfxHover.volume = 0.2; sfxHover.play().catch(() => { }); } }

    /* Допоміжні функції локалізації. */
    function getText(key) { return i18n.t(key); }

    /**
     * Внутрішньоігровий неоновий діалог підтвердження.
     * Запобігає блокуванню браузером нативного confirm() та коректно підтримує опцію "Більше не запитувати".
     */
    function showCustomConfirm({
        title = '',
        message = '',
        confirmText = '',
        cancelText = '',
        danger = true,
        showDontAskAgain = false,
        storageKey = null
    } = {}) {
        return new Promise((resolve) => {
            // Якщо збережено опцію "Більше не запитувати" — підтверджуємо миттєво без виклику модалки
            if (storageKey && localStorage.getItem(storageKey) === 'true') {
                resolve(true);
                return;
            }

            const modal = document.getElementById('custom-confirm-modal');
            if (!modal) {
                // Запасний варіант, якщо елемент відсутній у DOM
                const res = confirm(message);
                resolve(res);
                return;
            }

            const titleEl = document.getElementById('custom-confirm-title');
            const bodyEl = document.getElementById('custom-confirm-body');
            const optionsEl = document.getElementById('custom-confirm-options');
            const checkboxEl = document.getElementById('custom-confirm-checkbox');
            const checkboxTextEl = document.getElementById('custom-confirm-checkbox-text');
            const cancelBtn = document.getElementById('custom-confirm-cancel');
            const okBtn = document.getElementById('custom-confirm-ok');
            const closeBtn = modal.querySelector('.custom-confirm-close');

            if (titleEl) titleEl.textContent = title || (getText('confirmTitle') || 'Підтвердження');
            if (bodyEl) {
                const formatted = String(message || '')
                    .split('\n')
                    .map(l => l.trim())
                    .filter(l => l.length > 0)
                    .map(l => `<p>${l.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
                    .join('');
                bodyEl.innerHTML = formatted;
            }

            if (cancelBtn) cancelBtn.textContent = cancelText || (getText('cancel') || 'Скасувати');
            if (okBtn) {
                okBtn.textContent = confirmText || (getText('confirmBtn') || 'Підтвердити');
                okBtn.className = danger ? 'modern-btn modern-btn-danger' : 'modern-btn modern-btn-primary';
            }

            if (optionsEl && checkboxEl) {
                if (showDontAskAgain && storageKey) {
                    optionsEl.classList.remove('hidden');
                    checkboxEl.checked = false;
                    if (checkboxTextEl) checkboxTextEl.textContent = getText('dontAskAgain') || 'Більше не запитувати';
                } else {
                    optionsEl.classList.add('hidden');
                    checkboxEl.checked = false;
                }
            }

            modal.classList.remove('hidden');

            const handleDecision = (accepted) => {
                playClick();
                modal.classList.add('hidden');
                if (accepted && showDontAskAgain && storageKey && checkboxEl && checkboxEl.checked) {
                    try {
                        localStorage.setItem(storageKey, 'true');
                    } catch (e) {
                        console.warn("Could not persist confirmation preference:", e);
                    }
                }
                cleanup();
                resolve(accepted);
            };

            const onKeyDown = (e) => {
                if (e.key === 'Escape') handleDecision(false);
                else if (e.key === 'Enter') handleDecision(true);
            };

            const onBackdrop = (e) => {
                if (e.target === modal) handleDecision(false);
            };

            const cleanup = () => {
                if (okBtn) okBtn.onclick = null;
                if (cancelBtn) cancelBtn.onclick = null;
                if (closeBtn) closeBtn.onclick = null;
                modal.removeEventListener('mousedown', onBackdrop);
                document.removeEventListener('keydown', onKeyDown);
            };

            if (okBtn) okBtn.onclick = () => handleDecision(true);
            if (cancelBtn) cancelBtn.onclick = () => handleDecision(false);
            if (closeBtn) closeBtn.onclick = () => handleDecision(false);
            modal.addEventListener('mousedown', onBackdrop);
            document.addEventListener('keydown', onKeyDown);
        });
    }
    window.showCustomConfirm = showCustomConfirm;

    function updateLangDisplay() {
        const langText = document.getElementById('current-lang-text');
        if (langText) langText.textContent = State.currentLang.toUpperCase();
    }

    function updateGameText() {
        i18n.updateDOM();
        updateLangDisplay();
        try { if (SpriteCache && SpriteCache.initRatings) SpriteCache.initRatings(); } catch (e) { }

        // 1. Оновлення головного меню та гри
        const searchInput = document.getElementById('song-search-input');
        if (searchInput) searchInput.placeholder = getText('searchPlaceholder');
        const noSongsMsg = document.querySelector('#no-songs-msg h3');
        if (noSongsMsg) noSongsMsg.innerText = getText('noSongsFound');
        const instr = document.querySelector('.instruction-text'); 
        if (instr) instr.innerText = getText('instructions');
        const pauseTitle = document.querySelector('#pause-modal h2'); if (pauseTitle) pauseTitle.innerText = getText('paused');
        const btnResume = document.getElementById('btn-resume'); if (btnResume) btnResume.innerText = getText('resume');
        const btnQuit = document.getElementById('btn-quit'); if (btnQuit) btnQuit.innerText = getText('quit');
        const btnRestart = document.getElementById('btn-restart');
        if (btnRestart) {
            const span = btnRestart.querySelector('span');
            if (span) span.textContent = getText('restart');
            else btnRestart.innerText = getText('restart');
        }
        const btnMenu = document.getElementById('btn-menu-end');
        if (btnMenu) {
            const span = btnMenu.querySelector('span');
            if (span) span.textContent = getText('menu');
            else btnMenu.innerText = getText('menu');
        }
        const loadTitle = document.querySelector('#loader .cyber-loader-title') || document.querySelector('#loader h3');
        if (loadTitle) loadTitle.innerText = getText('loading') || 'Завантаження...';
        const loadSub = document.querySelector('#loader .cyber-loader-subtitle');
        if (loadSub) loadSub.innerText = getText('loadingTrack') || 'Аналіз треку та створення нот...';
        
        // Кнопка в меню
        const lbBtn = document.querySelector('.btn-leaderboard');
        if (lbBtn) lbBtn.innerHTML = `${icons.trophy(18)} <span>${getText('leaderboard')}</span>`;

        // Оновлення статусу авто-бота в адмінці
        const botStatusText = document.getElementById('admin-bot-status-text');
        if (botStatusText) {
            botStatusText.textContent = State.isBotEnabled ? getText('adminAutoPlayActive') : getText('adminAutoPlayInactive');
        }

        // ВИПРАВЛЕННЯ: Логіка для таблиці лідерів.
        const lbModal = document.getElementById('lb-modal');
        if (lbModal) {
            // Оновлюємо заголовок вікна
            const titleEl = lbModal.querySelector('.lb-title');
            if (titleEl) titleEl.innerHTML = `${icons.trophy(20)} <span>${getText('leaderboard')}</span>`;

            // Оновлюємо контент (перезавантажуємо таблицю, щоб оновились заголовки таблиці TH)
            if (typeof loadLeaderboardData === 'function') {
                loadLeaderboardData('global', lbModal);
            }
        }

        // Оновлюємо систему друзів при зміні мови
        if (typeof updateFriendsBadge === 'function') {
            updateFriendsBadge();
            const fModal = document.getElementById('friends-modal');
            if (fModal && !fModal.classList.contains('hidden') && typeof renderFriendsList === 'function') {
                renderFriendsList();
            }
        }

        if (typeof updateFullscreenIcons === 'function') {
            updateFullscreenIcons();
        }
    }

    function generateSafeUUID() {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            try { return crypto.randomUUID(); } catch (e) {}
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Безпечне перетворення назви треку в ключ поля Firestore (без крапок та спецсимволів)
    function toFirestoreTrackKey(title) {
        try {
            return 'b64_' + btoa(unescape(encodeURIComponent(title))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        } catch (e) {
            return 'enc_' + encodeURIComponent(title).replace(/\./g, '%2E').replace(/\//g, '%2F');
        }
    }

    function fromFirestoreTrackKey(key, trackObj) {
        if (trackObj && typeof trackObj.title === 'string' && trackObj.title.trim()) {
            return trackObj.title.trim();
        }
        if (typeof key === 'string' && key.startsWith('b64_')) {
            try {
                let base64 = key.slice(4).replace(/-/g, '+').replace(/_/g, '/');
                while (base64.length % 4) base64 += '=';
                return decodeURIComponent(escape(atob(base64)));
            } catch (e) {}
        }
        if (typeof key === 'string' && key.startsWith('enc_')) {
            try {
                return decodeURIComponent(key.slice(4));
            } catch (e) {}
        }
        if (typeof key === 'string' && key.includes('%')) {
            try {
                return decodeURIComponent(key);
            } catch (e) {}
        }
        if (Array.isArray(songsDB) && songsDB.some(s => s && s.title === key)) {
            return key;
        }
        try {
            if (typeof key === 'string' && !key.includes(' ') && key.length >= 4) {
                let base64 = key.replace(/-/g, '+').replace(/_/g, '/');
                while (base64.length % 4) base64 += '=';
                const candidate = decodeURIComponent(escape(atob(base64)));
                if (Array.isArray(songsDB) && songsDB.some(s => s && s.title === candidate)) {
                    return candidate;
                }
            }
        } catch (e) {}
        return key;
    }

    // Ранжування складності: hardcore (4) > hard (3) > normal (2) > easy (1)
    const DIFF_RANK = { hardcore: 4, hard: 3, normal: 2, easy: 1 };
    function getDiffRank(diff, isHardcore) {
        const d = String(diff || '').toLowerCase().trim();
        if (isHardcore || d === 'hardcore') return 4;
        return DIFF_RANK[d] || 0;
    }

    // Двостороння синхронізація найкращих результатів та часу гри
    async function syncUserProgressBidirectional(userId) {
        if (!userId) return;
        try {
            // Переконуємось, що треки завантажені
            if (!songsDB || songsDB.length === 0) {
                try { await loadCloudSongs(); } catch (e) {}
            }

            const progressRef = doc(db, "user_progress", userId);
            const snap = await getDoc(progressRef);
            const cloudData = snap.exists() ? snap.data() : {};
            const cloudTracks = cloudData.tracks || {};

            // 1. Безпечне завантаження кастомізації профілю виключно з хмари поточного користувача
            let cloudCosmSource = cloudData;
            if (!cloudCosmSource.unlockedFrames && !cloudCosmSource.avatarUrl && !cloudCosmSource.selectedTitle) {
                try {
                    const lbSnap = await getDoc(doc(db, "global_leaderboard", userId));
                    if (lbSnap.exists()) {
                        cloudCosmSource = { ...lbSnap.data(), ...cloudCosmSource };
                    }
                } catch (e) {
                    console.warn("Could not fetch cosmetics fallback from global_leaderboard:", e);
                }
            }

            // Застосовуємо виключно дані поточного акаунта з хмари, блокуючи перенесення чужих аватарів та рамок
            const appliedCosm = Cosmetics.applyCloudCosmetics(cloudCosmSource);
            const mergedAvatarUrl = appliedCosm.avatarUrl;
            const mergedSelectedFrame = appliedCosm.selectedFrame;
            const mergedSelectedTitle = appliedCosm.selectedTitle;
            const mergedUnlockedFrames = appliedCosm.unlockedFrames;
            const mergedUnlockedTitles = appliedCosm.unlockedTitles;
            const mergedUserStatus = appliedCosm.userStatus;
            const mergedFavoriteTrack = appliedCosm.favoriteTrack;

            if (typeof updateHeaderUserBadge === 'function') {
                updateHeaderUserBadge();
            }

            // 1.1. Синхронізація тем ігрового поля з хмари
            FieldThemes.applyCloudThemes(cloudData);
            if (typeof applyActiveThemeVisuals === 'function') {
                applyActiveThemeVisuals();
            }
            if (typeof updateShopCoins === 'function') {
                updateShopCoins();
            }

            // 2. Синхронізація часу у грі (зберігаємо найбільший)
            const cloudPlaytime = Number(cloudData.playtimeSeconds || 0);
            const localPlaytime = parseInt(localStorage.getItem('neon_total_playtime') || '0', 10);
            const bestPlaytime = Math.max(cloudPlaytime, localPlaytime);
            localStorage.setItem('neon_total_playtime', String(bestPlaytime));

            // Збираємо список валідних назв треків
            const validSongTitles = new Set();
            songsDB.forEach(s => { if (s && s.title) validSongTitles.add(s.title); });

            // Чистимо локальне сховище від застарілих та некоректних сміттєвих ключів neon_rhythm_
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith('neon_rhythm_')) {
                    const rawTitle = k.replace('neon_rhythm_', '');
                    if (validSongTitles.size > 0 && !validSongTitles.has(rawTitle) && !rawTitle.toLowerCase().includes('secret')) {
                        keysToRemove.push(k);
                    }
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));

            // Збираємо дедуплікований список усіх треків
            const tracksToSync = new Set(validSongTitles);
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith('neon_rhythm_')) {
                    const rawTitle = k.replace('neon_rhythm_', '');
                    if (rawTitle.toLowerCase().includes('secret')) {
                        tracksToSync.add(rawTitle);
                    }
                }
            }
            Object.entries(cloudTracks).forEach(([k, val]) => {
                const resolved = fromFirestoreTrackKey(k, val);
                if (resolved && (validSongTitles.has(resolved) || resolved.toLowerCase().includes('secret'))) {
                    tracksToSync.add(resolved);
                }
            });

            const mergedTracksForCloud = {};
            let cloudNeedsUpdate = false;
            let localUpdated = false;

            tracksToSync.forEach(title => {
                const local = getSavedData(title);
                const safeKey = toFirestoreTrackKey(title);

                // Пошук у хмарі (безпечний ключ з b64_, legacy base64, legacy encodeURI або пряма назва)
                let cloud = cloudTracks[safeKey] || null;
                if (!cloud) {
                    const legacyB64 = safeKey.startsWith('b64_') ? safeKey.slice(4) : '';
                    if (legacyB64 && cloudTracks[legacyB64]) cloud = cloudTracks[legacyB64];
                    else if (cloudTracks[encodeURIComponent(title)]) cloud = cloudTracks[encodeURIComponent(title)];
                    else if (cloudTracks[title]) cloud = cloudTracks[title];
                    else {
                        for (const [ck, cv] of Object.entries(cloudTracks)) {
                            if (cv && (cv.title === title || fromFirestoreTrackKey(ck, cv) === title)) {
                                cloud = cv;
                                break;
                            }
                        }
                    }
                }

                const localScore = Number(local.score) || 0;
                const cloudScore = cloud ? (Number(cloud.score) || 0) : 0;
                const bestScore = Math.max(localScore, cloudScore);

                const localStars = Number(local.stars) || 0;
                const cloudStars = cloud ? (Number(cloud.stars) || 0) : 0;
                const bestStars = Math.max(localStars, cloudStars);

                const mergedStarTypes = [];
                const localTypes = Array.isArray(local.starTypes) ? local.starTypes : [];
                const cloudTypes = (cloud && Array.isArray(cloud.starTypes)) ? cloud.starTypes : [];
                for (let i = 0; i < 5; i++) {
                    mergedStarTypes[i] = Math.max(Number(localTypes[i]) || 0, Number(cloudTypes[i]) || 0);
                }

                // Синхронізація інформації про складність проходження
                const localDiff = local.difficulty || '';
                const localIsHardcore = Boolean(local.isHardcore) || localDiff === 'hardcore';
                const localRank = getDiffRank(localDiff, localIsHardcore);

                const cloudDiff = cloud ? (cloud.difficulty || '') : '';
                const cloudIsHardcore = Boolean(cloud && (cloud.isHardcore || cloudDiff === 'hardcore'));
                const cloudRank = getDiffRank(cloudDiff, cloudIsHardcore);

                // Злиття масивів пройдених складнощів
                const localCompleted = Array.isArray(local.completedDifficulties) 
                    ? local.completedDifficulties 
                    : (localDiff ? [localDiff] : []);
                const cloudCompleted = (cloud && Array.isArray(cloud.completedDifficulties)) 
                    ? cloud.completedDifficulties 
                    : (cloudDiff ? [cloudDiff] : []);

                const mergedCompletedSet = new Set([...localCompleted, ...cloudCompleted]);
                if (localDiff) mergedCompletedSet.add(localDiff);
                if (cloudDiff) mergedCompletedSet.add(cloudDiff);
                if (localIsHardcore || cloudIsHardcore) mergedCompletedSet.add('hardcore');
                const mergedCompletedDiffs = Array.from(mergedCompletedSet).filter(Boolean);

                // Визначення найкращої складності: вищий ранг перемагає; за однакового — за вищим очками
                let bestDifficulty = '';
                let bestIsHardcore = false;

                if (cloudRank > localRank) {
                    bestDifficulty = cloudDiff;
                    bestIsHardcore = cloudIsHardcore;
                } else if (localRank > cloudRank) {
                    bestDifficulty = localDiff;
                    bestIsHardcore = localIsHardcore;
                } else {
                    if (cloudScore > localScore && cloudDiff) {
                        bestDifficulty = cloudDiff;
                        bestIsHardcore = cloudIsHardcore;
                    } else {
                        bestDifficulty = localDiff || cloudDiff || '';
                        bestIsHardcore = localIsHardcore || cloudIsHardcore;
                    }
                }
                if (!bestDifficulty && bestIsHardcore) bestDifficulty = 'hardcore';

                if (bestScore > 0 || bestStars > 0 || bestDifficulty) {
                    const trackPayload = {
                        title: title,
                        score: bestScore,
                        stars: bestStars,
                        starTypes: mergedStarTypes,
                        difficulty: bestDifficulty,
                        isHardcore: bestIsHardcore,
                        completedDifficulties: mergedCompletedDiffs
                    };

                    mergedTracksForCloud[safeKey] = trackPayload;

                    const localCompletedSorted = [...localCompleted].sort().join(',');
                    const mergedCompletedSorted = [...mergedCompletedDiffs].sort().join(',');

                    // Оновлюємо локально, якщо хмара містить новіші або кращі дані
                    const isLocalStale = (
                        bestScore > localScore ||
                        bestStars > localStars ||
                        JSON.stringify(mergedStarTypes) !== JSON.stringify(localTypes) ||
                        bestDifficulty !== localDiff ||
                        bestIsHardcore !== localIsHardcore ||
                        localCompletedSorted !== mergedCompletedSorted
                    );

                    if (isLocalStale) {
                        localStorage.setItem(`neon_rhythm_${title}`, JSON.stringify(trackPayload));
                        localUpdated = true;
                    }

                    // Перевіряємо, чи хмара потребує синхронізації
                    const cloudCompletedSorted = [...cloudCompleted].sort().join(',');
                    const isCloudStale = (
                        !cloud ||
                        bestScore > cloudScore ||
                        bestStars > cloudStars ||
                        JSON.stringify(mergedStarTypes) !== JSON.stringify(cloudTypes) ||
                        bestDifficulty !== cloudDiff ||
                        bestIsHardcore !== cloudIsHardcore ||
                        cloudCompletedSorted !== mergedCompletedSorted
                    );

                    if (isCloudStale) {
                        cloudNeedsUpdate = true;
                    }
                }
            });

            // Якщо хмара мала застарілі ключі без префікса або оновлені дані:
            const hasLegacyCloudKeys = Object.keys(cloudTracks).some(k => !k.startsWith('b64_') && !k.startsWith('enc_'));
            if (cloudNeedsUpdate || bestPlaytime > cloudPlaytime || !snap.exists() || hasLegacyCloudKeys) {
                // Очищаємо застарілі дублікати в хмарі, записуючи чисті дедупліковані дані
                await setDoc(progressRef, {
                    userId: userId,
                    tracks: mergedTracksForCloud,
                    playtimeSeconds: bestPlaytime,
                    avatarUrl: mergedAvatarUrl,
                    selectedFrame: mergedSelectedFrame,
                    selectedTitle: mergedSelectedTitle,
                    unlockedFrames: mergedUnlockedFrames,
                    unlockedTitles: mergedUnlockedTitles,
                    userStatus: mergedUserStatus,
                    favoriteTrack: mergedFavoriteTrack,
                    unlockedFieldThemes: FieldThemes.getUnlockedThemes(),
                    activeFieldTheme: FieldThemes.getActiveThemeId(),
                    spentCoins: parseInt(localStorage.getItem('neon_spent_coins') || '0', 10),
                    updatedAt: serverTimestamp()
                }, { merge: true });
            }

            if (localUpdated && typeof renderMenu === 'function') {
                renderMenu();
            }

            // 4. Оновлюємо глобальний рейтинг
            await syncGlobalProgress();
        } catch (err) {
            console.error("Bidirectional sync error:", err);
        }
    }

    // Завантаження прогресу пройдених рівнів для акаунта з Firestore (викликає двосторонню синхронізацію)
    async function loadCloudUserProgress(userId) {
        return syncUserProgressBidirectional(userId);
    }

    // Збереження прогресу рівня в акаунт у Firestore
    async function saveCloudUserProgress(userId, songTitle, songData) {
        if (!userId || !songTitle) return;
        try {
            const progressRef = doc(db, "user_progress", userId);
            const safeKey = toFirestoreTrackKey(songTitle);
            const playtime = parseInt(localStorage.getItem('neon_total_playtime') || '0', 10);
            await setDoc(progressRef, {
                userId: userId,
                tracks: {
                    [safeKey]: {
                        ...songData,
                        title: songTitle
                    }
                },
                playtimeSeconds: playtime,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (err) {
            console.warn("Could not save cloud user progress:", err);
        }
    }

    // Ідентифікація гравця без нав'язливих модальних вікон на старті
    async function initPlayerIdentity() {
        const currentUser = getCurrentUser();
        let userId = currentUser?.id || localStorage.getItem('playerId');
        if (!userId) {
            userId = generateSafeUUID();
            localStorage.setItem('playerId', userId);
        } else if (currentUser?.id) {
            localStorage.setItem('playerId', currentUser.id);
        }

        let playerName = currentUser?.username || localStorage.getItem('playerName');
        if (!playerName) {
            playerName = "Player_" + userId.slice(0, 5);
            localStorage.setItem('playerName', playerName);
        } else if (currentUser?.username) {
            localStorage.setItem('playerName', currentUser.username);
        }

        // Якщо користувач авторизований, синхронізуємо прогрес
        if (currentUser && currentUser.id) {
            await syncUserProgressBidirectional(currentUser.id);
        }

        // Синхронізація глобальної статистики
        try { await syncGlobalProgress(); } catch (e) { console.error("syncGlobalProgress:", e); }

        // Перше відвідування: показуємо реєстрацію першою при вході в гру
        const hasSeenOnboarding = localStorage.getItem('neon_onboarding_shown');
        if (!currentUser && !hasSeenOnboarding) {
            localStorage.setItem('neon_onboarding_shown', 'true');
            setTimeout(() => {
                const authM = document.getElementById('auth-modal');
                if (authM && !getCurrentUser()) {
                    setAuthMode(true);
                    authM.classList.remove('hidden');
                    const authUserInput = document.getElementById('auth-input-user');
                    if (authUserInput) authUserInput.focus();
                }
            }, 400);
        }
    }
    initPlayerIdentity();

    // Синхронізація загального прогресу гравця з Firebase. Я рахую загальну кількість пройдених рівнів та суму очок, щоб оновити глобальний рейтинг.
    async function syncGlobalProgress() {
        const userId = localStorage.getItem('playerId');
        const playerName = localStorage.getItem('playerName');
        if (!userId || !playerName) return;

        let totalScore = 0;
        let levelsCompleted = 0;
        let totalStars = 0;
        let totalDiamonds = 0;
        const countedTitles = new Set();

        songsDB.forEach(song => {
            if (!song || !song.title || song.isSecret) return; // Секретні рівні не впливають на глобальний прогрес
            countedTitles.add(song.title);
            const data = getSavedData(song.title);
            if (data && data.stars > 0) {
                levelsCompleted++;
                totalScore += (data.score || 0);
                totalStars += data.stars; // Кожен алмаз є зіркою!
                if (Array.isArray(data.starTypes)) {
                    for (let i = 0; i < data.stars; i++) {
                        if (data.starTypes[i] === 2) totalDiamonds++;
                    }
                }
            }
        });

        const playtimeSec = parseInt(localStorage.getItem('neon_total_playtime') || '0', 10);
        const cosm = Cosmetics.getLocalCosmetics();
        const currentUser = getCurrentUser();

        // Захист від засмічення бази: якщо це неавторизований гість без зіграних рівнів чи очок — не пишемо в таблицю лідерів
        if (!currentUser && totalScore === 0 && levelsCompleted === 0) return;

        try {
            const leaderboardPayload = {
                userId,
                name: playerName,
                levelsCompleted,
                totalScore,
                goldStarsCount: totalStars,
                starsCount: totalStars,
                totalStars: totalStars,
                diamondsCount: totalDiamonds,
                playtimeSeconds: playtimeSec,
                avatarUrl: cosm.avatarUrl || '',
                selectedFrame: cosm.selectedFrame || 'frame_none',
                selectedTitle: cosm.selectedTitle || 'title_novice',
                userStatus: cosm.userStatus || '',
                favoriteTrack: cosm.favoriteTrack || '',
                updatedAt: serverTimestamp()
            };
            await setDoc(doc(db, "global_leaderboard", userId), leaderboardPayload, { merge: true });

            await setDoc(doc(db, "user_progress", userId), {
                avatarUrl: cosm.avatarUrl || '',
                selectedFrame: cosm.selectedFrame || 'frame_none',
                selectedTitle: cosm.selectedTitle || 'title_novice',
                userStatus: cosm.userStatus || '',
                favoriteTrack: cosm.favoriteTrack || '',
                unlockedFrames: cosm.unlockedFrames || ['frame_none'],
                unlockedTitles: cosm.unlockedTitles || ['title_novice'],
                unlockedFieldThemes: FieldThemes.getUnlockedThemes(),
                activeFieldTheme: FieldThemes.getActiveThemeId(),
                spentCoins: parseInt(localStorage.getItem('neon_spent_coins') || '0', 10)
            }, { merge: true });
        } catch (e) {
            console.error("Global Sync Error:", e);
        }
    }
    // ==========================================
    // ==========================================
    // ПАТТЕРН OBJECT POOLING ДЛЯ ПАДАЮЧИХ НОТ
    // Усуває дикі спайки Garbage Collector (GC) та фризи на телефонах.
    // Об'єкти нот створюються один раз і перевикористовуються.
    // ==========================================
    const NOTE_POOL_SIZE = 128;
    const NotePool = {
        pool: [],
        init() {
            this.pool = [];
            for (let i = 0; i < NOTE_POOL_SIZE; i++) {
                this.pool.push({
                    inUse: false,
                    lane: 0,
                    time: 0,
                    type: 'tap',
                    duration: 0,
                    endTime: 0,
                    hit: false,
                    holding: false,
                    completed: false,
                    failed: false,
                    released: false,
                    missed: false,
                    fadeStartTime: 0,
                    hitAnimStart: 0,
                    hitVisualY: 0,
                    hitRating: 'good',
                    holdTicks: 0,
                    lastValidHoldTime: 0,
                    botOffset: 0
                });
            }
        },
        obtain(tileDef) {
            if (!this.pool || this.pool.length === 0) this.init();
            let note = null;
            for (let i = 0; i < this.pool.length; i++) {
                if (!this.pool[i].inUse) {
                    note = this.pool[i];
                    break;
                }
            }
            if (!note) {
                note = { inUse: false };
                this.pool.push(note);
            }
            note.inUse = true;
            note.lane = tileDef.lane;
            note.time = tileDef.time;
            note.type = tileDef.type;
            note.duration = tileDef.duration || 0;
            note.endTime = tileDef.endTime || tileDef.time;
            note.hit = false;
            note.holding = false;
            note.completed = false;
            note.failed = false;
            note.released = false;
            note.missed = false;
            note.fadeStartTime = 0;
            note.releaseSongTime = 0;
            note.hitAnimStart = 0;
            note.hitVisualY = 0;
            note.hitRating = 'good';
            note.holdTicks = 0;
            note.lastValidHoldTime = 0;
            note.botOffset = 0;
            return note;
        },
        release(note) {
            if (note) {
                note.inUse = false;
                note.hit = false;
                note.hitTime = 0;
                note.holding = false;
                note.completed = false;
                note.failed = false;
                note.released = false;
                note.missed = false;
                note.fadeStartTime = 0;
                note.releaseSongTime = 0;
                note.hitAnimStart = 0;
                note.hitVisualY = 0;
                note.hitRating = 'good';
            }
        },
        resetAll() {
            for (let i = 0; i < this.pool.length; i++) {
                this.release(this.pool[i]);
            }
        }
    };
    NotePool.init();

    // ==========================================
    // SPRITE CACHING (OFFSCREENCANVAS) ДЛЯ НОТ ТА ЕФЕКТІВ
    // Рендерить градієнти, світіння (shadowBlur) та обводки один раз.
    // В ігровому циклі виконується виключно блискавичний ctx.drawImage().
    // ==========================================
    const SpriteCache = {
        tap: {},
        longHead: {},
        longTail: {},
        receptorIdle: null,
        receptorActive: null,
        sheen: null,
        margin: 16,

        init(w, h, laneW, isLight) {
            if (!w || !h || !laneW) return;
            this.tap = {};
            this.longHead = {};
            this.longTail = {};
            const margin = this.margin;
            const cWidth = Math.ceil(w + margin * 2);
            const cHeight = Math.ceil(h + margin * 2);
            const noteRadius = Math.max(6, Math.round(w * 0.09));
            const glossInset = Math.max(4, Math.round(w * 0.08));
            const glossH = Math.max(3, Math.round(h * 0.022));

            const activeFieldTheme = FieldThemes.getActiveTheme();
            let themeSteel = PALETTES.STEEL;
            let themeElectric = PALETTES.ELECTRIC;
            let themeGold = PALETTES.GOLD;
            let themeCosmic = PALETTES.COSMIC;
            let themeLegendary = PALETTES.LEGENDARY;

            if (activeFieldTheme.id === 'phrolova') {
                themeSteel = { light: '#fda4af', main: '#e11d48', dark: '#9f1239', glow: 'rgba(225, 29, 72, 0.45)', border: '#f43f5e', long1: '#be123c', long2: '#881337' };
                themeElectric = { tap1: '#fecdd3', tap2: '#f43f5e', glow: 'rgba(244, 63, 94, 0.45)', border: '#fda4af', long1: '#e11d48', long2: '#9f1239' };
                themeGold = { black: '#ffe4e6', choco: '#e11d48', glow: 'rgba(251, 113, 133, 0.45)', border: '#ffe4e6', long1: '#fb7185', long2: '#be123c' };
                themeCosmic = { core: '#fff1f2', accent: '#be123c', glow: 'rgba(225, 29, 72, 0.55)', border: '#fecdd3', long1: '#f43f5e', long2: '#4c0519' };
                themeLegendary = { tap1: '#ffffff', tap2: '#e11d48', glow: 'rgba(255, 255, 255, 0.65)', border: '#ffffff', long1: '#f43f5e', long2: '#881337' };
            } else if (activeFieldTheme.id === 'dark_angel') {
                themeSteel = { light: '#d8b4fe', main: '#9333ea', dark: '#581c87', glow: 'rgba(168, 85, 247, 0.45)', border: '#c084fc', long1: '#7e22ce', long2: '#581c87' };
                themeElectric = { tap1: '#e9d5ff', tap2: '#a855f7', glow: 'rgba(168, 85, 247, 0.45)', border: '#d8b4fe', long1: '#9333ea', long2: '#6b21a8' };
                themeGold = { black: '#f3e8ff', choco: '#7c3aed', glow: 'rgba(124, 58, 237, 0.45)', border: '#f3e8ff', long1: '#a855f7', long2: '#581c87' };
                themeCosmic = { core: '#fae8ff', accent: '#6b21a8', glow: 'rgba(192, 132, 252, 0.55)', border: '#fae8ff', long1: '#c084fc', long2: '#3b0764' };
                themeLegendary = { tap1: '#ffffff', tap2: '#9333ea', glow: 'rgba(255, 255, 255, 0.65)', border: '#ffffff', long1: '#c084fc', long2: '#581c87' };
            } else if (activeFieldTheme.id === 'cosmic') {
                themeSteel = { light: '#a5b4fc', main: '#4f46e5', dark: '#312e81', glow: 'rgba(99, 102, 241, 0.45)', border: '#818cf8', long1: '#4338ca', long2: '#312e81' };
                themeElectric = { tap1: '#c7d2fe', tap2: '#6366f1', glow: 'rgba(99, 102, 241, 0.45)', border: '#a5b4fc', long1: '#4f46e5', long2: '#3730a3' };
                themeGold = { black: '#e0e7ff', choco: '#4338ca', glow: 'rgba(129, 140, 248, 0.45)', border: '#e0e7ff', long1: '#6366f1', long2: '#312e81' };
                themeCosmic = { core: '#eef2ff', accent: '#3730a3', glow: 'rgba(165, 180, 252, 0.55)', border: '#eef2ff', long1: '#818cf8', long2: '#1e1b4b' };
                themeLegendary = { tap1: '#ffffff', tap2: '#4f46e5', glow: 'rgba(255, 255, 255, 0.65)', border: '#ffffff', long1: '#818cf8', long2: '#312e81' };
            } else if (activeFieldTheme.id === 'iuno') {
                themeSteel = { light: '#e0f2fe', main: '#38bdf8', dark: '#0369a1', glow: 'rgba(56, 189, 248, 0.45)', border: '#fbbf24', long1: '#38bdf8', long2: '#0284c7' };
                themeElectric = { tap1: '#fef3c7', tap2: '#fbbf24', glow: 'rgba(251, 191, 36, 0.45)', border: '#7dd3fc', long1: '#fbbf24', long2: '#d97706' };
                themeGold = { black: '#fffbeb', choco: '#d97706', glow: 'rgba(251, 191, 36, 0.55)', border: '#fef3c7', long1: '#f59e0b', long2: '#b45309' };
                themeCosmic = { core: '#f0fdf4', accent: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.55)', border: '#99f6e4', long1: '#2dd4bf', long2: '#0f766e' };
                themeLegendary = { tap1: '#ffffff', tap2: '#fbbf24', glow: 'rgba(255, 255, 255, 0.70)', border: '#ffffff', long1: '#fbbf24', long2: '#38bdf8' };
            } else if (activeFieldTheme.id === 'hado99') {
                themeSteel = { light: '#f3e8ff', main: '#c084fc', dark: '#581c87', glow: 'rgba(168, 85, 247, 0.55)', border: '#d8b4fe', long1: '#9333ea', long2: '#3b0764' };
                themeElectric = { tap1: '#fae8ff', tap2: '#a855f7', glow: 'rgba(192, 132, 252, 0.60)', border: '#f0abfc', long1: '#a855f7', long2: '#581c87' };
                themeGold = { black: '#fdf4ff', choco: '#c026d3', glow: 'rgba(217, 70, 239, 0.65)', border: '#f5d0fe', long1: '#c026d3', long2: '#701a75' };
                themeCosmic = { core: '#ffffff', accent: '#d946ef', glow: 'rgba(232, 121, 249, 0.75)', border: '#ffffff', long1: '#e879f9', long2: '#4a044e' };
                themeLegendary = { tap1: '#ffffff', tap2: '#f0abfc', glow: 'rgba(255, 255, 255, 0.85)', border: '#ffffff', long1: '#f472b6', long2: '#831843' };
            }

            const styles = [
                { name: 'steel', p: themeSteel, tier: 0, c1: themeSteel.light || themeSteel.tap1, c2: themeSteel.main || themeSteel.tap2, l1: themeSteel.long1, l2: themeSteel.long2 },
                { name: 'electric', p: themeElectric, tier: 100, c1: themeElectric.tap1, c2: themeElectric.tap2, l1: themeElectric.long1, l2: themeElectric.long2 },
                { name: 'gold', p: themeGold, tier: 200, c1: themeGold.black, c2: themeGold.choco, l1: themeGold.long1, l2: themeGold.long2 },
                { name: 'cosmic', p: themeCosmic, tier: 400, c1: themeCosmic.core, c2: themeCosmic.accent, l1: themeCosmic.long1, l2: themeCosmic.long2 },
                { name: 'legendary', p: themeLegendary, tier: 800, c1: themeLegendary.tap1, c2: themeLegendary.tap2, l1: themeLegendary.long1, l2: themeLegendary.long2 }
            ];

            // Динамічне кешування спрайтів для унікальних палітр комбо-рівнів поточної теми
            const themeTiers = activeFieldTheme.comboTiers || [];
            themeTiers.forEach(t => {
                if (!styles.some(s => s.name === t.name)) {
                    styles.push({
                        name: t.name,
                        p: { border: t.border, glow: t.glow },
                        tier: t.min,
                        c1: t.particleColors[1] || t.particleColors[0],
                        c2: t.particleColors[0],
                        l1: t.particleColors[0],
                        l2: t.particleColors[2] || t.particleColors[0]
                    });
                }
            });

            styles.forEach(s => {
                // 1. Спрайт Tap ноти
                const tapC = document.createElement('canvas');
                tapC.width = cWidth;
                tapC.height = cHeight;
                const tctx = tapC.getContext('2d');

                let customTapBaked = false;
                if (activeFieldTheme && typeof activeFieldTheme.bakeTapNote === 'function') {
                    try {
                        customTapBaked = activeFieldTheme.bakeTapNote(tctx, margin, margin, w, h, isLight, s);
                    } catch (e) {
                        console.warn('Theme bakeTapNote error:', e);
                    }
                }

                if (!customTapBaked) {
                    const tapGrad = tctx.createLinearGradient(margin, margin, margin, margin + h);
                    tapGrad.addColorStop(0, s.c1 || '#38bdf8');
                    tapGrad.addColorStop(1, s.c2 || '#0284c7');

                    tctx.shadowColor = s.p.glow || 'rgba(56, 189, 248, 0.45)';
                    tctx.shadowBlur = (s.tier >= 800) ? 6 : ((s.tier >= 200) ? 4 : 2);
                    tctx.fillStyle = tapGrad;
                    tctx.beginPath();
                    if (tctx.roundRect) tctx.roundRect(margin, margin, w, h, noteRadius);
                    else tctx.fillRect(margin, margin, w, h);
                    tctx.fill();

                    tctx.shadowBlur = 0;
                    tctx.strokeStyle = s.p.border || '#38bdf8';
                    tctx.lineWidth = (s.tier >= 800) ? 1.8 : ((s.tier >= 200) ? 1.5 : 1.2);
                    tctx.stroke();

                    tctx.fillStyle = "rgba(255, 255, 255, 0.20)";
                    tctx.beginPath();
                    if (tctx.roundRect) tctx.roundRect(margin + glossInset, margin + 4, w - (glossInset * 2), glossH, 2);
                    else tctx.fillRect(margin + glossInset, margin + 4, w - (glossInset * 2), glossH);
                    tctx.fill();

                    tctx.fillStyle = "rgba(0, 0, 0, 0.20)";
                    tctx.fillRect(margin, margin + h - 5, w, 5);

                    if (s.tier >= 400) {
                        const starX = margin + w / 2;
                        const starY = margin + h / 2;
                        const rOuter = (s.tier >= 800) ? Math.max(6, Math.round(w * 0.075)) : Math.max(5, Math.round(w * 0.058));
                        const rInner = rOuter * 0.28;
                        tctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                        tctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
                        tctx.shadowBlur = 4;
                        tctx.beginPath();
                        tctx.moveTo(starX + rOuter, starY);
                        tctx.lineTo(starX + rInner * 0.7071, starY + rInner * 0.7071);
                        tctx.lineTo(starX, starY + rOuter);
                        tctx.lineTo(starX - rInner * 0.7071, starY + rInner * 0.7071);
                        tctx.lineTo(starX - rOuter, starY);
                        tctx.lineTo(starX - rInner * 0.7071, starY - rInner * 0.7071);
                        tctx.lineTo(starX, starY - rOuter);
                        tctx.lineTo(starX + rInner * 0.7071, starY - rInner * 0.7071);
                        tctx.closePath();
                        tctx.fill();
                        tctx.shadowBlur = 0;
                    }

                    // Оптимізація: запікаємо декор та гліфи активної теми безпосередньо в кеш-спрайт
                    if (activeFieldTheme && typeof activeFieldTheme.drawNoteDetails === 'function') {
                        try {
                            activeFieldTheme.drawNoteDetails(tctx, margin, margin, w, h, isLight, s.name);
                        } catch (e) {
                            console.warn('Theme drawNoteDetails bake error (tap):', e);
                        }
                    }
                }

                this.tap[s.name] = tapC;

                // 2. Спрайт голови довгої ноти
                const headC = document.createElement('canvas');
                headC.width = cWidth;
                headC.height = cHeight;
                const hctx = headC.getContext('2d');

                let customHeadBaked = false;
                if (activeFieldTheme && typeof activeFieldTheme.bakeLongHead === 'function') {
                    try {
                        customHeadBaked = activeFieldTheme.bakeLongHead(hctx, margin, margin, w, h, isLight, s);
                    } catch (e) {
                        console.warn('Theme bakeLongHead error:', e);
                    }
                }

                if (!customHeadBaked) {
                    const headGrad = hctx.createLinearGradient(margin, margin, margin, margin + h);
                    headGrad.addColorStop(0, s.l1 || '#6366f1');
                    headGrad.addColorStop(1, s.l2 || '#0284c7');

                    hctx.shadowColor = s.p.glow || 'rgba(56, 189, 248, 0.45)';
                    hctx.shadowBlur = (s.tier >= 800) ? 6 : 3;
                    hctx.fillStyle = headGrad;
                    hctx.beginPath();
                    if (hctx.roundRect) hctx.roundRect(margin, margin, w, h, noteRadius);
                    else hctx.fillRect(margin, margin, w, h);
                    hctx.fill();

                    hctx.shadowBlur = 0;
                    hctx.strokeStyle = s.p.border || '#38bdf8';
                    hctx.lineWidth = 1.5;
                    hctx.stroke();

                    hctx.fillStyle = "rgba(255, 255, 255, 0.20)";
                    hctx.beginPath();
                    if (hctx.roundRect) hctx.roundRect(margin + glossInset, margin + 4, w - (glossInset * 2), glossH, 2);
                    else hctx.fillRect(margin + glossInset, margin + 4, w - (glossInset * 2), glossH);
                    hctx.fill();

                    // Оптимізація: запікаємо декор та гліфи активної теми безпосередньо в кеш-спрайт голови довгої ноти
                    if (activeFieldTheme && typeof activeFieldTheme.drawNoteDetails === 'function') {
                        try {
                            activeFieldTheme.drawNoteDetails(hctx, margin, margin, w, h, isLight, s.name);
                        } catch (e) {
                            console.warn('Theme drawNoteDetails bake error (head):', e);
                        }
                    }
                }

                this.longHead[s.name] = headC;

                // 3. Спрайт хвоста довгої ноти (вертикальна смуга розтягування)
                const tailW = Math.max(10, Math.round(w - 16));
                const tailH = 384;
                const tailC = document.createElement('canvas');
                tailC.width = tailW;
                tailC.height = tailH;
                const tlctx = tailC.getContext('2d');

                let customTailBaked = false;
                if (activeFieldTheme && typeof activeFieldTheme.bakeLongTail === 'function') {
                    try {
                        customTailBaked = activeFieldTheme.bakeLongTail(tlctx, tailW, tailH, isLight, s);
                    } catch (e) {
                        console.warn('Theme bakeLongTail error:', e);
                    }
                }

                if (!customTailBaked) {
                    const tailGrad = tlctx.createLinearGradient(0, 0, 0, tailH);
                    tailGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
                    tailGrad.addColorStop(0.2, s.l2 || '#0284c7');
                    tailGrad.addColorStop(1, s.l1 || '#6366f1');
                    tlctx.fillStyle = tailGrad;
                    tlctx.fillRect(0, 0, tailW, tailH);

                    tlctx.fillStyle = (s.tier >= 800) ? 'rgba(255, 255, 255, 0.55)' : ((s.tier >= 200) ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.20)');
                    tlctx.fillRect(Math.floor(tailW / 2 - 1.5), 0, 3, tailH);
                }

                this.longTail[s.name] = tailC;
            });

            // Спеціальні спрайти для dead/failed та released нот
            const colors = isLight ? CONFIG.colorsLight : CONFIG.colorsDark;
            ['dead', 'released'].forEach(st => {
                const headC = document.createElement('canvas');
                headC.width = cWidth;
                headC.height = cHeight;
                const hctx = headC.getContext('2d');
                
                if (st === 'released') {
                    // Стильний попелясто-графітовий градієнт для відпущеної довгої ноти
                    const headGrad = hctx.createLinearGradient(0, margin, 0, margin + h);
                    if (isLight) {
                        headGrad.addColorStop(0, '#94a3b8');
                        headGrad.addColorStop(1, '#64748b');
                    } else {
                        headGrad.addColorStop(0, '#475569');
                        headGrad.addColorStop(1, '#1e293b');
                    }
                    hctx.fillStyle = headGrad;
                    hctx.beginPath();
                    if (hctx.roundRect) hctx.roundRect(margin, margin, w, h, noteRadius);
                    else hctx.fillRect(margin, margin, w, h);
                    hctx.fill();

                    // Матовий світлий блік зверху
                    hctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.22)';
                    hctx.beginPath();
                    if (hctx.roundRect) hctx.roundRect(margin + 4, margin + 4, w - 8, 6, 2);
                    else hctx.fillRect(margin + 4, margin + 4, w - 8, 6);
                    hctx.fill();

                    // Тонка срібляста рамка
                    hctx.strokeStyle = isLight ? 'rgba(71, 85, 105, 0.5)' : 'rgba(148, 163, 184, 0.55)';
                    hctx.lineWidth = 1.5;
                    hctx.stroke();
                } else {
                    const col = colors[st];
                    hctx.fillStyle = col[0] || '#555';
                    hctx.beginPath();
                    if (hctx.roundRect) hctx.roundRect(margin, margin, w, h, noteRadius);
                    else hctx.fillRect(margin, margin, w, h);
                    hctx.fill();
                    hctx.strokeStyle = 'rgba(255,255,255,0.3)';
                    hctx.lineWidth = 1.5;
                    hctx.stroke();
                }
                this.longHead[st] = headC;

                const tailW = Math.max(10, Math.round(w - 16));
                const tailH = 384;
                const tailC = document.createElement('canvas');
                tailC.width = tailW;
                tailC.height = tailH;
                const tlctx = tailC.getContext('2d');
                
                if (st === 'released') {
                    // Димчасто-сірий попелястий хвіст, що згасає
                    const tailGrad = tlctx.createLinearGradient(0, 0, 0, tailH);
                    if (isLight) {
                        tailGrad.addColorStop(0, 'rgba(148, 163, 184, 0.05)');
                        tailGrad.addColorStop(0.3, 'rgba(148, 163, 184, 0.35)');
                        tailGrad.addColorStop(1, 'rgba(100, 116, 139, 0.65)');
                    } else {
                        tailGrad.addColorStop(0, 'rgba(100, 116, 139, 0.05)');
                        tailGrad.addColorStop(0.3, 'rgba(71, 85, 105, 0.38)');
                        tailGrad.addColorStop(1, 'rgba(51, 65, 85, 0.72)');
                    }
                    tlctx.fillStyle = tailGrad;
                    tlctx.fillRect(0, 0, tailW, tailH);

                    // Центральна тонка лінія залишку енергії
                    tlctx.fillStyle = isLight ? 'rgba(71, 85, 105, 0.35)' : 'rgba(203, 213, 225, 0.25)';
                    tlctx.fillRect(Math.floor(tailW / 2 - 1), 0, 2, tailH);
                } else {
                    const col = colors[st];
                    const tailGrad = tlctx.createLinearGradient(0, 0, 0, tailH);
                    tailGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
                    tailGrad.addColorStop(1, col[1] || '#222');
                    tlctx.fillStyle = tailGrad;
                    tlctx.fillRect(0, 0, tailW, tailH);
                }
                this.longTail[st] = tailC;
            });

            // 4. Спрайти зон натискання (Hit Target Receptors)
            const padW = laneW - 10;
            const padH = 26;
            const recMargin = 8;
            const recW = Math.ceil(padW + recMargin * 2);
            const recH = Math.ceil(padH + recMargin * 2);

            const idleC = document.createElement('canvas');
            idleC.width = recW;
            idleC.height = recH;
            const ictx = idleC.getContext('2d');
            ictx.fillStyle = "rgba(255, 255, 255, 0.03)";
            ictx.strokeStyle = "rgba(255, 255, 255, 0.12)";
            ictx.lineWidth = 1;
            ictx.beginPath();
            if (ictx.roundRect) ictx.roundRect(recMargin, recMargin, padW, padH, 6);
            else ictx.fillRect(recMargin, recMargin, padW, padH);
            ictx.fill();
            ictx.stroke();
            this.receptorIdle = idleC;

            const actC = document.createElement('canvas');
            actC.width = recW;
            actC.height = recH;
            const actx = actC.getContext('2d');
            const recGlow = activeFieldTheme.colors?.stringGlow || "rgba(56, 189, 248, 0.45)";
            const recAura = activeFieldTheme.colors?.bgAura || "rgba(56, 189, 248, 0.15)";
            const recBorder = activeFieldTheme.colors?.receptorBorder || "rgba(56, 189, 248, 0.70)";
            actx.shadowColor = recGlow;
            actx.shadowBlur = 6;
            actx.fillStyle = recAura;
            actx.strokeStyle = recBorder;
            actx.lineWidth = 1.5;
            actx.beginPath();
            if (actx.roundRect) actx.roundRect(recMargin, recMargin, padW, padH, 6);
            else actx.fillRect(recMargin, recMargin, padW, padH);
            actx.fill();
            actx.stroke();
            this.receptorActive = actC;

            // 5. Відблиск (Sheen)
            const sheenC = document.createElement('canvas');
            sheenC.width = 32;
            sheenC.height = h;
            const sctx = sheenC.getContext('2d');
            const sGrad = sctx.createLinearGradient(0, 0, 32, 0);
            sGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            sGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
            sGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            sctx.fillStyle = sGrad;
            sctx.fillRect(0, 0, 32, h);
            this.sheen = sheenC;

            this.initRatings();
            pixiRenderer.syncThemeTextures(this);
        },

        initRatings() {
            this.ratings = {};
            const types = [
                {
                    key: 'rating-perfect',
                    text: (getText('perfect') || 'ІДЕАЛЬНО').toUpperCase(),
                    fontSize: 36,
                    shadowColor: '#00f2fe',
                    shadowBlur: 16,
                    grad: ['#ffffff', '#e0f2fe', '#38bdf8'],
                    stroke: 'rgba(56, 189, 248, 0.6)'
                },
                {
                    key: 'rating-good',
                    text: (getText('good') || 'ДОБРЕ').toUpperCase(),
                    fontSize: 30,
                    shadowColor: '#34d399',
                    shadowBlur: 12,
                    color: '#6ee7b7',
                    stroke: 'rgba(52, 211, 153, 0.5)'
                },
                {
                    key: 'rating-miss',
                    text: (getText('miss') || 'ПРОМАХ').toUpperCase(),
                    fontSize: 28,
                    shadowColor: '#f43f5e',
                    shadowBlur: 12,
                    color: '#fda4af',
                    stroke: 'rgba(244, 63, 94, 0.5)'
                }
            ];

            types.forEach(cfg => {
                const c = document.createElement('canvas');
                c.width = 340;
                c.height = 100;
                const rctx = c.getContext('2d');
                const cx = 170;
                const cy = 50;

                rctx.textAlign = 'center';
                rctx.textBaseline = 'middle';
                rctx.font = `900 ${cfg.fontSize}px 'Montserrat', 'Inter', system-ui, -apple-system, sans-serif`;

                rctx.shadowColor = cfg.shadowColor;
                rctx.shadowBlur = cfg.shadowBlur;

                if (cfg.grad) {
                    const grad = rctx.createLinearGradient(0, cy - cfg.fontSize / 2, 0, cy + cfg.fontSize / 2);
                    grad.addColorStop(0, cfg.grad[0]);
                    grad.addColorStop(0.4, cfg.grad[1]);
                    grad.addColorStop(1, cfg.grad[2]);
                    rctx.fillStyle = grad;
                } else {
                    rctx.fillStyle = cfg.color;
                }

                rctx.fillText(cfg.text, cx, cy);

                rctx.shadowBlur = 0;
                rctx.strokeStyle = cfg.stroke;
                rctx.lineWidth = 1.5;
                rctx.strokeText(cfg.text, cx, cy);

                this.ratings[cfg.key] = c;
            });
        },

        getRatingSprite(key) {
            return this.ratings[key] || null;
        },

        getTapSprite(name) {
            return this.tap[name] || this.tap['steel'];
        },

        getLongHeadSprite(name) {
            return this.longHead[name] || this.longHead['steel'];
        },

        getLongTailSprite(name) {
            return this.longTail[name] || this.longTail['steel'];
        }
    };

    // Ініціалізація градієнтів та кешу
    function initGradients() {
        if (!ctx) return;
        const styles = [
            { name: 'steel', c1: PALETTES.STEEL.light, c2: PALETTES.STEEL.main, l1: PALETTES.STEEL.long1, l2: PALETTES.STEEL.long2 },
            { name: 'electric', c1: PALETTES.ELECTRIC.tap1, c2: PALETTES.ELECTRIC.tap2, l1: PALETTES.ELECTRIC.long1, l2: PALETTES.ELECTRIC.long2 },
            { name: 'gold', c1: PALETTES.GOLD.black, c2: PALETTES.GOLD.choco, l1: PALETTES.GOLD.long1, l2: PALETTES.GOLD.long2 },
            { name: 'cosmic', c1: PALETTES.COSMIC.core, c2: PALETTES.COSMIC.accent, l1: PALETTES.COSMIC.long1, l2: PALETTES.COSMIC.long2 },
            { name: 'legendary', c1: PALETTES.LEGENDARY.tap1, c2: PALETTES.LEGENDARY.tap2, l1: PALETTES.LEGENDARY.long1, l2: PALETTES.LEGENDARY.long2 }
        ];

        const h = CONFIG.noteHeight;
        styles.forEach(style => {
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, style.c1);
            grad.addColorStop(1, style.c2);
            GRADIENT_CACHE.tap[style.name] = grad;

            const hGrad = ctx.createLinearGradient(0, 0, 0, h);
            hGrad.addColorStop(0, style.l1);
            hGrad.addColorStop(1, style.l2);
            GRADIENT_CACHE.longHead[style.name] = hGrad;
        });

        const gHeight = State.gameHeight || 600;
        const dividerGrad = ctx.createLinearGradient(0, 0, 0, gHeight);
        dividerGrad.addColorStop(0, 'rgba(56, 189, 248, 0.04)');
        dividerGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.16)');
        dividerGrad.addColorStop(CONFIG.hitPosition, 'rgba(56, 189, 248, 0.35)');
        dividerGrad.addColorStop(1, 'rgba(56, 189, 248, 0.06)');
        GRADIENT_CACHE.divider = dividerGrad;
    }

    // ==========================================
    // Основна логіка гри та ігровий цикл.
    // ==========================================

    function resetGameState() {
        State.currentSessionId++;
        if (State.animationFrameId) { cancelAnimationFrame(State.animationFrameId); State.animationFrameId = null; }
        if (State.sourceNode) { try { State.sourceNode.stop(); } catch (e) { } State.sourceNode = null; }
        State.isPlaying = false; State.isPaused = false;
        State.isCheated = false;
        State.lastFrameTime = 0; // Критично: скидаємо дельту кадру, щоб новий рівень не викликав хибну автопаузу
        State.startTime = 0;
        if (State.audioCtx && typeof State.audioCtx.resume === 'function' && State.audioCtx.state !== 'running') {
            State.audioCtx.resume().catch(() => {});
        }

        State.score = 0; State.combo = 0; State.maxCombo = 0; State.consecutiveMisses = 0;
        State.screenShake = 0;
        State.laneStringVibe = [0, 0, 0, 0];
        State.totalMisses = 0; // ЗМІНА: Змінна для підрахунку загальної кількості промахів гравця за всю гру.
        State.totalHits = 0;
        State.perfectHits = 0;
        State.starStatus = [0, 0, 0, 0, 0]; // ЗМІНА: Я скидаю стан масиву 5 зірок на початку кожної нової ігрової сесії.
        State.lastComboUpdateTime = 0;
        // Модифікатори залишаються при рестарті (гравець обрав їх свідомо), перераховую множник.
        State.scoreMultiplier = computeScoreMultiplier(State.selectedSpeed, State.isHardcore);
        NotePool.resetAll();
        State.activeTiles = []; State.mapTiles = []; State.nextSpawnIndex = 0;
        
        // Скидання стану всіх частинок у пулі, щоб вони були готові до повторного використання у новій грі.
        for(let i=0; i<MAX_PARTICLES; i++) particlePool[i].active = false;
        if (pixiRenderer && pixiRenderer.clearParticles) pixiRenderer.clearParticles();
        State.activeRatings = [];
        
        State.comboScale = 1.0;
        State.currentComboTier = 'none';

        State.holdingTiles = [null, null, null, null];
        State.keyState = [false, false, false, false];
        State.laneLastType = ['tap', 'tap', 'tap', 'tap'];
        State.laneBeamAlpha = [0, 0, 0, 0];
        State.ripples = [];
        State.lastRippleUpdateMs = Date.now();
        State.dynamicSpeedMultiplier = State.selectedSpeed || 1.0;
        State.bgPulse = 0;
        // Відмова від очищення ефектів утримання через DOM, оскільки я перевів ці візуалізації на Canvas для кращої продуктивності.
        // if (holdEffectsContainer) holdEffectsContainer.innerHTML = '';
        
        if (gameContainer) {
            gameContainer.className = ''; 
            gameContainer.id = 'game-container';
        }
        
        const legendaryOverlay = document.getElementById('legendary-border-overlay');
        if (legendaryOverlay) legendaryOverlay.classList.remove('active');
        
        updateScoreUI(); 
        if (progressBar) progressBar.style.width = '0%';
        document.getElementById('pause-modal')?.classList.add('hidden');
        document.getElementById('result-screen')?.classList.add('hidden');
        starsElements.forEach(s => {
            if (s) {
                s.className = 'star-marker';
                s.innerHTML = icons.starEmpty(16);
                s.style.display = '';
            }
        });
        laneElements.forEach(el => { if (el) el.classList.remove('active'); });
        laneKeyElements.forEach(el => { if (el) el.classList.remove('active'); });
        if(ctx) {
            initGradients();
            draw();
            pixiRenderer.render(0, State);
            pixiRenderer.clearNotes();
        }
    }

function getSavedData(songTitle) {
    try {
        const data = localStorage.getItem(`neon_rhythm_${songTitle}`);
        if (!data) return { score: 0, stars: 0, starTypes: [], difficulty: '', isHardcore: false, completedDifficulties: [] };
        const parsed = JSON.parse(data);
        // Автоматичне виправлення: якщо результат з попереднього сеансу зберігся як 'hard' через неточність визначення хардкору
        if (parsed && parsed.difficulty === 'hard' && parsed.isHardcore !== false) {
            parsed.difficulty = 'hardcore';
            parsed.isHardcore = true;
        }
        if (parsed) {
            if (!Array.isArray(parsed.completedDifficulties)) {
                const diffs = [];
                if (parsed.difficulty) diffs.push(parsed.difficulty);
                if (parsed.isHardcore && !diffs.includes('hardcore')) diffs.push('hardcore');
                parsed.completedDifficulties = diffs;
            }
            if (typeof parsed.isHardcore === 'undefined') {
                parsed.isHardcore = parsed.difficulty === 'hardcore';
            }
        }
        return parsed;
    } catch (e) { return { score: 0, stars: 0, starTypes: [], difficulty: '', isHardcore: false, completedDifficulties: [] }; }
}

function saveGameData(songTitle, newScore, newStars, isVictory = true) {
    const current = getSavedData(songTitle);
    const finalScore = Math.max(newScore, current.score || 0);
    const finalStars = Math.max(newStars, current.stars || 0);
    
    // ЗМІНА: Логіка злиття діамантових зірок. Я реалізував алгоритм, який зберігає максимальне значення типу зірки (діамант пріоритетніший за золото).
    // Ми беремо старі типи зірок і оновлюємо їх новими, ТІЛЬКИ якщо новий тип кращий (2 > 1 > 0)
    let finalTypes = current.starTypes || [];
    
    // Заповнюємо масив, якщо він короткий
    for(let k=0; k<5; k++) {
        if(finalTypes[k] === undefined) finalTypes[k] = 0;
    }

    // State.starStatus - це результат поточної гри
    for (let i = 0; i < 5; i++) {
        const newType = State.starStatus[i] || 0;
        const oldType = finalTypes[i] || 0;
        // Зберігаємо максимум: якщо була Діамантова (2), вона залишиться (2), навіть якщо зараз Золота (1)
        finalTypes[i] = Math.max(newType, oldType);
    }

    const currentRank = getDiffRank(current.difficulty, current.isHardcore);
    const currentCompleted = Array.isArray(current.completedDifficulties)
        ? [...current.completedDifficulties]
        : (current.difficulty ? [current.difficulty] : []);
    const completedSet = new Set(currentCompleted);

    let finalDifficulty = current.difficulty || '';
    let finalIsHardcore = Boolean(current.isHardcore);

    if (isVictory) {
        const newDiffKey = getDifficultyKey();
        const newRank = getDiffRank(newDiffKey, State.isHardcore);
        completedSet.add(newDiffKey);
        if (State.isHardcore) completedSet.add('hardcore');

        const isNewBest = newScore >= (current.score || 0);
        // Якщо новий результат здобуто на вищій/рівній складності або це новий абсолютний рекорд
        if (newRank >= currentRank || isNewBest || !current.difficulty) {
            finalDifficulty = newDiffKey;
            finalIsHardcore = Boolean(State.isHardcore);
        }
    }

    const finalCompletedDiffs = Array.from(completedSet).filter(Boolean);

    const payload = { 
        score: finalScore, 
        stars: finalStars, 
        starTypes: finalTypes,
        difficulty: finalDifficulty,
        isHardcore: finalIsHardcore,
        completedDifficulties: finalCompletedDiffs
    };

    localStorage.setItem(`neon_rhythm_${songTitle}`, JSON.stringify(payload));
    if (typeof updateShopCoins === 'function') {
        updateShopCoins();
    }

    // Хмарна прив'язка до акаунта гравця
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id) {
        saveCloudUserProgress(currentUser.id, songTitle, payload);
    }
}

    // Мій рушій Pulse Engine для процедурної генерації карти нот. Я використовую Web Audio API для декодування аудіофайлу, аналізую його амплітуду та зміни енергії (flux), щоб розставити ноти відповідно до ритму пісні.
    async function analyzeAudio(url, sessionId) {
        if (!State.audioCtx) State.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (!State.masterGain) {
            State.masterGain = State.audioCtx.createGain();
            State.masterGain.gain.value = State.isMuted ? 0 : 1;
            State.masterGain.connect(State.audioCtx.destination);
        }
        if (State.audioCtx.state === 'suspended') await State.audioCtx.resume();
        // 1. Створення унікального зерна (seed) на основі назви пісні для детермінованої генерації випадкових чисел.
    const songTitle = (songsDB[State.currentSongIndex] && songsDB[State.currentSongIndex].title) ? songsDB[State.currentSongIndex].title : "Track";
    let seed = 0;
    for (let i = 0; i < songTitle.length; i++) {
        seed = ((seed << 5) - seed) + songTitle.charCodeAt(i);
        seed |= 0; // Превращаем в 32bit integer
    }
    if (seed < 0) seed = -seed; // Убираем минус
    if (seed === 0) seed = 12345; // Защита от нуля

    // 2. Моя реалізація лінійного конгруентного генератора (LCG). Я використовую його замість Math.random(), щоб гарантувати, що для однієї і тієї ж пісні завжди генеруватиметься абсолютно однакова послідовність нот на будь-якому пристрої.
    const getStableRandom = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };

        // Перевірка in-memory кешу аудіобуферів та згенерованих нот з урахуванням обраної складності
        const diffKey = getDifficultyKey() || 'easy';
        const cacheKey = `${url}_${State.currentSongIndex}_${diffKey}_v58`;
        if (audioBufferCache.has(cacheKey) && tileMapCache.has(cacheKey)) {
            State.audioBuffer = audioBufferCache.get(cacheKey);
            const cachedData = tileMapCache.get(cacheKey);
            State.maxPossibleScore = cachedData.maxPossibleScore;
            return cachedData.tiles.map(t => ({
                time: t.time,
                duration: t.duration,
                endTime: t.endTime,
                lane: t.lane,
                type: t.type,
                hit: false, holding: false, completed: false, failed: false, released: false,
                holdTicks: 0,
                hitAnimStart: 0, lastValidHoldTime: 0
            }));
        }

        try {
            let arrayBuffer;
            if (url && url.startsWith("indexeddb://")) {
                const localId = url.replace("indexeddb://", "");
                const rawData = await getAudioFromIndexedDB(localId);
                if (!rawData) throw new Error("Аудіофайл не знайдено в локальній пам'яті браузера.");
                if (rawData instanceof ArrayBuffer) arrayBuffer = rawData;
                else if (rawData instanceof Blob) arrayBuffer = await rawData.arrayBuffer();
                else throw new Error("Невідомий формат аудіо.");
            } else {
                const response = await fetch(url);
                if (!response.ok) throw new Error("Помилка завантаження аудіо (HTTP " + response.status + ")");
                arrayBuffer = await response.arrayBuffer();
            }
            if (sessionId !== State.currentSessionId) return null;
            
            // Захист від detaching буфера через slice(0).
            // decodeAudioDataSafe: підтримує і старий callback-стиль (Redmi Note 9 / Chrome < 64 WebView)
            // і сучасний Promise-стиль — без помилок на бюджетних Android.
            const decodedAudio = await new Promise((resolve, reject) => {
                try {
                    const result = State.audioCtx.decodeAudioData(
                        arrayBuffer.slice(0),
                        (buf) => resolve(buf),    // legacy callback (Chrome < 64)
                        (err) => reject(err)       // legacy error callback
                    );
                    // Modern browsers return a Promise; handle both cases
                    if (result && typeof result.then === 'function') {
                        result.then(resolve, reject);
                    }
                } catch (e) {
                    reject(e);
                }
            });
            if (sessionId !== State.currentSessionId) return null;

            let isSecret = songsDB[State.currentSongIndex] ? songsDB[State.currentSongIndex].isSecret : false;
            let startSpeedMs = isSecret ? CONFIG.speedStartSecret : CONFIG.speedStart;
            let endSpeedMs = isSecret ? CONFIG.speedEndSecret : CONFIG.speedEnd;

            const rawData = decodedAudio.getChannelData(0);
            const normalizedData = normalizeBufferAggressive(rawData);
            const sampleRate = decodedAudio.sampleRate;
            const duration = decodedAudio.duration;
            const tiles = [];

            // Pulse Engine 2.0: Багатосмуговий частотний спліт Linkwitz-Riley
            // Смуга 1 (Low): Бас-бочка, суб-бас, бас-гітара (до ~240 Гц)
            // Смуга 2 (Mid): Вокал, фортепіано, акустична/електрогітара, синтезатори (240 - 3400 Гц)
            // Смуга 3 (High): Хай-хети, перкусія, тарілки, клацання (> 3400 Гц)
            const STEP_SIZE = Math.floor(sampleRate / 100); // 10 мс вікна (100 фреймів на секунду)
            const numFrames = Math.floor(rawData.length / STEP_SIZE);
            const lowE = new Float32Array(numFrames);
            const midE = new Float32Array(numFrames);
            const highE = new Float32Array(numFrames);

            let lowF = 0, midLowF = 0;
            const aLow = Math.min(0.2, (2 * Math.PI * 240) / sampleRate);
            const aHigh = Math.min(0.7, (2 * Math.PI * 3400) / sampleRate);

            // Високопродуктивна цифрова фільтрація (IIR Linkwitz-Riley)
            for (let f = 0; f < numFrames; f++) {
                let sL = 0, sM = 0, sH = 0;
                const start = f * STEP_SIZE;
                let count = 0;
                for (let j = 0; j < STEP_SIZE; j += 2) {
                    const x = normalizedData[start + j];
                    lowF += aLow * (x - lowF);
                    midLowF += aHigh * (x - midLowF);
                    sL += Math.abs(lowF);
                    sM += Math.abs(midLowF - lowF);
                    sH += Math.abs(x - midLowF);
                    count++;
                }
                lowE[f] = sL / (count || 1);
                midE[f] = sM / (count || 1);
                highE[f] = sH / (count || 1);
            }

            let laneFreeTime = [0, 0, 0, 0];
            let laneHoldUntil = [0, 0, 0, 0];
            let lastAnyNoteTime = -10;
            let lastDoubleTime = -10;
            let consecutiveChords = 0;
            let lastPitch = 440;
            let lastLane = -1;
            let maxPossibleScoreTemp = 0;
            laneUsageStats = [0, 0, 0, 0];
            lastAllocatedLane = -1;
            keyboardFlowDirection = 1;
            currentMotif = 0;
            motifNotesCount = 0;
            motifLength = 8;

            // Динамічна конфігурація фортепіанного рушія відповідно до обраної складності (Easy, Normal, Hard, Hardcore)
            let minNoteGap = 0.35;      // Easy (1.0x): 0.35с — спокійний, комфортний та розмірений темп
            let chordPadding = 0.55;    // Вільний простір перед і після акорду (щоб подвійні ноти було зручно грати)
            let chordCooldown = 3.2;    // Акорди з'являються зважено на кульмінаціях
            let lowSens = 0.46;         // Поріг чутливості баса
            let midSens = 0.40;         // Поріг чутливості мелодії
            let minHoldDur = 0.40;

            if (diffKey === 'hardcore') {
                minNoteGap = 0.18;      // Hardcore: 0.18с для максимального драйву
                chordPadding = 0.28;
                chordCooldown = 1.4;
                lowSens = 0.28;
                midSens = 0.25;
                minHoldDur = 0.34;
            } else if (diffKey === 'hard') {
                minNoteGap = 0.23;      // Hard (1.4x): 0.23с (+57% нот, висока віртуозна щільність)
                chordPadding = 0.36;
                chordCooldown = 1.9;
                lowSens = 0.32;
                midSens = 0.28;
                minHoldDur = 0.36;
            } else if (diffKey === 'normal') {
                minNoteGap = 0.28;      // Normal (1.2x): 0.28с (+27% більше нот для збереження динаміки під 1.2x)
                chordPadding = 0.45;
                chordCooldown = 2.5;
                lowSens = 0.38;
                midSens = 0.34;
                minHoldDur = 0.38;
            } else {
                // Easy (1.0x):
                minNoteGap = 0.35;      // Easy (1.0x): 0.35с
                chordPadding = 0.55;
                chordCooldown = 3.2;
                lowSens = 0.46;
                midSens = 0.40;
                minHoldDur = 0.40;
            }

            // Розрахунок спектрального потоку (Spectral Flux) — швидкості наростання амплітуди для точного пік-пікінгу
            const lowFlux = new Float32Array(numFrames);
            const midFlux = new Float32Array(numFrames);
            const highFlux = new Float32Array(numFrames);
            for (let f = 1; f < numFrames; f++) {
                lowFlux[f] = Math.max(0, lowE[f] - lowE[f - 1]);
                midFlux[f] = Math.max(0, midE[f] - midE[f - 1]);
                highFlux[f] = Math.max(0, highE[f] - highE[f - 1]);
            }

            const avgWindow = 150; // 1.5 секунди ковзного середнього
            let lowRunningSum = 0, midRunningSum = 0, highRunningSum = 0;
            for (let k = 0; k < Math.min(avgWindow, numFrames); k++) {
                lowRunningSum += lowE[k];
                midRunningSum += midE[k];
                highRunningSum += highE[k];
            }

            for (let f = 3; f < numFrames - 2; f++) {
                const time = f / 100;

                if (f >= avgWindow) {
                    lowRunningSum += lowE[f] - lowE[f - avgWindow];
                    midRunningSum += midE[f] - midE[f - avgWindow];
                    highRunningSum += highE[f] - highE[f - avgWindow];
                }
                const curWin = Math.min(f, avgWindow);
                const lowAvg = lowRunningSum / curWin;
                const midAvg = midRunningSum / curWin;
                const highAvg = highRunningSum / curWin;

                // Пік-пікінг (Local Maxima): фрейм є початком музичної ноти/удару лише якщо це пік атаки звуку!
                const isLowPeak = (lowFlux[f] >= lowFlux[f - 1]) && (lowFlux[f] >= lowFlux[f - 2]) &&
                                  (lowFlux[f] >= lowFlux[f + 1]) && (lowFlux[f] >= lowFlux[f + 2]);
                const isMidPeak = (midFlux[f] >= midFlux[f - 1]) && (midFlux[f] >= midFlux[f - 2]) &&
                                  (midFlux[f] >= midFlux[f + 1]) && (midFlux[f] >= midFlux[f + 2]);
                const isHighPeak = (highFlux[f] >= highFlux[f - 1]) && (highFlux[f] >= highFlux[f + 1]);

                // Музичні адаптивні пороги
                const lowThreshold = Math.max(0.032, lowAvg * lowSens);
                const midThreshold = Math.max(0.028, midAvg * midSens);

                // 1. Атака мелодії (Piano Lead / вокал / соло-інструмент) — ГОЛОВНИЙ голос гри!
                const isMelodyOnset = isMidPeak && (midFlux[f] > midThreshold);
                // 2. Ритмічний біт (Kick drum) — тримає пульс, коли мелодія бере паузу
                const isBeatOnset = isLowPeak && (lowFlux[f] > lowThreshold);
                // 3. Збивка ударних (Snare / Clap): сплеск середини та верхів
                const isSnareOnset = isMidPeak && isHighPeak && ((midFlux[f] + highFlux[f]) > midThreshold * 1.5);

                // 4. Мелодичний перехід тону (Pitch change) при співі або соло
                let isPitchTransition = false;
                const sampleCenter = f * STEP_SIZE;
                if (!isMelodyOnset && midE[f] > midAvg * 0.45 && f > 15 && (time - lastAnyNoteTime > minNoteGap)) {
                    const estPitch = estimatePitchAt(rawData, sampleCenter, sampleRate);
                    const pitchRatio = estPitch / Math.max(1, lastPitch);
                    if ((pitchRatio > 1.10 || pitchRatio < 0.90) && midFlux[f] > midThreshold * 0.75) {
                        isPitchTransition = true;
                    }
                }

                // Розпізнавання музичних подій (ударні, мелодія, баси, синт):
                const isKick = isLowPeak && (lowFlux[f] > lowThreshold);
                const isSnare = isMidPeak && isHighPeak && ((midFlux[f] + highFlux[f]) > midThreshold * 1.35);
                const isMelody = isMelodyOnset || isPitchTransition;

                // Ударні та мелодійні акценти чітко розпізнаються без блокування фоновими падами!
                const isMusicalHit = isKick || isSnare || isMelody;

                // Якщо немає жодного справжнього музичного удару — НІЯКИХ НОТ "ВІД БАЛДИ"!
                if (!isMusicalHit) continue;

                let hitRole = isKick ? 'kick' : (isSnare ? 'snare' : 'melody');

                // Знаходимо точний пік атаки для бездоганного таймінгу
                let peakIdx = sampleCenter;
                let maxVal = 0;
                const pStart = Math.max(0, sampleCenter - Math.floor(STEP_SIZE * 0.4));
                const pEnd = Math.min(rawData.length, sampleCenter + Math.floor(STEP_SIZE * 0.4));
                for (let p = pStart; p < pEnd; p += 2) {
                    const v = Math.abs(rawData[p]);
                    if (v > maxVal) { maxVal = v; peakIdx = p; }
                }
                const exactTime = peakIdx / sampleRate;

                // Оцінка висоти тону на піку
                const pitch = estimatePitchAt(rawData, peakIdx, sampleRate);

                // Оцінка протяжності звуку (Hold Note): для гучних подовжених нот
                const activeHoldsCount = [0, 1, 2, 3].filter(l => exactTime < laneHoldUntil[l]).length;
                const sustainInfo = checkSustain(normalizedData, rawData, peakIdx, sampleRate, midE[f], midAvg);
                const isLoudSustain = sustainInfo.isLong && (midE[f] > midAvg * 1.15) && (sustainInfo.duration >= minHoldDur);
                const isLong = isLoudSustain && (activeHoldsCount < 1);
                const type = isLong ? 'long' : 'tap';
                const dur = isLong ? Math.min(sustainInfo.duration, 2.0) : 0;

                // Акорди двома руками: з'являються на кульмінаціях, дропах та потужних бітах
                const isDrumClimax = isKick && (lowFlux[f] > lowThreshold * 1.50) && (isMelody || isSnare);
                const isHugeDrop = isKick && (lowFlux[f] > lowThreshold * 1.80);
                const isMajorClimax = isLowPeak && isMidPeak && (lowFlux[f] > lowThreshold * 1.45) && (midFlux[f] > midThreshold * 1.35);

                // Скидаємо лічильник послідовних акордів після кулдауну
                if (exactTime - lastDoubleTime >= chordCooldown) {
                    consecutiveChords = 0;
                }

                // Дозволяємо акорд після повного кулдауну або другий акорд поруч при подвійному акценті
                let chordAllowed = false;
                if (consecutiveChords === 0) {
                    if (exactTime - lastDoubleTime >= chordCooldown) {
                        chordAllowed = true;
                    }
                } else if (consecutiveChords === 1) {
                    // Можливість двох акордів поруч (наприклад, на сусідніх сильних долях або брейкдауні)
                    const chordGap = exactTime - lastDoubleTime;
                    if (chordGap >= Math.max(0.40, minNoteGap * 1.4) && chordGap <= 1.4) {
                        chordAllowed = true;
                    }
                }

                // ВАЖЛИВО: Навколо акорду обов'язково має бути вільний простір (chordPadding)!
                // Жодна одиночна нота не повинна спамитися безпосередньо перед або після акорду!
                const isChordCandidate = (isDrumClimax || isHugeDrop || isMajorClimax) && 
                                         chordAllowed && 
                                         (exactTime - lastAnyNoteTime >= chordPadding) && 
                                         type !== 'long' && 
                                         activeHoldsCount === 0;

                if (isChordCandidate) {
                    const lanes = musicalLaneAllocator(laneFreeTime, 2, exactTime, pitch, lastPitch, lastLane, hitRole, getStableRandom);
                    if (lanes && lanes.length === 2) {
                        lanes.forEach(lane => {
                            maxPossibleScoreTemp += 50;
                            tiles.push({
                                time: exactTime * 1000,
                                duration: 0,
                                endTime: exactTime * 1000,
                                lane: lane,
                                type: 'tap',
                                hit: false, holding: false, completed: false, failed: false, released: false,
                                holdTicks: 0,
                                hitAnimStart: 0, lastValidHoldTime: 0
                            });
                            // Резервуємо смуги на час після акорду
                            laneFreeTime[lane] = exactTime + chordPadding;
                        });
                        lastPitch = pitch;
                        lastLane = lanes[1];
                        // Гарантуємо вільний простір ПІСЛЯ акорду, щоб гравець комфортно зіграв двома руками
                        lastAnyNoteTime = exactTime + chordPadding * 0.65;
                        lastDoubleTime = exactTime;
                        consecutiveChords++;
                        continue;
                    }
                }

                // Одиночна нота (або подовжена нота):
                // Генерується тільки якщо пройшов мінімальний інтервал І пройшов вільний інтервал після акорду!
                if ((exactTime - lastAnyNoteTime >= minNoteGap) && 
                    (exactTime - lastDoubleTime >= chordPadding)) {

                    const lanes = musicalLaneAllocator(laneFreeTime, 1, exactTime, pitch, lastPitch, lastLane, hitRole, getStableRandom);
                    if (lanes && lanes.length > 0) {
                        const lane = lanes[0];
                        let noteScore = 50;
                        if (type === 'long') noteScore += (dur * 1000 / 220 * 5) + 10;
                        maxPossibleScoreTemp += noteScore;

                        tiles.push({
                            time: exactTime * 1000,
                            duration: dur * 1000,
                            endTime: (exactTime + dur) * 1000,
                            lane: lane,
                            type: type,
                            hit: false, holding: false, completed: false, failed: false, released: false,
                            holdTicks: 0,
                            hitAnimStart: 0, lastValidHoldTime: 0
                        });

                        laneFreeTime[lane] = exactTime + (dur > 0 ? dur + 0.40 : minNoteGap);
                        if (dur > 0) {
                            laneHoldUntil[lane] = exactTime + dur + 0.40;
                            // Блокуємо партнерську доріжку тієї ж руки (0<->1, 2<->3) на час затискання + 0.20с буфер
                            const partnerLane = lane ^ 1;
                            laneFreeTime[partnerLane] = Math.max(laneFreeTime[partnerLane], exactTime + dur + 0.20);
                        }

                        lastPitch = pitch;
                        lastLane = lane;
                        lastAnyNoteTime = exactTime;
                        continue;
                    }
                }
            }

            // Гарантуємо бездоганний хронологічний порядок нот
            tiles.sort((a, b) => a.time - b.time);

            State.maxPossibleScore = maxPossibleScoreTemp;
            State.audioBuffer = decodedAudio;
            audioBufferCache.set(cacheKey, decodedAudio);
            tileMapCache.set(cacheKey, { tiles: tiles.slice(), maxPossibleScore: maxPossibleScoreTemp });
            return tiles;

        } catch (error) {
            console.error("GEN ERROR:", error);
            if (sessionId === State.currentSessionId) {
                const errStr = String(error?.message || '') + ' ' + String(error?.name || '');
                let msg = "Generation Error: " + error.message;
                if (errStr.includes('NetworkError') || errStr.includes('Failed to fetch') || errStr.includes('fetch')) {
                    msg = getText('errorAudioCors') || ("Generation Error: " + error.message);
                }
                alert(msg);
                quitGame();
            }
            return null;
        }
        
        
    }

    function flushPlaytimeToCloud() {
        if (State.playtimeAccumulator > 0) {
            const addSec = Math.floor(State.playtimeAccumulator);
            State.playtimeAccumulator = 0;
            if (addSec > 0) {
                const cur = parseInt(localStorage.getItem('neon_total_playtime') || '0', 10);
                localStorage.setItem('neon_total_playtime', String(cur + addSec));
            }
        }
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id) {
            const total = parseInt(localStorage.getItem('neon_total_playtime') || '0', 10);
            setDoc(doc(db, "user_progress", currentUser.id), {
                playtimeSeconds: total,
                updatedAt: serverTimestamp()
            }, { merge: true }).catch(err => console.warn("Playtime sync error:", err));
        }
    }

// Головний ігровий цикл. Я викликаю його через requestAnimationFrame, що синхронізує оновлення логіки та рендеринг з частотою оновлення монітора.
    function gameLoop() {
        const now = Date.now();
        
        // Обчислення дельти часу (dt) між кадрами для забезпечення плавності анімацій незалежно від частоти кадрів.
        const dt = State.lastFrameTime ? (now - State.lastFrameTime) : 0;
        State.lastFrameTime = now;

        // Накопичення часу гри (активний геймплей без паузи)
        if (State.isPlaying && !State.isPaused && dt > 0 && dt < 400) {
            State.playtimeAccumulator += dt / 1000;
            if (State.playtimeAccumulator >= 1) {
                const addSec = Math.floor(State.playtimeAccumulator);
                State.playtimeAccumulator -= addSec;
                const cur = parseInt(localStorage.getItem('neon_total_playtime') || '0', 10);
                localStorage.setItem('neon_total_playtime', String(cur + addSec));
            }
        }

        // Безпечна автопауза при затримках кадру понад 500мс (системна шторка, вхідний дзвінок, згортання, GC паузи)
        // Надійно захищає рахунок від втрати та дає можливість гравцю спокійно відновити гру.
        if (dt > 500 && State.isPlaying && !State.isPaused) {
            console.log("[Gameplay] Large frame delta (" + Math.round(dt) + "ms). Auto-pausing to preserve score.");
            State.keyState = [false, false, false, false];
            State.holdingTiles.forEach((tile, lane) => {
                if (tile) {
                    tile.holding = false;
                    tile.released = true; 
                    if (!tile.fadeStartTime) tile.fadeStartTime = now;
                    if (!tile.releaseSongTime) tile.releaseSongTime = songTime;
                    toggleHoldEffect(lane, false);
                }
            });
            State.holdingTiles = [null, null, null, null];
            laneElements.forEach(el => { if (el) el.classList.remove('active'); });
            togglePauseGame(true);
            State.lastFrameTime = 0;
            return;
        }

        // Перевірка фокусу вікна: автопауза при переході на іншу вкладку чи згортанні
        if (!document.hasFocus() && State.isPlaying && !State.isPaused) {
            togglePauseGame(true);
            State.lastFrameTime = 0;
            return;
        }

        if (!State.isPlaying || State.isPaused) {
            State.lastFrameTime = 0; 
            return;
        }

        // Мелодія звучить у чистому природному темпі (1.0x, без зміни висоти тону).
        const songTime = State.audioCtx ? (State.audioCtx.currentTime - State.startTime) * 1000 : 0;
        const durationMs = State.audioBuffer.duration * 1000;
        const progress = Math.min(1, Math.max(0, songTime / durationMs));

        const isSecret = Boolean(songsDB[State.currentSongIndex]?.isSecret);
        const startSpd = isSecret ? CONFIG.speedStartSecret : CONFIG.speedStart;
        const baseSpeed = startSpd / (State.selectedSpeed || 1.0);

        // Стабільна швидкість протягом усього треку (без поступового прискорення)
        State.currentSpeed = baseSpeed;
        State.dynamicSpeedMultiplier = State.selectedSpeed || 1.0;

        updateProgressBar(songTime, durationMs);

        // Оптимізація: я використовую лінійну інтерполяцію (lerp) для плавного масштабування лічильника комбо. Це значно дешевше для процесора, ніж повноцінний фізичний рушій.
        State.comboScale += (1.0 - State.comboScale) * 0.15;

        if (songTime > durationMs + 1000) {
            endGame(true);
            return;
        }

        update(songTime);
        draw(songTime);
        const activeTheme = FieldThemes.getActiveTheme();
        pixiRenderer.render(songTime, State, CONFIG, activeTheme);
        State.animationFrameId = requestAnimationFrame(gameLoop);
    }

function update(songTime) {
        const hitTimeWindow = State.currentSpeed;
        const hitY = State.gameHeight * CONFIG.hitPosition;
        const themeColors = (document.body.getAttribute('data-theme') === 'light') ? CONFIG.colorsLight : CONFIG.colorsDark;
        const now = Date.now();
        const dt = now - (State.lastRippleUpdateMs || now);
        State.lastRippleUpdateMs = now;
        updateRipples(dt);
    
    // ЛОГІКА АВТО-БОТА ДЛЯ ТЕСТУВАННЯ ТА АВТОМАТИЧНОГО ПРОХОДЖЕННЯ РІВНЯ
    if (State.isBotEnabled && State.isPlaying && !State.isPaused) {
        State.activeTiles.forEach(tile => {
            if (tile.botOffset === undefined) {
                tile.botOffset = 0; // Ідеальне попадання точно в такт
            }

            // Симуляція натискання клавіші ботом
            if (!tile.hit && !tile.completed && !tile.failed && !tile.released) {
                if (tile.time - songTime <= tile.botOffset) {
                    handleInputDown(tile.lane);
                    if (tile.type === 'tap') {
                        setTimeout(() => handleInputUp(tile.lane), 45);
                    }
                }
            }

            // Симуляція відпускання клавіші для довгих нот
            if (tile.type === 'long' && tile.holding && !tile.completed) {
                if (songTime >= tile.endTime) {
                    handleInputUp(tile.lane);
                }
            }
        });
    }

        // Оптимізована поява нових нот через Object Pool:
        while (State.nextSpawnIndex < State.mapTiles.length) {
            const tileDef = State.mapTiles[State.nextSpawnIndex];
            if (tileDef.time - hitTimeWindow <= songTime) {
                const pooledTile = NotePool.obtain(tileDef);
                State.activeTiles.push(pooledTile);
                State.nextSpawnIndex++;
            } else {
                break;
            }
        }
        

        // Оновлення стану всіх активних нот (тих, що зараз видимі на екрані).
        for (let i = State.activeTiles.length - 1; i >= 0; i--) {
            const tile = State.activeTiles[i];

            // ВИПРАВЛЕННЯ 1: Миттєве видалення завершених нот з поверненням у пул
            if (tile.completed) {
                NotePool.release(tile);
                State.activeTiles.splice(i, 1);
                continue;
            }

            // 1. Логіка для нот, які гравець відпустив зарано:
            // Вони стають попелясто-сірими, продовжують плавно летіти вниз та розчиняються
            if (tile.released) {
                if (!tile.fadeStartTime) tile.fadeStartTime = now;
                if (!tile.releaseSongTime) tile.releaseSongTime = songTime;
                const elapsedFade = now - tile.fadeStartTime;
                const progressEnd = 1 - (tile.endTime - songTime) / State.currentSpeed;
                const yTail = progressEnd * hitY;

                // Звільняємо ноту, коли її хвіст повністю пройшов за межі екрана (або вийшов таймер 1600мс)
                if (yTail >= State.gameHeight + 40 || elapsedFade > 1600) {
                    NotePool.release(tile);
                    State.activeTiles.splice(i, 1);
                    continue; 
                }
            }

            // Розрахунок поточної вертикальної координати ноти на екрані
            const yStart = (1 - (tile.time - songTime) / State.currentSpeed) * hitY;
            let yEnd = yStart;
            if (tile.type === 'long') yEnd = (1 - (tile.endTime - songTime) / State.currentSpeed) * hitY;

            // Видалення звичайних нот (taps) після успішного влучання та завершення виразної анімації влучання
            if (tile.type === 'tap' && tile.hit) {
                if (now - tile.hitAnimStart > 260) {
                    NotePool.release(tile);
                    State.activeTiles.splice(i, 1);
                }
                continue;
            }

            // Захоплення початку довгої ноти в робочій зоні рецептора, якщо гравець утримує кнопку/палець
            if (!tile.hit && !tile.completed && !tile.failed && !tile.released && tile.type === 'long') {
                if (State.keyState[tile.lane]) {
                    const basePadY = Math.round(CONFIG.noteHeight * 0.35);
                    const hitZoneTop = hitY - basePadY * 1.5;
                    // Підхоплюємо ноту, щойно її голова увійшла в зону або вже на лінії, поки хвіст не завершився
                    if (yStart >= hitZoneTop && songTime < tile.endTime) {
                        tile.hit = true;
                        tile.holding = true;
                        tile.hitVisualY = Math.min(yStart, hitY);
                        tile.hitRating = (Math.abs(yStart - hitY) <= 75) ? 'perfect' : 'good';
                        State.totalHits++;
                        tile.lastValidHoldTime = now;
                        State.holdingTiles[tile.lane] = tile;
                        toggleHoldEffect(tile.lane, true);
                        const mult = getComboMultiplier();
                        const addScore = (tile.hitRating === 'perfect') ? CONFIG.scorePerfect : CONFIG.scoreGood;
                        State.score += Math.round(addScore * mult * State.scoreMultiplier);
                        State.lastComboUpdateTime = now;
                        showRating(getText(tile.hitRating), `rating-${tile.hitRating}`);
                        State.lastHitTime = now;
                        updateScoreUI();
                    }
                }
            }

            if (tile.type === 'long' && tile.hit && !tile.completed && !tile.failed && !tile.released) {
                const isKeyPressed = State.keyState[tile.lane];
                if (isKeyPressed) tile.lastValidHoldTime = now;

                // Захисний буфер утримання: 350мс толерантності для сенсорних екранів на смартфонах.
                // Захищає від переривань мультитачу при одночасному натисканні іншими пальцями.
                const isHoldingActive = isKeyPressed || (now - (tile.lastValidHoldTime || 0) < 350);

                if (isHoldingActive) {
                    // Обробка стану, коли гравець успішно утримує кнопку. Нараховуємо очки за кожен тік утримання.
                    if (songTime < tile.endTime) {
                        tile.holdTicks++;
                        if (tile.holdTicks % 10 === 0) {
                            const mult = getComboMultiplier();
                            State.score += Math.round(CONFIG.scoreHoldTick * mult * State.scoreMultiplier);
                            State.combo += 10;
                            State.lastComboUpdateTime = now;
                            if (State.combo > State.maxCombo) State.maxCombo = State.combo;
                            updateScoreUI(true); 
                        }
                        tile.holding = true;
                        State.lastHitTime = now;
                    } else {
                        // Успішне завершення довгої ноти, коли її час повністю вийшов.
                        completeLongNote(tile);
                    }
                } else {
                    // Обробка ситуації, коли гравець дійсно відпустив кнопку понад 350мс:
                    // Допуск на фініші: якщо відпущено менш ніж за 220мс до фактичного кінця — зараховуємо успіх
                    if (tile.endTime - songTime < 220) {
                        completeLongNote(tile);
                    } else {
                        // Якщо відпущено занадто рано, фіксуємо зрив ноти та запускаємо плавне зникнення
                        if (songTime < tile.endTime) {
                            tile.holding = false;
                            tile.released = true;
                            if (!tile.fadeStartTime) tile.fadeStartTime = now;
                            if (!tile.releaseSongTime) tile.releaseSongTime = songTime;
                            
                            if (State.holdingTiles[tile.lane] === tile) {
                                State.holdingTiles[tile.lane] = null;
                                toggleHoldEffect(tile.lane, false);
                            }
                        }
                    }
                }
            }

            // 1. Реєстрація промаху ТІЛЬКИ коли нота повністю вийшла за межі поля зору (в самий низ екрана)
            const bottomScreenLimit = State.gameHeight;
            if (!tile.hit && !tile.completed && !tile.failed && !tile.missed) {
                const noteTop = yStart - CONFIG.noteHeight;
                if ((tile.type === 'tap' && noteTop >= bottomScreenLimit) || 
                    (tile.type === 'long' && noteTop >= bottomScreenLimit && !tile.holding && !tile.released)) {
                    missNote(tile, true);
                }
            }

            // 2. Звільнення об'єкта ноти, коли вона остаточно виходить за межі екрана
            const limitY = State.gameHeight + 40;
            if (tile.missed || tile.failed) {
                if ((tile.type === 'tap' && (yStart - CONFIG.noteHeight) > limitY) || 
                    (tile.type === 'long' && yEnd > limitY)) {
                    NotePool.release(tile);
                    State.activeTiles.splice(i, 1);
                    continue;
                }
            }
        }
    }

    // Допоміжна функція для інкапсуляції логіки успішного завершення довгої ноти, щоб уникнути дублювання коду.
    function completeLongNote(tile) {
        tile.completed = true;
        tile.holding = false;
        
        if (State.holdingTiles[tile.lane] === tile) {
            State.holdingTiles[tile.lane] = null;
            toggleHoldEffect(tile.lane, false);
        }

        const mult = getComboMultiplier();
        State.score += Math.round((CONFIG.scoreHoldTick * 5) * mult * State.scoreMultiplier);
        State.combo++; 
        State.lastComboUpdateTime = Date.now();
        if (State.combo > State.maxCombo) State.maxCombo = State.combo;
        updateScoreUI(true);
    }

    function applyActiveThemeVisuals() {
        if (!ctx) return;
        const laneW = (State.gameWidth || 400) / 4;
        const padding = 6;
        const w = laneW - (padding * 2);
        const isLight = document.body.getAttribute('data-theme') === 'light';
        SpriteCache.init(w, CONFIG.noteHeight, laneW, isLight);
        State.bgStars = null;
        State.themeAtmosphereParticles = null;
        State.themeCosmicStars = null;
        State.themeConstellation = null;
        State.currentAtmosphereTheme = null;
        const activeTheme = FieldThemes.getActiveTheme();
        if (activeTheme && activeTheme._atm) activeTheme._atm = null;
    }
    window.applyActiveThemeVisuals = applyActiveThemeVisuals;

    function updateAndDrawThemeAtmosphere(ctx, theme, songTime, warpMult, speedBoost) {
        if (theme && typeof theme.updateAndDrawAtmosphere === 'function') {
            theme.updateAndDrawAtmosphere(ctx, songTime, warpMult, speedBoost, State);
        }
    }

    // Цикл рендерингу. Це найбільш критична до продуктивності частина коду. Я максимально оптимізував її, мінімізувавши зміни стану контексту Canvas та використовуючи кешовані об'єкти.
    function draw(songTime) {
        if (!ctx) return;
        const validSongTime = (typeof songTime === 'number' && !isNaN(songTime))
            ? songTime
            : (State.audioCtx ? Math.max(0, (State.audioCtx.currentTime - (State.startTime || 0)) * 1000) : (State.songTime || 0));
        const now = Date.now();
        const isLight = document.body.getAttribute('data-theme') === 'light';
        const activeTheme = FieldThemes.getActiveTheme();

        const laneW = State.gameWidth / 4;
        const hitY = State.gameHeight * CONFIG.hitPosition;
        const padding = 6;
        const w = laneW - (padding * 2);

        // Стилістичні палітри залежно від поточного комбо та активної модульної теми
        const comboTier = (activeTheme && typeof activeTheme.getTier === 'function') 
            ? activeTheme.getTier(State.combo) 
            : null;

        let p = { glow: '', border: '', name: 'steel' };
        if (comboTier) {
            p.glow = comboTier.glow; 
            p.border = comboTier.border; 
            p.name = comboTier.name;
        } else if (State.combo < 100) {
            p.glow = PALETTES.STEEL.glow; p.border = PALETTES.STEEL.border; p.name = 'steel';
        } else if (State.combo < 200) {
            p.glow = PALETTES.ELECTRIC.glow; p.border = PALETTES.ELECTRIC.border; p.name = 'electric';
        } else if (State.combo < 400) {
            p.glow = PALETTES.GOLD.glow; p.border = PALETTES.GOLD.border; p.name = 'gold';
        } else if (State.combo < 800) {
            p.glow = PALETTES.COSMIC.glow; p.border = PALETTES.COSMIC.border; p.name = 'cosmic';
        } else {
            p.glow = PALETTES.LEGENDARY.glow; p.border = PALETTES.LEGENDARY.border; p.name = 'legendary';
        }

        // Аналіз частотного спектра аудіо (бас, середина, верхи) для динамічних ефектів
        let bass = 0, mid = 0, treble = 0;
        if (State.analyser && State.dataArray) {
            State.analyser.getByteFrequencyData(State.dataArray);
            bass = (State.dataArray[0] + State.dataArray[1] + State.dataArray[2] + State.dataArray[3]) / (4 * 255.0);
            mid = (State.dataArray[6] + State.dataArray[7] + State.dataArray[8] + State.dataArray[9]) / (4 * 255.0);
            treble = (State.dataArray[14] + State.dataArray[15] + State.dataArray[16]) / (3 * 255.0);
        }
        State.bgPulse = (State.bgPulse || 0) * 0.82 + (bass * 0.18);

        ctx.clearRect(0, 0, State.gameWidth, State.gameHeight);
        if (isLight) { 
            ctx.fillStyle = "rgba(255,255,255,0.95)"; 
            ctx.fillRect(0, 0, State.gameWidth, State.gameHeight); 
        } else {
            // Dynamic theme background gradient
            if (activeTheme.colors?.bgCenter) {
                const bgKey = `${activeTheme.id}_${State.gameWidth}_${State.gameHeight}`;
                if (!GRADIENT_CACHE.bgGrad || GRADIENT_CACHE.bgGradKey !== bgKey) {
                    const bgGrad = ctx.createRadialGradient(
                        State.gameWidth / 2, hitY * 0.45, 20,
                        State.gameWidth / 2, hitY * 0.45, Math.max(State.gameHeight * 0.85, 500)
                    );
                    bgGrad.addColorStop(0, activeTheme.colors.bgCenter);
                    bgGrad.addColorStop(0.55, activeTheme.colors.bgMid);
                    bgGrad.addColorStop(1, activeTheme.colors.bgOuter);
                    GRADIENT_CACHE.bgGrad = bgGrad;
                    GRADIENT_CACHE.bgGradKey = bgKey;
                }
                ctx.fillStyle = GRADIENT_CACHE.bgGrad;
                ctx.fillRect(0, 0, State.gameWidth, State.gameHeight);
            }

            if (State.glowSprite) {
                const auraW = State.gameWidth * (1.35 + State.bgPulse * 0.45);
                const auraH = State.gameHeight * (0.65 + mid * 0.35);
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                
                // Верхня аура атмосфери треку
                ctx.globalAlpha = 0.05 + State.bgPulse * 0.07 + mid * 0.03;
                ctx.drawImage(State.glowSprite, State.gameWidth / 2 - auraW / 2, hitY * 0.45 - auraH / 2, auraW, auraH);
                
                // Пульсація біля лінії рецептора при активному біті або комбо
                if (State.combo >= 100) {
                    ctx.globalAlpha = 0.03 + State.bgPulse * 0.05;
                    ctx.drawImage(State.glowSprite, State.gameWidth / 2 - auraW * 0.45, hitY - auraH * 0.35, auraW * 0.9, auraH * 0.7);
                }
                ctx.restore();
            }

            const warpMult = (State.dynamicSpeedMultiplier || 1.0);
            const speedBoost = 1.0 + State.bgPulse * 0.8;

            if (activeTheme && typeof activeTheme.updateAndDrawAtmosphere === 'function') {
                activeTheme.updateAndDrawAtmosphere(ctx, validSongTime, warpMult, speedBoost, State);
            }

            // Тонкі неонові лінії перспективи шосе для теми Classic
            if (activeTheme.id === 'classic') {
                const gridTime = (validSongTime * 0.0008 * warpMult) % 1.0;
                ctx.save();
                ctx.strokeStyle = activeTheme.colors?.receptorBorder || (p.border || 'rgba(56, 189, 248, 0.2)');
                ctx.lineWidth = 1;
                ctx.globalAlpha = 0.06 + State.bgPulse * 0.05;
                ctx.beginPath();
                for (let g = 0; g < 5; g++) {
                    const gyRatio = ((g / 5) + gridTime * (1 / 5)) % 1.0;
                    const gy = Math.pow(gyRatio, 1.7) * hitY;
                    ctx.moveTo(6, gy);
                    ctx.lineTo(State.gameWidth - 6, gy);
                }
                ctx.stroke();
                ctx.restore();
            }
        }

        ctx.save();
        if (State.screenShake > 0.1) {
            const idx = now & 255;
            const sx = State.shakeTable[idx] * State.screenShake * 1.5;
            const sy = State.shakeTable[(idx + 64) & 255] * State.screenShake * 1.5;
            ctx.translate(sx, sy);
            State.screenShake *= 0.82;
            if (State.screenShake < 0.1) State.screenShake = 0;
        }

        // ==========================================
        // 2. Розділювачі ігрових доріжок (кешований стиль)
        // ==========================================

        ctx.lineWidth = 1;
        ctx.strokeStyle = GRADIENT_CACHE.divider || 'rgba(56, 189, 248, 0.2)';
        ctx.beginPath();
        for (let i = 1; i < 4; i++) {
            const lineX = i * laneW;
            ctx.moveTo(lineX, 0);
            ctx.lineTo(lineX, State.gameHeight);
        }
        ctx.stroke();

        // ==========================================
        // 3. Зони натискання (Hit Target Receptors через Sprite Caching)
        // ==========================================
        for (let l = 0; l < 4; l++) {
            const padX = l * laneW + 5;
            const padY = hitY - 13;
            const isLaneActive = (State.laneLastInputTime && (now - State.laneLastInputTime[l] < 120)) || (State.holdingTiles && State.holdingTiles[l]);
            if (activeTheme && typeof activeTheme.drawReceptor === 'function') {
                activeTheme.drawReceptor(ctx, padX, padY, laneW - 10, 26, isLaneActive, isLight);
            } else {
                const recSprite = isLaneActive ? SpriteCache.receptorActive : SpriteCache.receptorIdle;
                if (recSprite) {
                    ctx.drawImage(recSprite, padX - 8, padY - 8);
                }
            }
        }

        // ==========================================
        // 3.1. 4 Адаптивні горизонтальні струни удару
        // ==========================================
        let stringColors = [];
        let stringGlow = p.glow || 'rgba(56, 189, 248, 0.4)';
        if (activeTheme && typeof activeTheme.getStringColors === 'function') {
            stringColors = activeTheme.getStringColors(State.combo);
            stringGlow = p.glow || activeTheme.colors?.stringGlow;
        } else if (activeTheme.id !== 'classic' && activeTheme.colors?.strings) {
            stringColors = activeTheme.colors.strings;
            stringGlow = activeTheme.colors.stringGlow || p.glow;
        } else if (State.combo >= 800) {
            // LEGENDARY: Призматичний м'ятний
            stringColors = ['#d1fae5', '#a7f3d0', '#6ee7b7', '#10b981'];
            stringGlow = 'rgba(16, 185, 129, 0.4)';
        } else if (State.combo >= 400) {
            // COSMIC: Лавандово-фіолетовий
            stringColors = ['#f3e8ff', '#e9d5ff', '#d8b4fe', '#a855f7'];
            stringGlow = 'rgba(168, 85, 247, 0.4)';
        } else if (State.combo >= 200) {
            // GOLD: Теплий золотий
            stringColors = ['#fef3c7', '#fde68a', '#fcd34d', '#f59e0b'];
            stringGlow = 'rgba(245, 158, 11, 0.4)';
        } else if (State.combo >= 100) {
            // ELECTRIC: Спокійна бірюза
            stringColors = ['#cffafe', '#a5f3fc', '#67e8f9', '#06b6d4'];
            stringGlow = 'rgba(6, 182, 212, 0.4)';
        } else {
            // STEEL: Спокійний блакитний
            stringColors = ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8'];
            stringGlow = 'rgba(56, 189, 248, 0.4)';
        }

        const stringConfigs = [
            { dy: -9, baseWidth: 1.4, freq: 0.042, speed: 0.034, mult: 1.15 },
            { dy: -3, baseWidth: 1.8, freq: 0.036, speed: 0.029, mult: 1.0 },
            { dy:  3, baseWidth: 2.3, freq: 0.031, speed: 0.025, mult: 0.88 },
            { dy:  9, baseWidth: 3.0, freq: 0.026, speed: 0.021, mult: 0.75 }
        ];

        const step = State.isMobile ? 18 : 12;
        const startRipple = Math.max(0, State.ripples.length - 4);
        const hasRipples = State.ripples.length > 0;
        const hasHold = State.holdingTiles && State.holdingTiles.some(Boolean);

        for (let s = 0; s < 4; s++) {
            const cfg = stringConfigs[s];
            const strY = hitY + cfg.dy;
            ctx.strokeStyle = stringColors[s];
            ctx.lineWidth = cfg.baseWidth + ((State.combo >= 200) ? 0.4 : 0);
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            if (!State.isMobile) {
                ctx.shadowColor = stringGlow;
                ctx.shadowBlur = (State.combo >= 200) ? 4 : 2;
            } else {
                ctx.shadowBlur = 0;
            }

            ctx.beginPath();
            if (!hasRipples && !hasHold) {
                ctx.moveTo(0, strY);
                ctx.lineTo(State.gameWidth, strY);
            } else {
                for (let x = 0; x <= State.gameWidth; x += step) {
                    let yOffset = 0;
                    if (hasRipples) {
                        for (let i = startRipple; i < State.ripples.length; i++) {
                            const r = State.ripples[i];
                            const dist = Math.abs(x - r.x);
                            if (dist < r.radius + 75) { 
                                const wave = Math.sin(dist * cfg.freq - r.age * cfg.speed + s * 0.45);
                                const damping = 1 / (1 + dist * 0.012); 
                                yOffset += wave * r.power * damping * cfg.mult;
                            }
                        }
                    }
                    if (hasHold) {
                        for (let l = 0; l < 4; l++) {
                            if (State.holdingTiles[l]) {
                                const laneCenterX = (l + 0.5) * laneW;
                                const laneDist = Math.abs(x - laneCenterX);
                                if (laneDist < laneW) {
                                    const buzz = Math.sin(now * 0.035 + s * 1.6) * 2.2 * (1 - laneDist / laneW);
                                    yOffset += buzz;
                                }
                            }
                        }
                    }

                    if (x === 0) ctx.moveTo(x, strY + yOffset);
                    else ctx.lineTo(x, strY + yOffset);
                }
            }
            ctx.stroke();

            // Точки кріплення струни по краях екрана
            ctx.fillStyle = stringColors[s];
            ctx.beginPath();
            ctx.arc(3, strY, cfg.baseWidth + 0.8, 0, Math.PI * 2);
            ctx.arc(State.gameWidth - 3, strY, cfg.baseWidth + 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        // ==========================================
        // 4. Рендеринг нот: PixiJS WebGL (Phase 3) з автоматичним фолбеком на Canvas 2D
        // ==========================================
        const pixiHandlesNotes = pixiRenderer && pixiRenderer.isReady && pixiRenderer.areNotesHandled;

        if (pixiHandlesNotes) {
            // Ноти рендеряться на GPU через Pixi.js. Canvas 2D хіт-анімації викликаються лише як фолбек, якщо Pixi ефекти вимкнено (Фаза 4)
            if (!pixiRenderer.areParticlesHandled) {
                for (let i = 0; i < State.activeTiles.length; i++) {
                    const tile = State.activeTiles[i];
                    if (tile.completed || !tile.hit || !tile.hitAnimStart) continue;

                    const animDuration = 240;
                    const elapsed = now - tile.hitAnimStart;
                    if (elapsed < animDuration) {
                        const p = elapsed / animDuration;
                        const x = tile.lane * laneW + padding;
                        const progressStart = 1 - (tile.time - songTime) / State.currentSpeed;
                        const visualY = (tile.hitVisualY > 0) ? tile.hitVisualY : progressStart * hitY;
                        const yTop = visualY - CONFIG.noteHeight;
                        const cx = x + w / 2;
                        const cy = yTop + CONFIG.noteHeight / 2;
                        const isPerfect = (tile.hitRating === 'perfect');

                        if (activeTheme && typeof activeTheme.drawHitAnimation === 'function') {
                            activeTheme.drawHitAnimation(ctx, cx, cy, w, CONFIG.noteHeight, p, isPerfect, isLight, now, State.combo);
                        }
                    }
                }
            }
        } else {
            // Фолбек: повноцінний цикл рендерингу Canvas 2D
            const tapSprite = SpriteCache.getTapSprite(p.name);
            const longTailSprite = SpriteCache.getLongTailSprite(p.name);
            const longHeadSprite = SpriteCache.getLongHeadSprite(p.name);
            const deadTailSprite = SpriteCache.getLongTailSprite('dead');
            const deadHeadSprite = SpriteCache.getLongHeadSprite('dead');
            const relTailSprite = SpriteCache.getLongTailSprite('released');
            const relHeadSprite = SpriteCache.getLongHeadSprite('released');

            for (let i = 0; i < State.activeTiles.length; i++) {
                const tile = State.activeTiles[i];
                if (tile.completed) continue;

            const x = tile.lane * laneW + padding;

            if (tile.type === 'tap') {
                const progressStart = 1 - (tile.time - songTime) / State.currentSpeed;
                const visualY = (tile.hit && tile.hitVisualY > 0) ? tile.hitVisualY : progressStart * hitY;
                const yTop = visualY - CONFIG.noteHeight;

                // Viewport Culling для tap нот
                if (yTop > State.gameHeight + 40 || yTop + CONFIG.noteHeight < -40) continue;

                if (tile.hit) {
                    if (tile.hitAnimStart) {
                        try {
                            const animDuration = 240; // Швидкий, соковитий та чіткий імпульс влучання
                            const elapsed = now - tile.hitAnimStart;
                            if (elapsed < animDuration) {
                                const p = elapsed / animDuration;
                                const cx = x + w / 2;
                                const cy = yTop + CONFIG.noteHeight / 2;
                                const isPerfect = (tile.hitRating === 'perfect');

                                if (activeTheme && typeof activeTheme.drawHitAnimation === 'function') {
                                    activeTheme.drawHitAnimation(ctx, cx, cy, w, CONFIG.noteHeight, p, isPerfect, isLight, now, State.combo);
                                }
                            }
                        } catch (e) {
                            console.warn("Hit animation draw error:", e);
                        }
                    }
                    // Захист: влучена tap-нота ніколи не малюється як звичайна нота в польоті!
                    continue;
                }

                // Звичайна нота в польоті до моменту натискання:
                // Усі деталі теми (візерунки, півмісяць, руни, філігрань) вже запечені в tapSprite
                if (tapSprite) {
                    ctx.drawImage(tapSprite, x - 16, yTop - 16);
                }
                if (activeTheme && typeof activeTheme.drawHeadOverlay === 'function') {
                    activeTheme.drawHeadOverlay(ctx, x, yTop, w, CONFIG.noteHeight, tile, isLight, now, State.combo);
                } else if (activeTheme && typeof activeTheme.drawTapOverlay === 'function') {
                    activeTheme.drawTapOverlay(ctx, x, yTop, w, CONFIG.noteHeight, tile, isLight, now, State.combo);
                }

                // Динамічний світловий відблиск (Sheen) — на десктопі, строго обмежений межами ноти через clip()
                if (!State.isMobile && State.combo >= 800 && SpriteCache.sheen) {
                    const sheenCycle = ((now * 0.0018 + tile.lane * 0.3) % 1.6);
                    if (sheenCycle < 1.0) {
                        ctx.save();
                        ctx.beginPath();
                        if (ctx.roundRect) {
                            ctx.roundRect(x, yTop, w, CONFIG.noteHeight, 8);
                        } else {
                            ctx.rect(x, yTop, w, CONFIG.noteHeight);
                        }
                        ctx.clip();
                        const sheenX = x + sheenCycle * (w + 32) - 16;
                        ctx.drawImage(SpriteCache.sheen, sheenX, yTop);
                        ctx.restore();
                    }
                }

                // Візуальне відображення хітбокса (ширина ноти, висота +30% зверху та знизу)
                if (CONFIG.showHitbox && !tile.hit) {
                    const padY = Math.round(CONFIG.noteHeight * 0.30);
                    const hbX = x;
                    const hbY = yTop - padY;
                    const hbW = w;
                    const hbH = CONFIG.noteHeight + padY * 2;

                    ctx.save();
                    // Напівпрозорий неоновий фон хітбокса
                    ctx.fillStyle = 'rgba(34, 197, 94, 0.12)';
                    ctx.fillRect(hbX, hbY, hbW, hbH);

                    // Пунктирна неонова рамка точного хітбокса
                    ctx.strokeStyle = '#22c55e';
                    ctx.lineWidth = 1.5;
                    ctx.setLineDash([6, 3]);
                    ctx.strokeRect(hbX, hbY, hbW, hbH);
                    ctx.setLineDash([]);

                    // Неонові кутові маркери для миттєвого візуального сприйняття меж
                    ctx.fillStyle = '#4ade80';
                    const cs = 6;
                    ctx.fillRect(hbX, hbY, cs, 2); ctx.fillRect(hbX, hbY, 2, cs);
                    ctx.fillRect(hbX + hbW - cs, hbY, cs, 2); ctx.fillRect(hbX + hbW - 2, hbY, 2, cs);
                    ctx.fillRect(hbX, hbY + hbH - 2, cs, 2); ctx.fillRect(hbX, hbY + hbH - cs, 2, cs);
                    ctx.fillRect(hbX + hbW - cs, hbY + hbH - 2, cs, 2); ctx.fillRect(hbX + hbW - 2, hbY + hbH - cs, 2, cs);
                    ctx.restore();
                }
            } else if (tile.type === 'long') {
                const headH = CONFIG.noteHeight;
                let yTail, yHead;

                if (tile.released) {
                    // Користувач відпустив довгу ноту зарано:
                    // 1. Вона стає попелясто-сірою
                    // 2. Її залишок продовжує плавно летіти вниз зі швидкістю треку
                    if (!tile.releaseSongTime) tile.releaseSongTime = songTime;
                    const elapsedRelease = songTime - tile.releaseSongTime;
                    
                    // Голова (місце відриву пальця) опускається вниз крізь струни:
                    yHead = hitY + (elapsedRelease / State.currentSpeed) * hitY;
                    
                    // Хвіст опускається за темпом музики:
                    const progressEnd = 1 - (tile.endTime - songTime) / State.currentSpeed;
                    yTail = progressEnd * hitY;
                    if (yTail > yHead) yTail = yHead;
                } else {
                    const progressStart = 1 - (tile.time - songTime) / State.currentSpeed;
                    const rawHeadY = progressStart * hitY;
                    const progressEnd = 1 - (tile.endTime - songTime) / State.currentSpeed;
                    const rawTailY = progressEnd * hitY;

                    if (tile.hit && tile.holding) {
                        yHead = hitY;
                        yTail = Math.min(rawTailY, hitY);
                    } else {
                        yHead = rawHeadY;
                        yTail = rawTailY;
                    }
                    if (yTail > yHead) yTail = yHead;
                }

                // Округлюємо ВСІ координати до цілих пікселів для уникнення субпіксельного мерехтіння
                yTail = Math.round(yTail);
                yHead = Math.round(yHead);

                const actualYHeadTop = Math.round(yHead - headH);
                const tailH = Math.max(0, actualYHeadTop - yTail);

                // Viewport culling для довгих нот: тільки коли хвіст пройшов екран або нота ще далеко вгорі
                if (yTail > State.gameHeight + 40 || (actualYHeadTop < -headH - 40 && yTail < -40)) continue;

                if (tile.released) {
                    // Рендеринг відпущеної довгої ноти: попелясто-сіра, що продовжує плавний рух униз крізь струни
                    const elapsedFade = now - (tile.fadeStartTime || now);
                    const overallAlpha = Math.max(0, 1.0 - elapsedFade / 1600);
                    if (overallAlpha <= 0.01) continue;

                    // Спавнимо легкі ефірні частинки розчинення
                    if (yHead >= hitY - 10 && yTail <= State.gameHeight && Math.random() < 0.25) {
                        spawnDissolveParticles(x, Math.min(yHead, hitY), w);
                    }

                    ctx.save();
                    ctx.globalAlpha = overallAlpha;

                    // Попелясто-сірий хвіст, що летить далі вниз
                    let customRelBodyDrawn = false;
                    if (activeTheme && typeof activeTheme.drawHoldBody === 'function' && tailH > 1) {
                        customRelBodyDrawn = activeTheme.drawHoldBody(ctx, x, yTail, w, headH, tile, isLight, now, tailH, 0, actualYHeadTop, true);
                    }
                    if (!customRelBodyDrawn && tailH > 1 && relTailSprite) {
                        ctx.drawImage(relTailSprite, 0, 0, relTailSprite.width, relTailSprite.height,
                            Math.round(x + 8), Math.round(yTail), Math.round(w - 16), Math.round(tailH + Math.round(headH * 0.4)));
                    }

                    // NOTE: drawHoldTail is intentionally NOT called for released tiles —
                    // the arrow tip and neck collar should not show during the fade-out animation.

                    // Попелясто-сіра голова, що летить далі вниз
                    if (relHeadSprite && actualYHeadTop > -headH - 20 && actualYHeadTop < State.gameHeight + 40) {
                        if (activeTheme && typeof activeTheme.drawNeck === 'function') {
                            activeTheme.drawNeck(ctx, x, actualYHeadTop, w, headH, tile, true, 0);
                        }
                        ctx.drawImage(relHeadSprite, Math.round(x - 16), Math.round(actualYHeadTop - 16));
                    }

                    ctx.restore();
                    continue;
                }

                const curTailSprite = tile.failed ? deadTailSprite : longTailSprite;
                const curHeadSprite = tile.failed ? deadHeadSprite : longHeadSprite;

                // Відмальовування "хвоста" довгої ноти:
                // Якщо тема підтримує процедурне извивающееся тіло (drawHoldBody) — використовуємо його!
                let customBodyDrawn = false;
                if (activeTheme && typeof activeTheme.drawHoldBody === 'function' && tailH > 1) {
                    customBodyDrawn = activeTheme.drawHoldBody(ctx, x, yTail, w, headH, tile, isLight, now, tailH, State.combo, actualYHeadTop, false);
                }
                if (!customBodyDrawn && tailH > 1 && curTailSprite) {
                    ctx.drawImage(curTailSprite, 0, 0, curTailSprite.width, curTailSprite.height,
                        Math.round(x + 8), Math.round(yTail), Math.round(w - 16), Math.round(tailH + Math.round(headH * 0.4)));
                }

                // Тематичний завершальний хвіст довгої ноти + neck junction collar
                // Pass tailH, actualYHeadTop, and nextTileDist so themes can prevent overlapping with following notes
                if (activeTheme && typeof activeTheme.drawHoldTail === 'function' && yTail > -headH - 40 && yTail < State.gameHeight + 40) {
                    let nextTileDist = 9999;
                    if (Array.isArray(State.activeTiles)) {
                        for (let at = 0; at < State.activeTiles.length; at++) {
                            const other = State.activeTiles[at];
                            if (other !== tile && other.lane === tile.lane && !other.completed && !other.failed) {
                                if (other.time >= (tile.endTime || tile.time)) {
                                    const otherProg = 1 - (other.time - songTime) / State.currentSpeed;
                                    const otherYHead = otherProg * hitY;
                                    const gap = yTail - otherYHead;
                                    if (gap > 0 && gap < nextTileDist) {
                                        nextTileDist = gap;
                                    }
                                }
                            }
                        }
                    }
                    activeTheme.drawHoldTail(ctx, x, yTail, w, headH, tile, isLight, now, tailH, State.combo, actualYHeadTop, nextTileDist);
                }

                // Відмальовування шиї довгої ноти перед головою (синхронізовано з головою)
                if (activeTheme && typeof activeTheme.drawNeck === 'function' && actualYHeadTop > -headH + 4 && actualYHeadTop < State.gameHeight + 40) {
                    activeTheme.drawNeck(ctx, x, actualYHeadTop, w, headH, tile, Boolean(tile.failed), State.combo);
                }

                // Відмальовування "голови" довгої ноти через кешований спрайт (усі деталі теми вже запечені)
                if (curHeadSprite && actualYHeadTop > -headH + 4) {
                    ctx.drawImage(curHeadSprite, Math.round(x - 16), Math.round(actualYHeadTop - 16));
                }
                if (activeTheme && typeof activeTheme.drawHeadOverlay === 'function' && actualYHeadTop > -headH + 4 && actualYHeadTop < State.gameHeight + 40) {
                    activeTheme.drawHeadOverlay(ctx, x, actualYHeadTop, w, headH, tile, isLight, now, State.combo);
                }
                ctx.globalAlpha = 1.0;

                // Сяйво при активному утриманні довгої ноти
                if (tile.hit && tile.holding && State.glowSprite) {
                    const headCenterX = x + w / 2;
                    const headCenterY = actualYHeadTop + headH / 2;
                    const glowW = w * 2.2;
                    const glowH = headH * 2.2;
                    ctx.save();
                    if (!State.isMobile) {
                        ctx.globalCompositeOperation = 'screen';
                    }
                    ctx.globalAlpha = State.isMobile ? 0.22 : 0.35;
                    ctx.drawImage(State.glowSprite, headCenterX - glowW / 2, headCenterY - glowH / 2, glowW, glowH);
                    ctx.restore();
                }

                // Візуальне відображення хітбокса довгої ноти (+30% зверху та знизу)
                if (CONFIG.showHitbox && !tile.completed && !tile.failed) {
                    const padY = Math.round(CONFIG.noteHeight * 0.30);
                    const topBound = Math.min(yTail, actualYHeadTop) - padY;
                    const bottomBound = visualY + padY;
                    const hbX = x;
                    const hbY = topBound;
                    const hbW = w;
                    const hbH = bottomBound - topBound;

                    ctx.save();
                    ctx.fillStyle = tile.holding ? 'rgba(56, 189, 248, 0.16)' : 'rgba(34, 197, 94, 0.12)';
                    ctx.fillRect(hbX, hbY, hbW, hbH);

                    ctx.strokeStyle = tile.holding ? '#38bdf8' : '#22c55e';
                    ctx.lineWidth = 1.5;
                    ctx.setLineDash([6, 3]);
                    ctx.strokeRect(hbX, hbY, hbW, hbH);
                    ctx.setLineDash([]);

                    // Неонові кутові маркери
                    ctx.fillStyle = tile.holding ? '#7dd3fc' : '#4ade80';
                    const cs = 6;
                    ctx.fillRect(hbX, hbY, cs, 2); ctx.fillRect(hbX, hbY, 2, cs);
                    ctx.fillRect(hbX + hbW - cs, hbY, cs, 2); ctx.fillRect(hbX + hbW - 2, hbY, 2, cs);
                    ctx.fillRect(hbX, hbY + hbH - 2, cs, 2); ctx.fillRect(hbX, hbY + hbH - cs, 2, cs);
                    ctx.fillRect(hbX + hbW - cs, hbY + hbH - 2, cs, 2); ctx.fillRect(hbX + hbW - 2, hbY + hbH - cs, 2, cs);
                    ctx.restore();
                }
            }
        }
        }

        // Пост-рендер оверлей активної теми (парячий попіл Рейсі, глобальні шлейфи)
        if (activeTheme && typeof activeTheme.drawPostNotesOverlay === 'function') {
            activeTheme.drawPostNotesOverlay(ctx, now, State.combo);
        }

        // 5. Рендеринг системи частинок (іскор) при влучанні по нотах (Canvas 2D фолбек)
        ctx.shadowBlur = 0; 
        
        const pixiHandlesParticles = pixiRenderer && pixiRenderer.isReady && pixiRenderer.areParticlesHandled;
        if (!pixiHandlesParticles) {
            for (let i = 0; i < MAX_PARTICLES; i++) {
                let pt = particlePool[i];
                if (!pt.active) continue;

                pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.5; pt.life -= 0.035;
                if (State.combo >= 400) pt.angle += pt.spin; 
                
                if (pt.life <= 0.05) { pt.active = false; continue; }

                ctx.globalAlpha = Math.max(0, pt.life);
                ctx.fillStyle = pt.color;
                
                if (activeTheme && typeof activeTheme.drawParticle === 'function') {
                    activeTheme.drawParticle(ctx, pt, pt.life);
                    continue;
                }

                ctx.beginPath();
                if (State.combo >= 800 || State.combo >= 400) {
                     const size = State.combo >= 800 ? 6 : 8; 
                     const thickness = 2; 
                     const c = Math.cos(pt.angle);
                     const s = Math.sin(pt.angle);
                     
                     const hw = size/2; const hh = thickness/2;
                     const p1x = (-hw)*c - (-hh)*s + pt.x; const p1y = (-hw)*s + (-hh)*c + pt.y;
                     const p2x = (hw)*c - (-hh)*s + pt.x;  const p2y = (hw)*s + (-hh)*c + pt.y;
                     const p3x = (hw)*c - (hh)*s + pt.x;   const p3y = (hw)*s + (hh)*c + pt.y;
                     const p4x = (-hw)*c - (hh)*s + pt.x;  const p4y = (-hw)*s + (hh)*c + pt.y;
                     ctx.moveTo(p1x, p1y); ctx.lineTo(p2x, p2y); ctx.lineTo(p3x, p3y); ctx.lineTo(p4x, p4y); ctx.lineTo(p1x, p1y);

                     const vhw = thickness/2; const vhh = size/2;
                     const q1x = (-vhw)*c - (-vhh)*s + pt.x; const q1y = (-vhw)*s + (-vhh)*c + pt.y;
                     const q2x = (vhw)*c - (-vhh)*s + pt.x;  const q2y = (vhw)*s + (-vhh)*c + pt.y;
                     const q3x = (vhw)*c - (vhh)*s + pt.x;   const q3y = (vhw)*s + (vhh)*c + pt.y;
                     const q4x = (-vhw)*c - (vhh)*s + pt.x;  const q4y = (-vhw)*s + (hh)*c + pt.y;
                     ctx.moveTo(q1x, q1y); ctx.lineTo(q2x, q2y); ctx.lineTo(q3x, q3y); ctx.lineTo(q4x, q4y); ctx.lineTo(q1x, q1y);
                     
                } else if (State.combo >= 200) {
                    ctx.moveTo(pt.x, pt.y - 4); ctx.lineTo(pt.x + 4, pt.y); ctx.lineTo(pt.x, pt.y + 4); ctx.lineTo(pt.x - 4, pt.y);
                } else {
                    ctx.arc(pt.x, pt.y, (i % 3) + 1, 0, Math.PI * 2);
                }
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }

        // 6. Останнім шаром відмальовуються тільки оцінки точності в центрі (ІДЕАЛЬНО / ДОБРЕ / ПРОМАХ).
        // Комбо та множник тепер елегантно інтегровані у верхній бейдж game-combo-pill.
        drawRatings();
        ctx.restore();
    }

    function drawMultiplier(color) {
        const mult = getComboMultiplier();
        if (mult <= 1.0) return;

        const timeSinceUpdate = Date.now() - State.lastComboUpdateTime;
        let alpha = 1.0;
        if (timeSinceUpdate > 2000) {
             alpha = Math.max(0, 1 - (timeSinceUpdate - 2000) / 1000);
        }
        if (alpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = alpha;
        
        const cx = State.gameWidth / 2;
        const cy = State.isMobile ? 145 : 160; 

        ctx.translate(cx, cy);
        ctx.scale(State.comboScale, State.comboScale);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const fontSize = State.isMobile ? 24 : 28; 
        const text = `${mult.toFixed(1)}x`;

        ctx.font = `italic 900 ${fontSize}px 'Montserrat', 'Inter', system-ui, sans-serif`;
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillText(text, 2, 2);

        ctx.fillStyle = color;
        ctx.fillText(text, 0, 0);

        ctx.restore();
        ctx.globalAlpha = 1.0;
    }

    function drawComboDisplay() {
        if (State.combo < 3) return; 

        const timeSinceUpdate = Date.now() - State.lastComboUpdateTime;
        let alpha = 1.0;
        if (timeSinceUpdate > 2000) {
             alpha = Math.max(0, 1 - (timeSinceUpdate - 2000) / 1000); 
        }
        if (alpha <= 0) return;
        
        const curTier = (activeTheme && typeof activeTheme.getTier === 'function') 
            ? activeTheme.getTier(State.combo) 
            : null;

        let gradColors = ['#fff', '#ccc'];
        let fontSize = 60;
        let labelColor = '#fff';

        if (curTier && Array.isArray(curTier.particleColors) && curTier.particleColors.length > 0) {
            gradColors = [curTier.particleColors[0], curTier.particleColors[1] || curTier.particleColors[0]];
            fontSize = (State.combo >= 800) ? 70 : ((State.combo >= 400) ? 68 : ((State.combo >= 200) ? 66 : ((State.combo >= 100) ? 64 : 60)));
            labelColor = curTier.border || '#fff';
        } else if (State.combo >= 800) {
            gradColors = ['#43dca9ff', '#1f7da2ff']; 
            fontSize = 70; labelColor = '#e1bee7a4';
        } else if (State.combo >= 400) {
            gradColors = ['#00e5ff', '#d500f9']; 
            fontSize = 68; labelColor = '#00e5ff';
        } else if (State.combo >= 200) {
            gradColors = ['#FFD700', '#FDB931']; 
            fontSize = 66; labelColor = '#FFF8E1';
        } else if (State.combo >= 100) {
            gradColors = ['#00bcd4', '#b2ebf2']; 
            fontSize = 64; labelColor = '#00bcd4';
        }

        ctx.save();
        ctx.globalAlpha = alpha;
        const cx = State.gameWidth / 2;
        const cy = State.gameHeight * 0.3; 
        
        ctx.translate(cx, cy);
        ctx.scale(State.comboScale, State.comboScale);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.font = "800 16px 'Montserrat', 'Inter', system-ui, sans-serif";
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillText(getText('combo'), 2, -36 + 2);
        ctx.fillStyle = labelColor; ctx.fillText(getText('combo'), 0, -36);

        ctx.font = `900 ${fontSize - 12}px 'Montserrat', 'Inter', system-ui, sans-serif`;
        
        let gradient = ctx.createLinearGradient(0, -25, 0, 25);
        gradient.addColorStop(0, gradColors[0]);
        gradient.addColorStop(1, gradColors[1]);

        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillText(State.combo, 3, 13);
        ctx.fillStyle = gradient; ctx.fillText(State.combo, 0, 10);

        ctx.restore();
        ctx.globalAlpha = 1.0;
    }

    function drawRatings() {
        if (State.activeRatings.length === 0) return;
        const now = Date.now();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (let i = State.activeRatings.length - 1; i >= 0; i--) {
            const r = State.activeRatings[i];
            const elapsed = now - r.startTime;
            const duration = 380; 
            
            if (elapsed > duration) {
                State.activeRatings.splice(i, 1);
                continue;
            }

            const progress = elapsed / duration;
            let alpha = 1;
            let scale = 1;
            let yOffset = 0;

            if (progress < 0.25) {
                const t = progress / 0.25;
                scale = 0.75 + (0.35 * t); // Швидкий вибуховий вхід
                alpha = t;
                yOffset = -10 * t;
            } else {
                const t = (progress - 0.25) / 0.75;
                scale = 1.1 - (0.1 * t);
                alpha = 1 - Math.pow(t, 1.4);
                yOffset = -10 - (18 * t);
            }

            const sprite = SpriteCache.getRatingSprite(r.type);
            if (sprite) {
                ctx.save();
                ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
                ctx.translate(r.x, r.y + yOffset);
                ctx.scale(scale, scale);
                ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
                ctx.restore();
            }
        }
        ctx.globalAlpha = 1;
    }

    // Логіка обробки користувацького вводу (клавіатура та сенсорний екран).
    function spawnSparks(lane, y, color, type = 'good') {
        const laneW = State.gameWidth / 4;
        const x = lane * laneW + laneW / 2;
        const activeTheme = FieldThemes.getActiveTheme();
        let finalColor = '#cfd8dc';
        const curTier = (activeTheme && typeof activeTheme.getTier === 'function') 
            ? activeTheme.getTier(State.combo) 
            : null;

        if (curTier && Array.isArray(curTier.particleColors) && curTier.particleColors.length > 0) {
            const pal = curTier.particleColors;
            finalColor = pal[Math.floor(Math.random() * pal.length)];
        } else if (State.combo >= 800) {
            finalColor = Math.random() > 0.4 ? '#2cf5b2ff' : '#101006ff';
        } else if (State.combo >= 400) {
            finalColor = Math.random() > 0.5 ? '#d500f9' : '#0a6974ff';
        } else if (State.combo >= 200) {
            finalColor = '#e6953f';
        } else if (State.combo >= 100) {
            finalColor = '#00bcd4';
        }
        
        const count = type === 'perfect' ? 16 : 8;

        // Phase 4: Delegate to PixiRenderer WebGL particle system
        if (pixiRenderer && pixiRenderer.isReady && pixiRenderer.areParticlesHandled) {
            pixiRenderer.spawnSparks(x, y, count, finalColor, activeTheme ? activeTheme.id : 'default', type, State.combo);
            return;
        }

        let spawned = 0;
        
        for (let i = 0; i < MAX_PARTICLES; i++) {
            if (spawned >= count) break;
            let idx = (particlePoolIndex + i) % MAX_PARTICLES;
            if (!particlePool[idx].active) {
                const pt = particlePool[idx];
                pt.active = true;
                pt.x = x + (Math.random() - 0.5) * 40;
                pt.y = y;
                pt.vx = (Math.random() - 0.5) * 12;
                pt.vy = (Math.random() - 1) * 12 - 4;
                pt.life = 1.0;
                pt.color = finalColor;
                pt.theme = activeTheme.id;
                pt.size = Math.random() * 4 + 4;
                // Ініціалізація параметрів обертання для частинок, щоб вони красиво розліталися під час польоту.
                pt.angle = Math.random() * Math.PI * 2;
                pt.spin = (Math.random() - 0.5) * 0.2;
                spawned++;
            }
        }
        particlePoolIndex = (particlePoolIndex + count) % MAX_PARTICLES;
    }

    // Легкі димчасто-попелясті частинки розчинення довгої ноти, що занурюється крізь струни в невидимий простір
    function spawnDissolveParticles(x, y, w) {
        // Phase 4: Delegate to PixiRenderer WebGL dissolve particles
        if (pixiRenderer && pixiRenderer.isReady && pixiRenderer.areParticlesHandled) {
            pixiRenderer.spawnDissolve(x, y, w);
            return;
        }

        for (let i = 0; i < 2; i++) {
            const idx = (particlePoolIndex + i) % MAX_PARTICLES;
            if (!particlePool[idx].active) {
                const pt = particlePool[idx];
                pt.active = true;
                pt.x = x + Math.random() * w;
                pt.y = y + (Math.random() * 6 - 3);
                pt.vx = (Math.random() - 0.5) * 2.2;
                pt.vy = -(Math.random() * 1.8 + 0.6);
                pt.life = 0.5 + Math.random() * 0.4;
                pt.color = 'rgba(148, 163, 184, 0.55)';
                pt.angle = Math.random() * Math.PI * 2;
                pt.spin = (Math.random() - 0.5) * 0.12;
            }
        }
        particlePoolIndex = (particlePoolIndex + 2) % MAX_PARTICLES;
    }

function handleInputDown(lane, touchY, touchX) {
        if (!State.isPlaying || State.isPaused) return;
        const now = Date.now();
        const activeTheme = FieldThemes.getActiveTheme();
        
        // Захист від надмірного спаму / апаратного дребезгу контактів (40 мс)
        if (now - (State.laneLastInputTime[lane] || 0) < 40) return;
        State.laneLastInputTime[lane] = now;
        
        State.keyState[lane] = true;
        
        if (laneElements[lane]) laneElements[lane].classList.add('active');
        if (laneKeyElements[lane]) laneKeyElements[lane].classList.add('active');

        const songTime = State.audioCtx ? (State.audioCtx.currentTime - State.startTime) * 1000 : 0;
        const hitY = State.gameHeight * CONFIG.hitPosition;

        const laneW = State.gameWidth / 4;
        const laneLeft = lane * laneW;
        const laneRight = (lane + 1) * laneW;
        
        // Вертикальний хітбокс: адаптивний до швидкості.
        // При вищій швидкості (1.6x тощо) ноти швидше пролітають — hitbox стає ширшим
        // щоб гравцеві було комфортно потрапляти при одночасних натисканнях на смартфонах.
        const speedMultiplier = State.selectedSpeed || 1.0;
        const speedPadBoost = Math.max(1.0, speedMultiplier);
        const basePadY = Math.round(CONFIG.noteHeight * (0.35 * speedPadBoost));
        const isTouch = (touchY !== undefined);
        const padTop = isTouch ? Math.max(basePadY, 52) : basePadY;
        const padBottom = isTouch ? Math.max(basePadY, 65) : basePadY;

        // Горизонтальний margin для touch: 22px для комфортної гри пальцями на смартфонах
        const laneHitPad = isTouch ? 22 : 0;

        // Перевірка 1. Пріоритет: спочатку шукаємо незіграну ноту безпосередньо під пальцем / курсором
        const candidates = State.activeTiles.filter(t => {
            if (t.hit || t.completed || t.failed || t.missed || t.released) return false;
            if (t.lane !== lane) return false;

            const visualY = (1 - (t.time - songTime) / State.currentSpeed) * hitY;

            if (isTouch) {
                // Горизонтальна перевірка з розширеним margin для пальців
                if (touchX !== undefined && (touchX < laneLeft - laneHitPad || touchX > laneRight + laneHitPad)) {
                    return false;
                }

                if (t.type === 'tap') {
                    const yTop = visualY - CONFIG.noteHeight;
                    // Нота ще не пішла за межі нижнього краю екрана
                    if (yTop > State.gameHeight + 10) return false;

                    // Варіант 1: безпосередній дотик до самої ноти з вертикальним запасом
                    const onNote = (touchY >= yTop - padTop && touchY <= visualY + padBottom);
                    // Варіант 2: гравець торкається рецепторної лінії або низу екрана, поки нота в межах поля зору
                    const inReceptorZone = (touchY >= hitY - padTop && touchY <= State.gameHeight + 60 && visualY >= hitY - padTop && yTop <= State.gameHeight);
                    // Варіант 3: нота вже нижче hitY (летить до низу екрана) — гравець натиснув будь-де в зоні між лінією удару та низом
                    const catchingLateNote = (visualY >= hitY && yTop <= State.gameHeight && touchY >= hitY - padTop && touchY <= State.gameHeight + 60);
                    return onNote || inReceptorZone || catchingLateNote;
                } else if (t.type === 'long') {
                    const progressEnd = 1 - (t.endTime - songTime) / State.currentSpeed;
                    const yTail = progressEnd * hitY;
                    // Якщо хвіст довгої ноти повністю пішов за межі низу екрана — нота вже не в грі
                    if (yTail > State.gameHeight + 10) return false;

                    const actualYHeadTop = visualY - CONFIG.noteHeight;
                    const topBound = Math.min(yTail, actualYHeadTop) - padTop;
                    const bottomBound = Math.max(visualY, hitY, State.gameHeight) + padBottom;
                    const onNote = (touchY >= topBound && touchY <= bottomBound);
                    const inReceptorZone = (touchY >= hitY - padTop && touchY <= State.gameHeight + 60 && visualY >= hitY - padTop && yTail <= State.gameHeight);
                    const catchingLateNote = (visualY >= hitY && yTail <= State.gameHeight && touchY >= hitY - padTop && touchY <= State.gameHeight + 60);
                    return onNote || inReceptorZone || catchingLateNote;
                }
                return false;
            } else {
                // Клавіатура: нижня 1/3 екрана біля лінії рецептора
                const bottomAreaTop = State.gameHeight * 0.66;
                const yTop = visualY - CONFIG.noteHeight;
                return (visualY >= bottomAreaTop && yTop <= State.gameHeight + 50);
            }
        });

        if (candidates.length > 0) {
            // Якщо тач — обираємо ноту, до центру якої найближче торкнулися; для клавіатури — найпершу за часом ноту
            if (isTouch) {
                candidates.sort((a, b) => {
                    const aMid = (1 - (a.time - songTime) / State.currentSpeed) * hitY - CONFIG.noteHeight / 2;
                    const bMid = (1 - (b.time - songTime) / State.currentSpeed) * hitY - CONFIG.noteHeight / 2;
                    return Math.abs(aMid - touchY) - Math.abs(bMid - touchY);
                });
            } else {
                candidates.sort((a, b) => a.time - b.time);
            }
            const target = candidates[0];

            State.laneBeamAlpha[lane] = 1.0; 
            State.laneLastType[lane] = target.type; 

            const diff = Math.abs(target.time - songTime);
            const targetY = (1 - (target.time - songTime) / State.currentSpeed) * hitY;

            target.hit = true;
            target.hitTime = now;
            target.hitVisualY = targetY; // Фіксуємо точну висоту натискання — нота НЕ притягується донизу
            if (target.type === 'tap') target.hitAnimStart = now;

            State.totalHits++;
            State.consecutiveMisses = 0;
            State.lastHitTime = now;
            State.lastComboUpdateTime = now;

            const mult = getComboMultiplier();
            const dist = Math.abs(targetY - hitY);

            // Оцінка точності: Perfect поблизу лінії або Good на решті поверхні екрану
            if (dist <= 65 || diff < 95) {
                State.perfectHits++;
                State.score += Math.round(CONFIG.scorePerfect * mult * State.scoreMultiplier);
                showRating(getText('perfect'), "rating-perfect");
                target.hitRating = 'perfect';
            } else {
                State.score += Math.round(CONFIG.scoreGood * mult * State.scoreMultiplier);
                showRating(getText('good'), "rating-good");
                target.hitRating = 'good';
            }

            if (target.type === 'long') {
                target.holding = true;
                State.holdingTiles[lane] = target;
                target.lastValidHoldTime = now;
                toggleHoldEffect(lane, true);
                State.score += Math.round(CONFIG.scorePerfect * mult * State.scoreMultiplier);
                showRating(getText('perfect'), "rating-perfect");
            } else {
                State.combo++;
                if (State.combo > State.maxCombo) State.maxCombo = State.combo;
            }

            // Phase 4: Trigger GPU WebGL Hit Explosion in PixiRenderer
            if (pixiRenderer && pixiRenderer.isReady && pixiRenderer.areParticlesHandled) {
                try {
                    const laneW = State.gameWidth / 4;
                    const padding = 6;
                    const w = laneW - (padding * 2);
                    const cx = target.lane * laneW + laneW / 2;
                    const cy = (target.hitVisualY > 0 ? target.hitVisualY : targetY) - CONFIG.noteHeight / 2;
                    const isPerfect = (target.hitRating === 'perfect');
                    pixiRenderer.triggerHitEffect(cx, cy, w, CONFIG.noteHeight, isPerfect, activeTheme ? activeTheme.id : 'default', State.combo, target.lane, activeTheme);
                } catch (err) {
                    console.warn("[PixiRenderer] hit effect error:", err);
                }
            }

            // Плавна неонова хвиля на лінії удару без вибуху ноти
            try { spawnRipple(lane); } catch(e) { }
            updateScoreUI(true);
            return;
        }

        // Перевірка 2. Якщо незіграної ноти під пальцем не було — перевіряємо, чи це повторне утримання довгої ноти
        const activeHold = State.activeTiles.find(t => t.lane === lane && t.type === 'long' && t.hit && !t.completed && !t.failed && !t.released);
        if (activeHold) {
            let validHoldTouch = true;
            if (touchY !== undefined) {
                if (touchX !== undefined && (touchX < laneLeft - laneHitPad || touchX > laneRight + laneHitPad)) {
                    validHoldTouch = false;
                } else {
                    const progressEnd = 1 - (activeHold.endTime - songTime) / State.currentSpeed;
                    const visualY = (1 - (activeHold.time - songTime) / State.currentSpeed) * hitY;
                    const yHead = (activeHold.hit && activeHold.holding) ? (visualY >= hitY ? hitY : visualY) : visualY;
                    const yTail = Math.min(progressEnd * hitY, hitY);
                    const actualYHeadTop = yHead - CONFIG.noteHeight;
                    const topBound = Math.min(yTail, actualYHeadTop) - padTop;
                    const bottomBound = Math.max(yHead, hitY, State.gameHeight) + padBottom;
                    validHoldTouch = (touchY >= topBound && touchY <= bottomBound);
                }
            }
            if (validHoldTouch) {
                State.holdingTiles[lane] = activeHold;
                activeHold.holding = true;
                activeHold.lastValidHoldTime = now;
                toggleHoldEffect(lane, true);
                
                State.laneBeamAlpha[lane] = 1.0; 
                State.laneLastType[lane] = 'long'; 
                return;
            }
        }

        // Натискання на доріжку, коли ноти немає або повз хітбокс:
        // Фіксуємо промах для всіх типів вводу (як клавіатура, так і тач)
        missNote(null, false);
        State.laneBeamAlpha[lane] = 0.25;
    }

    function handleInputUp(lane) {
        State.keyState[lane] = false;
        if (laneElements[lane]) laneElements[lane].classList.remove('active');
        if (laneKeyElements[lane]) laneKeyElements[lane].classList.remove('active');
        // Якщо довга нота активна і утримується, НЕ скидаємо ефект утримання миттєво при мікро-розриві,
        // а дозволяємо буферу толерантності в update() коректно завершити або плавно згасити її
        const activeTile = State.holdingTiles[lane];
        if (!activeTile || activeTile.completed || activeTile.released || activeTile.failed) {
            toggleHoldEffect(lane, false);
            State.holdingTiles[lane] = null;
        }
    }

    function missNote(tile, isSpawnedMiss) {
        if (tile) {
            tile.failed = true;
            tile.missed = true;
        }
        State.consecutiveMisses++;
        State.totalMisses++; // ЗМІНА: Я фіксую промах у глобальному лічильнику. Це критично для визначення того, чи отримає гравець діамантову зірку в кінці рівня.
        State.combo = 0;
        State.lastComboUpdateTime = 0; 
        updateScoreUI(); 
        showRating(getText('miss'), "rating-miss");
        
        // 60 FPS апаратне тремтіння Canvas без DOM-рефлоу
        State.screenShake = 11;

        // Неоновий червоний оверлей по краях екрану через композитор GPU (0 reflow)
        const missOverlay = document.getElementById('miss-flash-overlay');
        if (missOverlay) {
            missOverlay.classList.add('active');
            if (State._missFlashTimer) clearTimeout(State._missFlashTimer);
            State._missFlashTimer = setTimeout(() => {
                missOverlay.classList.remove('active');
            }, 140);
        }

        // Хардкор-режим: будь-який промах миттєво завершує гру. 1 Промах = Смерть.
        if (State.isHardcore) {
            endGame(false);
            return;
        }
        if (State.consecutiveMisses >= CONFIG.missLimit) endGame(false);
    }

    // Функції для оновлення елементів інтерфейсу на сторінці.
    function getComboMultiplier() {
        if (State.combo >= 800) return 10.0;
        if (State.combo >= 400) return 8.0;
        if (State.combo >= 200) return 6.0;
        if (State.combo >=  100) return 4.0;
        if (State.combo >= 50) return 2.0;
        return 1.0;
    }

    // Обчислення множника очків на основі обраних модифікаторів (швидкість + хардкор).
    function computeScoreMultiplier(speed, hardcore) {
        const speedMap = { 1.0: 1.0, 1.2: 1.3, 1.3: 1.3, 1.4: 1.6, 1.6: 1.6 };
        const speedMult = speedMap[speed] || speed || 1.0;
        return hardcore ? Math.round(speedMult * 1.5 * 10) / 10 : speedMult;
    }

    // Визначення мітки складності для відображення на картці треку.
    function getDifficultyLabel() {
        if (State.isHardcore) return getText('modHardcore');
        if (State.selectedSpeed >= 1.35) return getText('diffHard');
        if (State.selectedSpeed >= 1.15) return getText('diffNormal');
        return getText('diffEasy');
    }

    // Отримання ключа складності для збереження (не залежить від мови).
    function getDifficultyKey() {
        if (State.isHardcore) return 'hardcore';
        if (State.selectedSpeed >= 1.35) return 'hard';
        if (State.selectedSpeed >= 1.15) return 'normal';
        return 'easy';
    }

    // Оптимізація: оновлюємо DOM тільки при реальній зміні значень та кешуємо посилання
    let lastRenderedScore = -1;
    let lastMultiplierTier = 1.0;
    let lastAppliedTier = '';
    let comboPillEl = null;
    let comboCountEl = null;
    let comboIconEl = null;
    let comboMultEl = null;
    let comboTitleEl = null;
    let comboProgressFillEl = null;

    function initComboDOMElements() {
        comboPillEl = document.getElementById('game-combo-pill');
        comboCountEl = document.getElementById('combo-count');
        comboIconEl = document.getElementById('combo-icon');
        comboMultEl = document.getElementById('combo-mult');
        comboTitleEl = comboPillEl?.querySelector('.combo-title');
        comboProgressFillEl = document.getElementById('combo-progress-fill');
    }

    function updateScoreUI(isHit = false) {
        if (scoreEl && State.score !== lastRenderedScore) {
            scoreEl.innerText = State.score;
            lastRenderedScore = State.score;
        }

        if (isHit && State.combo > 0) {
            State.comboScale = 1.3; 
        }

        if (!comboPillEl) initComboDOMElements();

        if (comboPillEl && comboCountEl) {
            if (State.combo >= 2) {
                comboCountEl.textContent = State.combo;
                if (comboTitleEl && !comboTitleEl.textContent) {
                    comboTitleEl.textContent = getText('combo') || 'COMBO';
                }
                if (comboIconEl && !comboIconEl.innerHTML) {
                    comboIconEl.innerHTML = icons.flame(13);
                }

                const mult = getComboMultiplier();
                if (comboMultEl) {
                    comboMultEl.textContent = `x${mult.toFixed(1)}`;
                }

                // Шкала прогресу до наступного рівня комбо
                let progressPct = 0;
                if (State.combo < 50) progressPct = (State.combo / 50) * 100;
                else if (State.combo < 100) progressPct = ((State.combo - 50) / 50) * 100;
                else if (State.combo < 200) progressPct = ((State.combo - 100) / 100) * 100;
                else if (State.combo < 400) progressPct = ((State.combo - 200) / 200) * 100;
                else if (State.combo < 800) progressPct = ((State.combo - 400) / 400) * 100;
                else progressPct = 100;

                if (comboProgressFillEl) {
                    comboProgressFillEl.style.width = `${Math.min(100, Math.max(3, progressPct))}%`;
                }

                comboPillEl.classList.remove('hidden');
                
                let currentTier = '';
                if (State.combo >= 800) currentTier = 'tier-800';
                else if (State.combo >= 400) currentTier = 'tier-400';
                else if (State.combo >= 200) currentTier = 'tier-200';
                else if (State.combo >= 100) currentTier = 'tier-100';
                else if (State.combo >= 50) currentTier = 'tier-50';

                if (currentTier !== lastAppliedTier) {
                    comboPillEl.classList.remove('tier-50', 'tier-100', 'tier-200', 'tier-400', 'tier-800');
                    if (currentTier) comboPillEl.classList.add(currentTier);
                    lastAppliedTier = currentTier;
                }

                // Анімація переходу на новий рівень множника без накопичення інстансів Web Animations
                if (mult > lastMultiplierTier) {
                    if (comboMultEl && typeof comboMultEl.animate === 'function') {
                        if (comboMultEl._anim) comboMultEl._anim.cancel();
                        comboMultEl._anim = comboMultEl.animate([
                            { transform: 'scale(1) rotate(0deg)', filter: 'brightness(1)' },
                            { transform: 'scale(1.75) rotate(-10deg)', filter: 'brightness(2.2)' },
                            { transform: 'scale(1) rotate(0deg)', filter: 'brightness(1)' }
                        ], { duration: 380, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
                    }
                    if (typeof comboPillEl.animate === 'function') {
                        if (comboPillEl._anim) comboPillEl._anim.cancel();
                        comboPillEl._anim = comboPillEl.animate([
                            { transform: 'scale(1)' },
                            { transform: 'scale(1.16)', filter: 'brightness(1.4)' },
                            { transform: 'scale(1)', filter: 'brightness(1)' }
                        ], { duration: 320, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
                    }
                    lastMultiplierTier = mult;
                }

                // Швидка анімація влучання з попереднім скиданням
                if (isHit) {
                    if (typeof comboCountEl.animate === 'function') {
                        if (comboCountEl._anim) comboCountEl._anim.cancel();
                        comboCountEl._anim = comboCountEl.animate([
                            { transform: 'scale(1.38) translateY(-2px)' },
                            { transform: 'scale(1) translateY(0)' }
                        ], { duration: 130, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
                    }
                    if (comboIconEl && typeof comboIconEl.animate === 'function') {
                        if (comboIconEl._anim) comboIconEl._anim.cancel();
                        comboIconEl._anim = comboIconEl.animate([
                            { transform: 'scale(1.3) rotate(-8deg)' },
                            { transform: 'scale(1) rotate(0deg)' }
                        ], { duration: 150, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
                    }
                }
            } else {
                comboPillEl.classList.add('hidden');
                comboPillEl.classList.remove('tier-50', 'tier-100', 'tier-200', 'tier-400', 'tier-800');
                lastAppliedTier = '';
                if (comboProgressFillEl) comboProgressFillEl.style.width = '0%';
                lastMultiplierTier = 1.0;
                updateContainerEffects();
            }
        }
    }

    function updateContainerEffects() {
        // Я фіксую поточний рівень комбо як 'none', щоб зупинити використання важких ефектів CSS, таких як тіні контейнера, і повністю перекласти рендеринг на Canvas.
        State.currentComboTier = 'none';

        // Я гарантовано прибираю всі зайві CSS класи з контейнера гри, які могли залишитися від старих версій коду.
        if (gameContainer) {
            gameContainer.classList.remove('container-ripple-gold', 'container-ripple-cosmic', 'container-legendary');
        }

        // Прибираю HTML-оверлей легендарного режиму з тих самих міркувань оптимізації.
        const legendaryOverlay = document.getElementById('legendary-border-overlay');
        if (legendaryOverlay) {
            legendaryOverlay.classList.remove('active');
        }
    }

    function showRating(text, cssClass) {
        let color = '#fff';
        if (cssClass === 'rating-perfect') color = '#ff00ff';
        else if (cssClass === 'rating-good') color = '#66FCF1';
        else if (cssClass === 'rating-miss') color = '#ff3333';

        if (State.activeRatings.length > 2) {
            State.activeRatings.shift();
        }

        State.activeRatings.push({
            text: text,
            type: cssClass,
            color: color,
            startTime: Date.now(),
            x: State.gameWidth / 2,
            y: State.gameHeight * 0.4
        });
    }

    // Спрощена функція вмикання ефектів утримання. Я більше не використовую кешування кольорів тут, оскільки цикл малювання автоматично підбирає потрібний колір.
    function toggleHoldEffect(lane, active) {
        if (lane < 0 || lane > 3) return;
        if (active) {
            State.laneBeamAlpha[lane] = 1.0;
        } else {
            
        }
    }

function updateProgressBar(current, total) {
    if (!progressBar) return;
    const ratio = Math.min(1, Math.max(0, current / total));
    
    // Оновлюємо стиль прогрес-бару лише якщо є відчутна зміна (мінімум 0.2%)
    const pct = (ratio * 100).toFixed(1);
    if (progressBar._lastPct !== pct) {
        progressBar._lastPct = pct;
        progressBar.style.width = `${pct}%`;
    }

    // Динамічне оновлення швидкості в HUD лише якщо швидкість реально змінилась
    // Це усуває 60-120 важких DOM innerHTML парсингів на секунду під час гри!
    if (!State._modSpeedEl) State._modSpeedEl = document.getElementById('game-mod-speed');
    const modSpeedEl = State._modSpeedEl;
    if (modSpeedEl) {
        const dynamicSpd = (State.dynamicSpeedMultiplier || (State.selectedSpeed || 1.0)).toFixed(2);
        if (modSpeedEl._lastSpd !== dynamicSpd) {
            modSpeedEl._lastSpd = dynamicSpd;
            modSpeedEl.innerHTML = `${icons.zap(12)} <span>${dynamicSpd}x</span>`;
            modSpeedEl.classList.remove('hidden');
        }
    }
    
    // Пороги прогресу для зірок: оновлюємо DOM лише в момент фактичного переходу статусу!
    const isSecret = Boolean(songsDB[State.currentSongIndex]?.isSecret);
    const limits = isSecret ? [0.2, 0.4, 0.6, 0.8, 0.999] : [0.333, 0.666, 0.999];

    limits.forEach((limit, i) => {
        const starEl = starsElements[i];
        if (!starEl) return;

        if (ratio >= limit) {
            // Зірка досягнута за прогресом
            if (!State.starStatus[i] || State.starStatus[i] === 0) {
                // Вперше досягли цієї зірки:
                // Якщо до цього моменту не було жодного промаху (totalMisses === 0) — це діамант (2)!
                // Якщо промах вже стався раніше (totalMisses > 0) — це звичайна золота зірка (1).
                const status = (State.totalMisses === 0) ? 2 : 1;
                State.starStatus[i] = status;
                if (status === 2) {
                    starEl.className = 'star-marker active diamond';
                    starEl.innerHTML = icons.diamond(16);
                } else {
                    starEl.className = 'star-marker active';
                    starEl.innerHTML = icons.starFilled(16);
                }
            }
            // Якщо State.starStatus[i] вже встановлено (1 або 2) — ВОНО НЕ ЗНИЖУЄТЬСЯ!
            // Отриманий раніше алмаз залишається алмазом назавжди, навіть якщо гравець зробить помилку пізніше.
        } else {
            // Зірка ще не досягнута
            if (State.starStatus[i] !== 0) {
                State.starStatus[i] = 0;
                starEl.className = 'star-marker';
                starEl.innerHTML = icons.starEmpty(16);
            }
        }
    });
}
    // Я створив функцію генерації невеликого спрайту радіального світіння. Він створюється на окремому прихованому Canvas лише один раз під час завантаження гри. Потім я просто копіюю його пікселі на основний екран, що працює в десятки разів швидше, ніж малювання градієнтів вручну.
    function createGlowSprite(size = 128) {
	if (!document) return;
	const c = document.createElement('canvas');
	c.width = size; c.height = size;
	const gctx = c.getContext('2d');
	const cx = size / 2, cy = size / 2, r = size / 2;
	const grad = gctx.createRadialGradient(cx, cy, 0, cx, cy, r);
	grad.addColorStop(0, "rgba(255,255,255,0.95)");
	grad.addColorStop(0.4, "rgba(255,255,255,0.25)");
	grad.addColorStop(1, "rgba(255,255,255,0)");
	gctx.fillStyle = grad;
	gctx.fillRect(0, 0, size, size);
	State.glowSprite = c;
}

// Система хвиль на лінії удару: логіка створення (spawn) та оновлення фізики з часом.
function spawnRipple(lane) {
    const laneW = State.gameWidth / 4;
    const x = lane * laneW + laneW / 2;
    let power = 2;
    if (State.combo >= 800) power = 4.5;
    else if (State.combo >= 400) power = 3.5;
    else if (State.combo >= 200) power = 2.8;
    else if (State.combo >= 100) power = 2.0;

    State.ripples.push({ x: x, power: power, age: 0, life: 480, radius: 0 });
    if (State.ripples.length > 5) {
        State.ripples.shift(); 
    }
}

function updateRipples(dt) {
    if (!State.ripples || State.ripples.length === 0) return;
    const out = [];
    for (let i = 0; i < State.ripples.length; i++) {
        const r = State.ripples[i];
        r.age += dt;
        // Швидке затухання для чіткого ігрового відгуку
        r.power = Math.max(0, r.power - (0.0035 * dt));
        r.radius += 240 * (dt / 1000) * (0.5 + r.power * 0.5);
        if (r.age < r.life && r.power > 0.05) out.push(r);
    }
    State.ripples = out;
}

    // Функції керування життєвим циклом гри (старт, кінець, вихід).
    async function startGame(idx) {
        const song = songsDB[idx];
        if (!song || !song.audioUrl) {
            alert(getText('errorMissingAudio') || "Помилка: Аудіофайл для цього треку відсутній.");
            return;
        }

        if (bgMusicEl) bgMusicEl.pause();
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
        }
        resetGameState();
        document.body.classList.add('in-game');

        const starContainer = document.querySelector('.stars-container');
        if (starContainer) {
            starContainer.innerHTML = '';
            const count = (song && song.isSecret) ? 5 : 3;
            starsElements = [];
            const secretPercentages = ['20%', '40%', '60%', '80%', '99.9%'];
            for (let i = 1; i <= count; i++) {
                const s = document.createElement('div');
                s.id = `star-${i}`;
                s.className = 'star-marker';
                s.innerHTML = icons.starEmpty(16);
                s.style.left = (song && song.isSecret) ? secretPercentages[i - 1] : (i === 1 ? '33.3%' : (i === 2 ? '66.6%' : '99.9%'));
                starContainer.appendChild(s);
                starsElements.push(s);
            }
        }

        const mySession = State.currentSessionId;
        State.currentSongIndex = idx;
        if (menuLayer) menuLayer.classList.add('hidden');
        if (gameContainer) gameContainer.classList.remove('hidden');
        if (loader) loader.classList.remove('hidden');
        resizeCanvas();
        updateGameText();

        const botIndicator = document.getElementById('game-bot-indicator');
        if (botIndicator) {
            botIndicator.classList.toggle('hidden', !State.isBotEnabled);
        }

        // Відображення активних модифікаторів в ігровому інтерфейсі
        const modSpeedEl = document.getElementById('game-mod-speed');
        const modHardcoreEl = document.getElementById('game-mod-hardcore');
        const modMultEl = document.getElementById('game-mod-mult');

        if (modSpeedEl) {
            if (State.selectedSpeed > 1.0) {
                modSpeedEl.innerHTML = `${icons.zap(12)} <span>${State.selectedSpeed}x</span>`;
                modSpeedEl.classList.remove('hidden');
            } else {
                modSpeedEl.classList.add('hidden');
            }
        }
        if (modHardcoreEl) {
            if (State.isHardcore) {
                modHardcoreEl.innerHTML = `${icons.skull(12)} <span>${getText('modHardcore') || 'HARDCORE'}</span>`;
                modHardcoreEl.classList.remove('hidden');
            } else {
                modHardcoreEl.classList.add('hidden');
            }
        }
        if (modMultEl) {
            if (State.scoreMultiplier > 1.0) {
                modMultEl.innerHTML = `${icons.flame(12)} <span>x${State.scoreMultiplier.toFixed(1)}</span>`;
                modMultEl.classList.remove('hidden');
            } else {
                modMultEl.classList.add('hidden');
            }
        }

        analyzeAudio(song.audioUrl, mySession).then(generatedTiles => {
            if (mySession !== State.currentSessionId) return;
            if (generatedTiles) {
                State.mapTiles = generatedTiles;
                State.mapTiles.sort((a, b) => a.time - b.time);
                State.nextSpawnIndex = 0;
                if (loader) loader.classList.add('hidden');
                playMusic();
            }
        }).catch(err => {
            console.error("Помилка завантаження аудіо:", err);
            alert((getText('errorLoadAudio') || "Не вдалося завантажити аудіо треку:\n") + (err.message || err));
            if (loader) loader.classList.add('hidden');
            quitGame();
        });
    }

    async function playMusic() {
        if (State.sourceNode) {
            try { State.sourceNode.stop(); } catch (e) { }
            State.sourceNode = null;
        }
        if (State.audioCtx && State.audioCtx.state !== 'running') {
            try { await State.audioCtx.resume(); } catch (e) { }
        }
        resizeCanvas();

        State.sourceNode = State.audioCtx.createBufferSource();
        State.sourceNode.buffer = State.audioBuffer;

        // Я створюю вузол AnalyserNode у Web Audio API для отримання даних про частотний спектр звуку в реальному часі.
        if (!State.analyser) {
            State.analyser = State.audioCtx.createAnalyser();
            State.analyser.fftSize = 64; 
            State.dataArray = new Uint8Array(State.analyser.frequencyBinCount);
        }

        // Я вибудовую ланцюг обробки звуку: Джерело -> Аналізатор -> Регулятор гучності -> Вихідний пристрій користувача.
        State.sourceNode.connect(State.analyser);
        State.analyser.connect(State.masterGain);

        const startDelay = 2;
        State.startTime = State.audioCtx.currentTime + startDelay;
        // Мелодія завжди звучить у природному темпі 1.0x (pitch та темп чисті, без спотворень)
        State.sourceNode.playbackRate.value = 1.0;
        State.sourceNode.start(State.startTime);
        State.lastFrameTime = 0;
        State.isPlaying = true; State.isPaused = false;
        if (State.animationFrameId) {
            cancelAnimationFrame(State.animationFrameId);
            State.animationFrameId = null;
        }
        State.animationFrameId = requestAnimationFrame(gameLoop);
        if (State.isPreviewMode && typeof startPreviewCountdown === 'function') {
            startPreviewCountdown();
        }
    }

    function cleanLevelRemnants() {
        NotePool.resetAll();
        State.activeTiles = [];
        State.mapTiles = [];
        State.nextSpawnIndex = 0;
        State.holdingTiles = [null, null, null, null];
        State.keyState = [false, false, false, false];
        State.laneLastType = ['tap', 'tap', 'tap', 'tap'];
        State.laneBeamAlpha = [0, 0, 0, 0];
        State.laneStringVibe = [0, 0, 0, 0];
        State.ripples = [];
        for (let i = 0; i < MAX_PARTICLES; i++) {
            if (particlePool[i]) particlePool[i].active = false;
        }
        State.activeRatings = [];
        State.screenShake = 0;
        if (progressBar) progressBar.style.width = '0%';
        laneElements.forEach(el => { if (el) el.classList.remove('active'); });
        laneKeyElements.forEach(el => { if (el) el.classList.remove('active'); });
        if (ctx) {
            draw();
            pixiRenderer.render(0, State);
            pixiRenderer.clearNotes();
            if (pixiRenderer.clearParticles) pixiRenderer.clearParticles();
        }
    }

    async function endGame(victory) {
        if (State.isPreviewMode) {
            exitThemePreview();
            return;
        }
        flushPlaytimeToCloud();
        State.isPlaying = false;
        if (State.sourceNode) {
            try { State.sourceNode.stop(); } catch (e) { }
            State.sourceNode = null;
        }
        if (State.animationFrameId) {
            cancelAnimationFrame(State.animationFrameId);
            State.animationFrameId = null;
        }
        State.lastFrameTime = 0;
        if (bgMusicEl && !State.isMuted) bgMusicEl.play().catch(() => {});

        const currentSong = songsDB[State.currentSongIndex];
        const isSecret = Boolean(currentSong?.isSecret);
        const total = isSecret ? 5 : 3;

        // Облік незіграних нот на екрані при завершенні треку
        // ВАЖЛИВО: Лише активні ноти, які вже були на екрані і які гравець не встиг натиснути.
        // Ненароджені майбутні ноти треку (mapTiles) КАТЕГОРИЧНО НЕ додаються до промахів,
        // бо це показувало 700+ промахів при поразці або передчасному завершенні.
        let leftoverMisses = 0;
        if (Array.isArray(State.activeTiles)) {
            State.activeTiles.forEach(t => {
                if (!t.hit && !t.completed && !t.missed && !t.failed && !t.released) {
                    leftoverMisses++;
                }
            });
        }
        if (victory && leftoverMisses > 0) {
            State.totalMisses = (State.totalMisses || 0) + leftoverMisses;
        }

        // Негайне очищення всіх залишків рівня з ігрового поля та канвасу
        cleanLevelRemnants();

        // Розрахунок точності (% вдалих попадань)
        const totalProcessed = (State.totalHits || 0) + (State.totalMisses || 0);
        let accuracy = 0;
        if (totalProcessed > 0) {
            accuracy = Math.max(0, Math.min(100, Math.round(((State.totalHits || 0) / totalProcessed) * 1000) / 10));
        } else if (victory && State.score > 0) {
            accuracy = 100.0;
        }

        // Розрахунок рангу результату (S / A / B / C / D)
        let grade = 'D';
        if (victory) {
            if (accuracy >= 95 && (State.totalMisses === 0 || accuracy >= 98)) {
                grade = 'S';
            } else if (accuracy >= 85) {
                grade = 'A';
            } else if (accuracy >= 70) {
                grade = 'B';
            } else if (accuracy >= 50) {
                grade = 'C';
            } else {
                grade = 'D';
            }
        } else {
            grade = 'D';
        }

        // Оновлення картки результатів у стилі модернізму
        const gradeBadgeEl = document.getElementById('res-grade-badge');
        if (gradeBadgeEl) {
            gradeBadgeEl.textContent = grade;
            gradeBadgeEl.className = `res-grade-badge grade-${grade.toLowerCase()}`;
        }

        const title = document.getElementById('end-title');
        if (title) {
            title.innerText = victory ? (getText('resLevelPassed') || getText('complete') || 'ЧУДОВО!') : (getText('resLevelFailed') || getText('failed') || 'ПРОВАЛЕНО');
            title.style.color = victory ? "#38bdf8" : "#f43f5e";
        }

        const resTrackTitle = document.getElementById('res-track-title');
        if (resTrackTitle && currentSong) {
            resTrackTitle.textContent = `${currentSong.artist} — ${currentSong.title}`;
        }

        const finalScoreEl = document.getElementById('final-score');
        if (finalScoreEl) finalScoreEl.innerText = Math.round(State.score).toLocaleString();

        const resAccEl = document.getElementById('res-stat-accuracy');
        if (resAccEl) resAccEl.innerText = `${accuracy.toFixed(1)}%`;

        const resComboEl = document.getElementById('res-stat-combo');
        if (resComboEl) resComboEl.innerText = String(State.maxCombo || 0);

        const resMissesEl = document.getElementById('res-stat-misses');
        if (resMissesEl) resMissesEl.innerText = String(State.totalMisses || 0);

        let starsCount = 0;
        if (victory) {
            starsCount = total;
            // Якщо трек завершено успішно, гарантуємо, що всі зірки отримані
            for (let i = 0; i < total; i++) {
                if (!State.starStatus[i] || State.starStatus[i] === 0) {
                    State.starStatus[i] = (State.totalMisses === 0) ? 2 : 1;
                }
            }
        } else {
            // При провалі рівня результат відповідає реально досягнутим зіркам
            starsCount = 0;
            for (let i = 0; i < total; i++) {
                if (State.starStatus[i] > 0) {
                    starsCount++;
                }
            }
        }

        if (isSecret && starsCount >= 1) {
            const userId = localStorage.getItem('playerId');
            const playerName = localStorage.getItem('playerName'); 
            if (userId && playerName) {
                try {
                    const dbRef = collection(db, "secret_leaderboard");
                    const q = query(dbRef, where("userId", "==", userId));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const userDoc = querySnapshot.docs[0];
                        if (State.score > userDoc.data().score) {
                            await updateDoc(doc(db, "secret_leaderboard", userDoc.id), { score: State.score, date: new Date(), name: playerName });
                        }
                    } else {
                        await addDoc(dbRef, { userId: userId, name: playerName, score: State.score, date: new Date() });
                    }
                } catch (e) { console.error(e); }
            }
        }

        // Надійне збереження результатів гри (як у localStorage, так і в Firestore)
        if ((State.score > 0 || victory) && currentSong) {
            saveGameData(currentSong.title, State.score, starsCount, victory);
            try {
                if (typeof renderSongList === 'function') renderSongList();
            } catch (e) { console.warn(e); }
        }
        if (currentSong && !currentSong.isSecret) {
            try { await syncGlobalProgress(); } catch (e) { console.error(e); }
        }

        // Відображення бейджа складності на екрані результатів
        const finalDiffEl = document.getElementById('final-difficulty');
        if (finalDiffEl) {
            const currentDiffKey = getDifficultyKey();
            const diffLabelMap = { 
                easy: getText('diffEasy'), 
                normal: getText('diffNormal'), 
                hard: getText('diffHard'),
                hardcore: getText('modHardcore')
            };
            const diffColorMap = { 
                easy: '#4ade80', 
                normal: '#facc15', 
                hard: '#fb923c',
                hardcore: '#f43f5e'
            };
            const diffLabel = diffLabelMap[currentDiffKey] || currentDiffKey;
            const diffColor = diffColorMap[currentDiffKey] || '#38bdf8';
            finalDiffEl.innerHTML = `<span class="track-diff-badge ${currentDiffKey}" style="font-size: 0.85rem; font-weight: 700; padding: 4px 14px; border-radius: 20px; background: ${diffColor}22; color: ${diffColor}; border: 1px solid ${diffColor}55; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 0 12px ${diffColor}33;">${State.isHardcore ? icons.skull(13) : ''}${diffLabel}</span>`;
        }

        // Формування зірок та алмазів на екрані результатів
        let starsHTML = "";
        let diamondsCount = 0;
        let goldCount = 0;
        for (let i = 0; i < total; i++) {
            if (i < starsCount) {
                if (State.starStatus[i] === 2) {
                    diamondsCount++;
                    starsHTML += `<span class="result-star diamond" style="margin: 0 5px; display: inline-flex; filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.8)); transform: scale(1.08);">${icons.diamond(36)}</span>`;
                } else {
                    goldCount++;
                    starsHTML += `<span class="result-star gold" style="color: #eab308; margin: 0 5px; display: inline-flex; filter: drop-shadow(0 0 8px rgba(234, 179, 8, 0.6));">${icons.starFilled(36)}</span>`;
                }
            } else {
                starsHTML += `<span class="result-star empty" style="color: rgba(255,255,255,0.2); margin: 0 5px; display: inline-flex;">${icons.starEmpty(36)}</span>`;
            }
        }
        const finalStarsEl = document.getElementById('final-stars');
        if (finalStarsEl) finalStarsEl.innerHTML = starsHTML;

        // Відображення текстового опису здобутих зірок / алмазів
        const resStarsTextEl = document.getElementById('res-stars-text');
        if (resStarsTextEl) {
            if (diamondsCount === total) {
                resStarsTextEl.className = 'res-stars-summary diamond';
                const tpl = getText('resDiamondsEarned') || '✦ {count} / {total} Діамантів (Повне комбо!)';
                resStarsTextEl.textContent = tpl.replace('{count}', diamondsCount).replace('{total}', total);
            } else if (diamondsCount > 0 && goldCount > 0) {
                resStarsTextEl.className = 'res-stars-summary diamond';
                const tpl = getText('resMixedEarned') || '✦ {diamonds} Діам. + ★ {gold} Золотих (з {total})';
                resStarsTextEl.textContent = tpl.replace('{diamonds}', diamondsCount).replace('{gold}', goldCount).replace('{total}', total);
            } else if (diamondsCount > 0 && goldCount === 0) {
                resStarsTextEl.className = 'res-stars-summary diamond';
                const tpl = getText('resDiamondsPartial') || '✦ {count} / {total} Діамантів';
                resStarsTextEl.textContent = tpl.replace('{count}', diamondsCount).replace('{total}', total);
            } else if (goldCount > 0) {
                resStarsTextEl.className = 'res-stars-summary';
                const tpl = getText('resStarsEarned') || '★ {count} / {total} Золотих зірок';
                resStarsTextEl.textContent = tpl.replace('{count}', goldCount).replace('{total}', total);
            } else {
                resStarsTextEl.className = 'res-stars-summary';
                const tpl = getText('resStarsNone') || '0 / {total} зірок';
                resStarsTextEl.textContent = tpl.replace('{total}', total).replace('{count}', 0);
            }
        }

        // Перевірка та нарахування розблокованих косметичних предметів (рамок та титулів)
        try {
            let totalStarsInGame = 0;
            songsDB.forEach(s => {
                if (!s || !s.title || s.isSecret) return;
                const d = getSavedData(s.title);
                if (d && d.stars > 0) totalStarsInGame += d.stars;
            });

            Cosmetics.checkCosmeticsUnlocks({
                playedSong: true,
                victory: Boolean(victory),
                score: State.score,
                maxCombo: State.maxCombo,
                perfectHits: State.perfectHits || 0,
                totalHits: State.totalHits || 0,
                totalMisses: State.totalMisses || 0,
                accuracy: accuracy,
                isHardcore: Boolean(State.isHardcore),
                speed: State.selectedSpeed || 1.0,
                starsEarned: starsCount,
                diamondsEarned: diamondsCount,
                isSecret: Boolean(isSecret),
                totalStarsInGame: totalStarsInGame
            }, getText, showNotification);
        } catch (err) {
            console.warn("[Cosmetics] Error checking unlocks:", err);
        }

        const botIndicator = document.getElementById('game-bot-indicator');
        if (botIndicator) botIndicator.classList.add('hidden');
        hideModBadges();

        document.getElementById('result-screen').classList.remove('hidden');
        updateGameText();
    }

    function hideModBadges() {
        document.getElementById('game-mod-speed')?.classList.add('hidden');
        document.getElementById('game-mod-hardcore')?.classList.add('hidden');
        document.getElementById('game-mod-mult')?.classList.add('hidden');
        document.getElementById('game-combo-pill')?.classList.add('hidden');
    }

    function quitGame() {
        const botIndicator = document.getElementById('game-bot-indicator');
        if (botIndicator) botIndicator.classList.add('hidden');
        hideModBadges();

        if (State.isPreviewMode) {
            State.isPreviewMode = false;
            FieldThemes.setPreviewThemeOverride(null);
            applyActiveThemeVisuals();
            if (State.previewTimerId) { clearTimeout(State.previewTimerId); State.previewTimerId = null; }
            if (State.previewIntervalId) { clearInterval(State.previewIntervalId); State.previewIntervalId = null; }
            const hudBanner = document.getElementById('theme-preview-hud');
            if (hudBanner) hudBanner.classList.add('hidden');
        }

        flushPlaytimeToCloud();
        if (bgMusicEl && !State.isMuted) bgMusicEl.play().catch(() => {});
        // Повне скидання модифікаторів при виході в меню.
        State.selectedSpeed = 1.0;
        State.isHardcore = false;
        State.scoreMultiplier = 1.0;
        resetGameState();
        document.body.classList.remove('in-game');
        if (gameContainer) gameContainer.classList.add('hidden');
        if (menuLayer) menuLayer.classList.remove('hidden');
        renderMenu();
        const searchInput = document.getElementById('song-search-input');
        if (searchInput) { searchInput.value = ''; document.getElementById('no-songs-msg')?.classList.add('hidden'); }
    }

    // ==========================================
    // Компонент модального вікна. Я створив це вікно, щоб повідомляти гравців про те, що секретний рівень заблоковано.
    // ==========================================
    function showSecretLockModal() {
        // Я обов'язково перевіряю та видаляю попередній екземпляр вікна в DOM, щоб уникнути дублювання елементів.
        const existing = document.getElementById('lock-modal');
        if (existing) existing.remove();

        // Створення фонового контейнера (оверлея) для модального вікна.
        const modal = document.createElement('div');
        modal.id = 'lock-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6); z-index: 2000;
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
            opacity: 0; transition: opacity 0.3s ease;
        `;

        // Створення самого інформаційного блоку (картки) вікна.
        const content = document.createElement('div');
        content.style.cssText = `
            background: var(--glass-bg);
            border: 1px solid var(--highlight);
            box-shadow: 0 0 30px var(--accent-glow);
            padding: 30px; border-radius: 20px;
            text-align: center; max-width: 320px; width: 90%;
            color: var(--text-color);
            transform: scale(0.8); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        `;

        // Наповнення вікна текстом на основі поточного вибраного перекладу.
        content.innerHTML = `
            <div style="margin-bottom: 15px; display: flex; justify-content: center; color: var(--highlight);">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h3 style="margin: 0 0 10px 0; color: var(--highlight); text-transform: uppercase;">Oops!</h3>
            <p style="font-size: 1rem; margin-bottom: 25px; line-height: 1.4; opacity: 0.9;">
                ${getText('secretLockMsg')}
            </p>
            <button id="lock-close-btn" style="
                background: var(--highlight); color: #000; border: none;
                padding: 12px 30px; border-radius: 50px; font-weight: bold; font-size: 1rem;
                cursor: pointer; font-family: inherit; box-shadow: 0 0 15px var(--accent-glow);
                transition: transform 0.2s;
            ">${getText('close')}</button>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Запуск CSS-анімації появи вікна через requestAnimationFrame.
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            content.style.transform = 'scale(1)';
        });

        // Функція плавного закриття модального вікна із затримкою на виконання CSS-анімації зникнення.
        const close = () => {
            modal.style.opacity = '0';
            content.style.transform = 'scale(0.8)';
            setTimeout(() => modal.remove(), 300);
        };

        const btn = content.querySelector('#lock-close-btn');
        btn.onclick = (e) => {
            playClick(); 
            e.stopPropagation();
            close();
        };
        
        // Додавання обробника подій, який дозволяє гравцю закрити вікно, просто клікнувши у будь-якому місці поза межами картки.
        modal.onclick = (e) => {
            if (e.target === modal) close();
        };
    }

    // Логіка відмальовування головного меню та масштабованого вибору треків.
    let currentSongFilter = 'all';
    let currentSongSort = 'default';
    let isCatalogControlsInitialized = false;

    renderMenu = function() {
        const list = document.getElementById('song-list');
        if (!list) return;
        list.innerHTML = '';

        // Ініціалізація тулбару, фільтр-чіпів та селектора сортування (одноразово)
        if (!isCatalogControlsInitialized) {
            isCatalogControlsInitialized = true;
            
            const lbBtn = document.getElementById('btn-open-leaderboard');
            if (lbBtn) {
                lbBtn.onclick = () => { playClick(); showLeaderboard(); };
                const lbIcon = lbBtn.querySelector('.btn-lb-icon');
                if (lbIcon) lbIcon.innerHTML = icons.trophy(18);
            }

            document.querySelectorAll('.filter-chip').forEach(chip => {
                chip.onclick = () => {
                    playClick();
                    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                    currentSongFilter = chip.dataset.filter || 'all';
                    renderMenu();
                };
                const f = chip.dataset.filter;
                const iconContainer = chip.querySelector(`span[class^="filter-icon-"]`);
                if (iconContainer) {
                    if (f === 'all') iconContainer.innerHTML = icons.music(14);
                    else if (f === 'completed') iconContainer.innerHTML = icons.check(14);
                    else if (f === 'unplayed') iconContainer.innerHTML = icons.play(12);
                    else if (f === 'hardcore') iconContainer.innerHTML = icons.skull(13);
                    else if (f === 'secret') iconContainer.innerHTML = icons.lock(13);
                }
            });

            const sortSelect = document.getElementById('catalog-sort-select');
            if (sortSelect) {
                sortSelect.onchange = () => {
                    playClick();
                    currentSongSort = sortSelect.value;
                    renderMenu();
                };
            }

            const searchInput = document.getElementById('song-search-input');
            if (searchInput) {
                searchInput.onclick = (e) => e.stopPropagation();
                searchInput.oninput = () => {
                    renderMenu();
                };
            }
        }

        // Перевірка секретних рівнів та підрахунок статистики каталогу (пройденими вважаються треки з >= 3 зірками)
        let total3StarSongs = 0;
        let totalCompleted = 0;
        songsDB.forEach(s => {
            if (!s) return;
            const d = getSavedData(s.title);
            const stars = (d && typeof d.stars === 'number') ? d.stars : 0;
            if (stars >= 3) {
                totalCompleted++;
                if (!s.isSecret) total3StarSongs++;
            }
        });
        const isSecretUnlocked = total3StarSongs >= 5;

        // Оновлення лічильників прогресу в тулбарі
        const tracksCountEl = document.getElementById('catalog-tracks-count');
        if (tracksCountEl) {
            const rawCount = getText('tracksCountLabel', 'Треків: {count}');
            const tpl = (rawCount && rawCount.includes('{count}')) ? rawCount : 'Треків: {count}';
            tracksCountEl.textContent = tpl.replace('{count}', songsDB.length);
        }
        const passedCountEl = document.getElementById('catalog-passed-count');
        if (passedCountEl) {
            const rawPassed = getText('tracksCompletedCount', 'Пройдено: {completed} з {total}');
            const tpl = (rawPassed && rawPassed.includes('{completed}')) ? rawPassed : 'Пройдено: {completed} з {total}';
            passedCountEl.textContent = tpl.replace('{completed}', totalCompleted).replace('{total}', songsDB.length);
        }

        const musicStatsIcon = document.querySelector('.stats-icon-music');
        if (musicStatsIcon) musicStatsIcon.innerHTML = icons.music(14);
        const trophyStatsIcon = document.querySelector('.stats-icon-trophy');
        if (trophyStatsIcon) trophyStatsIcon.innerHTML = icons.trophy(14);

        if (songsDB.length === 0) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'empty-cloud-tracks';
            emptyEl.style.cssText = 'text-align: center; padding: 45px 15px; grid-column: 1 / -1; color: var(--text-secondary);';
            emptyEl.innerHTML = `
                <div style="margin-bottom: 16px; color: var(--highlight); display: flex; justify-content: center;">${icons.music(48)}</div>
                <h3 style="color: var(--text-primary); margin-bottom: 8px;">Фонотека поки порожня</h3>
                <p style="font-size: 0.95rem; opacity: 0.85;">Увійдіть в акаунт та відкрийте Панель адміністратора для завантаження аудіотреків!</p>
            `;
            list.appendChild(emptyEl);
            updateGameText();
            return;
        }

        // Отримання пошукового запиту
        const searchInput = document.getElementById('song-search-input');
        const queryStr = searchInput ? searchInput.value.trim().toLowerCase() : '';

        // Підготовка списку пісень для фільтрації та сортування
        let displayedSongs = songsDB.map((s, originalIndex) => {
            const saved = getSavedData(s.title);
            return { song: s, originalIndex, saved };
        });

        // 1. Фільтрація за пошуковим словом
        if (queryStr) {
            displayedSongs = displayedSongs.filter(item => {
                const title = (item.song.title || '').toLowerCase();
                const artist = (item.song.artist || '').toLowerCase();
                return title.includes(queryStr) || artist.includes(queryStr);
            });
        }

        // 2. Фільтрація за активним чіпом категорії
        if (currentSongFilter === 'completed') {
            // Пройдені: рівні, де зароблено 3 або більше зірок
            displayedSongs = displayedSongs.filter(item => (item.saved.stars || 0) >= 3);
        } else if (currentSongFilter === 'unplayed') {
            // Не пройдені: рівні, де менше 3 зірок (< 3)
            displayedSongs = displayedSongs.filter(item => (item.saved.stars || 0) < 3);
        } else if (currentSongFilter === 'hardcore') {
            displayedSongs = displayedSongs.filter(item => {
                const s = item.saved;
                return s.isHardcore || s.difficulty === 'hardcore' || (Array.isArray(s.completedDifficulties) && s.completedDifficulties.includes('hardcore'));
            });
        } else if (currentSongFilter === 'secret') {
            displayedSongs = displayedSongs.filter(item => item.song.isSecret);
        }

        // 3. Сортування списку
        if (currentSongSort === 'score') {
            // Сортування за рекордом: враховує зірки, діаманти та рахунок
            displayedSongs.sort((a, b) => {
                const sA = a.saved || {};
                const sB = b.saved || {};

                const starsA = sA.stars || 0;
                const starsB = sB.stars || 0;

                const typesA = Array.isArray(sA.starTypes) ? sA.starTypes : [];
                const typesB = Array.isArray(sB.starTypes) ? sB.starTypes : [];

                const diamondsA = typesA.slice(0, starsA).filter(t => t === 2).length;
                const diamondsB = typesB.slice(0, starsB).filter(t => t === 2).length;

                const scoreA = sA.score || 0;
                const scoreB = sB.score || 0;

                // 1. Кількість зірок: рівні з більшою кількістю зірок вище (3 зірки > 2 зірки > 1 зірка > 0)
                if (starsA !== starsB) {
                    return starsB - starsA;
                }

                // 2. Діамантові зірки: при рівній кількості зірок діаманти (0 промахів / Full Combo) дають пріоритет
                if (diamondsA !== diamondsB) {
                    return diamondsB - diamondsA;
                }

                // 3. Рекордний рахунок (score): при однакових зірках та діамантах порівнюємо числовий результат
                return scoreB - scoreA;
            });
        } else if (currentSongSort === 'title') {
            displayedSongs.sort((a, b) => (a.song.title || '').localeCompare(b.song.title || ''));
        } else if (currentSongSort === 'durationAsc') {
            const parseDuration = (d) => {
                if (typeof d === 'number') return d;
                const parts = String(d || '0:0').split(':');
                return parts.length === 2 ? parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10) : parseFloat(d) || 0;
            };
            displayedSongs.sort((a, b) => parseDuration(a.song.duration) - parseDuration(b.song.duration));
        } else if (currentSongSort === 'durationDesc' || currentSongSort === 'duration') {
            const parseDuration = (d) => {
                if (typeof d === 'number') return d;
                const parts = String(d || '0:0').split(':');
                return parts.length === 2 ? parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10) : parseFloat(d) || 0;
            };
            displayedSongs.sort((a, b) => parseDuration(b.song.duration) - parseDuration(a.song.duration));
        }

        const noSongsMsg = document.getElementById('no-songs-msg');
        if (displayedSongs.length === 0) {
            if (noSongsMsg) noSongsMsg.classList.remove('hidden');
        } else {
            if (noSongsMsg) noSongsMsg.classList.add('hidden');
        }

        // Відмальовування карток у сітці
        displayedSongs.forEach(({ song: s, originalIndex: i, saved }) => {
            const maxStars = s.isSecret ? 5 : 3;
            const types = saved.starTypes || [];
            let starsStr = '';

            for (let j = 0; j < maxStars; j++) {
                const type = types[j] || 0;
                const isEarned = j < saved.stars;
                if (isEarned) {
                    if (type === 2) {
                        starsStr += `<span class="star-diamond" style="display:inline-flex; vertical-align:middle; margin:0 0.5px;">${icons.diamond(12)}</span>`;
                    } else {
                        starsStr += `<span style="color:#eab308; display:inline-flex; vertical-align:middle; margin:0 0.5px;">${icons.starFilled(12)}</span>`;
                    }
                } else {
                    starsStr += `<span style="color:rgba(255,255,255,0.25); display:inline-flex; vertical-align:middle; margin:0 0.5px;">${icons.starEmpty(12)}</span>`;
                }
            }

            const el = document.createElement('div');
            el.className = 'song-card';

            const isLocked = s.isSecret && !isSecretUnlocked;
            if (isLocked) {
                el.classList.add('song-locked');
            } else if (s.isSecret) {
                el.classList.add('secret-song-card');
            }

            el.onclick = () => {
                playClick();
                if (isLocked) { showSecretLockModal(); return; }
                showLaunchModal(i, s);
            };
            el.onmouseenter = playHover;

            const isLocal = s.isLocal || (s.audioUrl && s.audioUrl.startsWith('indexeddb://'));
            const localBadgeHtml = isLocal
                ? `<span style="font-size: 0.7rem; padding: 2px 7px; border-radius: 6px; background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56,189,248,0.25); margin-left: 6px; display:inline-flex; align-items:center; gap:3px;">${icons.hardDrive(11)} ${getText('localBadgeTrack') || 'Офлайн'}</span>`
                : '';

            // Мітка складності рекорду
            let diffKey = saved.difficulty || '';
            const isSavedHardcore = diffKey === 'hardcore' || Boolean(saved.isHardcore);
            if (!diffKey && Array.isArray(saved.completedDifficulties) && saved.completedDifficulties.length > 0) {
                let maxR = 0;
                saved.completedDifficulties.forEach(d => {
                    const r = getDiffRank(d);
                    if (r > maxR) { maxR = r; diffKey = d; }
                });
            }
            const diffLabelMap = {
                easy: getText('diffEasy'),
                normal: getText('diffNormal'),
                hard: getText('diffHard'),
                hardcore: getText('modHardcore')
            };
            const diffColorMap = {
                easy: '#4ade80',
                normal: '#facc15',
                hard: '#fb923c',
                hardcore: '#f43f5e'
            };
            const effectiveDiff = isSavedHardcore ? 'hardcore' : diffKey;
            const diffBadgeHtml = (effectiveDiff && saved.score > 0)
                ? `<span class="track-diff-badge ${effectiveDiff}" style="font-size:0.68rem; padding:2px 7px; border-radius:4px; background:${diffColorMap[effectiveDiff] || '#888'}22; color:${diffColorMap[effectiveDiff] || '#888'}; border:1px solid ${diffColorMap[effectiveDiff] || '#888'}44; display:inline-flex; align-items:center; gap:3px;">${effectiveDiff === 'hardcore' ? icons.skull(11) : ''}${diffLabelMap[effectiveDiff] || effectiveDiff}</span>`
                : '';

            const bestStatHtml = saved.score > 0
                ? `<div class="track-best-stat">
                     <div class="stat-main-row">
                       <span class="track-record-label">${getText('bestScore')}: <b>${saved.score.toLocaleString()}</b></span>
                       <span class="track-stars-visual">${starsStr}</span>
                     </div>
                     ${diffBadgeHtml ? `<div class="stat-badge-row">${diffBadgeHtml}</div>` : ''}
                   </div>`
                : `<div class="track-best-stat not-played">
                     <div class="stat-main-row">
                       <span class="track-record-label">${getText('notPlayedYet')}</span>
                       <span class="track-stars-visual">${starsStr}</span>
                     </div>
                   </div>`;

            const isLightMode = document.body.getAttribute('data-theme') === 'light';
            const darkGradients = [
                { bg: 'linear-gradient(145deg, #0ea5e9 0%, #0369a1 45%, #082f49 100%)', mixColor: '#38bdf8' },
                { bg: 'linear-gradient(145deg, #eab308 0%, #ca8a04 45%, #422006 100%)', mixColor: '#facc15' },
                { bg: 'linear-gradient(145deg, #f97316 0%, #c2410c 45%, #431407 100%)', mixColor: '#fb923c' },
                { bg: 'linear-gradient(145deg, #ec4899 0%, #be185d 45%, #500724 100%)', mixColor: '#f472b6' },
                { bg: 'linear-gradient(145deg, #84cc16 0%, #4d7c0f 45%, #14532d 100%)', mixColor: '#a3e635' },
                { bg: 'linear-gradient(145deg, #6366f1 0%, #4338ca 45%, #1e1b4b 100%)', mixColor: '#818cf8' },
                { bg: 'linear-gradient(145deg, #14b8a6 0%, #0f766e 45%, #134e4a 100%)', mixColor: '#2dd4bf' },
                { bg: 'linear-gradient(145deg, #a855f7 0%, #7e22ce 45%, #3b0764 100%)', mixColor: '#c084fc' }
            ];
            const lightGradients = [
                { bg: 'linear-gradient(145deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)', mixColor: '#0284c7' },
                { bg: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)', mixColor: '#d97706' },
                { bg: 'linear-gradient(145deg, #ffedd5 0%, #fed7aa 50%, #fdba74 100%)', mixColor: '#ea580c' },
                { bg: 'linear-gradient(145deg, #fce7f3 0%, #fbcfe8 50%, #f472b6 100%)', mixColor: '#db2777' },
                { bg: 'linear-gradient(145deg, #ecfccb 0%, #d9f99d 50%, #bef264 100%)', mixColor: '#65a30d' },
                { bg: 'linear-gradient(145deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)', mixColor: '#4f46e5' },
                { bg: 'linear-gradient(145deg, #ccfbf1 0%, #99f6e4 50%, #5eead4 100%)', mixColor: '#0d9488' },
                { bg: 'linear-gradient(145deg, #f3e8ff 0%, #e9d5ff 50%, #d8b4fe 100%)', mixColor: '#9333ea' }
            ];
            const activeGradList = isLightMode ? lightGradients : darkGradients;
            const gradTheme = activeGradList[i % activeGradList.length];

            el.innerHTML = `
                <div class="spotify-cover-wrap" style="background: ${s.coverUrl ? `url('${s.coverUrl}') center/cover no-repeat` : gradTheme.bg};">
                    <div class="spotify-cover-top">
                        <span class="spotify-cover-badge">${icons.music(13)}</span>
                        ${isLocked ? `<span class="spotify-lock-pill">${icons.lock(11)} Locked</span>` : ''}
                    </div>
                    <div class="spotify-cover-art">
                        <div class="spotify-vinyl-disc ${isLocked ? 'locked' : ''}">
                            ${isLocked ? icons.lock(28) : icons.disc(36)}
                        </div>
                    </div>
                    <button type="button" class="spotify-play-btn" aria-label="Play">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="#000000"><polygon points="7 4 20 12 7 20 7 4"/></svg>
                    </button>
                </div>
                <div class="spotify-card-info">
                    <div class="spotify-track-title" title="${escapeHtml(s.title)}">
                        ${escapeHtml(s.title)} ${localBadgeHtml}
                    </div>
                    <div class="spotify-track-artist">
                        ${escapeHtml(s.artist)} • ${s.duration}
                    </div>
                    <div class="spotify-track-footer">
                        ${bestStatHtml}
                    </div>
                </div>
            `;
            list.appendChild(el);
        });

        updateGameText();
    };

    // Модальне вікно налаштування та запуску треку з модифікаторами складності.
    function showLaunchModal(idx, song) {
        const existing = document.getElementById('track-launch-modal');
        if (existing) existing.remove();

        let chosenSpeed = 1.0;
        let chosenHardcore = false;

        const modal = document.createElement('div');
        modal.id = 'track-launch-modal';
        modal.className = 'launch-modal-backdrop';

        function calcMult() {
            return computeScoreMultiplier(chosenSpeed, chosenHardcore);
        }

        function getDiffText(speed, hardcore) {
            if (hardcore) return getText('modHardcore');
            if (speed >= 1.35) return getText('diffHard');
            if (speed >= 1.15) return getText('diffNormal');
            return getText('diffEasy');
        }

        function getDiffColor(speed, hardcore) {
            if (hardcore) return '#f43f5e';
            if (speed >= 1.35) return '#fb923c';
            if (speed >= 1.15) return '#facc15';
            return '#4ade80';
        }

        function renderContent() {
            const mult = calcMult();
            const bonusPercent = Math.round((mult - 1.0) * 100);
            const diffText = getDiffText(chosenSpeed, chosenHardcore);
            const diffColor = getDiffColor(chosenSpeed, chosenHardcore);

            modal.innerHTML = `
                <div class="launch-modal-card">
                    <div class="launch-modal-header">
                        <div class="launch-track-icon">${icons.music(26)}</div>
                        <div class="launch-track-details">
                            <h3 class="launch-track-title">${escapeHtml(song.title || 'Track')}</h3>
                            <p class="launch-track-artist">${escapeHtml(song.artist || 'Artist')} • <span class="launch-track-dur">${song.duration || ''}</span></p>
                        </div>
                    </div>

                    <div class="launch-section">
                        <label class="launch-section-label">
                            <span class="launch-label-icon">${icons.zap(15)}</span>
                            <span>${getText('modSpeed')}</span>
                        </label>
                        <div class="launch-speed-pills">
                            <button type="button" class="launch-speed-btn ${chosenSpeed === 1.0 ? 'active' : ''}" data-speed="1.0">
                                <span class="speed-val">1.0x</span>
                                <span class="speed-sub">${getText('diffEasy')}</span>
                            </button>
                            <button type="button" class="launch-speed-btn ${chosenSpeed === 1.2 ? 'active' : ''}" data-speed="1.2">
                                <span class="speed-val">1.2x</span>
                                <span class="speed-sub">${getText('diffNormal')} (+30%)</span>
                            </button>
                            <button type="button" class="launch-speed-btn ${chosenSpeed === 1.4 ? 'active' : ''}" data-speed="1.4">
                                <span class="speed-val">1.4x</span>
                                <span class="speed-sub">${getText('diffHard')} (+60%)</span>
                            </button>
                        </div>
                    </div>

                    <div class="launch-section">
                        <div class="launch-hardcore-row ${chosenHardcore ? 'active' : ''}" id="launch-hardcore-toggle">
                            <div class="launch-hardcore-info">
                                <div class="launch-hardcore-title">
                                    <span class="launch-hardcore-icon">${icons.skull(16)}</span>
                                    <span>${getText('modHardcore')}</span>
                                    <span class="launch-hardcore-badge">+50%</span>
                                </div>
                                <div class="launch-hardcore-desc">${getText('modHardcoreDesc')}</div>
                            </div>
                            <div class="launch-switch ${chosenHardcore ? 'checked' : ''}">
                                <div class="launch-switch-thumb"></div>
                            </div>
                        </div>
                    </div>

                    <div class="launch-summary-box">
                        <div class="launch-summary-item">
                            <span class="launch-sum-label">${getText('modBonusLabel')}:</span>
                            <span class="launch-sum-bonus" style="color: ${bonusPercent > 0 ? '#38bdf8' : '#8892b0'};">
                                ${icons.flame(15)} ${bonusPercent > 0 ? '+' + bonusPercent + '%' : '0%'} (x${mult.toFixed(1)})
                            </span>
                        </div>
                        <div class="launch-summary-item">
                            <span class="launch-sum-label">${getText('modMode') || 'Режим'}:</span>
                            <span class="launch-sum-diff" style="color: ${diffColor}; font-weight: 700;">
                                ${diffText}
                            </span>
                        </div>
                    </div>

                    <div class="launch-modal-actions">
                        <button type="button" class="launch-btn-cancel" id="launch-btn-cancel">${getText('modCancel') || 'Скасувати'}</button>
                        <button type="button" class="launch-btn-start" id="launch-btn-start">
                            ${icons.play(18)} <span>${getText('modStart') || 'СТАРТ'}</span>
                        </button>
                    </div>
                </div>
            `;

            // Обробники кліків
            modal.querySelectorAll('.launch-speed-btn').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    chosenSpeed = parseFloat(btn.dataset.speed);
                    playClick();
                    renderContent();
                };
            });

            const hcToggle = modal.querySelector('#launch-hardcore-toggle');
            if (hcToggle) {
                hcToggle.onclick = (e) => {
                    e.stopPropagation();
                    chosenHardcore = !chosenHardcore;
                    playClick();
                    renderContent();
                };
            }

            const cancelBtn = modal.querySelector('#launch-btn-cancel');
            if (cancelBtn) {
                cancelBtn.onclick = (e) => {
                    e.stopPropagation();
                    playClick();
                    modal.classList.add('closing');
                    setTimeout(() => modal.remove(), 180);
                };
            }

            const startBtn = modal.querySelector('#launch-btn-start');
            if (startBtn) {
                startBtn.onclick = (e) => {
                    e.stopPropagation();
                    playClick();
                    State.selectedSpeed = chosenSpeed;
                    State.isHardcore = chosenHardcore;
                    State.scoreMultiplier = calcMult();
                    modal.classList.add('closing');
                    setTimeout(() => modal.remove(), 180);
                    startGame(idx);
                };
            }
        }

        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.add('closing');
                setTimeout(() => modal.remove(), 180);
            }
        };

        renderContent();
        document.body.appendChild(modal);
    }

    function showNotification(text) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = 'position: fixed; bottom: 25px; right: 25px; z-index: 99999; display: flex; flex-direction: column; gap: 10px; pointer-events: none;';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.style.cssText = 'background: rgba(15, 23, 42, 0.95); border: 1px solid var(--highlight, #00d2ff); color: #fff; padding: 12px 20px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); font-size: 0.9rem; transition: opacity 0.3s ease;';
        toast.innerText = text;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 350);
        }, 3000);
    }

    async function changePlayerName() {
        const userId = localStorage.getItem('playerId');
        if (!userId) return;
        const newName = await getNameFromUser(true);
        if (!newName) return;

        try {
            const dbRef = collection(db, "secret_leaderboard");
            const q = query(dbRef, where("userId", "==", userId));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                await updateDoc(doc(db, "secret_leaderboard", querySnapshot.docs[0].id), { name: newName });
            }
            localStorage.setItem('playerName', newName);
            showNotification(getText('nameUpdated'));
            renderMenu();
        } catch (e) { console.error(e); alert("Error updating database."); }
    }

    function getNameFromUser(isChangeMode = false) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'name-input-modal';
            modal.innerHTML = `
                <div class="name-input-content">
                    <h2 style="margin-bottom: 10px;">${isChangeMode ? getText('enterNewName') : getText('enterName')}</h2>
                    <input type="text" id="player-name-input" class="name-input-field" placeholder="${getText('namePls')}" maxlength="15" autocomplete="off">
                    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
                        <button id="save-name-btn" class="name-submit-btn">${getText('btnOk')}</button>
                        ${isChangeMode ? `<button id="cancel-name-btn" class="name-submit-btn cancel-btn">${getText('btnCancel')}</button>` : ''}
                    </div>
                    <div id="name-error" class="input-error-msg"></div>
                </div>`;
            document.body.appendChild(modal);

            const input = modal.querySelector('#player-name-input');
            const btn = modal.querySelector('#save-name-btn');
            const errorMsg = modal.querySelector('#name-error');

            modal.querySelector('#cancel-name-btn')?.addEventListener('click', () => { modal.remove(); resolve(null); });

            async function submit() {
                const name = input.value.trim();
                if (!name) return;
                if (isChangeMode && name === localStorage.getItem('playerName')) { modal.remove(); resolve(null); return; }

                btn.innerText = getText('checking');
                btn.disabled = true;
                errorMsg.style.display = 'none';

                try {
                    const q = query(collection(db, "secret_leaderboard"), where("name", "==", name));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        errorMsg.innerText = getText('nameTaken');
                        errorMsg.style.display = 'block';
                        btn.innerText = "OK";
                        btn.disabled = false;
                    } else {
                        if (!isChangeMode) localStorage.setItem('playerName', name);
                        modal.style.opacity = '0';
                        setTimeout(() => { modal.remove(); resolve(name); }, 300);
                    }
                } catch (e) {
                    errorMsg.innerText = "Network Error"; errorMsg.style.display = 'block'; btn.disabled = false;
                }
            }
            btn.onclick = submit;
            input.onkeypress = (e) => { if (e.key === 'Enter') submit(); errorMsg.style.display = 'none'; };
            setTimeout(() => input.focus(), 100);
        });
    }

    // Логіка роботи модального вікна таблиці лідерів із фіксованим розміром та анімаціями перемикання.

    // Логіка роботи модального вікна таблиці лідерів із розширеним списком гравців.
    async function showLeaderboard() {
        // Очищення DOM від старого вікна перед створенням нового.
        const existing = document.getElementById('lb-modal-overlay') || document.getElementById('lb-modal');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'lb-modal-overlay';
        overlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.id = 'lb-modal';
        modal.className = 'leaderboard-modal';
        
        // Генерація каркасу вікна таблиці лідерів з кнопками вибору ліміту та подіумом Топ-3
        modal.innerHTML = `
            <div class="lb-header-row">
                <div class="lb-title" style="display:flex;align-items:center;gap:8px;">${icons.trophy(20)} <span>${getText('leaderboard')}</span></div>
                <button class="lb-close-btn" aria-label="Close">${icons.close(16)}</button>
            </div>

            <div class="lb-limit-bar" style="display: flex; align-items: center; gap: 6px; margin: 10px 0 6px 0;">
                <span style="font-size: 0.8rem; color: var(--text-secondary); margin-right: 2px;">${getText('lbLimitLabel') || 'Ліміт:'}</span>
                <button type="button" class="lb-limit-btn ${currentLeaderboardLimit === 25 ? 'active' : ''}" data-limit="25">${getText('lbLimitTop25') || 'Топ 25'}</button>
                <button type="button" class="lb-limit-btn ${currentLeaderboardLimit === 50 ? 'active' : ''}" data-limit="50">${getText('lbLimitTop50') || 'Топ 50'}</button>
                <button type="button" class="lb-limit-btn ${currentLeaderboardLimit === 100 ? 'active' : ''}" data-limit="100">${getText('lbLimitTop100') || 'Топ 100'}</button>
                <button type="button" class="lb-limit-btn ${currentLeaderboardLimit === 'all' ? 'active' : ''}" data-limit="all">${getText('lbLimitAll') || 'Всі'}</button>
            </div>

            <!-- Top 3 Podium -->
            <div id="lb-podium" class="lb-podium-container"></div>
            
            <div class="lb-content-wrapper" style="margin-top: 6px;">
                <div class="lb-scroll-area" id="lb-scroll-area" style="max-height: 440px; overflow-y: auto;">
                    <table class="lb-table">
                        <thead id="lb-header"></thead>
                        <tbody id="lb-body"></tbody>
                    </table>
                </div>
            </div>`;
            
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const closeLb = () => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 250);
        };

        // Призначення обробників подій для закриття вікна
        modal.querySelector('.lb-close-btn').onclick = closeLb;
        overlay.addEventListener('mousedown', (e) => {
            if (e.target === overlay) closeLb();
        });

        modal.querySelectorAll('.lb-limit-btn').forEach(btn => {
            btn.onclick = () => {
                playClick();
                modal.querySelectorAll('.lb-limit-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const rawLimit = btn.dataset.limit;
                currentLeaderboardLimit = rawLimit === 'all' ? 'all' : parseInt(rawLimit, 10);
                loadLeaderboardData('global', modal, currentLeaderboardLimit);
            };
        });

        // Автоматичне завантаження глобального рейтингу при відкритті
        await syncGlobalProgress().catch(e => console.error(e));
        loadLeaderboardData('global', modal, currentLeaderboardLimit);
    }

    async function loadLeaderboardData(type = 'global', modalRef, limitCount = currentLeaderboardLimit) {
        if (!modalRef) modalRef = document.getElementById('lb-modal');
        if (!modalRef) return;
        const thead = modalRef.querySelector('#lb-header');
        const tbody = modalRef.querySelector('#lb-body');
        const podiumEl = modalRef.querySelector('#lb-podium');
        if (!thead || !tbody) return;
        
        tbody.innerHTML = ''; 
        if (podiumEl) podiumEl.innerHTML = '';

        thead.innerHTML = `<tr>
            <th width="15%">#</th>
            <th width="45%">${getText('lbName')}</th>
            <th width="20%">${getText('lbLevels')}</th>
            <th width="20%">${getText('lbTotalScore')}</th>
        </tr>`;

        // Відображення індикатора завантаження під час очікування відповіді від Firebase.
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 40px;">${getText('lbLoading')}</td></tr>`;

        try {
            let q;
            if (limitCount === 'all' || !limitCount || limitCount <= 0) {
                q = query(collection(db, "global_leaderboard"), orderBy("totalScore", "desc"));
            } else {
                q = query(collection(db, "global_leaderboard"), orderBy("totalScore", "desc"), limit(Number(limitCount) || 100));
            }
            const snap = await getDocs(q);
            
            tbody.innerHTML = ''; // Видалення індикатора завантаження після отримання даних.

            const allPlayers = [];
            snap.forEach(docSnap => {
                allPlayers.push({ id: docSnap.id, ...docSnap.data() });
            });

            if (allPlayers.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 40px; opacity:0.6;">${getText('lbNoRecords')}</td></tr>`;
                return;
            }

            // Відмальовування Топ-3 гравців на подіумі (Порядок: 2-е місце зліва, 1-е по центру, 3-є справа)
            if (podiumEl && allPlayers.length > 0) {
                const p1 = allPlayers[0];
                const p2 = allPlayers.length > 1 ? allPlayers[1] : null;
                const p3 = allPlayers.length > 2 ? allPlayers[2] : null;

                const getPodiumTitleHtml = (player) => {
                    if (!player) return '';
                    const titleId = player.selectedTitle || 'title_novice';
                    const tDef = Cosmetics.TITLES.find(item => item.id === titleId);
                    const titleText = tDef ? (getText(tDef.nameKey) || tDef.id) : (getText('titleNovice') || 'Новачок біту');
                    return `<div class="podium-title-wrap"><span class="podium-title-badge">${escapeHtml(titleText)}</span></div>`;
                };

                let podiumHtml = '';

                // 2 місце (Срібло)
                if (p2) {
                    const p2AvatarHtml = Cosmetics.getAvatarContent(p2.name, p2.avatarUrl);
                    const p2FrameClass = Cosmetics.getFrameCssClass(p2.selectedFrame);
                    podiumHtml += `
                        <div class="podium-card podium-rank-2" data-podium-idx="1" title="${getText('clickToViewProfile')}">
                            <div class="podium-crown-icon" style="color: #cbd5e1;">${icons.medal(20)}</div>
                            <div class="podium-avatar ${p2FrameClass}">${p2AvatarHtml}</div>
                            <div class="podium-name">${escapeHtml(p2.name || 'Unknown')}</div>
                            ${getPodiumTitleHtml(p2)}
                            <div class="podium-score">${(p2.totalScore || 0).toLocaleString()}</div>
                            <div class="podium-levels">${p2.levelsCompleted || 0} ${getText('lbLevels') || 'рівнів'}</div>
                        </div>
                    `;
                }

                // 1 місце (Золото)
                if (p1) {
                    const p1AvatarHtml = Cosmetics.getAvatarContent(p1.name, p1.avatarUrl);
                    const p1FrameClass = Cosmetics.getFrameCssClass(p1.selectedFrame);
                    podiumHtml += `
                        <div class="podium-card podium-rank-1" data-podium-idx="0" title="${getText('clickToViewProfile')}">
                            <div class="podium-crown-icon" style="color: #fbbf24;">${icons.crown(24)}</div>
                            <div class="podium-avatar ${p1FrameClass}">${p1AvatarHtml}</div>
                            <div class="podium-name">${escapeHtml(p1.name || 'Unknown')}</div>
                            ${getPodiumTitleHtml(p1)}
                            <div class="podium-score">${(p1.totalScore || 0).toLocaleString()}</div>
                            <div class="podium-levels">${p1.levelsCompleted || 0} ${getText('lbLevels') || 'рівнів'}</div>
                        </div>
                    `;
                }

                // 3 місце (Бронза)
                if (p3) {
                    const p3AvatarHtml = Cosmetics.getAvatarContent(p3.name, p3.avatarUrl);
                    const p3FrameClass = Cosmetics.getFrameCssClass(p3.selectedFrame);
                    podiumHtml += `
                        <div class="podium-card podium-rank-3" data-podium-idx="2" title="${getText('clickToViewProfile')}">
                            <div class="podium-crown-icon" style="color: #d97706;">${icons.medal(20)}</div>
                            <div class="podium-avatar ${p3FrameClass}">${p3AvatarHtml}</div>
                            <div class="podium-name">${escapeHtml(p3.name || 'Unknown')}</div>
                            ${getPodiumTitleHtml(p3)}
                            <div class="podium-score">${(p3.totalScore || 0).toLocaleString()}</div>
                            <div class="podium-levels">${p3.levelsCompleted || 0} ${getText('lbLevels') || 'рівнів'}</div>
                        </div>
                    `;
                }

                podiumEl.innerHTML = podiumHtml;

                podiumEl.querySelectorAll('.podium-card').forEach(card => {
                    card.onclick = () => {
                        const idx = parseInt(card.dataset.podiumIdx, 10);
                        if (allPlayers[idx]) openPlayerProfileModal(allPlayers[idx], idx + 1);
                    };
                });
            }

            // Відмальовування рядків таблиці починаючи з 4-го місця (оскільки Топ-3 вже представлено на подіумі)
            const remainingPlayers = allPlayers.slice(3);
            if (remainingPlayers.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 24px; opacity:0.6; font-size:0.85rem;">${getText('lbNoMorePlayers') || 'Інші гравці поки відсутні'}</td></tr>`;
            } else {
                let rank = 4;
                remainingPlayers.forEach(p => {
                    const tr = document.createElement('tr');
                    tr.className = 'lb-player-row';
                    tr.title = getText('clickToViewProfile');

                    const rankDisplay = `<span style="font-weight:700; opacity:0.8;">#${rank}</span>`;
                    const pAvatarHtml = Cosmetics.getAvatarContent(p.name, p.avatarUrl);
                    const pFrameClass = Cosmetics.getFrameCssClass(p.selectedFrame);
                    let titleHtml = '';
                    if (p.selectedTitle && p.selectedTitle !== 'title_novice') {
                        const tDef = Cosmetics.TITLES.find(item => item.id === p.selectedTitle);
                        if (tDef) {
                            titleHtml = `<span class="user-title-badge" style="font-size: 0.65rem; padding: 1px 6px; margin-left: 6px;">${escapeHtml(getText(tDef.nameKey) || tDef.id)}</span>`;
                        }
                    }

                    tr.innerHTML = `
                        <td width="15%"><b>${rankDisplay}</b></td>
                        <td width="45%">
                            <div class="lb-player-cell">
                                <div class="lb-avatar-mini ${pFrameClass}">${pAvatarHtml}</div>
                                <span class="lb-player-name">${escapeHtml(p.name || 'Unknown')}${titleHtml}</span>
                            </div>
                        </td>
                        <td width="20%">${p.levelsCompleted || 0}</td>
                        <td width="20%"><span class="lb-score-val">${(p.totalScore || 0).toLocaleString()}</span></td>
                    `;

                    const currentRank = rank;
                    tr.onclick = () => {
                        openPlayerProfileModal(p, currentRank);
                    };

                    tbody.appendChild(tr);
                    rank++;
                });
            }
        } catch (e) {
            console.error(e);
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#ff4444;">${getText('lbError')}</td></tr>`;
        }
    }

    function escapeHtml(text) {
        if (text === null || text === undefined || text === '') return '';
        return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    // Ініціалізація та налаштування глобальних обробників вводу (миша, сенсор, клавіатура).
    function initControls() {
        const lanesContainer = document.getElementById('lanes-bg');
        if (lanesContainer) for (let i = 0; i < 4; i++) laneElements[i] = lanesContainer.children[i];
        const keysContainer = document.querySelector('.lane-hints');
        if (keysContainer) for (let i = 0; i < 4; i++) laneKeyElements[i] = keysContainer.children[i];

        const ignore = ['.hit-line', '.lane-hints', '#hold-effects-container', '#legendary-border-overlay'];
        ignore.forEach(sel => { const el = document.querySelector(sel); if(el) el.style.pointerEvents = 'none'; });

        const searchInput = document.getElementById('song-search-input');
        if (searchInput) {
            searchInput.onclick = (e) => e.stopPropagation();
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim().toLowerCase().replace(/[^a-zа-я0-9їієґ]/g, '');
                const cards = document.querySelectorAll('.song-card');
                let visibleCount = 0;

                const getTrigrams = (str) => {
                    const t = [];
                    for(let i=0; i<str.length-2; i++) t.push(str.slice(i, i+3));
                    return t;
                };

                cards.forEach(card => {
                    const text = card.innerText.toLowerCase().replace(/[^a-zа-я0-9їієґ]/g, '');
                    let match = false;
                    if (query.length === 0) match = true;
                    else if (query.length < 3) match = text.includes(query);
                    else {
                        const qTri = getTrigrams(query);
                        const tTri = getTrigrams(text);
                        let matches = 0;
                        qTri.forEach(tr => { if(tTri.includes(tr)) matches++; });
                        match = (matches / qTri.length) >= 0.5;
                    }
                    card.style.display = match ? 'flex' : 'none';
                    if (match) visibleCount++;
                });
                const msg = document.getElementById('no-songs-msg');
                if (msg) msg.classList.toggle('hidden', visibleCount > 0 || query === '');
            });
        }

        if (canvas) {
            // Multi-touch: відстежуємо кожен pointer (палець) окремо.
            // activePointerLanes: Map<pointerId, lane> — який палець тримає яку доріжку
            const activePointerLanes = new Map();

            // Кешуємо getBoundingClientRect() і оновлюємо тільки при справжньому pointerdown,
            // щоб не викликати layout thrash 60 разів на секунду при русі пальців.
            let gameRect = null;
            const refreshRect = () => { gameRect = canvas.getBoundingClientRect(); };

            const handlePointerDown = (e) => {
                if (e.cancelable) e.preventDefault();

                // Оновлюємо rect тільки якщо він ще не кешований або перший палець
                if (!gameRect || activePointerLanes.size === 0) refreshRect();
                if (!gameRect || !gameRect.width || !gameRect.height) return;

                const scaleX = State.gameWidth / gameRect.width;
                const scaleY = State.gameHeight / gameRect.height;
                const touchX = (e.clientX - gameRect.left) * scaleX;
                const touchY = (e.clientY - gameRect.top) * scaleY;
                if (touchX < 0 || touchX > State.gameWidth || touchY < 0 || touchY > State.gameHeight) return;

                const laneW = State.gameWidth / 4;
                const lane = Math.max(0, Math.min(3, Math.floor(touchX / laneW)));
                activePointerLanes.set(e.pointerId, lane);

                // НЕ використовуємо setPointerCapture — у Chrome для Android < 100
                // setPointerCapture на canvas блокує отримання нових pointerdown від ІНШИХ пальців.
                // Баг підтверджений: https://crbug.com/1001806
                // Замість цього використовуємо pointercancel на window для обробки drift.

                // Гарантоване розблокування Web Audio API на першому дотику
                if (State.audioCtx && State.audioCtx.state === 'suspended') {
                    State.audioCtx.resume().catch(() => {});
                }

                handleInputDown(lane, touchY, touchX);
            };

            const handlePointerUp = (e) => {
                if (e.cancelable) e.preventDefault();
                let lane = activePointerLanes.get(e.pointerId);
                if (lane === undefined) {
                    // Fallback: обчислюємо лейн з позиції пальця
                    if (gameRect && gameRect.width) {
                        const scaleX = State.gameWidth / gameRect.width;
                        const touchX = (e.clientX - gameRect.left) * scaleX;
                        const laneW = State.gameWidth / 4;
                        lane = Math.max(0, Math.min(3, Math.floor(touchX / laneW)));
                    }
                }
                activePointerLanes.delete(e.pointerId);

                // Multi-touch захист: деактивуємо доріжку лише якщо жоден інший палець її не утримує
                let otherInLane = false;
                for (const l of activePointerLanes.values()) {
                    if (l === lane) { otherInLane = true; break; }
                }
                if (!otherInLane && lane !== undefined && lane >= 0 && lane < 4) {
                    handleInputUp(lane);
                }
            };

            const handlePointerMove = (e) => {
                if (e.cancelable) e.preventDefault();
                // Під час руху пальця по екрану оновлюємо таймер утримання
                const lane = activePointerLanes.get(e.pointerId);
                if (lane !== undefined) {
                    State.keyState[lane] = true;
                    const heldTile = State.holdingTiles[lane];
                    if (heldTile && !heldTile.completed && !heldTile.released && !heldTile.failed) {
                        heldTile.lastValidHoldTime = Date.now();
                    }
                }
            };

            const handlePointerCancel = (e) => {
                if (e.cancelable) e.preventDefault();
                // Захист від системного зриву утримання при мультитач-диспатчі на Android:
                const lane = activePointerLanes.get(e.pointerId);
                if (lane !== undefined) {
                    const heldTile = State.holdingTiles[lane];
                    if (heldTile && !heldTile.completed && !heldTile.released && !heldTile.failed) {
                        heldTile.lastValidHoldTime = Date.now();
                    }
                }
                activePointerLanes.delete(e.pointerId);

                let otherInLane = false;
                for (const l of activePointerLanes.values()) {
                    if (l === lane) { otherInLane = true; break; }
                }
                if (!otherInLane && lane !== undefined && lane >= 0 && lane < 4) {
                    const heldTile = State.holdingTiles[lane];
                    // Якщо в цій доріжці активно утримується довга нота, захищаємо її від обриву через жест браузера
                    if (!heldTile || heldTile.completed || heldTile.released) {
                        handleInputUp(lane);
                    }
                }
            };

            // Інвалідуємо rect при ресайзі вікна щоб не використовувати застарілі координати
            window.addEventListener('resize', () => { gameRect = null; }, { passive: true });

            canvas.addEventListener('pointerdown', handlePointerDown, { passive: false });
            canvas.addEventListener('pointermove', handlePointerMove, { passive: false });
            window.addEventListener('pointermove', (e) => {
                if (State.isPlaying && e.cancelable) e.preventDefault();
            }, { passive: false });
            window.addEventListener('pointerup', handlePointerUp, { passive: false });
            window.addEventListener('pointercancel', handlePointerCancel, { passive: false });
            window.addEventListener('contextmenu', (e) => {
                if (State.isPlaying) e.preventDefault();
            }, { passive: false });
            window.addEventListener('selectstart', (e) => {
                if (State.isPlaying) e.preventDefault();
            }, { passive: false });
        }

        // Гарантована ізоляція введення в текстових полях (включаючи пробіл та спеціальні клавіші в адмінці)
        document.addEventListener('keydown', e => {
            if (e.target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable)) {
                e.stopPropagation();
            }
        }, true);
        document.addEventListener('keyup', e => {
            if (e.target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable)) {
                e.stopPropagation();
            }
        }, true);

        window.addEventListener('keydown', e => {
            const active = document.activeElement;
            const target = e.target;
            const isTyping = (active && (['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName) || active.isContentEditable)) ||
                             (target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable));
            if (isTyping && !State.isPlaying) return;

            if (e.code === 'Space') {
                e.preventDefault(); togglePauseGame(); return;
            }
            if (!e.repeat) {
                let lane = KEYS.indexOf(e.code);
                if (lane === -1) {
                    if (e.code === 'ArrowLeft') lane = 0;
                    else if (e.code === 'ArrowDown') lane = 1;
                    else if (e.code === 'ArrowUp') lane = 2;
                    else if (e.code === 'ArrowRight') lane = 3;
                }
                if (lane !== -1) handleInputDown(lane);
            }
        });
        window.addEventListener('keyup', e => {
            const active = document.activeElement;
            const target = e.target;
            const isTyping = (active && (['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName) || active.isContentEditable)) ||
                             (target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable));
            if (isTyping && !State.isPlaying) return;

            let lane = KEYS.indexOf(e.code);
            if (lane === -1) {
                if (e.code === 'ArrowLeft') lane = 0;
                else if (e.code === 'ArrowDown') lane = 1;
                else if (e.code === 'ArrowUp') lane = 2;
                else if (e.code === 'ArrowRight') lane = 3;
            }
            if (lane !== -1) handleInputUp(lane);
        });

        const setupBtn = (id, fn) => {
            const btn = document.getElementById(id);
            if (btn) { btn.onclick = (e) => { e.stopPropagation(); playClick(); fn(btn); }; btn.onmouseenter = playHover; }
        };
        // Спливаюче повідомлення (Toast notification)
        function showGameNotification(text, duration = 2500) {
            const el = document.createElement('div');
            el.className = 'game-notification';
            el.textContent = text;
            document.body.appendChild(el);
            setTimeout(() => {
                el.style.animation = 'toastFadeOut 0.4s forwards';
                setTimeout(() => el.remove(), 400);
            }, duration);
        }

        // Інжекція векторних SVG іконок у шапку сайту та інтерфейс (ЖОДНИХ ЕМОДЗІ)
        const logoIcon = document.querySelector('.logo-icon-container');
        if (logoIcon) logoIcon.innerHTML = icons.piano(22);

        const iconLogin = document.querySelector('.icon-login-container');
        if (iconLogin) iconLogin.innerHTML = icons.login(16);

        const iconUser = document.querySelector('.icon-user-container');
        if (iconUser) iconUser.innerHTML = icons.user(16);

        const iconAdmin = document.querySelector('.icon-admin-container');
        if (iconAdmin) iconAdmin.innerHTML = icons.admin(16);

        const iconLogout = document.querySelector('.icon-logout-container');
        if (iconLogout) iconLogout.innerHTML = icons.logout(16);

        const iconGlobe = document.querySelector('.icon-globe-container');
        if (iconGlobe) iconGlobe.innerHTML = icons.globe(16);

        const iconFriends = document.querySelector('.icon-friends-container');
        if (iconFriends) iconFriends.innerHTML = icons.users(18);

        const friendsModalIcon = document.querySelector('.friends-modal-icon');
        if (friendsModalIcon) friendsModalIcon.innerHTML = icons.users(20);

        const addFriendBtnIcon = document.querySelector('.btn-icon-add-friend');
        if (addFriendBtnIcon) addFriendBtnIcon.innerHTML = icons.userPlus(15);

        const friendsCloseBtnEl = document.getElementById('friends-close-btn');
        if (friendsCloseBtnEl && !friendsCloseBtnEl.hasChildNodes()) friendsCloseBtnEl.innerHTML = icons.close(16);

        const searchIcon = document.querySelector('.search-icon-inside');
        if (searchIcon) searchIcon.innerHTML = icons.search(16);

        const tabIconFile = document.querySelector('.tab-icon-file');
        if (tabIconFile) tabIconFile.innerHTML = icons.folder(16);

        const tabIconUrl = document.querySelector('.tab-icon-url');
        if (tabIconUrl) tabIconUrl.innerHTML = icons.link(16);

        const refreshIcon = document.querySelector('.refresh-icon-container');
        if (refreshIcon) refreshIcon.innerHTML = icons.refresh(14);

        const iconSettings = document.querySelector('.icon-settings-container');
        if (iconSettings) iconSettings.innerHTML = icons.settings(18);

        const profileAvatarIcon = document.querySelector('.profile-avatar-icon');
        if (profileAvatarIcon) profileAvatarIcon.innerHTML = icons.user(32);

        const profileRankIcon = document.querySelector('.profile-rank-icon');
        if (profileRankIcon) profileRankIcon.innerHTML = icons.trophy(16);

        const statClock = document.getElementById('stat-icon-clock');
        if (statClock) statClock.innerHTML = icons.clock(22);

        const statLevels = document.getElementById('stat-icon-levels');
        if (statLevels) statLevels.innerHTML = icons.trophy(22);

        const statGoldStar = document.getElementById('stat-icon-gold-star');
        if (statGoldStar) statGoldStar.innerHTML = icons.starFilled(22);

        const statDiamond = document.getElementById('stat-icon-diamond');
        if (statDiamond) statDiamond.innerHTML = icons.diamond(22);

        const profileSettingsIcon = document.querySelector('.profile-settings-icon');
        if (profileSettingsIcon) profileSettingsIcon.innerHTML = icons.settings(16);

        const dangerIcon = document.querySelector('.danger-icon-container');
        if (dangerIcon) dangerIcon.innerHTML = icons.alertTriangle(18);

        const shopIconContainer = document.querySelector('.icon-shop-container');
        if (shopIconContainer) shopIconContainer.innerHTML = icons.shop(18);

        const shopModalIcon = document.querySelector('.shop-modal-icon');
        if (shopModalIcon) shopModalIcon.innerHTML = icons.shop(24);

        const custIconContainer = document.querySelector('.icon-customization-container');
        if (custIconContainer) custIconContainer.innerHTML = icons.palette(18);

        const custModalIcon = document.querySelector('.cust-modal-icon');
        if (custModalIcon) custModalIcon.innerHTML = icons.palette(24);

        const shopCloseBtn = document.getElementById('shop-close-btn');
        if (shopCloseBtn && !shopCloseBtn.hasChildNodes()) shopCloseBtn.innerHTML = icons.close(16);

        document.querySelectorAll('.modal-close-btn').forEach(b => {
            b.innerHTML = icons.close(16);
        });

        function toggleThemeMode() {
            const current = document.body.getAttribute('data-theme') || 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', next);
            localStorage.setItem('siteTheme', next);
            if (ctx) {
                initGradients();
                const laneW = (State.gameWidth || 400) / 4;
                const padding = 6;
                const w = laneW - (padding * 2);
                SpriteCache.init(w, CONFIG.noteHeight, laneW, next === 'light');
            }
            if (typeof renderMenu === 'function') {
                renderMenu();
            }
            updateSettingsThemeUI();
        }

        function updateSettingsThemeUI() {
            const current = document.body.getAttribute('data-theme') || 'dark';
            const container = document.getElementById('theme-icon-container');
            if (container) container.innerHTML = current === 'dark' ? icons.moon(18) : icons.sun(18);

            const settingsIcon = document.getElementById('settings-theme-icon');
            if (settingsIcon) settingsIcon.innerHTML = current === 'dark' ? icons.moon(16) : icons.sun(16);

            const settingsText = document.getElementById('settings-theme-text');
            if (settingsText) settingsText.textContent = current === 'dark' ? (getText('themeDark') || 'Темна') : (getText('themeLight') || 'Світла');
        }

        function toggleSoundMode() {
            State.isMuted = !State.isMuted;
            localStorage.setItem('isMuted', State.isMuted);
            if (State.masterGain) State.masterGain.gain.value = State.isMuted ? 0 : 1;
            if (bgMusicEl) State.isMuted ? bgMusicEl.pause() : (!State.isPlaying && bgMusicEl.play().catch(() => {}));
            updateSettingsSoundUI();
        }

        function updateSettingsSoundUI() {
            const container = document.getElementById('sound-icon-container');
            if (container) container.innerHTML = State.isMuted ? icons.volumeX(18) : icons.volume(18);

            const settingsIcon = document.getElementById('settings-sound-icon');
            if (settingsIcon) settingsIcon.innerHTML = State.isMuted ? icons.volumeX(16) : icons.volume(16);

            const settingsText = document.getElementById('settings-sound-text');
            if (settingsText) settingsText.textContent = State.isMuted ? (getText('soundOff') || 'Вимкнено') : (getText('soundOn') || 'Увімкнено');
        }

        function setGameLanguage(lang) {
            playClick();
            State.currentLang = lang;
            localStorage.setItem('siteLang', lang);
            i18n.setLanguage(lang);
            document.body.setAttribute('data-lang', lang);
            updateGameText();
            updateFullscreenIcons();
            updateSettingsLangUI();
            updateSettingsThemeUI();
            updateSettingsSoundUI();
            const adminModal = document.getElementById('admin-modal');
            if (adminModal && !adminModal.classList.contains('hidden')) {
                renderAdminTrackList();
            }
            if (typeof renderMenu === 'function') renderMenu();
            if (typeof renderShop === 'function') renderShop();
        }

        function updateSettingsLangUI() {
            document.querySelectorAll('.lang-pill').forEach(pill => {
                const lang = pill.getAttribute('data-set-lang');
                if (lang === State.currentLang) {
                    pill.classList.add('active');
                } else {
                    pill.classList.remove('active');
                }
            });
        }

        // Ініціалізація UI налаштувань
        updateSettingsThemeUI();
        updateSettingsSoundUI();
        updateSettingsLangUI();

        // Налаштування кнопок перемикання теми
        setupBtn('themeToggle', () => {
            toggleThemeMode();
        });
        setupBtn('settings-theme-toggle', () => {
            playClick();
            toggleThemeMode();
        });

        // Налаштування кнопок керування звуком
        setupBtn('soundToggle', () => {
            toggleSoundMode();
        });
        setupBtn('settings-sound-toggle', () => {
            playClick();
            toggleSoundMode();
        });

        // Пігулки вибору мови в модальному вікні налаштувань
        document.querySelectorAll('.lang-pill').forEach(pill => {
            pill.onclick = () => {
                const lang = pill.getAttribute('data-set-lang');
                if (lang) setGameLanguage(lang);
            };
        });

        const langBtn = document.getElementById('langToggle');
        const langWrapper = document.querySelector('.lang-wrapper');

        if (langBtn && langWrapper) {
            langBtn.onclick = (e) => {
                e.stopPropagation();
                playClick();
                langWrapper.classList.toggle('open');
            };
        }

        document.querySelectorAll('.lang-dropdown button').forEach(b => {
            b.onclick = () => {
                setGameLanguage(b.dataset.lang);
                if (langWrapper) langWrapper.classList.remove('open');
            };
        });

        document.addEventListener('click', (e) => {
            if (langWrapper && !langWrapper.contains(e.target)) {
                langWrapper.classList.remove('open');
            }
        });

        function isFullScreen() {
            return Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
        }

        function updateFullscreenIcons() {
            const fsActive = isFullScreen();
            const iconSvg = fsActive ? icons.minimize(18) : icons.maximize(18);
            const iconSvgSmall = fsActive ? icons.minimize(16) : icons.maximize(16);
            const fsText = fsActive ? (getText('exitFullscreen') || 'Віконний режим') : (getText('fullscreen') || 'Повний екран');

            const headerFsIcon = document.getElementById('fullscreen-icon-container');
            if (headerFsIcon) headerFsIcon.innerHTML = iconSvg;
            const headerFsBtn = document.getElementById('btn-fullscreen');
            if (headerFsBtn) {
                headerFsBtn.setAttribute('title', fsText);
                headerFsBtn.setAttribute('aria-label', fsText);
            }

            const settingsFsIcon = document.getElementById('settings-fullscreen-icon');
            if (settingsFsIcon) settingsFsIcon.innerHTML = iconSvgSmall;
            const settingsFsText = document.getElementById('settings-fullscreen-text');
            if (settingsFsText) settingsFsText.textContent = fsText;

            const pauseFsIcon = document.getElementById('pause-fullscreen-icon');
            if (pauseFsIcon) pauseFsIcon.innerHTML = iconSvgSmall;
            const pauseFsText = document.getElementById('pause-fullscreen-text');
            if (pauseFsText) pauseFsText.textContent = fsText;
        }

        async function toggleFullScreen() {
            playClick();
            try {
                if (!isFullScreen()) {
                    const el = document.documentElement;
                    if (el.requestFullscreen) await el.requestFullscreen();
                    else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
                    else if (el.mozRequestFullScreen) await el.mozRequestFullScreen();
                    else if (el.msRequestFullscreen) await el.msRequestFullscreen();
                } else {
                    if (document.exitFullscreen) await document.exitFullscreen();
                    else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
                    else if (document.mozCancelFullScreen) await document.mozCancelFullScreen();
                    else if (document.msExitFullscreen) await document.msExitFullscreen();
                }
            } catch (err) {
                console.warn("[Fullscreen] Error:", err);
            }
            updateFullscreenIcons();
        }

        setupBtn('btn-fullscreen', toggleFullScreen);
        setupBtn('settings-fullscreen-toggle', toggleFullScreen);
        setupBtn('btn-pause-fullscreen', toggleFullScreen);

        ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(ev => {
            document.addEventListener(ev, updateFullscreenIcons);
        });
        updateFullscreenIcons();

        function togglePauseGame(forcePause) {
            if (!State.isPlaying) return;
            if (typeof forcePause === 'boolean') {
                if (State.isPaused === forcePause) return;
                State.isPaused = forcePause;
            } else {
                State.isPaused = !State.isPaused;
            }

            const m = document.getElementById('pause-modal');
            if (State.isPaused) {
                if (State.audioCtx && State.audioCtx.state === 'running') {
                    try { State.audioCtx.suspend(); } catch (e) {}
                }
                const currentSong = songsDB[State.currentSongIndex];
                const pauseSongTitle = document.getElementById('pause-song-title');
                if (pauseSongTitle) pauseSongTitle.textContent = currentSong ? `${currentSong.artist} — ${currentSong.title}` : '';
                const pauseScore = document.getElementById('pause-stat-score');
                if (pauseScore) pauseScore.textContent = Math.round(State.score).toLocaleString();
                const pauseCombo = document.getElementById('pause-stat-combo');
                if (pauseCombo) pauseCombo.textContent = String(State.combo || 0);
                updateFullscreenIcons();
                m?.classList.remove('hidden');
            } else {
                if (State.audioCtx && State.audioCtx.state === 'suspended') {
                    try { State.audioCtx.resume(); } catch (e) {}
                }
                m?.classList.add('hidden');
                State.lastFrameTime = 0;
                if (State.animationFrameId) {
                    cancelAnimationFrame(State.animationFrameId);
                    State.animationFrameId = null;
                }
                State.animationFrameId = requestAnimationFrame(gameLoop);
            }
        }

        const setupNav = (id, fn) => { const btn = document.getElementById(id); if (btn) btn.onclick = () => { playClick(); fn(); }; };
        setupNav('global-back-btn', () => State.isPlaying ? quitGame() : window.location.href = 'index.html');
        setupNav('btn-quit', quitGame);
        setupNav('btn-menu-end', quitGame);
        setupNav('btn-pause', () => togglePauseGame());
        setupNav('btn-resume', () => togglePauseGame(false));
        setupNav('btn-pause-restart', () => {
            const m = document.getElementById('pause-modal');
            if (m) m.classList.add('hidden');
            State.isPaused = false;
            resetGameState();
            setTimeout(() => startGame(State.currentSongIndex), 50);
        });
        setupNav('btn-restart', () => {
            document.getElementById('result-screen')?.classList.add('hidden');
            resetGameState();
            setTimeout(() => startGame(State.currentSongIndex), 50);
        });

        // ==========================================
        // Панель адміністратора (Admin Dashboard)
        // ==========================================
        const adminModal = document.getElementById('admin-modal');
        const adminCloseBtn = document.getElementById('admin-close-btn');
        const adminBottomCloseBtn = document.getElementById('admin-bottom-close-btn');
        const btnOpenAdmin = document.getElementById('btn-open-admin');
        const adminUrlInput = document.getElementById('admin-url-input');
        const adminFileInput = document.getElementById('admin-file-input');
        const adminFileLabel = document.getElementById('admin-file-label');
        const adminFileInfo = document.getElementById('admin-file-info');
        const adminTitleInput = document.getElementById('admin-title-input');
        const adminArtistInput = document.getElementById('admin-artist-input');
        const adminDurationInput = document.getElementById('admin-duration-input');
        const adminDurationFeedback = document.getElementById('admin-duration-feedback');
        const adminUploadBtn = document.getElementById('admin-upload-btn');
        const adminRefreshBtn = document.getElementById('admin-refresh-tracks');
        const adminForm = document.getElementById('admin-track-form');

        let adminSelectedFile = null;

        function resetAdminFileInput() {
            adminSelectedFile = null;
            if (adminFileInput) adminFileInput.value = '';
            if (adminFileLabel) {
                adminFileLabel.textContent = getText('adminSelectAudioFile') || 'Обрати аудіофайл з пристрою (.mp3)';
                const parentLabel = adminFileLabel.closest('label');
                if (parentLabel) {
                    parentLabel.style.background = 'rgba(56, 189, 248, 0.12)';
                    parentLabel.style.borderColor = 'rgba(56, 189, 248, 0.45)';
                    parentLabel.style.color = '#38bdf8';
                }
            }
            if (adminFileInfo) {
                adminFileInfo.style.display = 'none';
                adminFileInfo.innerHTML = '';
            }
        }

        if (adminFileInput) {
            adminFileInput.addEventListener('change', async (e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;

                adminSelectedFile = file;

                // Парсимо назву файлу (наприклад "Artist - Title.mp3" або "Title.mp3")
                const rawName = file.name.replace(/\.[^/.]+$/, '');
                let parsedArtist = '';
                let parsedTitle = rawName;

                if (rawName.includes(' - ')) {
                    const parts = rawName.split(' - ');
                    parsedArtist = parts[0].trim();
                    parsedTitle = parts.slice(1).join(' - ').trim();
                } else if (rawName.includes('_-_')) {
                    const parts = rawName.split('_-_');
                    parsedArtist = parts[0].trim();
                    parsedTitle = parts.slice(1).join('_-_').trim();
                }

                if (adminArtistInput && (!adminArtistInput.value.trim() || adminArtistInput.value.trim() === 'Local')) {
                    adminArtistInput.value = parsedArtist;
                }
                if (adminTitleInput && !adminTitleInput.value.trim()) {
                    adminTitleInput.value = parsedTitle;
                }

                if (adminFileLabel) {
                    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
                    adminFileLabel.textContent = `✓ ${file.name} (${sizeMb} MB)`;
                    const parentLabel = adminFileLabel.closest('label');
                    if (parentLabel) {
                        parentLabel.style.background = 'rgba(16, 185, 129, 0.16)';
                        parentLabel.style.borderColor = 'rgba(16, 185, 129, 0.6)';
                        parentLabel.style.color = '#34d399';
                    }
                }

                if (adminFileInfo) {
                    adminFileInfo.style.display = 'flex';
                    adminFileInfo.className = 'duration-feedback-row calculating';
                    adminFileInfo.innerHTML = `${icons.refresh(13)} <span>${getText('adminDurationCalculating') || 'Розрахунок тривалості...'}</span>`;
                }

                try {
                    const dur = await calculateAudioDuration(file);
                    if (dur > 0 && adminDurationInput) {
                        adminDurationInput.value = dur;
                    }

                    // Duplicate check immediately upon file selection
                    let fileHash = '';
                    try { fileHash = await calculateFileHash(file); } catch (_) {}

                    const dupCheck = findDuplicateTrack(songsDB, {
                        file,
                        fileHash,
                        fileSize: file.size,
                        title: adminTitleInput?.value || parsedTitle || '',
                        artist: adminArtistInput?.value || parsedArtist || '',
                        duration: dur
                    });

                    if (dupCheck.duplicate && dupCheck.track) {
                        const d = dupCheck.track;
                        const fullTrackName = `${d.artist ? d.artist + ' - ' : ''}${d.title}`;
                        const dupMsg = (getText('trackAlreadyExists') || 'Цей трек уже є у фонотеці ({title})!').replace('{title}', fullTrackName);
                        if (adminFileInfo) {
                            adminFileInfo.className = 'duration-feedback-row warning';
                            adminFileInfo.innerHTML = `⚠️ <span style="color:#f87171; font-weight:700;">${escapeHtml(dupMsg)}</span>`;
                        }
                        if (adminUploadBtn) {
                            adminUploadBtn.disabled = true;
                            adminUploadBtn.style.opacity = '0.5';
                            adminUploadBtn.title = dupMsg;
                        }
                        showNotification(dupMsg, 'warning');
                    } else {
                        if (adminUploadBtn) {
                            adminUploadBtn.disabled = false;
                            adminUploadBtn.style.opacity = '1';
                            adminUploadBtn.title = '';
                        }
                        if (dur > 0) {
                            const mins = Math.floor(dur / 60);
                            const secs = Math.floor(dur % 60).toString().padStart(2, '0');
                            if (adminFileInfo) {
                                adminFileInfo.className = 'duration-feedback-row detected';
                                adminFileInfo.innerHTML = `${icons.check(13)} <span>${getText('adminFileSelected') || 'Файл обрано:'} <b>${dur}s</b> (${mins}:${secs})</span>`;
                            }
                        } else if (adminFileInfo) {
                            adminFileInfo.className = 'duration-feedback-row detected';
                            adminFileInfo.innerHTML = `${icons.check(13)} <span>${getText('adminFileSelected') || 'Файл обрано'}</span>`;
                        }
                    }
                } catch (err) {
                    console.warn('[AdminFile] Duration calc warning:', err);
                    if (adminFileInfo) {
                        adminFileInfo.className = 'duration-feedback-row detected';
                        adminFileInfo.innerHTML = `${icons.check(13)} <span>${getText('adminFileSelected') || 'Файл обрано'}</span>`;
                    }
                }
            });
        }

        // Spotify Autofill елементи
        const adminSpotifyInput = document.getElementById('admin-spotify-input');
        const adminSpotifyBtn = document.getElementById('admin-spotify-btn');
        const adminSpotifyFeedback = document.getElementById('admin-spotify-feedback');
        const adminSpotifyIconContainer = document.querySelector('.admin-spotify-icon-container');
        const adminSpotifyBtnIcon = document.querySelector('.admin-spotify-btn-icon');

        if (adminSpotifyIconContainer && icons.spotify) {
            adminSpotifyIconContainer.innerHTML = icons.spotify(16);
        }
        if (adminSpotifyBtnIcon && icons.sparkles) {
            adminSpotifyBtnIcon.innerHTML = icons.sparkles(14);
        }

        let spotifyDebounceTimer = null;
        let isFetchingSpotify = false;

        async function handleSpotifyImport(providedUrl = null) {
            const rawUrl = providedUrl || (adminSpotifyInput ? adminSpotifyInput.value.trim() : '');
            if (!rawUrl) return;

            if (isFetchingSpotify) return;
            isFetchingSpotify = true;

            if (adminSpotifyBtn) adminSpotifyBtn.disabled = true;
            if (adminSpotifyFeedback) {
                adminSpotifyFeedback.className = 'admin-spotify-feedback loading';
                adminSpotifyFeedback.innerHTML = `${icons.refresh(13)} <span>${getText('adminSpotifyFetching')}</span>`;
            }

            try {
                const metadata = await fetchSpotifyTrackMetadata(rawUrl);
                if (metadata && (metadata.title || metadata.artist)) {
                    if (adminTitleInput && metadata.title) {
                        adminTitleInput.value = metadata.title;
                    }
                    if (adminArtistInput && metadata.artist) {
                        adminArtistInput.value = metadata.artist;
                    }
                    if (adminDurationInput && metadata.duration > 0) {
                        adminDurationInput.value = metadata.duration;
                        const mins = Math.floor(metadata.duration / 60);
                        const secs = Math.floor(metadata.duration % 60).toString().padStart(2, '0');
                        if (adminDurationFeedback) {
                            adminDurationFeedback.className = 'duration-feedback-row detected';
                            adminDurationFeedback.innerHTML = `${icons.check(13)} <span>${getText('adminDurationDetected')}: <b>${metadata.duration}s</b> (${mins}:${secs})</span>`;
                        }
                    }

                    if (adminSpotifyFeedback) {
                        adminSpotifyFeedback.className = 'admin-spotify-feedback success';
                        adminSpotifyFeedback.innerHTML = `${icons.check(13)} <span>${getText('adminSpotifySuccess')} <b>${metadata.artist ? metadata.artist + ' - ' : ''}${metadata.title}</b></span>`;
                    }
                    showGameNotification(getText('adminSpotifySuccess'));
                } else {
                    throw new Error(getText('adminSpotifyError'));
                }
            } catch (err) {
                console.warn('[Spotify] Import error:', err);
                if (adminSpotifyFeedback) {
                    adminSpotifyFeedback.className = 'admin-spotify-feedback error';
                    adminSpotifyFeedback.innerHTML = `<span>⚠️ ${err.message || getText('adminSpotifyError')}</span>`;
                }
            } finally {
                isFetchingSpotify = false;
                if (adminSpotifyBtn) adminSpotifyBtn.disabled = false;
            }
        }

        if (adminSpotifyBtn) {
            adminSpotifyBtn.onclick = (e) => {
                e.preventDefault();
                playClick();
                handleSpotifyImport();
            };
        }
        if (adminSpotifyInput) {
            adminSpotifyInput.addEventListener('input', () => {
                clearTimeout(spotifyDebounceTimer);
                const val = adminSpotifyInput.value.trim();
                if (val.includes('spotify.com/track/') || val.includes('spotify:track:') || val.match(/^[a-zA-Z0-9]{22}$/)) {
                    spotifyDebounceTimer = setTimeout(() => handleSpotifyImport(), 600);
                }
            });
            adminSpotifyInput.addEventListener('paste', () => {
                setTimeout(() => handleSpotifyImport(), 100);
            });
            adminSpotifyInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSpotifyImport();
                }
            });
        }

        // Закриття адмін-панелі без перезавантаження сайту
        function closeAdminPanel() {
            playClick();
            if (adminModal) adminModal.classList.add('hidden');
            resetAdminFileInput();
        }

        if (adminCloseBtn) {
            adminCloseBtn.innerHTML = icons.close(20);
            adminCloseBtn.onclick = closeAdminPanel;
        }
        if (adminBottomCloseBtn) adminBottomCloseBtn.onclick = closeAdminPanel;

        if (adminModal) {
            // Клік по затемненому фону (backdrop) закриває модалку
            adminModal.addEventListener('mousedown', (e) => {
                if (e.target === adminModal) closeAdminPanel();
            });
        }

        if (btnOpenAdmin) {
            btnOpenAdmin.onclick = () => {
                playClick();
                if (adminModal) {
                    adminModal.classList.remove('hidden');
                    updateBotToggleUI();
                    if (typeof switchAdminTab === 'function') {
                        switchAdminTab('tracks');
                    }
                    renderAdminTrackList();
                }
            };
        }

        // ==========================================
        // Керування авто-ботом з адмін-панелі
        // ==========================================
        const adminToggleBotBtn = document.getElementById('admin-toggle-bot-btn');
        const adminBotStatusText = document.getElementById('admin-bot-status-text');
        const adminBotIconContainer = document.querySelector('.admin-bot-icon-container');
        if (adminBotIconContainer) adminBotIconContainer.innerHTML = icons.bot(22);

        function updateBotToggleUI() {
            const isEnabled = Boolean(State.isBotEnabled);
            if (adminToggleBotBtn) {
                adminToggleBotBtn.classList.toggle('active-bot', isEnabled);
            }
            if (adminBotStatusText) {
                adminBotStatusText.textContent = isEnabled ? getText('adminAutoPlayActive') : getText('adminAutoPlayInactive');
            }
        }

        if (adminToggleBotBtn) {
            adminToggleBotBtn.onclick = (e) => {
                e.stopPropagation();
                playClick();
                State.isBotEnabled = !State.isBotEnabled;
                localStorage.setItem('neon_autobot_enabled', State.isBotEnabled ? 'true' : 'false');
                updateBotToggleUI();
                showGameNotification(State.isBotEnabled ? getText('adminAutoPlayActiveToast') : getText('adminAutoPlayInactiveToast'));
            };
        }
        updateBotToggleUI();

        if (adminRefreshBtn) {
            adminRefreshBtn.onclick = async () => {
                playClick();
                await renderAdminTrackList();
                await loadCloudSongs();
            };
        }

        // Автоматичний аналіз тривалості аудіо за прямим URL (Catbox.moe тощо)
        let durationDebounceTimer = null;
        const triggerUrlAnalysis = async () => {
            const url = adminUrlInput ? adminUrlInput.value.trim() : '';
            if (!url) {
                if (adminDurationFeedback) adminDurationFeedback.innerHTML = '';
                return;
            }

            // Якщо користувач випадково вставив посилання Spotify у поле прямого аудіофайлу
            if (url.includes('spotify.com/track/') || url.includes('spotify:track:')) {
                if (adminSpotifyInput) adminSpotifyInput.value = url;
                if (adminUrlInput) adminUrlInput.value = '';
                handleSpotifyImport(url);
                if (adminDurationFeedback) {
                    adminDurationFeedback.className = 'duration-feedback-row';
                    adminDurationFeedback.innerHTML = `<span style="color: #1ed760;">${getText('adminSpotifyRedirectHint')}</span>`;
                }
                return;
            }

            // Автоматична конвертація Pixeldrain /u/ в прямий потік /api/file/
            if (url.includes('pixeldrain.com/u/')) {
                const converted = url.replace('pixeldrain.com/u/', 'pixeldrain.com/api/file/');
                if (adminUrlInput) adminUrlInput.value = converted;
            }
            // Автоматична конвертація Dropbox dl=0 в прямий потік raw=1
            if (url.includes('dropbox.com') && url.includes('dl=0')) {
                const converted = url.replace('dl=0', 'raw=1');
                if (adminUrlInput) adminUrlInput.value = converted;
            }

            if (!url.startsWith('http://') && !url.startsWith('https://')) return;

            if (adminDurationFeedback) {
                adminDurationFeedback.className = 'duration-feedback-row calculating';
                adminDurationFeedback.innerHTML = `${icons.refresh(13)} <span>${getText('adminDurationCalculating')}</span>`;
            }

            try {
                const dur = await calculateAudioDurationFromUrl(url);
                if (dur > 0) {
                    if (adminDurationInput) adminDurationInput.value = dur;
                    const mins = Math.floor(dur / 60);
                    const secs = Math.floor(dur % 60).toString().padStart(2, '0');
                    if (adminDurationFeedback) {
                        adminDurationFeedback.className = 'duration-feedback-row detected';
                        adminDurationFeedback.innerHTML = `${icons.check(13)} <span>${getText('adminDurationDetected')}: <b>${dur}s</b> (${mins}:${secs})</span>`;
                    }
                } else {
                    if (adminDurationFeedback) {
                        adminDurationFeedback.className = 'duration-feedback-row';
                        adminDurationFeedback.innerHTML = '';
                    }
                }
            } catch (err) {
                if (adminDurationFeedback) {
                    adminDurationFeedback.className = 'duration-feedback-row';
                    adminDurationFeedback.innerHTML = '';
                }
            }
        };

        if (adminUrlInput) {
            adminUrlInput.addEventListener('input', () => {
                clearTimeout(durationDebounceTimer);
                durationDebounceTimer = setTimeout(triggerUrlAnalysis, 600);
            });
            adminUrlInput.addEventListener('paste', () => {
                setTimeout(triggerUrlAnalysis, 100);
            });
            adminUrlInput.addEventListener('change', triggerUrlAnalysis);
        }

        // Відправка форми додавання треку
        if (adminForm) {
            adminForm.onsubmit = async (e) => {
                e.preventDefault();
                const file = adminSelectedFile || (adminFileInput?.files && adminFileInput.files[0]) || null;
                const url = adminUrlInput?.value.trim() || '';
                const title = adminTitleInput?.value.trim() || '';
                const artist = adminArtistInput?.value.trim() || '';
                let duration = parseFloat(adminDurationInput?.value) || 0;

                if (!file && !url) {
                    alert(getText('adminSelectFile') || 'Будь ласка, оберіть аудіофайл або введіть пряме посилання.');
                    return;
                }

                if (!title) {
                    alert(getText('adminSpecifyTitle') || 'Вкажіть назву треку.');
                    return;
                }

                // Перевірка на дублікат треку перед відправкою (по файлу, назві, автору, тривалості, хешу або URL)
                let fileHash = '';
                if (file) {
                    try { fileHash = await calculateFileHash(file); } catch (_) {}
                }

                const dupCheck = findDuplicateTrack(songsDB, {
                    file,
                    fileHash,
                    fileSize: file ? file.size : 0,
                    url,
                    title,
                    artist,
                    duration
                });

                if (dupCheck.duplicate && dupCheck.track) {
                    const d = dupCheck.track;
                    const fullTrackName = `${d.artist ? d.artist + ' - ' : ''}${d.title}`;
                    const dupMsg = (getText('trackAlreadyExists') || 'Цей трек уже є у фонотеці ({title})!').replace('{title}', fullTrackName);
                    showNotification(dupMsg, 'warning');
                    alert(dupMsg);
                    return;
                }

                try {
                    adminUploadBtn.disabled = true;

                    if (file) {
                        adminUploadBtn.innerText = getText('adminAnalyzing') || 'Аналіз та збереження...';
                        if (duration <= 0) {
                            try {
                                duration = await calculateAudioDuration(file);
                            } catch (e) {
                                duration = 0;
                            }
                        }

                        await uploadTrack({
                            file,
                            title,
                            artist: artist || 'Local',
                            duration,
                            onProgress: (pct) => {
                                if (adminUploadBtn) {
                                    adminUploadBtn.innerText = `${getText('adminUploadingProgress') || 'Завантаження:'} ${pct}%`;
                                }
                            }
                        });
                    } else {
                        adminUploadBtn.innerText = getText('adminAnalyzing') || 'Аналіз та збереження...';
                        if (duration <= 0) {
                            duration = await calculateAudioDurationFromUrl(url);
                        }
                        await addTrackByUrl({ url, title, artist, duration });
                    }

                    showNotification(getText('adminTrackAdded') || 'Трек успішно додано у фонотеку!');

                    adminForm.reset();
                    resetAdminFileInput();
                    if (adminDurationFeedback) adminDurationFeedback.innerHTML = '';
                    if (adminSpotifyFeedback) {
                        adminSpotifyFeedback.className = 'admin-spotify-feedback';
                        adminSpotifyFeedback.innerHTML = '';
                    }
                    adminUploadBtn.disabled = false;
                    adminUploadBtn.innerText = getText('adminUploadBtn') || 'Додати трек у фонотеку';

                    await renderAdminTrackList();
                    await loadCloudSongs();
                } catch (err) {
                    console.error('Помилка додавання треку:', err);
                    alert(err.message || err);
                    adminUploadBtn.disabled = false;
                    adminUploadBtn.innerText = getText('adminUploadBtn') || 'Додати трек у фонотеку';
                }
            };
        }

        // Відображення списку треків в адмінці
        async function renderAdminTrackList() {
            const listEl = document.getElementById('admin-track-list');
            if (!listEl) return;
            listEl.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-color); opacity: 0.7;">${getText('adminLoadingList') || 'Отримання списку...'}</div>`;

            try {
                const tracks = await getAllTracks();
                if (!tracks.length) {
                    listEl.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-color); opacity: 0.6;">${getText('adminNoTracks') || 'Немає завантажених треків.'}</div>`;
                    return;
                }

                listEl.innerHTML = '';
                tracks.forEach(track => {
                    const item = document.createElement('div');
                    item.className = 'admin-track-item';

                    const isLocal = Boolean(track.audioUrl && track.audioUrl.startsWith('indexeddb://'));
                    const isSupabase = Boolean(track.audioUrl && track.audioUrl.includes('supabase.co'));
                    let badge = '';
                    if (isLocal) {
                        badge = `<span style="font-size:0.7rem; background:rgba(56,189,248,0.15); color:#38bdf8; padding:2px 8px; border-radius:4px; margin-left:6px; display:inline-flex; align-items:center; gap:4px;">${icons.hardDrive(12)} ${getText('localBadgeTrack') || 'Local'}</span>`;
                    } else if (isSupabase) {
                        badge = `<span style="font-size:0.7rem; background:rgba(16,185,129,0.15); color:#34d399; padding:2px 8px; border-radius:4px; margin-left:6px; display:inline-flex; align-items:center; gap:4px;">${icons.cloud(12)} Supabase</span>`;
                    }

                    item.innerHTML = `
                        <div class="admin-track-item-info" style="flex: 1 1 0; min-width: 0; padding-right: 8px; cursor: pointer; overflow: hidden;" title="${getText('adminEditTrack') || 'Редагувати / Замінити аудіо'}">
                            <div class="admin-track-item-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">
                                ${escapeHtml(track.title)} ${badge}
                            </div>
                            <div class="admin-track-item-meta" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">
                                ${escapeHtml(track.artist)} • ${track.duration || 0} ${getText('secondsShort') || 'сек.'}
                            </div>
                        </div>
                        <div style="display: flex; gap: 6px; align-items: center; flex-shrink: 0;">
                            <button class="nav-btn admin-btn-secondary admin-btn-sm btn-edit-track" title="${getText('adminEditTrack') || 'Редагувати / Замінити аудіо'}">
                                ${icons.edit(14)}
                            </button>
                            <button class="nav-btn admin-btn-danger admin-btn-sm btn-delete-track" title="${getText('adminDeleteTrack') || 'Видалити трек'}">
                                ${icons.trash(14)}
                            </button>
                        </div>
                    `;

                    const editBtn = item.querySelector('.btn-edit-track');
                    const infoArea = item.querySelector('.admin-track-item-info');
                    if (editBtn) {
                        editBtn.onclick = (e) => {
                            e.stopPropagation();
                            playClick();
                            openAdminEditModal(track);
                        };
                    }
                    if (infoArea) {
                        infoArea.onclick = () => {
                            playClick();
                            openAdminEditModal(track);
                        };
                    }

                    const delBtn = item.querySelector('.btn-delete-track');
                    delBtn.onclick = async (e) => {
                        e.stopPropagation();
                        const confirmPrompt = (getText('adminDeleteConfirmPrompt') || 'Ви дійсно бажаєте видалити трек "{title}"?').replace('{title}', track.title);
                        if (!confirm(confirmPrompt)) return;
                        delBtn.disabled = true;
                        delBtn.innerText = '...';
                        try {
                            await deleteTrack(track.id, track.storagePath, track.audioUrl);
                            if (track.audioUrl && track.audioUrl.startsWith('indexeddb://')) {
                                const localId = track.audioUrl.replace('indexeddb://', '');
                                await deleteAudioFromIndexedDB(localId);
                            }
                            showNotification(getText('adminDeleteSuccess') || 'Трек видалено!');
                            await loadCloudSongs();
                            await renderAdminTrackList();
                        } catch (err) {
                            alert((getText('adminDeleteError') || 'Помилка видалення: ') + err.message);
                            delBtn.disabled = false;
                            delBtn.innerHTML = icons.trash(14);
                        }
                    };

                    listEl.appendChild(item);
                });
            } catch (err) {
                listEl.innerHTML = `<div style="color: #ff5555; padding: 15px; font-size: 0.85rem;">${getText('adminError') || 'Помилка'}: ${escapeHtml(err.message)}</div>`;
            }
        }

        // ==========================================
        // Модальне вікно редагування треку (Track Editor & Audio Replacer)
        // ==========================================
        const adminEditModal = document.getElementById('admin-edit-track-modal');
        const adminEditCloseBtn = document.getElementById('admin-edit-close-btn');
        const adminEditCancelBtn = document.getElementById('admin-edit-cancel-btn');
        const adminEditForm = document.getElementById('admin-edit-track-form');
        const adminEditTrackId = document.getElementById('admin-edit-track-id');
        const adminEditOldStoragePath = document.getElementById('admin-edit-old-storage-path');
        const adminEditPreviewName = document.getElementById('admin-edit-preview-name');
        const adminEditPreviewDuration = document.getElementById('admin-edit-preview-duration');
        const adminEditPreviewSource = document.getElementById('admin-edit-preview-source');
        const adminEditFileInput = document.getElementById('admin-edit-file-input');
        const adminEditFileLabel = document.getElementById('admin-edit-file-label');
        const adminEditFileInfo = document.getElementById('admin-edit-file-info');
        const adminEditUrlInput = document.getElementById('admin-edit-url-input');
        const adminEditUrlFeedback = document.getElementById('admin-edit-url-feedback');
        const adminEditTitleInput = document.getElementById('admin-edit-title-input');
        const adminEditArtistInput = document.getElementById('admin-edit-artist-input');
        const adminEditDurationInput = document.getElementById('admin-edit-duration-input');
        const adminEditProgressWrap = document.getElementById('admin-edit-progress-wrap');
        const adminEditProgressBar = document.getElementById('admin-edit-progress-bar');
        const adminEditProgressPct = document.getElementById('admin-edit-progress-pct');
        const adminEditProgressText = document.getElementById('admin-edit-progress-text');
        const adminEditSaveBtn = document.getElementById('admin-edit-save-btn');

        let editSelectedFile = null;

        function resetEditFileInput() {
            editSelectedFile = null;
            if (adminEditFileInput) adminEditFileInput.value = '';
            if (adminEditFileLabel) {
                adminEditFileLabel.textContent = getText('adminSelectAudioFile') || 'Обрати аудіофайл з пристрою (.mp3)';
                const parentLabel = adminEditFileLabel.closest('label');
                if (parentLabel) {
                    parentLabel.style.background = 'rgba(56, 189, 248, 0.12)';
                    parentLabel.style.borderColor = 'rgba(56, 189, 248, 0.45)';
                    parentLabel.style.color = '#38bdf8';
                }
            }
            if (adminEditFileInfo) {
                adminEditFileInfo.style.display = 'none';
                adminEditFileInfo.innerHTML = '';
            }
        }

        function openAdminEditModal(track) {
            if (!adminEditModal || !track) return;
            if (adminEditTrackId) adminEditTrackId.value = track.id || '';
            if (adminEditOldStoragePath) adminEditOldStoragePath.value = track.storagePath || '';
            if (adminEditTitleInput) adminEditTitleInput.value = track.title || '';
            if (adminEditArtistInput) adminEditArtistInput.value = track.artist || '';
            if (adminEditDurationInput) adminEditDurationInput.value = track.duration || 0;
            if (adminEditUrlInput) adminEditUrlInput.value = '';
            if (adminEditUrlFeedback) adminEditUrlFeedback.innerHTML = '';

            if (adminEditPreviewName) {
                adminEditPreviewName.textContent = `${track.artist ? track.artist + ' - ' : ''}${track.title}`;
            }
            if (adminEditPreviewDuration) {
                adminEditPreviewDuration.textContent = `${track.duration || 0} ${getText('secondsShort') || 'сек.'}`;
            }
            if (adminEditPreviewSource) {
                let sourceText = 'URL';
                if (track.audioUrl) {
                    if (track.audioUrl.startsWith('indexeddb://')) {
                        sourceText = 'IndexedDB (Local)';
                    } else if (track.audioUrl.includes('supabase.co')) {
                        sourceText = 'Supabase Storage (CDN)';
                    } else if (track.audioUrl.includes('catbox.moe')) {
                        sourceText = `Catbox.moe (${track.audioUrl.split('/').pop()})`;
                    } else {
                        try {
                            const u = new URL(track.audioUrl);
                            sourceText = `${u.hostname} (${track.audioUrl.split('/').pop()})`;
                        } catch (_) {
                            sourceText = track.audioUrl.slice(0, 35) + '...';
                        }
                    }
                }
                adminEditPreviewSource.textContent = sourceText;
            }

            resetEditFileInput();
            if (adminEditProgressWrap) adminEditProgressWrap.style.display = 'none';
            if (adminEditProgressBar) adminEditProgressBar.style.width = '0%';
            if (adminEditSaveBtn) {
                adminEditSaveBtn.disabled = false;
                adminEditSaveBtn.innerText = getText('adminSaveTrackChanges') || 'Зберегти зміни';
            }

            adminEditModal.classList.remove('hidden');
        }

        function closeAdminEditModal() {
            if (adminEditModal) adminEditModal.classList.add('hidden');
            resetEditFileInput();
        }

        if (adminEditCloseBtn) adminEditCloseBtn.onclick = closeAdminEditModal;
        if (adminEditCancelBtn) adminEditCancelBtn.onclick = closeAdminEditModal;
        if (adminEditModal) {
            adminEditModal.addEventListener('mousedown', (e) => {
                if (e.target === adminEditModal) closeAdminEditModal();
            });
        }

        if (adminEditFileInput) {
            adminEditFileInput.addEventListener('change', async (e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                editSelectedFile = file;

                if (adminEditFileLabel) {
                    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
                    adminEditFileLabel.textContent = `✓ ${file.name} (${sizeMb} MB)`;
                    const parentLabel = adminEditFileLabel.closest('label');
                    if (parentLabel) {
                        parentLabel.style.background = 'rgba(16, 185, 129, 0.16)';
                        parentLabel.style.borderColor = 'rgba(16, 185, 129, 0.6)';
                        parentLabel.style.color = '#34d399';
                    }
                }

                if (adminEditFileInfo) {
                    adminEditFileInfo.style.display = 'flex';
                    adminEditFileInfo.className = 'duration-feedback-row calculating';
                    adminEditFileInfo.innerHTML = `${icons.refresh(13)} <span>${getText('adminDurationCalculating') || 'Розрахунок тривалості...'}</span>`;
                }

                try {
                    const dur = await calculateAudioDuration(file);
                    if (dur > 0 && adminEditDurationInput) {
                        adminEditDurationInput.value = dur;
                        if (adminEditFileInfo) {
                            adminEditFileInfo.className = 'duration-feedback-row success';
                            adminEditFileInfo.innerHTML = `${icons.check(13)} <span>${getText('adminDurationDetected') || 'Авто-визначено:'} <strong>${dur} ${getText('secondsShort') || 'сек.'}</strong></span>`;
                        }
                    } else if (adminEditFileInfo) {
                        adminEditFileInfo.style.display = 'none';
                    }
                } catch (err) {
                    console.warn('Edit file duration calculation error:', err);
                    if (adminEditFileInfo) adminEditFileInfo.style.display = 'none';
                }
            });
        }

        if (adminEditUrlInput) {
            adminEditUrlInput.addEventListener('input', () => {
                const url = adminEditUrlInput.value.trim();
                if (!url && adminEditUrlFeedback) {
                    adminEditUrlFeedback.innerHTML = '';
                }
            });
            adminEditUrlInput.addEventListener('change', async () => {
                const url = adminEditUrlInput.value.trim();
                if (!url) return;
                if (adminEditUrlFeedback) {
                    adminEditUrlFeedback.className = 'duration-feedback-row calculating';
                    adminEditUrlFeedback.innerHTML = `${icons.refresh(13)} <span>${getText('adminDurationCalculating') || 'Аналіз тривалості...'}</span>`;
                }
                try {
                    const dur = await calculateAudioDurationFromUrl(url);
                    if (dur > 0 && adminEditDurationInput) {
                        adminEditDurationInput.value = dur;
                        if (adminEditUrlFeedback) {
                            adminEditUrlFeedback.className = 'duration-feedback-row success';
                            adminEditUrlFeedback.innerHTML = `${icons.check(13)} <span>${getText('adminDurationDetected') || 'Авто-визначено:'} <strong>${dur} ${getText('secondsShort') || 'сек.'}</strong></span>`;
                        }
                    } else if (adminEditUrlFeedback) {
                        adminEditUrlFeedback.innerHTML = '';
                    }
                } catch (_) {
                    if (adminEditUrlFeedback) adminEditUrlFeedback.innerHTML = '';
                }
            });
        }

        if (adminEditForm) {
            adminEditForm.onsubmit = async (e) => {
                e.preventDefault();
                const trackId = adminEditTrackId ? adminEditTrackId.value : null;
                if (!trackId) return;

                const title = adminEditTitleInput ? adminEditTitleInput.value.trim() : '';
                const artist = adminEditArtistInput ? adminEditArtistInput.value.trim() : '';
                const duration = adminEditDurationInput ? parseFloat(adminEditDurationInput.value) : 0;
                const newUrl = adminEditUrlInput ? adminEditUrlInput.value.trim() : '';
                const oldStoragePath = adminEditOldStoragePath ? adminEditOldStoragePath.value : null;

                if (!title) {
                    alert(getText('adminSpecifyTitle') || 'Вкажіть назву треку.');
                    return;
                }

                try {
                    if (adminEditSaveBtn) {
                        adminEditSaveBtn.disabled = true;
                        adminEditSaveBtn.innerText = getText('adminSavingTrack') || 'Збереження треку...';
                    }

                    if (editSelectedFile && adminEditProgressWrap) {
                        adminEditProgressWrap.style.display = 'block';
                        if (adminEditProgressBar) adminEditProgressBar.style.width = '0%';
                        if (adminEditProgressPct) adminEditProgressPct.textContent = '0%';
                    }

                    await updateTrackAdmin({
                        trackId,
                        file: editSelectedFile,
                        title,
                        artist,
                        duration,
                        audioUrl: newUrl || null,
                        oldStoragePath,
                        onProgress: (pct) => {
                            if (adminEditProgressWrap) adminEditProgressWrap.style.display = 'block';
                            if (adminEditProgressBar) adminEditProgressBar.style.width = `${pct}%`;
                            if (adminEditProgressPct) adminEditProgressPct.textContent = `${pct}%`;
                            if (adminEditProgressText) {
                                adminEditProgressText.textContent = `${getText('adminUploadingProgress') || 'Завантаження:'} ${pct}%`;
                            }
                        }
                    });

                    // Invalidate audio buffer and tile map cache for this track
                    audioBufferCache.delete(trackId);
                    tileMapCache.delete(trackId);

                    showNotification(getText('adminTrackUpdatedSuccess') || 'Трек успішно оновлено!');
                    closeAdminEditModal();
                    await renderAdminTrackList();
                    await loadCloudSongs();
                } catch (err) {
                    console.error('Помилка оновлення треку:', err);
                    alert((getText('adminTrackUpdateError') || 'Помилка оновлення треку: ') + (err.message || err));
                    if (adminEditSaveBtn) {
                        adminEditSaveBtn.disabled = false;
                        adminEditSaveBtn.innerText = getText('adminSaveTrackChanges') || 'Зберегти зміни';
                    }
                }
            };
        }

        // ==========================================
        // Керування результатами гравців (Player Scores Admin Editor)
        // ==========================================
        const adminTabBtnTracks = document.getElementById('admin-tab-btn-tracks');
        const adminTabBtnScores = document.getElementById('admin-tab-btn-scores');
        const adminTabBtnThemes = document.getElementById('admin-tab-btn-themes');
        const adminTabTracksView = document.getElementById('admin-tab-tracks-view');
        const adminTabScoresView = document.getElementById('admin-tab-scores-view');
        const adminTabThemesView = document.getElementById('admin-tab-themes-view');
        const adminThemesList = document.getElementById('admin-themes-list');
        const adminBtnSaveAllThemes = document.getElementById('admin-btn-save-all-themes');

        const adminSelectLevel = document.getElementById('admin-select-level');
        const adminPlayerSearch = document.getElementById('admin-player-search');
        const adminSelectPlayer = document.getElementById('admin-select-player');
        const adminInputScore = document.getElementById('admin-input-score');
        const adminInputStars = document.getElementById('admin-input-stars');
        const adminInputDifficulty = document.getElementById('admin-input-difficulty');
        const adminInputIsHardcore = document.getElementById('admin-input-is-hardcore');
        const adminStarTypesSelector = document.getElementById('admin-star-types-selector');
        const adminBtnSaveScore = document.getElementById('admin-btn-save-score');
        const adminBtnResetScore = document.getElementById('admin-btn-reset-score');
        const adminBtnRenamePlayer = document.getElementById('admin-btn-rename-player');
        const adminBtnDeletePlayer = document.getElementById('admin-btn-delete-player');
        const adminRefreshScoresBtn = document.getElementById('admin-refresh-scores-btn');
        const adminLevelPlayersTbody = document.getElementById('admin-level-players-tbody');
        const adminEditPlayerTitle = document.getElementById('admin-edit-player-title');
        const adminEditPlayerSubtitle = document.getElementById('admin-edit-player-subtitle');
        const adminEditStatusBadge = document.getElementById('admin-edit-status-badge');

        // Елементи керування монетами гравця
        const adminCoinsEditorCard = document.getElementById('admin-coins-editor-card');
        const adminCoinsPlayerName = document.getElementById('admin-coins-player-name');
        const adminCoinsCurrentVal = document.getElementById('admin-coins-current-val');
        const adminInputPlayerCoins = document.getElementById('admin-input-player-coins');
        const adminBtnSaveCoins = document.getElementById('admin-btn-save-coins');
        const adminBtnSelectSelf = document.getElementById('admin-btn-select-self');
        const adminCoinQuickAddBtns = document.querySelectorAll('.admin-coin-quick-add');

        // Ініціалізація іконок для вкладок та кнопок
        const tabIconTracks = document.querySelector('.admin-tab-icon-tracks');
        if (tabIconTracks) tabIconTracks.innerHTML = icons.music(16);
        const tabIconScores = document.querySelector('.admin-tab-icon-scores');
        if (tabIconScores) tabIconScores.innerHTML = icons.users(16);
        const tabIconThemes = document.querySelector('.admin-tab-icon-themes');
        if (tabIconThemes) tabIconThemes.innerHTML = icons.palette ? icons.palette(16) : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`;
        const btnIconTrash = document.querySelector('.btn-icon-trash');
        if (btnIconTrash) btnIconTrash.innerHTML = icons.trash(14);
        const btnIconTrashPlayer = document.querySelector('.btn-icon-trash-player');
        if (btnIconTrashPlayer) btnIconTrashPlayer.innerHTML = icons.trash(14);
        const btnIconReset = document.querySelector('.btn-icon-reset');
        if (btnIconReset) btnIconReset.innerHTML = icons.refresh(14);
        const btnIconSave = document.querySelector('.btn-icon-save');
        if (btnIconSave) btnIconSave.innerHTML = icons.save(15);
        const adminLbIcon = document.querySelector('.admin-lb-icon');
        if (adminLbIcon) adminLbIcon.innerHTML = icons.trophy(16);

        let adminCurrentStarTypes = [0, 0, 0, 0, 0];
        let adminCachedPlayers = [];

        // Перемикання вкладок в адмінці
        function switchAdminTab(tab) {
            playClick();
            adminTabBtnTracks?.classList.toggle('active', tab === 'tracks');
            adminTabBtnScores?.classList.toggle('active', tab === 'scores');
            adminTabBtnThemes?.classList.toggle('active', tab === 'themes');

            adminTabTracksView?.classList.toggle('hidden', tab !== 'tracks');
            adminTabScoresView?.classList.toggle('hidden', tab !== 'scores');
            adminTabThemesView?.classList.toggle('hidden', tab !== 'themes');

            if (tab === 'scores') {
                initAdminScoresView();
            } else if (tab === 'themes') {
                initAdminThemesView();
            }
        }

        if (adminTabBtnTracks) adminTabBtnTracks.onclick = () => switchAdminTab('tracks');
        if (adminTabBtnScores) adminTabBtnScores.onclick = () => switchAdminTab('scores');
        if (adminTabBtnThemes) adminTabBtnThemes.onclick = () => switchAdminTab('themes');

        // Отримання повного списку гравців з Firestore
        async function fetchAllAdminPlayers() {
            const playersMap = new Map();

            // 1. Колекція users
            try {
                const usersSnap = await getDocs(collection(db, "users"));
                usersSnap.forEach(d => {
                    const u = d.data();
                    const name = u.username || u.name || ("Player_" + d.id.slice(0, 5));
                    const isAdmin = Boolean(u.isAdmin || u.role === 'admin');
                    playersMap.set(d.id, { id: d.id, name: name, isAdmin: isAdmin });
                });
            } catch (e) { console.warn("Fetch users for admin:", e); }

            // 2. Колекція global_leaderboard
            try {
                const lbSnap = await getDocs(collection(db, "global_leaderboard"));
                lbSnap.forEach(d => {
                    const l = d.data();
                    if (!playersMap.has(d.id)) {
                        playersMap.set(d.id, { id: d.id, name: l.name || ("Player_" + d.id.slice(0, 5)), isAdmin: false });
                    }
                });
            } catch (e) { console.warn("Fetch lb for admin:", e); }

            // 3. Колекція user_progress
            try {
                const progSnap = await getDocs(collection(db, "user_progress"));
                progSnap.forEach(d => {
                    if (!playersMap.has(d.id)) {
                        playersMap.set(d.id, { id: d.id, name: "Player_" + d.id.slice(0, 5), isAdmin: false });
                    }
                });
            } catch (e) { console.warn("Fetch prog for admin:", e); }

            // Додаємо локального гравця якщо відсутній
            const currentU = getCurrentUser();
            const localPlayerId = currentU?.id || localStorage.getItem('playerId');
            const localPlayerName = currentU?.username || localStorage.getItem('playerName');
            const isLocalAdmin = Boolean(currentU?.isAdmin || currentU?.role === 'admin');
            if (localPlayerId && !playersMap.has(localPlayerId)) {
                playersMap.set(localPlayerId, { id: localPlayerId, name: localPlayerName || "Гравець", isAdmin: isLocalAdmin });
            } else if (localPlayerId && playersMap.has(localPlayerId) && isLocalAdmin) {
                playersMap.get(localPlayerId).isAdmin = true;
            }

            adminCachedPlayers = Array.from(playersMap.values()).sort((a, b) => a.name.localeCompare(b.name));
            return adminCachedPlayers;
        }

        // Рендеринг інтерактивних кнопок вибору типів зірок (0 = None, 1 = Gold, 2 = Diamond)
        function renderAdminStarTypesSelector() {
            if (!adminStarTypesSelector) return;
            adminStarTypesSelector.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const type = adminCurrentStarTypes[i] || 0;
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `admin-star-toggle ${type === 1 ? 'gold' : type === 2 ? 'diamond' : ''}`;
                btn.title = `Зірка ${i + 1}: ${type === 2 ? (getText('adminStarDiamond') || 'Діамант') : type === 1 ? (getText('adminStarGold') || 'Золото') : 'Пуста'}`;
                
                if (type === 2) {
                    btn.innerHTML = icons.diamond(20);
                } else if (type === 1) {
                    btn.innerHTML = icons.starFilled(20);
                } else {
                    btn.innerHTML = icons.starEmpty(20);
                }

                btn.onclick = () => {
                    playClick();
                    adminCurrentStarTypes[i] = (type + 1) % 3;
                    let activeCount = 0;
                    for (let j = 0; j < 5; j++) {
                        if (adminCurrentStarTypes[j] > 0) activeCount++;
                    }
                    if (adminInputStars) adminInputStars.value = String(activeCount);
                    renderAdminStarTypesSelector();
                };

                adminStarTypesSelector.appendChild(btn);
            }
        }

        if (adminInputStars) {
            adminInputStars.onchange = () => {
                const count = parseInt(adminInputStars.value, 10) || 0;
                for (let i = 0; i < 5; i++) {
                    if (i < count) {
                        if (adminCurrentStarTypes[i] === 0) adminCurrentStarTypes[i] = 1;
                    } else {
                        adminCurrentStarTypes[i] = 0;
                    }
                }
                renderAdminStarTypesSelector();
            };
        }

        function renderAdminPlayerOptions(filterQuery = '') {
            if (!adminSelectPlayer) return;
            const q = (filterQuery || '').trim().toLowerCase();
            const currentVal = adminSelectPlayer.value;
            adminSelectPlayer.innerHTML = '';

            const filtered = adminCachedPlayers.filter(p => {
                if (!q) return true;
                return (p.name || '').toLowerCase().includes(q) || (p.id || '').toLowerCase().includes(q);
            });

            if (filtered.length === 0) {
                const opt = document.createElement('option');
                opt.value = '';
                opt.textContent = `(${getText('adminNoPlayersFound') || 'Гравців не знайдено'})`;
                adminSelectPlayer.appendChild(opt);
                return;
            }

            filtered.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = `${p.name} (id: ${p.id.slice(0, 6)}...)`;
                adminSelectPlayer.appendChild(opt);
            });

            if (filtered.some(p => p.id === currentVal)) {
                adminSelectPlayer.value = currentVal;
            } else if (filtered.length > 0) {
                adminSelectPlayer.value = filtered[0].id;
            }
        }

        if (adminPlayerSearch) {
            adminPlayerSearch.oninput = async (e) => {
                renderAdminPlayerOptions(e.target.value);
                await loadSelectedPlayerScore();
                highlightSelectedPlayerInLevelTable();
            };
        }

        // Ініціалізація вкладки редактора результатів
        async function initAdminScoresView() {
            if (!adminSelectLevel || !adminSelectPlayer) return;

            // 1. Заповнюємо список рівнів з songsDB
            const currentLevelVal = adminSelectLevel.value;
            adminSelectLevel.innerHTML = '';
            songsDB.forEach((song) => {
                if (!song || !song.title) return;
                const opt = document.createElement('option');
                opt.value = song.title;
                opt.textContent = `${song.title} (${song.artist || 'Невідомий'})${song.isSecret ? ' [SECRET]' : ''}`;
                adminSelectLevel.appendChild(opt);
            });

            if (currentLevelVal && Array.from(adminSelectLevel.options).some(o => o.value === currentLevelVal)) {
                adminSelectLevel.value = currentLevelVal;
            } else if (adminSelectLevel.options.length > 0) {
                adminSelectLevel.selectedIndex = 0;
            }

            // 2. Завантажуємо гравців
            adminSelectPlayer.innerHTML = `<option value="">(Завантаження гравців...)</option>`;
            await fetchAllAdminPlayers();

            renderAdminPlayerOptions(adminPlayerSearch?.value || '');

            const curU = getCurrentUser();
            const preferredId = curU?.id || (adminCachedPlayers[0]?.id || '');
            if (preferredId && Array.from(adminSelectPlayer.options).some(o => o.value === preferredId)) {
                adminSelectPlayer.value = preferredId;
            }

            // Завантажуємо дані для поточної пари
            await loadSelectedPlayerScore();
            await renderAdminLevelLeaderboard(adminSelectLevel.value);
        }

        // Завантаження результатів конкретного гравця на обраному треку
        async function loadSelectedPlayerScore() {
            const trackTitle = adminSelectLevel?.value;
            const userId = adminSelectPlayer?.value;
            if (!trackTitle || !userId) return;

            const playerObj = adminCachedPlayers.find(p => p.id === userId);
            const playerName = playerObj ? playerObj.name : userId;

            if (adminEditPlayerTitle) {
                adminEditPlayerTitle.textContent = `${getText('adminEditScoreTitle') || 'Редагування результату'}: ${playerName}`;
            }
            if (adminEditPlayerSubtitle) {
                adminEditPlayerSubtitle.textContent = `Трек: "${trackTitle}" • ID: ${userId}`;
            }

            try {
                const progressRef = doc(db, "user_progress", userId);
                const snap = await getDoc(progressRef);
                const tracks = snap.exists() ? (snap.data().tracks || {}) : {};
                const safeKey = toFirestoreTrackKey(trackTitle);

                let trackData = tracks[safeKey] || null;
                if (!trackData) {
                    for (const [k, v] of Object.entries(tracks)) {
                        if (v && (v.title === trackTitle || fromFirestoreTrackKey(k, v) === trackTitle)) {
                            trackData = v;
                            break;
                        }
                    }
                }

                if (trackData) {
                    if (adminInputScore) adminInputScore.value = trackData.score || 0;
                    if (adminInputStars) adminInputStars.value = trackData.stars || 0;
                    if (adminInputDifficulty) adminInputDifficulty.value = trackData.difficulty || '';
                    if (adminInputIsHardcore) adminInputIsHardcore.checked = Boolean(trackData.isHardcore || trackData.difficulty === 'hardcore');

                    adminCurrentStarTypes = Array.isArray(trackData.starTypes) 
                        ? [...trackData.starTypes] 
                        : [0, 0, 0, 0, 0];
                    while (adminCurrentStarTypes.length < 5) adminCurrentStarTypes.push(0);

                    if (adminEditStatusBadge) {
                        adminEditStatusBadge.innerHTML = `<span style="font-size:0.75rem; padding:3px 10px; border-radius:12px; background:rgba(52,211,153,0.15); color:#34d399; border:1px solid rgba(52,211,153,0.3); font-weight:700;">Пройдено: ${(trackData.score || 0).toLocaleString()}</span>`;
                    }
                } else {
                    if (adminInputScore) adminInputScore.value = 0;
                    if (adminInputStars) adminInputStars.value = 0;
                    if (adminInputDifficulty) adminInputDifficulty.value = '';
                    if (adminInputIsHardcore) adminInputIsHardcore.checked = false;
                    adminCurrentStarTypes = [0, 0, 0, 0, 0];

                    if (adminEditStatusBadge) {
                        adminEditStatusBadge.innerHTML = `<span style="font-size:0.75rem; padding:3px 10px; border-radius:12px; background:rgba(255,255,255,0.08); color:var(--text-secondary); border:1px solid rgba(255,255,255,0.1);">Немає запису</span>`;
                    }
                }

                // Оновлюємо інформацію про монети обраного гравця
                let playerBonus = 0;
                let playerSpent = 0;
                let playerEarned = 0;

                const curU = getCurrentUser();
                const localPlayerId = curU?.id || localStorage.getItem('playerId');
                const isCurrentSelf = (userId === localPlayerId);

                if (isCurrentSelf) {
                    const cData = FieldThemes.getCoinsData(songsDB);
                    playerEarned = cData.earned;
                    playerBonus = cData.bonus;
                    playerSpent = cData.spent;
                } else if (snap.exists()) {
                    const pData = snap.data();
                    playerBonus = Number(pData.bonusCoins) || 0;
                    playerSpent = Number(pData.spentCoins) || 0;
                    if (pData.tracks) {
                        for (const tr of Object.values(pData.tracks)) {
                            if (tr && tr.stars > 0) {
                                const starCoins = Math.min(3, Math.max(0, tr.stars || 0));
                                let hasDiamond = false;
                                if (Array.isArray(tr.starTypes)) {
                                    hasDiamond = tr.starTypes.some(t => t === 2);
                                }
                                playerEarned += (starCoins + (hasDiamond ? 3 : 0));
                            }
                        }
                    }
                }

                const currentCoinsBalance = Math.max(0, playerEarned + playerBonus - playerSpent);
                if (adminCoinsPlayerName) adminCoinsPlayerName.textContent = `${playerName} (ID: ${userId})`;
                if (adminCoinsCurrentVal) adminCoinsCurrentVal.textContent = currentCoinsBalance;
                if (adminInputPlayerCoins) adminInputPlayerCoins.value = currentCoinsBalance;

                renderAdminStarTypesSelector();
                updateAdminDeleteBtnState();
            } catch (err) {
                console.error("Помилка завантаження результату гравця:", err);
            }
        }

        // Оновлення стану кнопки видалення в адмінці (захист адміна)
        function updateAdminDeleteBtnState() {
            if (!adminBtnDeletePlayer) return;
            const userId = adminSelectPlayer?.value;
            const playerObj = adminCachedPlayers.find(p => p.id === userId);
            if (playerObj?.isAdmin) {
                adminBtnDeletePlayer.disabled = true;
                adminBtnDeletePlayer.title = getText('adminCannotBeDeleted') || 'Акаунт адміністратора захищено від видалення.';
                adminBtnDeletePlayer.style.opacity = '0.4';
                adminBtnDeletePlayer.style.cursor = 'not-allowed';
            } else {
                adminBtnDeletePlayer.disabled = false;
                adminBtnDeletePlayer.title = getText('adminDeletePlayerTooltip') || 'Видалити гравця та всі його дані';
                adminBtnDeletePlayer.style.opacity = '1';
                adminBtnDeletePlayer.style.cursor = 'pointer';
            }
        }

        if (adminSelectLevel) {
            adminSelectLevel.onchange = async () => {
                playClick();
                await loadSelectedPlayerScore();
                await renderAdminLevelLeaderboard(adminSelectLevel.value);
            };
        }

        if (adminSelectPlayer) {
            adminSelectPlayer.onchange = async () => {
                playClick();
                await loadSelectedPlayerScore();
                highlightSelectedPlayerInLevelTable();
                updateAdminDeleteBtnState();
            };
        }

        if (adminRefreshScoresBtn) {
            adminRefreshScoresBtn.onclick = async () => {
                playClick();
                await loadSelectedPlayerScore();
                await renderAdminLevelLeaderboard(adminSelectLevel?.value);
            };
        }

        // Швидкий вибір власного акаунта (Адмін)
        if (adminBtnSelectSelf) {
            adminBtnSelectSelf.onclick = async () => {
                playClick();
                const curU = getCurrentUser();
                const myId = curU?.id || localStorage.getItem('playerId');
                if (myId && adminSelectPlayer) {
                    if (!Array.from(adminSelectPlayer.options).some(o => o.value === myId)) {
                        const opt = document.createElement('option');
                        opt.value = myId;
                        opt.textContent = `${curU?.username || 'Адмін'} (id: ${myId.slice(0, 6)}...)`;
                        adminSelectPlayer.appendChild(opt);
                    }
                    adminSelectPlayer.value = myId;
                    await loadSelectedPlayerScore();
                    highlightSelectedPlayerInLevelTable();
                    updateAdminDeleteBtnState();
                }
            };
        }

        // Швидкі кнопки додавання монет (+50, +100, +500, +1000)
        if (adminCoinQuickAddBtns) {
            adminCoinQuickAddBtns.forEach(btn => {
                btn.onclick = () => {
                    playClick();
                    const addVal = parseInt(btn.getAttribute('data-add'), 10) || 0;
                    const curVal = parseInt(adminInputPlayerCoins?.value, 10) || 0;
                    if (adminInputPlayerCoins) {
                        adminInputPlayerCoins.value = Math.max(0, curVal + addVal);
                    }
                };
            });
        }

        // Збереження / накрутка балансу монет гравця через адмінку
        if (adminBtnSaveCoins) {
            adminBtnSaveCoins.onclick = async () => {
                const userId = adminSelectPlayer?.value;
                if (!userId) {
                    alert(getText('adminChoosePlayerFirst') || 'Оберіть гравця.');
                    return;
                }

                playClick();
                adminBtnSaveCoins.disabled = true;
                adminBtnSaveCoins.innerText = 'Збереження...';

                try {
                    const targetBalance = Math.max(0, parseInt(adminInputPlayerCoins?.value, 10) || 0);

                    const progressRef = doc(db, "user_progress", userId);
                    const snap = await getDoc(progressRef);
                    const pData = snap.exists() ? snap.data() : {};
                    const curSpent = Number(pData.spentCoins) || 0;

                    let earnedCoins = 0;
                    if (pData.tracks) {
                        for (const tr of Object.values(pData.tracks)) {
                            if (tr && tr.stars > 0) {
                                const starCoins = Math.min(3, Math.max(0, tr.stars || 0));
                                let hasDiamond = false;
                                if (Array.isArray(tr.starTypes)) {
                                    hasDiamond = tr.starTypes.some(t => t === 2);
                                }
                                earnedCoins += (starCoins + (hasDiamond ? 3 : 0));
                            }
                        }
                    }

                    const curU = getCurrentUser();
                    const localPlayerId = curU?.id || localStorage.getItem('playerId');
                    const isSelf = (userId === localPlayerId);
                    if (isSelf) {
                        earnedCoins = FieldThemes.calculateEarnedCoins(songsDB);
                    }

                    // bonus = targetBalance + spent - earned
                    const newBonus = Math.max(0, targetBalance + curSpent - earnedCoins);

                    // Оновлюємо user_progress у Firestore
                    await setDoc(progressRef, {
                        userId: userId,
                        bonusCoins: newBonus,
                        updatedAt: serverTimestamp()
                    }, { merge: true });

                    // Якщо це поточний користувач — оновлюємо локальне сховище та інтерфейс магазину
                    if (isSelf) {
                        FieldThemes.setBonusCoins(newBonus);
                        if (typeof updateShopCoins === 'function') updateShopCoins();
                        if (typeof renderShop === 'function') renderShop();
                    }

                    showNotification(getText('adminCoinsSavedSuccess') || 'Баланс монет успішно оновлено!');
                    await loadSelectedPlayerScore();
                } catch (err) {
                    console.error("Помилка збереження монет:", err);
                    alert("Помилка: " + (err.message || err));
                } finally {
                    adminBtnSaveCoins.disabled = false;
                    adminBtnSaveCoins.innerHTML = `<span>💾</span> <span data-i18n="adminSaveCoins">${getText('adminSaveCoins') || 'Зберегти монети'}</span>`;
                }
            };
        }

        // Збереження оновленого результату через адмінку
        if (adminBtnSaveScore) {
            adminBtnSaveScore.onclick = async () => {
                const trackTitle = adminSelectLevel?.value;
                const userId = adminSelectPlayer?.value;
                if (!trackTitle) {
                    alert(getText('adminChooseLevelFirst') || 'Оберіть рівень.');
                    return;
                }
                if (!userId) {
                    alert(getText('adminChoosePlayerFirst') || 'Оберіть гравця.');
                    return;
                }

                playClick();
                adminBtnSaveScore.disabled = true;
                adminBtnSaveScore.innerText = 'Збереження...';

                try {
                    const newScore = Math.max(0, parseInt(adminInputScore?.value, 10) || 0);
                    const newStars = parseInt(adminInputStars?.value, 10) || 0;
                    const newDiff = adminInputDifficulty?.value || '';
                    const isHardcore = Boolean(adminInputIsHardcore?.checked);
                    const starTypes = [...adminCurrentStarTypes];
                    while (starTypes.length < 5) starTypes.push(0);

                    const progressRef = doc(db, "user_progress", userId);
                    const snap = await getDoc(progressRef);
                    const currentData = snap.exists() ? snap.data() : { tracks: {} };
                    const currentTracks = currentData.tracks || {};
                    const safeKey = toFirestoreTrackKey(trackTitle);

                    const existingTrack = currentTracks[safeKey] || {};
                    const existingCompleted = Array.isArray(existingTrack.completedDifficulties) 
                        ? existingTrack.completedDifficulties 
                        : (existingTrack.difficulty ? [existingTrack.difficulty] : []);

                    const completedSet = new Set(existingCompleted);
                    if (newDiff) completedSet.add(newDiff);
                    if (isHardcore) completedSet.add('hardcore');
                    const finalCompletedDiffs = Array.from(completedSet).filter(Boolean);

                    const trackPayload = {
                        title: trackTitle,
                        score: newScore,
                        stars: newStars,
                        starTypes: starTypes,
                        difficulty: isHardcore ? 'hardcore' : newDiff,
                        isHardcore: isHardcore,
                        completedDifficulties: finalCompletedDiffs
                    };

                    currentTracks[safeKey] = trackPayload;

                    // 1. Оновлюємо user_progress
                    await setDoc(progressRef, {
                        userId: userId,
                        tracks: currentTracks,
                        updatedAt: serverTimestamp()
                    }, { merge: true });

                    // 2. Перераховуємо global_leaderboard
                    let totalScore = 0;
                    let levelsCompleted = 0;
                    const counted = new Set();
                    songsDB.forEach(s => {
                        if (!s || !s.title || s.isSecret) return;
                        counted.add(s.title);
                        const sk = toFirestoreTrackKey(s.title);
                        const tr = currentTracks[sk] || Object.values(currentTracks).find(v => v && v.title === s.title);
                        if (tr && tr.stars > 0) {
                            levelsCompleted++;
                            totalScore += (tr.score || 0);
                        }
                    });

                    const playerObj = adminCachedPlayers.find(p => p.id === userId);
                    const playerName = playerObj ? playerObj.name : ("Player_" + userId.slice(0, 5));

                    await setDoc(doc(db, "global_leaderboard", userId), {
                        userId: userId,
                        name: playerName,
                        totalScore: totalScore,
                        levelsCompleted: levelsCompleted,
                        updatedAt: serverTimestamp()
                    }, { merge: true });

                    // 3. Якщо це поточний гравець — оновлюємо localStorage
                    const curU = getCurrentUser();
                    const localPlayerId = curU?.id || localStorage.getItem('playerId');
                    if (userId === localPlayerId) {
                        localStorage.setItem(`neon_rhythm_${trackTitle}`, JSON.stringify(trackPayload));
                        if (typeof renderMenu === 'function') renderMenu();
                    }

                    showNotification(getText('adminScoreSavedSuccess') || 'Результат збережено!');
                    await loadSelectedPlayerScore();
                    await renderAdminLevelLeaderboard(trackTitle);
                } catch (err) {
                    console.error("Помилка збереження результату:", err);
                    alert("Помилка: " + (err.message || err));
                } finally {
                    adminBtnSaveScore.disabled = false;
                    adminBtnSaveScore.innerHTML = `${icons.save(15)} <span>${getText('adminSaveScore') || 'Зберегти результат'}</span>`;
                }
            };
        }

        // Скидання результату до 0
        if (adminBtnResetScore) {
            adminBtnResetScore.onclick = async () => {
                const trackTitle = adminSelectLevel?.value;
                const userId = adminSelectPlayer?.value;
                if (!trackTitle || !userId) return;

                const playerObj = adminCachedPlayers.find(p => p.id === userId);
                const playerName = playerObj ? playerObj.name : userId;

                const confirmPrompt = (getText('adminConfirmResetScore') || 'Скинути результат для треку "{title}" гравця "{player}"?')
                    .replace('{title}', trackTitle)
                    .replace('{player}', playerName);

                const isConfirmed = await showCustomConfirm({
                    title: getText('confirmTitle') || 'Підтвердження',
                    message: confirmPrompt,
                    confirmText: getText('confirmBtn') || 'Підтвердити',
                    cancelText: getText('cancel') || 'Скасувати',
                    danger: true
                });
                if (!isConfirmed) return;

                playClick();
                adminBtnResetScore.disabled = true;

                try {
                    const progressRef = doc(db, "user_progress", userId);
                    const snap = await getDoc(progressRef);
                    const currentData = snap.exists() ? snap.data() : { tracks: {} };
                    const currentTracks = currentData.tracks || {};
                    const safeKey = toFirestoreTrackKey(trackTitle);

                    const trackPayload = {
                        title: trackTitle,
                        score: 0,
                        stars: 0,
                        starTypes: [0, 0, 0, 0, 0],
                        difficulty: '',
                        isHardcore: false,
                        completedDifficulties: []
                    };

                    currentTracks[safeKey] = trackPayload;

                    await setDoc(progressRef, {
                        userId: userId,
                        tracks: currentTracks,
                        updatedAt: serverTimestamp()
                    }, { merge: true });

                    // Перераховуємо рейтинг
                    let totalScore = 0;
                    let levelsCompleted = 0;
                    songsDB.forEach(s => {
                        if (!s || !s.title || s.isSecret) return;
                        const sk = toFirestoreTrackKey(s.title);
                        const tr = currentTracks[sk] || Object.values(currentTracks).find(v => v && v.title === s.title);
                        if (tr && tr.stars > 0) {
                            levelsCompleted++;
                            totalScore += (tr.score || 0);
                        }
                    });

                    await setDoc(doc(db, "global_leaderboard", userId), {
                        userId: userId,
                        name: playerName,
                        totalScore: totalScore,
                        levelsCompleted: levelsCompleted,
                        updatedAt: serverTimestamp()
                    }, { merge: true });

                    const curU = getCurrentUser();
                    const localPlayerId = curU?.id || localStorage.getItem('playerId');
                    if (userId === localPlayerId) {
                        localStorage.setItem(`neon_rhythm_${trackTitle}`, JSON.stringify(trackPayload));
                        if (typeof renderMenu === 'function') renderMenu();
                    }

                    showNotification(getText('adminScoreResetSuccess') || 'Результат скинуто до 0.');
                    await loadSelectedPlayerScore();
                    await renderAdminLevelLeaderboard(trackTitle);
                } catch (err) {
                    console.error("Помилка скидання результату:", err);
                    alert("Помилка: " + (err.message || err));
                } finally {
                    adminBtnResetScore.disabled = false;
                }
            };
        }

        // Повне безповоротне видалення гравця та всіх його даних через адмінку
        async function deletePlayerCompletely(userId, playerName = null) {
            if (!userId) {
                alert(getText('adminChoosePlayerFirst') || 'Будь ласка, оберіть гравця.');
                return;
            }

            const playerObj = adminCachedPlayers.find(p => p.id === userId);
            const resolvedName = playerName || (playerObj ? playerObj.name : userId);

            // Захист акаунта адміністратора від видалення
            if (playerObj?.isAdmin) {
                alert(getText('adminCannotBeDeleted') || 'Акаунт адміністратора захищено від видалення.');
                return;
            }

            const curU = getCurrentUser();
            const localPlayerId = curU?.id || localStorage.getItem('playerId');
            const isSelf = (userId === localPlayerId);

            let confirmMsg = (getText('adminConfirmDeletePlayer') || 'Ви дійсно бажаєте видалити гравця "{player}" (ID: {id}) та всі його дані?')
                .replace('{player}', resolvedName)
                .replace('{id}', userId);

            if (isSelf) {
                confirmMsg += "\n\n" + (getText('adminDeleteSelfWarning') || 'УВАГА: Ви збираєтесь видалити свій власний акаунт!');
            }

            const isConfirmed = await showCustomConfirm({
                title: getText('confirmTitle') || 'Підтвердження',
                message: confirmMsg,
                confirmText: getText('adminDeletePlayer') || 'Видалити гравця',
                cancelText: getText('cancel') || 'Скасувати',
                danger: true,
                showDontAskAgain: true,
                storageKey: 'neon_skip_admin_delete_confirm'
            });
            if (!isConfirmed) return;

            playClick();
            if (adminBtnDeletePlayer) {
                adminBtnDeletePlayer.disabled = true;
                adminBtnDeletePlayer.innerText = getText('adminDeletingPlayer') || 'Видалення...';
            }

            try {
                // Виклик адміністративного сервісу видалення
                await deletePlayerAdmin(userId, resolvedName);

                // Якщо видалено свій акаунт — очищаємо сесію та ізолюємо кеш
                if (isSelf) {
                    logoutUser();
                    clearLocalUserData();
                    initPlayerIdentity();
                    updateHeaderUserBadge();
                    if (typeof renderMenu === 'function') renderMenu();
                }

                // Видаляємо зі списку закешованих гравців
                adminCachedPlayers = adminCachedPlayers.filter(p => p.id !== userId);

                // Оновлюємо випадаючий список гравців
                if (adminSelectPlayer) {
                    renderAdminPlayerOptions(adminPlayerSearch?.value || '');
                }

                // Оновлюємо картку редагування
                if (adminCachedPlayers.length > 0) {
                    await loadSelectedPlayerScore();
                } else {
                    if (adminInputScore) adminInputScore.value = 0;
                    if (adminInputStars) adminInputStars.value = 0;
                    if (adminInputDifficulty) adminInputDifficulty.value = '';
                    if (adminInputIsHardcore) adminInputIsHardcore.checked = false;
                    adminCurrentStarTypes = [0, 0, 0, 0, 0];
                    renderAdminStarTypesSelector();
                    if (adminEditPlayerTitle) adminEditPlayerTitle.textContent = getText('adminEditScoreTitle') || 'Редагування результату';
                    if (adminEditPlayerSubtitle) adminEditPlayerSubtitle.textContent = 'Гравців немає';
                    if (adminEditStatusBadge) adminEditStatusBadge.innerHTML = '';
                }

                // Оновлюємо таблицю результатів рівня
                await renderAdminLevelLeaderboard(adminSelectLevel?.value);

                const successMsg = (getText('adminPlayerDeletedSuccess') || 'Гравця "{player}" та всі його дані успішно видалено!')
                    .replace('{player}', resolvedName);
                showNotification(successMsg);
            } catch (err) {
                console.error("Помилка видалення гравця:", err);
                alert("Помилка при видаленні: " + (err.message || err));
            } finally {
                if (adminBtnDeletePlayer) {
                    adminBtnDeletePlayer.disabled = false;
                    adminBtnDeletePlayer.innerHTML = `<span class="btn-icon-trash-player">${icons.trash(14)}</span> <span data-i18n="adminDeletePlayerBtn">${getText('adminDeletePlayerBtn') || 'Видалити'}</span>`;
                }
            }
        }

        // Зміна імені гравця через адмінку
        async function renamePlayerPrompt(userId, currentName = null) {
            if (!userId) {
                alert(getText('adminChoosePlayerFirst') || 'Будь ласка, оберіть гравця.');
                return;
            }
            const playerObj = adminCachedPlayers.find(p => p.id === userId);
            const resolvedOldName = currentName || (playerObj ? playerObj.name : userId);

            const promptText = (getText('adminPromptNewPlayerName') || 'Введіть нове ім\'я для гравця "{name}":')
                .replace('{name}', resolvedOldName);

            const newNameInput = prompt(promptText, resolvedOldName);
            if (newNameInput === null) return; // Скасовано користувачем
            const cleanNewName = newNameInput.trim();
            if (!cleanNewName) {
                alert(getText('adminPlayerNameEmptyError') || 'Ім\'я гравця не може бути порожнім.');
                return;
            }
            if (cleanNewName === resolvedOldName) return;

            playClick();
            if (adminBtnRenamePlayer) {
                adminBtnRenamePlayer.disabled = true;
            }

            try {
                await updatePlayerNameAdmin(userId, cleanNewName);

                // Оновлюємо закешований список гравців
                if (playerObj) {
                    playerObj.name = cleanNewName;
                    playerObj.username = cleanNewName;
                }

                // Якщо перейменовано свій власний акаунт — оновлюємо сесію і UI
                const curU = getCurrentUser();
                const localPlayerId = curU?.id || localStorage.getItem('playerId');
                if (userId === localPlayerId) {
                    localStorage.setItem('playerName', cleanNewName);
                    if (curU) {
                        curU.name = cleanNewName;
                        curU.username = cleanNewName;
                        curU.displayName = cleanNewName;
                    }
                    updateHeaderUserBadge();
                    if (typeof renderMenu === 'function') renderMenu();
                }

                // Оновлюємо селектор гравців
                if (adminSelectPlayer) {
                    renderAdminPlayerOptions(adminPlayerSearch?.value || '');
                    adminSelectPlayer.value = userId;
                }

                // Оновлюємо картку редагування
                await loadSelectedPlayerScore();

                // Оновлюємо таблицю результатів рівня
                await renderAdminLevelLeaderboard(adminSelectLevel?.value);

                const successMsg = (getText('adminPlayerNameSavedSuccess') || 'Ім\'я гравця успішно змінено на "{name}"!')
                    .replace('{name}', cleanNewName);
                showNotification(successMsg);
            } catch (err) {
                console.error("Помилка зміни імені гравця:", err);
                alert("Помилка при зміні імені: " + (err.message || err));
            } finally {
                if (adminBtnRenamePlayer) {
                    adminBtnRenamePlayer.disabled = false;
                }
            }
        }

        if (adminBtnRenamePlayer) {
            adminBtnRenamePlayer.onclick = async () => {
                const userId = adminSelectPlayer?.value;
                await renamePlayerPrompt(userId);
            };
        }

        if (adminBtnDeletePlayer) {
            adminBtnDeletePlayer.onclick = async () => {
                const userId = adminSelectPlayer?.value;
                await deletePlayerCompletely(userId);
            };
        }

        // Рендеринг таблиці результатів усіх гравців на вибраному рівні
        async function renderAdminLevelLeaderboard(trackTitle) {
            if (!adminLevelPlayersTbody || !trackTitle) return;
            adminLevelPlayersTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color: var(--text-color); opacity: 0.6;">${getText('lbLoading') || 'Завантаження...'}</td></tr>`;

            try {
                const progSnap = await getDocs(collection(db, "user_progress"));
                const safeKey = toFirestoreTrackKey(trackTitle);
                const results = [];

                progSnap.forEach(d => {
                    const userId = d.id;
                    const uData = d.data();
                    const tracks = uData.tracks || {};
                    let tr = tracks[safeKey] || null;
                    if (!tr) {
                        for (const [k, v] of Object.entries(tracks)) {
                            if (v && (v.title === trackTitle || fromFirestoreTrackKey(k, v) === trackTitle)) {
                                tr = v;
                                break;
                            }
                        }
                    }

                    if (tr && ((tr.score || 0) > 0 || (tr.stars || 0) > 0)) {
                        const playerObj = adminCachedPlayers.find(p => p.id === userId);
                        const playerName = playerObj ? playerObj.name : ("Player_" + userId.slice(0, 5));
                        results.push({
                            userId: userId,
                            name: playerName,
                            isAdmin: Boolean(playerObj?.isAdmin),
                            score: Number(tr.score) || 0,
                            stars: Number(tr.stars) || 0,
                            starTypes: tr.starTypes || [],
                            difficulty: tr.difficulty || '',
                            isHardcore: Boolean(tr.isHardcore)
                        });
                    }
                });

                results.sort((a, b) => b.score - a.score);

                adminLevelPlayersTbody.innerHTML = '';
                if (!results.length) {
                    adminLevelPlayersTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color: var(--text-color); opacity: 0.6;">${getText('adminNoPlayerResults') || 'Ще жоден гравець не має результату на цьому рівні.'}</td></tr>`;
                    return;
                }

                const diffLabelMap = { 
                    easy: getText('diffEasy'), 
                    normal: getText('diffNormal'), 
                    hard: getText('diffHard'),
                    hardcore: getText('modHardcore')
                };
                const diffColorMap = { 
                    easy: '#4ade80', 
                    normal: '#facc15', 
                    hard: '#fb923c',
                    hardcore: '#f43f5e'
                };

                results.forEach((res, idx) => {
                    const tr = document.createElement('tr');
                    tr.className = `admin-level-row ${adminSelectPlayer?.value === res.userId ? 'selected' : ''}`;
                    tr.dataset.userId = res.userId;
                    
                    const effDiff = res.isHardcore ? 'hardcore' : (res.difficulty || '');
                    const badgeHtml = effDiff 
                        ? `<span class="track-diff-badge ${effDiff}" style="font-size:0.7rem; padding:2px 7px; border-radius:4px; background:${diffColorMap[effDiff] || '#888'}22; color:${diffColorMap[effDiff] || '#888'}; border:1px solid ${diffColorMap[effDiff] || '#888'}44; display:inline-flex; align-items:center; gap:3px;">${effDiff === 'hardcore' ? icons.skull(11) : ''}${diffLabelMap[effDiff] || effDiff}</span>`
                        : '<span style="opacity:0.4;">—</span>';

                    let starsVisual = '';
                    for (let s = 0; s < 5; s++) {
                        if (s < res.stars) {
                            starsVisual += (res.starTypes[s] === 2) 
                                ? `<span style="color:#38bdf8; margin:0 1px;">${icons.diamond(14)}</span>` 
                                : `<span style="color:#eab308; margin:0 1px;">${icons.starFilled(14)}</span>`;
                        }
                    }

                    const deleteBtnHtml = res.isAdmin
                        ? `<span style="opacity: 0.7; display:inline-flex; align-items:center; justify-content:center; gap:3px; padding: 4px; font-size: 0.72rem; color: #38bdf8;" title="${getText('adminCannotBeDeleted') || 'Акаунт адміністратора захищено від видалення.'}">🛡️ <span class="hidden-xs">${getText('adminProtectedBadge') || 'Захищено'}</span></span>`
                        : `<button type="button" class="admin-row-delete-btn" title="${getText('adminDeletePlayerTooltip') || 'Видалити гравця та всі його дані'}">${icons.trash(13)}</button>`;

                    const actionCellHtml = `
                        <div style="display: inline-flex; align-items: center; justify-content: flex-end; gap: 4px;">
                            <button type="button" class="admin-row-edit-name-btn" title="${getText('adminEditPlayerNameTooltip') || 'Змінити ім\'я гравця'}" style="background: rgba(255,255,255,0.06); border: 1px solid var(--surface-border); border-radius: 4px; color: var(--text-color); cursor: pointer; padding: 3px 6px; font-size: 0.78rem; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s ease;">✏️</button>
                            ${deleteBtnHtml}
                        </div>
                    `;

                    tr.innerHTML = `
                        <td><b>#${idx + 1}</b></td>
                        <td>
                            <span style="font-weight: 600; color: #fff;">${escapeHtml(res.name || 'Unknown')}</span>
                            <span style="font-size: 0.72rem; color: var(--text-secondary); margin-left: 4px;">(${res.userId.slice(0, 5)})</span>
                        </td>
                        <td><b style="color: var(--highlight);">${res.score.toLocaleString()}</b></td>
                        <td>${starsVisual || '<span style="opacity:0.4;">—</span>'}</td>
                        <td>${badgeHtml}</td>
                        <td style="text-align: right;">
                            ${actionCellHtml}
                        </td>
                    `;

                    const rowEditBtn = tr.querySelector('.admin-row-edit-name-btn');
                    if (rowEditBtn) {
                        rowEditBtn.onclick = async (e) => {
                            e.stopPropagation();
                            await renamePlayerPrompt(res.userId, res.name);
                        };
                    }

                    const rowDelBtn = tr.querySelector('.admin-row-delete-btn');
                    if (rowDelBtn) {
                        rowDelBtn.onclick = async (e) => {
                            e.stopPropagation();
                            await deletePlayerCompletely(res.userId, res.name);
                        };
                    }

                    tr.onclick = () => {
                        playClick();
                        if (adminSelectPlayer) {
                            adminSelectPlayer.value = res.userId;
                        }
                        highlightSelectedPlayerInLevelTable();
                        loadSelectedPlayerScore();
                    };

                    adminLevelPlayersTbody.appendChild(tr);
                });
            } catch (err) {
                console.error("Помилка завантаження таблиці рівня:", err);
                adminLevelPlayersTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#ff4444;">Помилка завантаження результатів</td></tr>`;
            }
        }

        function highlightSelectedPlayerInLevelTable() {
            const currentSelected = adminSelectPlayer?.value;
            if (!adminLevelPlayersTbody) return;
            adminLevelPlayersTbody.querySelectorAll('.admin-level-row').forEach(row => {
                if (row.dataset.userId === currentSelected) {
                    row.classList.add('selected');
                } else {
                    row.classList.remove('selected');
                }
            });
        }

        // ==========================================
        // Керування темами оформлення (Theme Management Admin Editor)
        // ==========================================
        async function initAdminThemesView() {
            if (!adminThemesList) return;
            adminThemesList.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 25px; color: var(--text-color); opacity: 0.7;">${getText('lbLoading') || 'Завантаження тем...'}</div>`;

            let currentSettings = {};
            try {
                currentSettings = await getThemeSettings();
                if (currentSettings && typeof currentSettings === 'object') {
                    FieldThemes.applyThemeOverrides(currentSettings);
                }
            } catch (e) {
                console.warn("Error fetching theme settings:", e);
            }

            adminThemesList.innerHTML = '';

            FieldThemes.FIELD_THEMES.forEach(theme => {
                const def = FieldThemes.THEME_DEFAULTS.get(theme.id) || {
                    price: theme.price,
                    nameKey: theme.nameKey,
                    descKey: theme.descKey,
                    badgeKey: theme.badgeKey
                };

                const defaultName = getText(def.nameKey) || theme.id;
                const defaultBadge = getText(def.badgeKey) || '';
                const defaultDesc = getText(def.descKey) || '';

                const currentName = (theme.customName && theme.customName !== 'Unknown') ? theme.customName : '';
                const currentBadge = (theme.customBadge && theme.customBadge !== 'Unknown') ? theme.customBadge : '';
                const currentPrice = (typeof theme.price === 'number') ? theme.price : def.price;
                const currentDesc = (theme.customDesc && theme.customDesc !== 'Unknown') ? theme.customDesc : '';
                const isDiscount = Boolean(theme.isDiscountActive);
                const discountPct = theme.discountPercent || 0;
                const discountPrice = (typeof theme.discountPrice === 'number') ? theme.discountPrice : (discountPct > 0 ? Math.max(0, Math.round(currentPrice * (1 - discountPct / 100))) : '');

                const card = document.createElement('div');
                card.className = 'admin-theme-card';
                card.dataset.themeId = theme.id;

                const accentColor = theme.accentColor || '#38bdf8';

                card.innerHTML = `
                    <div class="admin-theme-accent-strip" style="background: ${accentColor}; box-shadow: 0 0 8px ${accentColor};"></div>
                    <div class="admin-theme-header">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${accentColor};"></span>
                            <strong style="font-size: 0.98rem; color: var(--text-primary);">${escapeHtml(defaultName)}</strong>
                        </div>
                        <span class="admin-theme-id-tag">id: ${escapeHtml(theme.id)}</span>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div>
                            <label style="font-size: 0.8rem; font-weight: 600; color: var(--highlight); display: block; margin-bottom: 4px;">
                                ${getText('adminThemeName') || 'Назва теми:'}
                            </label>
                            <input type="text" class="modern-input theme-input-name" placeholder="${escapeHtml(defaultName)}" value="${escapeHtml(currentName)}" style="margin: 0 !important; width: 100%;">
                        </div>
                        <div>
                            <label style="font-size: 0.8rem; font-weight: 600; color: var(--highlight); display: block; margin-bottom: 4px;">
                                ${getText('adminThemeBadge') || 'Класифікація / Бейдж:'}
                            </label>
                            <input type="text" class="modern-input theme-input-badge" placeholder="${escapeHtml(defaultBadge)}" value="${escapeHtml(currentBadge)}" style="margin: 0 !important; width: 100%;">
                        </div>
                    </div>

                    <div>
                        <label style="font-size: 0.8rem; font-weight: 600; color: var(--highlight); display: block; margin-bottom: 4px;">
                            ${getText('adminThemePrice') || 'Ціна (🪙):'}
                        </label>
                        <input type="number" class="modern-input theme-input-price" min="0" max="99999" placeholder="${def.price}" value="${currentPrice}" style="margin: 0 !important; width: 100%;">
                    </div>

                    <div>
                        <label style="font-size: 0.8rem; font-weight: 600; color: var(--highlight); display: block; margin-bottom: 4px;">
                            ${getText('adminThemeDesc') || 'Опис теми:'}
                        </label>
                        <textarea class="modern-input theme-input-desc" rows="3" placeholder="${escapeHtml(defaultDesc)}" style="margin: 0 !important; width: 100%; resize: vertical; min-height: 60px;">${escapeHtml(currentDesc)}</textarea>
                    </div>

                    <!-- Discount Section -->
                    <div class="admin-theme-discount-box">
                        <label class="admin-discount-toggle-label">
                            <input type="checkbox" class="theme-check-discount" ${isDiscount ? 'checked' : ''} style="width: 17px; height: 17px; accent-color: #f59e0b; cursor: pointer;">
                            <span>${getText('adminThemeDiscountActive') || 'Активувати знижку'}</span>
                        </label>

                        <div class="discount-inputs-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; ${isDiscount ? '' : 'opacity: 0.45; pointer-events: none;'}">
                            <div>
                                <label style="font-size: 0.74rem; font-weight: 600; color: #cbd5e1; display: block; margin-bottom: 2px;">
                                    ${getText('adminThemeDiscountPercent') || 'Знижка (%):'}
                                </label>
                                <input type="number" class="modern-input theme-input-disc-pct" min="1" max="99" placeholder="0" value="${discountPct || ''}" style="margin: 0 !important; padding: 6px 8px; font-size: 0.82rem;">
                            </div>
                            <div>
                                <label style="font-size: 0.74rem; font-weight: 600; color: #cbd5e1; display: block; margin-bottom: 2px;">
                                    ${getText('adminThemeDiscountPrice') || 'Ціна зі знижкою (🪙):'}
                                </label>
                                <input type="number" class="modern-input theme-input-disc-price" min="0" max="99999" placeholder="0" value="${discountPrice !== '' ? discountPrice : ''}" style="margin: 0 !important; padding: 6px 8px; font-size: 0.82rem;">
                            </div>
                        </div>

                        <div class="theme-discount-preview-row" style="margin-top: 4px;">
                            <span class="admin-discount-preview-tag">
                                <span style="color: #94a3b8; font-size: 0.76rem;">${getText('adminThemeDiscountPreview') || 'Ціна в магазині:'}</span>
                                <span class="theme-preview-price-display" style="font-weight: 700;"></span>
                            </span>
                        </div>
                    </div>

                    <!-- Card Action Buttons -->
                    <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 6px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                        <button type="button" class="modern-btn modern-btn-secondary btn-reset-single-theme" style="padding: 6px 12px; font-size: 0.78rem;">
                            ${getText('adminThemeResetBtn') || 'Скинути'}
                        </button>
                        <button type="button" class="modern-btn modern-btn-primary btn-save-single-theme" style="padding: 6px 14px; font-size: 0.78rem;">
                            ${getText('adminThemeSaveBtn') || 'Зберегти'}
                        </button>
                    </div>
                `;

                // Wire up auto-calculation and preview
                const inputName = card.querySelector('.theme-input-name');
                const inputBadge = card.querySelector('.theme-input-badge');
                const inputPrice = card.querySelector('.theme-input-price');
                const inputDesc = card.querySelector('.theme-input-desc');
                const checkDisc = card.querySelector('.theme-check-discount');
                const discInputsRow = card.querySelector('.discount-inputs-row');
                const inputDiscPct = card.querySelector('.theme-input-disc-pct');
                const inputDiscPrice = card.querySelector('.theme-input-disc-price');
                const previewDisplay = card.querySelector('.theme-preview-price-display');

                function updatePreview() {
                    const basePrice = Math.max(0, parseInt(inputPrice.value, 10) || 0);
                    const isDiscActive = checkDisc.checked;
                    const pctVal = Math.max(0, Math.min(99, parseInt(inputDiscPct.value, 10) || 0));
                    const priceVal = parseInt(inputDiscPrice.value, 10);

                    if (isDiscActive) {
                        discInputsRow.style.opacity = '1';
                        discInputsRow.style.pointerEvents = 'auto';
                        let finalDiscPrice = basePrice;
                        if (!isNaN(priceVal) && priceVal >= 0 && priceVal < basePrice) {
                            finalDiscPrice = priceVal;
                        } else if (pctVal > 0) {
                            finalDiscPrice = Math.max(0, Math.round(basePrice * (1 - pctVal / 100)));
                        }
                        const calcPct = basePrice > 0 ? Math.round((1 - finalDiscPrice / basePrice) * 100) : 0;
                        previewDisplay.innerHTML = `<span style="text-decoration:line-through; opacity:0.5; margin-right:4px;">${basePrice}</span> <span style="color:#4ade80;">${finalDiscPrice} 🪙</span> <span style="color:#ef4444; font-size:0.75rem;">(-${calcPct}%)</span>`;
                    } else {
                        discInputsRow.style.opacity = '0.45';
                        discInputsRow.style.pointerEvents = 'none';
                        previewDisplay.innerHTML = `<span style="color:#fde047;">${basePrice} 🪙</span>`;
                    }
                }

                checkDisc.onchange = () => {
                    playClick();
                    if (checkDisc.checked && !inputDiscPct.value && !inputDiscPrice.value) {
                        inputDiscPct.value = '20';
                        const p = parseInt(inputPrice.value, 10) || def.price;
                        inputDiscPrice.value = Math.max(0, Math.round(p * 0.8));
                    }
                    updatePreview();
                };

                inputPrice.oninput = () => {
                    if (checkDisc.checked && inputDiscPct.value) {
                        const p = parseInt(inputPrice.value, 10) || 0;
                        const pct = parseInt(inputDiscPct.value, 10) || 0;
                        inputDiscPrice.value = Math.max(0, Math.round(p * (1 - pct / 100)));
                    }
                    updatePreview();
                };

                inputDiscPct.oninput = () => {
                    const p = parseInt(inputPrice.value, 10) || 0;
                    const pct = Math.max(0, Math.min(99, parseInt(inputDiscPct.value, 10) || 0));
                    if (p > 0 && pct > 0) {
                        inputDiscPrice.value = Math.max(0, Math.round(p * (1 - pct / 100)));
                    }
                    updatePreview();
                };

                inputDiscPrice.oninput = () => {
                    const p = parseInt(inputPrice.value, 10) || 0;
                    const dp = parseInt(inputDiscPrice.value, 10);
                    if (p > 0 && !isNaN(dp) && dp >= 0 && dp <= p) {
                        inputDiscPct.value = Math.max(0, Math.min(99, Math.round((1 - dp / p) * 100)));
                    }
                    updatePreview();
                };

                updatePreview();

                // Reset button
                const btnReset = card.querySelector('.btn-reset-single-theme');
                btnReset.onclick = async () => {
                    playClick();
                    inputName.value = '';
                    inputBadge.value = '';
                    inputPrice.value = def.price;
                    inputDesc.value = '';
                    checkDisc.checked = false;
                    inputDiscPct.value = '';
                    inputDiscPrice.value = '';
                    updatePreview();

                    const allOverrides = collectAllThemeOverridesFromDOM();
                    await saveThemeSettings(allOverrides);
                    FieldThemes.applyThemeOverrides(allOverrides);
                    showNotification(getText('adminThemeSavedSuccess') || 'Налаштування теми скинуто до стандартних!');
                    if (typeof renderShop === 'function') renderShop();
                    if (typeof renderCustomizationModal === 'function') renderCustomizationModal();
                };

                // Save single theme button
                const btnSave = card.querySelector('.btn-save-single-theme');
                btnSave.onclick = async () => {
                    playClick();
                    btnSave.disabled = true;
                    btnSave.innerText = '...';
                    try {
                        const allOverrides = collectAllThemeOverridesFromDOM();
                        await saveThemeSettings(allOverrides);
                        FieldThemes.applyThemeOverrides(allOverrides);
                        showNotification(getText('adminThemeSavedSuccess') || 'Налаштування теми збережено!');
                        if (typeof renderShop === 'function') renderShop();
                        if (typeof renderCustomizationModal === 'function') renderCustomizationModal();
                    } catch (err) {
                        alert("Помилка збереження: " + err.message);
                    } finally {
                        btnSave.disabled = false;
                        btnSave.innerText = getText('adminThemeSaveBtn') || 'Зберегти';
                    }
                };

                adminThemesList.appendChild(card);
            });
        }

        function collectAllThemeOverridesFromDOM() {
            const overrides = {};
            if (!adminThemesList) return overrides;
            adminThemesList.querySelectorAll('.admin-theme-card').forEach(card => {
                const themeId = card.dataset.themeId;
                if (!themeId) return;

                const inputName = card.querySelector('.theme-input-name');
                const inputBadge = card.querySelector('.theme-input-badge');
                const inputPrice = card.querySelector('.theme-input-price');
                const inputDesc = card.querySelector('.theme-input-desc');
                const checkDisc = card.querySelector('.theme-check-discount');
                const inputDiscPct = card.querySelector('.theme-input-disc-pct');
                const inputDiscPrice = card.querySelector('.theme-input-disc-price');

                const rawName = inputName?.value.trim() || '';
                const customName = (rawName && rawName !== 'Unknown') ? rawName : null;

                const rawBadge = inputBadge?.value.trim() || '';
                const customBadge = (rawBadge && rawBadge !== 'Unknown') ? rawBadge : null;

                const rawDesc = inputDesc?.value.trim() || '';
                const customDesc = (rawDesc && rawDesc !== 'Unknown') ? rawDesc : null;

                const price = parseInt(inputPrice?.value, 10);
                const isDiscountActive = Boolean(checkDisc?.checked);
                const discountPercent = Math.max(0, Math.min(99, parseInt(inputDiscPct?.value, 10) || 0));
                const parsedDiscPrice = parseInt(inputDiscPrice?.value, 10);
                const discountPrice = (!isNaN(parsedDiscPrice) && parsedDiscPrice >= 0) ? parsedDiscPrice : null;

                overrides[themeId] = {
                    customName,
                    customBadge,
                    price: (!isNaN(price) && price >= 0) ? price : 0,
                    customDesc,
                    isDiscountActive,
                    discountPercent,
                    discountPrice
                };
            });
            return overrides;
        }

        if (adminBtnSaveAllThemes) {
            adminBtnSaveAllThemes.onclick = async () => {
                playClick();
                adminBtnSaveAllThemes.disabled = true;
                adminBtnSaveAllThemes.innerHTML = '<span>💾</span> <span>Збереження...</span>';
                try {
                    const allOverrides = collectAllThemeOverridesFromDOM();
                    await saveThemeSettings(allOverrides);
                    FieldThemes.applyThemeOverrides(allOverrides);
                    showNotification(getText('adminThemeSavedSuccess') || 'Всі теми успішно збережено!');
                    if (typeof renderShop === 'function') renderShop();
                    if (typeof renderCustomizationModal === 'function') renderCustomizationModal();
                } catch (err) {
                    alert("Помилка збереження тем: " + err.message);
                } finally {
                    adminBtnSaveAllThemes.disabled = false;
                    adminBtnSaveAllThemes.innerHTML = `<span>💾</span> <span data-i18n="adminThemeSaveAllBtn">${getText('adminThemeSaveAllBtn') || 'Зберегти всі теми'}</span>`;
                }
            };
        }

        // ==========================================
        // Авторизація та керування профілем
        // ==========================================
        const authModal = document.getElementById('auth-modal');
        const btnOpenAuth = document.getElementById('btn-open-auth');
        const userBadge = document.getElementById('user-badge');
        const usernameSpan = document.getElementById('username-span');
        const btnLogout = document.getElementById('btn-logout');
        const authForm = document.getElementById('auth-form-element');
        const authUserInput = document.getElementById('auth-input-user');
        const authPassInput = document.getElementById('auth-input-pass');
        const authTitle = document.getElementById('auth-title');
        const authSubmit = document.getElementById('auth-submit');
        const authToggleMode = document.getElementById('auth-toggle-mode');
        const updateAuthUI = async (user) => {
            if (user) {
                const activeUid = localStorage.getItem('neon_active_user_id');
                if (activeUid && activeUid !== user.id) {
                    // Зміна користувача: очищаємо кеш попереднього користувача
                    clearLocalUserData();
                }
                localStorage.setItem('neon_active_user_id', user.id);
                localStorage.setItem('playerName', user.username);
                localStorage.setItem('playerId', user.id);

                if (btnOpenAuth) btnOpenAuth.style.display = 'none';
                if (userBadge) {
                    userBadge.style.display = 'inline-flex';
                    userBadge.onclick = () => openPlayerProfileModal(null, null);
                }
                if (usernameSpan) usernameSpan.textContent = user.username;
                if (btnOpenAdmin) btnOpenAdmin.style.display = user.isAdmin ? 'inline-flex' : 'none';
                if (btnLogout) btnLogout.style.display = 'inline-flex';
                updateHeaderUserBadge();

                // Завантажуємо та синхронізуємо збережений прогрес рівнів користувача з хмари
                await syncUserProgressBidirectional(user.id);
            } else {
                if (btnOpenAuth) btnOpenAuth.style.display = 'inline-flex';
                if (userBadge) {
                    userBadge.style.display = 'none';
                    userBadge.onclick = null;
                }
                if (btnOpenAdmin) btnOpenAdmin.style.display = 'none';
                if (btnLogout) btnLogout.style.display = 'none';
            }
        };

        const updateHeaderUserBadge = () => {
            if (!userBadge) return;
            const cosm = Cosmetics.getLocalCosmetics();
            const iconUserContainer = document.querySelector('.icon-user-container');
            const curUser = getCurrentUser();
            const pName = curUser?.username || localStorage.getItem('playerName') || 'P';
            if (iconUserContainer) {
                if (curUser && cosm.avatarUrl) {
                    iconUserContainer.innerHTML = Cosmetics.getAvatarContent(pName, cosm.avatarUrl);
                } else {
                    iconUserContainer.innerHTML = icons.user(16);
                }
            }
            Cosmetics.FRAMES.forEach(f => { if (f.cssClass) userBadge.classList.remove(f.cssClass); });
            const bFrameCls = curUser ? Cosmetics.getFrameCssClass(cosm.selectedFrame) : '';
            if (bFrameCls) userBadge.classList.add(bFrameCls);
        };

        onAuthStateChanged(updateAuthUI);

        // ==========================================
        // Модальне вікно профілю та статистики гравця
        // ==========================================
        const profileModal = document.getElementById('profile-modal');
        const profileCloseBtn = document.getElementById('profile-close-btn');
        const profileBtnSettings = document.getElementById('profile-btn-settings');

        async function openProfileModal() {
            if (!profileModal) return;
            playClick();

            const currentUser = getCurrentUser();
            const playerName = currentUser?.username || localStorage.getItem('playerName') || 'Гравець';
            const userId = currentUser?.id || localStorage.getItem('playerId');

            // 1. Час у грі (години, хвилини, секунди)
            const playtimeSec = parseInt(localStorage.getItem('neon_total_playtime') || '0', 10);
            const hours = Math.floor(playtimeSec / 3600);
            const minutes = Math.floor((playtimeSec % 3600) / 60);
            const seconds = playtimeSec % 60;
            let playtimeStr = '';
            if (hours > 0) {
                playtimeStr = `${hours} ${getText('profileHours')} ${minutes} ${getText('profileMinutes')}`;
            } else if (minutes > 0) {
                playtimeStr = `${minutes} ${getText('profileMinutes')} ${seconds} ${getText('profileSeconds')}`;
            } else {
                playtimeStr = `${seconds} ${getText('profileSeconds')}`;
            }

            // 2. Рівні та зірки (золоті та діамантові)
            let levelsCompleted = 0;
            let totalGoldStars = 0;
            let totalDiamonds = 0;

            const countedTitles = new Set();
            songsDB.forEach(s => {
                if (!s || !s.title || s.isSecret) return;
                countedTitles.add(s.title);
                const d = getSavedData(s.title);
                if (d && d.stars > 0) {
                    levelsCompleted++;
                    if (Array.isArray(d.starTypes)) {
                        for (let i = 0; i < d.stars; i++) {
                            const type = d.starTypes[i];
                            if (type === 2) totalDiamonds++;
                            else totalGoldStars++;
                        }
                    } else {
                        totalGoldStars += d.stars;
                    }
                }
            });

            // Враховуємо секретні рівні лише якщо вони збережені локально
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith('neon_rhythm_')) {
                    const t = k.replace('neon_rhythm_', '');
                    if (!countedTitles.has(t) && t.toLowerCase().includes('secret')) {
                        countedTitles.add(t);
                        const d = getSavedData(t);
                        if (d && d.stars > 0) {
                            levelsCompleted++;
                            if (Array.isArray(d.starTypes)) {
                                for (let j = 0; j < d.stars; j++) {
                                    if (d.starTypes[j] === 2) totalDiamonds++;
                                    else totalGoldStars++;
                                }
                            } else {
                                totalGoldStars += d.stars;
                            }
                        }
                    }
                }
            }

            // 3. Місце в глобальній таблиці лідерів
            let rankText = getText('profileNoRank');
            try {
                const q = query(collection(db, "global_leaderboard"), orderBy("totalScore", "desc"), limit(100));
                const snap = await getDocs(q);
                let currentRank = 1;
                snap.forEach(d => {
                    const data = d.data();
                    if (d.id === userId || data.userId === userId || (data.name && data.name.toLowerCase() === playerName.toLowerCase())) {
                        rankText = `#${currentRank}`;
                    }
                    currentRank++;
                });
            } catch (e) {
                console.warn("Could not fetch player rank:", e);
            }

            // 4. Оновлення DOM елементів картки статистики
            const nameEl = document.getElementById('profile-display-name');
            if (nameEl) nameEl.textContent = playerName;

            const rankEl = document.getElementById('profile-rank-text');
            if (rankEl) rankEl.textContent = `${getText('lbRank')}: ${rankText}`;

            const ptEl = document.getElementById('profile-stat-playtime');
            if (ptEl) ptEl.textContent = playtimeStr;

            const lvEl = document.getElementById('profile-stat-levels');
            if (lvEl) lvEl.textContent = String(levelsCompleted);

            const gsEl = document.getElementById('profile-stat-gold-stars');
            if (gsEl) gsEl.textContent = String(totalGoldStars);

            const diaEl = document.getElementById('profile-stat-diamonds');
            if (diaEl) diaEl.textContent = String(totalDiamonds);

            const cosm = Cosmetics.getLocalCosmetics();
            const profileAvatarPill = document.querySelector('.profile-avatar-pill');
            if (profileAvatarPill) {
                profileAvatarPill.innerHTML = Cosmetics.getAvatarContent(playerName, cosm.avatarUrl);
                Cosmetics.FRAMES.forEach(f => { if (f.cssClass) profileAvatarPill.classList.remove(f.cssClass); });
                const pFrameCls = Cosmetics.getFrameCssClass(cosm.selectedFrame);
                if (pFrameCls) profileAvatarPill.classList.add(pFrameCls);
            }

            profileModal.classList.remove('hidden');
        }

        if (profileCloseBtn) {
            profileCloseBtn.onclick = () => {
                playClick();
                if (profileModal) profileModal.classList.add('hidden');
            };
        }

        const profileBtnCustomize = document.getElementById('profile-btn-customize');
        if (profileBtnCustomize) {
            profileBtnCustomize.onclick = () => {
                playClick();
                if (profileModal) profileModal.classList.add('hidden');
                openPlayerProfileModal(null, null);
            };
        }
        const sparklesContainer = document.querySelector('.icon-sparkles-container');
        if (sparklesContainer && !sparklesContainer.hasChildNodes()) sparklesContainer.innerHTML = icons.sparkles(15);

        if (profileBtnSettings) {
            profileBtnSettings.onclick = () => {
                if (profileModal) profileModal.classList.add('hidden');
                openSettingsModal();
            };
        }

        // ==========================================
        // Інтерактивна картка профілю гравця з таблиці лідерів
        // ==========================================
        const userProfileModal = document.getElementById('user-profile-modal');
        const userProfileCloseBtn = document.getElementById('user-profile-close-btn');

        if (userProfileCloseBtn) {
            userProfileCloseBtn.onclick = () => {
                playClick();
                if (userProfileModal) userProfileModal.classList.add('hidden');
            };
        }

        if (userProfileModal) {
            userProfileModal.addEventListener('mousedown', (e) => {
                if (e.target === userProfileModal) userProfileModal.classList.add('hidden');
            });
        }

        openPlayerProfileModal = async function(playerData, rank) {
            if (!userProfileModal) return;
            playClick();
            i18n.updateDOM();

            const currentAuthUser = getCurrentUser();
            const myPlayerId = currentAuthUser?.id || localStorage.getItem('playerId');
            const myName = (currentAuthUser?.username || localStorage.getItem('playerName') || 'Player').trim();

            if (!playerData) {
                playerData = {
                    id: myPlayerId,
                    userId: myPlayerId,
                    name: myName
                };
            }

            const playerId = playerData.id || playerData.userId || '';
            let name = playerData.name || myName || 'Player';
            const cleanName = (name || '').trim().toLowerCase();
            const isMe = Boolean(
                (playerId && myPlayerId && String(playerId).trim() === String(myPlayerId).trim()) ||
                (currentAuthUser?.username && cleanName && currentAuthUser.username.trim().toLowerCase() === cleanName) ||
                (myName && cleanName && myName.toLowerCase() === cleanName) ||
                (!playerId && (!playerData.name || cleanName === myName.toLowerCase()))
            );

            // Якщо переглядаємо власний профіль — завантажуємо точні актуальні локальні дані та косметику
            if (isMe) {
                let localStars = 0;
                let localDia = 0;
                let localCompleted = 0;
                let localScore = 0;
                songsDB.forEach(s => {
                    if (!s || !s.title || s.isSecret) return;
                    const d = getSavedData(s.title);
                    if (d && d.stars > 0) {
                        localCompleted++;
                        localScore += (d.score || 0);
                        localStars += d.stars;
                        if (Array.isArray(d.starTypes)) {
                            for (let i = 0; i < d.stars; i++) {
                                if (d.starTypes[i] === 2) localDia++;
                            }
                        }
                    }
                });
                playerData.totalScore = localScore;
                playerData.levelsCompleted = localCompleted;
                playerData.goldStarsCount = localStars;
                playerData.totalStars = localStars;
                playerData.diamondsCount = localDia;
                playerData.playtimeSeconds = parseInt(localStorage.getItem('neon_total_playtime') || '0', 10);

                const localCosm = Cosmetics.getLocalCosmetics();
                playerData.avatarUrl = localCosm.avatarUrl || '';
                playerData.selectedFrame = localCosm.selectedFrame || 'frame_none';
                playerData.selectedTitle = localCosm.selectedTitle || 'title_novice';
                playerData.userStatus = localCosm.userStatus || '';
                playerData.favoriteTrack = localCosm.favoriteTrack || '';
            } else if (playerId && (playerData.goldStarsCount === undefined || playerData.diamondsCount === undefined || playerData.playtimeSeconds === undefined || !playerData.selectedFrame)) {
                // Якщо профіль іншого гравця — довантажуємо з бази даних global_leaderboard
                try {
                    const snap = await getDoc(doc(db, "global_leaderboard", playerId));
                    if (snap.exists()) {
                        const d = snap.data();
                        if (d.totalScore !== undefined) playerData.totalScore = d.totalScore;
                        if (d.levelsCompleted !== undefined) playerData.levelsCompleted = d.levelsCompleted;
                        if (d.goldStarsCount !== undefined) playerData.goldStarsCount = d.goldStarsCount;
                        if (d.diamondsCount !== undefined) playerData.diamondsCount = d.diamondsCount;
                        if (d.playtimeSeconds !== undefined) playerData.playtimeSeconds = d.playtimeSeconds;
                        if (d.avatarUrl) playerData.avatarUrl = d.avatarUrl;
                        if (d.selectedFrame) playerData.selectedFrame = d.selectedFrame;
                        if (d.selectedTitle) playerData.selectedTitle = d.selectedTitle;
                        if (d.userStatus) playerData.userStatus = d.userStatus;
                        if (d.favoriteTrack) playerData.favoriteTrack = d.favoriteTrack;
                        if (d.name && (!playerData.name || playerData.name.startsWith('Player_'))) {
                            playerData.name = d.name;
                            name = d.name;
                        }
                    }
                } catch (e) {
                    console.warn("[Profile] Could not fetch player doc:", e);
                }
            }

            // Визначення актуального місця в рейтингу, якщо воно не передано аргументом (напр. з шапки)
            let resolvedRank = (typeof rank === 'number' && rank > 0) ? rank : null;
            if (!resolvedRank && (playerId || cleanName)) {
                try {
                    const lbQ = query(collection(db, "global_leaderboard"), orderBy("totalScore", "desc"), limit(100));
                    const lbSnap = await getDocs(lbQ);
                    let foundRank = -1;
                    lbSnap.docs.forEach((docSnap, index) => {
                        const d = docSnap.data();
                        const docId = docSnap.id;
                        const docName = (d.name || '').trim().toLowerCase();
                        if ((playerId && docId === playerId) || (cleanName && docName === cleanName)) {
                            foundRank = index + 1;
                        }
                    });
                    if (foundRank > 0) {
                        resolvedRank = foundRank;
                    }
                } catch (e) {
                    console.warn("[Profile] Could not resolve rank:", e);
                }
            }

            // Інжекція іконок у вікно профілю
            const profileCloseIcon = userProfileModal.querySelector('.profile-close-icon');
            if (profileCloseIcon && !profileCloseIcon.hasChildNodes()) profileCloseIcon.innerHTML = icons.close(16);

            const trophyIcon = userProfileModal.querySelector('.up-icon-trophy');
            if (trophyIcon && !trophyIcon.hasChildNodes()) trophyIcon.innerHTML = icons.trophy(20);

            const musicIcon = userProfileModal.querySelector('.up-icon-music');
            if (musicIcon && !musicIcon.hasChildNodes()) musicIcon.innerHTML = icons.music(20);

            const starIcon = userProfileModal.querySelector('.up-icon-star');
            if (starIcon && !starIcon.hasChildNodes()) starIcon.innerHTML = icons.starFilled(20);

            const diamondIcon = userProfileModal.querySelector('.up-icon-diamond');
            if (diamondIcon && !diamondIcon.hasChildNodes()) diamondIcon.innerHTML = icons.diamond(20);

            const clockIcon = userProfileModal.querySelector('.up-icon-clock');
            if (clockIcon && !clockIcon.hasChildNodes()) clockIcon.innerHTML = icons.clock(20);

            const editIcon = userProfileModal.querySelector('.btn-icon-edit-up');
            if (editIcon && !editIcon.hasChildNodes()) editIcon.innerHTML = icons.edit(14);

            const trashIcon = userProfileModal.querySelector('.btn-icon-trash-up');
            if (trashIcon && !trashIcon.hasChildNodes()) trashIcon.innerHTML = icons.trash(14);

            const cameraUpIcon = userProfileModal.querySelector('.icon-camera-up');
            if (cameraUpIcon && !cameraUpIcon.hasChildNodes()) cameraUpIcon.innerHTML = icons.camera(13);

            const trashAvatarIcon = userProfileModal.querySelector('.icon-trash-up-avatar');
            if (trashAvatarIcon && !trashAvatarIcon.hasChildNodes()) trashAvatarIcon.innerHTML = icons.trash(11);

            const saveUpIcon = userProfileModal.querySelector('.icon-save-up');
            if (saveUpIcon && !saveUpIcon.hasChildNodes()) saveUpIcon.innerHTML = icons.save(14);

            const favMusicIcon = userProfileModal.querySelector('.fav-icon-music');
            if (favMusicIcon && !favMusicIcon.hasChildNodes()) favMusicIcon.innerHTML = icons.music(15);

            // Отримання та заповнення полів профілю
            const upAvatar = document.getElementById('up-avatar');
            const upRankBadge = document.getElementById('up-rank-badge');
            const upName = document.getElementById('up-name');
            const upTierBadge = document.getElementById('up-tier-badge');
            const upTitleBadge = document.getElementById('up-title-badge');
            const upIdSnippet = document.getElementById('up-id-snippet');
            const upStatScore = document.getElementById('up-stat-score');
            const upStatLevels = document.getElementById('up-stat-levels');
            const upStatStars = document.getElementById('up-stat-stars');
            const upStatDiamonds = document.getElementById('up-stat-diamonds');
            const upStatPlaytime = document.getElementById('up-stat-playtime');

            // Відображення аватара та рамки
            if (upAvatar) {
                upAvatar.innerHTML = Cosmetics.getAvatarContent(name, playerData.avatarUrl);
                Cosmetics.FRAMES.forEach(f => {
                    if (f.cssClass) upAvatar.classList.remove(f.cssClass);
                });
                const activeFrameClass = Cosmetics.getFrameCssClass(playerData.selectedFrame || 'frame_none');
                if (activeFrameClass) upAvatar.classList.add(activeFrameClass);
            }

            // Титул гравця
            if (upTitleBadge) {
                const titleDef = Cosmetics.TITLES.find(t => t.id === (playerData.selectedTitle || 'title_novice'));
                const titleText = titleDef ? (getText(titleDef.nameKey) || titleDef.id) : (getText('titleNovice') || 'Новачок біту');
                upTitleBadge.textContent = titleText;
            }

            // Ранг у таблиці лідерів
            if (upRankBadge) {
                if (resolvedRank === 1) {
                    upRankBadge.innerHTML = `${icons.crown(14)} #1`;
                    upRankBadge.className = 'user-profile-rank-badge gold';
                } else if (resolvedRank === 2) {
                    upRankBadge.innerHTML = `${icons.medal(14)} #2`;
                    upRankBadge.className = 'user-profile-rank-badge silver';
                } else if (resolvedRank === 3) {
                    upRankBadge.innerHTML = `${icons.medal(14)} #3`;
                    upRankBadge.className = 'user-profile-rank-badge bronze';
                } else if (resolvedRank) {
                    upRankBadge.textContent = `#${resolvedRank}`;
                    upRankBadge.className = 'user-profile-rank-badge';
                } else {
                    upRankBadge.textContent = '#—';
                    upRankBadge.className = 'user-profile-rank-badge';
                }
            }

            if (upName) upName.textContent = name;

            const score = Number(playerData.totalScore) || 0;
            const completed = Number(playerData.levelsCompleted) || 0;

            // Спеціальний бейдж тільки для адміністраторів (щоб не дублювати титул гравця)
            if (upTierBadge) {
                if (playerData.role === 'admin' || playerData.isAdmin) {
                    upTierBadge.textContent = getText('profileAdminBadge') || 'Адміністратор';
                    upTierBadge.className = 'user-tier-badge tier-admin';
                    upTierBadge.classList.remove('hidden');
                    upTierBadge.style.display = '';
                } else {
                    upTierBadge.textContent = '';
                    upTierBadge.classList.add('hidden');
                    upTierBadge.style.display = 'none';
                }
            }

            if (upIdSnippet) {
                const shortId = playerId ? (playerId.length > 10 ? `${playerId.slice(0, 8)}...` : playerId) : '—';
                upIdSnippet.innerHTML = `ID: ${shortId} <span class="copy-id-icon" title="${getText('clickToCopyId') || 'Натисніть, щоб скопіювати ID'}">📋</span>`;
                upIdSnippet.title = getText('clickToCopyId') || 'Натисніть, щоб скопіювати ID';
                upIdSnippet.onclick = async (e) => {
                    e.stopPropagation();
                    if (!playerId) return;
                    playClick();
                    let copiedSuccessfully = false;
                    try {
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                            await navigator.clipboard.writeText(playerId);
                            copiedSuccessfully = true;
                        }
                    } catch (err) {
                        // navigator.clipboard may fail in non-HTTPS or without user gesture
                    }

                    if (!copiedSuccessfully) {
                        try {
                            const ta = document.createElement('textarea');
                            ta.value = playerId;
                            ta.style.position = 'fixed';
                            ta.style.opacity = '0';
                            document.body.appendChild(ta);
                            ta.select();
                            copiedSuccessfully = document.execCommand('copy');
                            document.body.removeChild(ta);
                        } catch (e2) {}
                    }

                    const originalContent = upIdSnippet.innerHTML;
                    upIdSnippet.classList.add('copied-glow');
                    upIdSnippet.textContent = (getText('copied') || 'Скопійовано!') + ' ✓';
                    showNotification(getText('idCopied') || 'ID скопійовано в буфер обміну!');
                    setTimeout(() => {
                        upIdSnippet.classList.remove('copied-glow');
                        upIdSnippet.innerHTML = originalContent;
                    }, 1200);
                };
            }

            if (upStatScore) upStatScore.textContent = score.toLocaleString();
            if (upStatLevels) upStatLevels.textContent = String(completed);
            if (upStatStars) upStatStars.textContent = String(playerData.goldStarsCount || playerData.totalStars || 0);
            if (upStatDiamonds) upStatDiamonds.textContent = String(playerData.diamondsCount || 0);

            // Розрахунок часу у грі
            const playtimeSec = Number(playerData.playtimeSeconds) || 0;
            const hours = Math.floor(playtimeSec / 3600);
            const minutes = Math.floor((playtimeSec % 3600) / 60);
            const seconds = playtimeSec % 60;
            let playtimeStr = '';
            if (hours > 0) {
                playtimeStr = `${hours} ${getText('profileHours')} ${minutes} ${getText('profileMinutes')}`;
            } else if (minutes > 0) {
                playtimeStr = `${minutes} ${getText('profileMinutes')} ${seconds} ${getText('profileSeconds')}`;
            } else {
                playtimeStr = `${seconds} ${getText('profileSeconds')}`;
            }
            if (upStatPlaytime) upStatPlaytime.textContent = playtimeStr;

            // ------------------------------------------
            // Статус / Девіз профілю (Bio)
            // ------------------------------------------
            const upBioDisplay = document.getElementById('up-bio-display');
            const upBioEditBox = document.getElementById('up-bio-edit-box');
            const upBioInput = document.getElementById('up-bio-input');
            const upBioCounter = document.getElementById('up-bio-counter');
            const upBioSaveBtn = document.getElementById('up-bio-save-btn');

            if (isMe) {
                if (upBioDisplay) upBioDisplay.classList.add('hidden');
                if (upBioEditBox) upBioEditBox.classList.remove('hidden');
                if (upBioInput) {
                    upBioInput.value = playerData.userStatus || '';
                    if (upBioCounter) upBioCounter.textContent = `${(playerData.userStatus || '').length}/60`;
                    upBioInput.oninput = () => {
                        if (upBioCounter) upBioCounter.textContent = `${upBioInput.value.length}/60`;
                    };
                    const doSaveBio = async () => {
                        const newBio = (upBioInput.value || '').trim().slice(0, 60);
                        Cosmetics.saveLocalCosmetics({ userStatus: newBio });
                        showNotification(getText('statusUpdated') || 'Статус збережено!');
                        if (myPlayerId) {
                            try {
                                await setDoc(doc(db, "global_leaderboard", myPlayerId), { userStatus: newBio }, { merge: true });
                                await setDoc(doc(db, "user_progress", myPlayerId), { userStatus: newBio }, { merge: true });
                            } catch (e) { console.warn(e); }
                            syncGlobalProgress();
                        }
                    };
                    if (upBioSaveBtn) upBioSaveBtn.onclick = doSaveBio;
                    upBioInput.onkeydown = (e) => { if (e.key === 'Enter') doSaveBio(); };
                }
            } else {
                if (upBioEditBox) upBioEditBox.classList.add('hidden');
                if (upBioDisplay) {
                    upBioDisplay.classList.remove('hidden');
                    upBioDisplay.textContent = playerData.userStatus ? `«${playerData.userStatus}»` : '';
                }
            }

            // ------------------------------------------
            // Улюблений трек (Favorite Track) з пошуковим фільтром
            // ------------------------------------------
            const favTitleEl = document.getElementById('up-favorite-track-title');
            const favControlsEl = document.getElementById('up-favorite-track-controls');
            const favSearchEl = document.getElementById('up-favorite-track-search');
            const favClearEl = document.getElementById('up-favorite-track-clear');
            const favSelectEl = document.getElementById('up-favorite-track-select');
            if (favTitleEl) favTitleEl.textContent = playerData.favoriteTrack || '—';

            if (isMe && favControlsEl && favSelectEl) {
                favControlsEl.classList.remove('hidden');

                const renderFavOptions = (query = '') => {
                    const q = query.trim().toLowerCase();
                    let optionsHtml = `<option value="">${getText('profileSelectFavTrack') || 'Оберіть улюблений трек...'}</option>`;
                    let matchCount = 0;
                    songsDB.forEach(s => {
                        if (!s || !s.title) return;
                        const fullText = `${s.artist || ''} ${s.title}`.toLowerCase();
                        if (q && !fullText.includes(q)) return;
                        matchCount++;
                        const isSel = s.title === playerData.favoriteTrack;
                        optionsHtml += `<option value="${escapeHtml(s.title)}" ${isSel ? 'selected' : ''}>${escapeHtml(s.artist || '')} — ${escapeHtml(s.title)}</option>`;
                    });
                    if (q && matchCount === 0) {
                        optionsHtml += `<option value="" disabled>${getText('noTracksFound') || 'Нічого не знайдено'}</option>`;
                    }
                    favSelectEl.innerHTML = optionsHtml;
                };

                if (favSearchEl) {
                    favSearchEl.value = '';
                    favSearchEl.placeholder = getText('searchFavTrackPlaceholder') || '🔍 Пошук треку або виконавця...';
                    if (favClearEl) favClearEl.classList.add('hidden');
                    favSearchEl.oninput = () => {
                        const val = favSearchEl.value;
                        if (favClearEl) favClearEl.classList.toggle('hidden', !val);
                        renderFavOptions(val);
                    };
                }

                if (favClearEl) {
                    favClearEl.onclick = () => {
                        playClick();
                        if (favSearchEl) {
                            favSearchEl.value = '';
                            favClearEl.classList.add('hidden');
                            favSearchEl.focus();
                        }
                        renderFavOptions('');
                    };
                }

                renderFavOptions('');

                favSelectEl.onchange = async () => {
                    playClick();
                    const newFav = favSelectEl.value;
                    if (!newFav) return;
                    playerData.favoriteTrack = newFav;
                    Cosmetics.saveLocalCosmetics({ favoriteTrack: newFav });
                    if (favTitleEl) favTitleEl.textContent = newFav || '—';
                    showNotification(getText('favTrackUpdated') || 'Улюблений трек оновлено!');
                    if (myPlayerId) {
                        try {
                            await setDoc(doc(db, "global_leaderboard", myPlayerId), { favoriteTrack: newFav }, { merge: true });
                            await setDoc(doc(db, "user_progress", myPlayerId), { favoriteTrack: newFav }, { merge: true });
                        } catch (e) { console.warn(e); }
                        syncGlobalProgress();
                    }
                };
            } else if (favControlsEl) {
                favControlsEl.classList.add('hidden');
            }

            // ------------------------------------------
            // Завантаження власної аватарки та стиснення
            // ------------------------------------------
            const avatarEditBtn = document.getElementById('up-avatar-edit-btn');
            const avatarResetBtn = document.getElementById('up-avatar-reset-btn');
            const avatarFileInput = document.getElementById('up-avatar-file-input');

            if (isMe) {
                if (avatarEditBtn) {
                    avatarEditBtn.classList.remove('hidden');
                    avatarEditBtn.onclick = () => {
                        playClick();
                        avatarFileInput?.click();
                    };
                }
                if (avatarResetBtn) {
                    if (playerData.avatarUrl) avatarResetBtn.classList.remove('hidden');
                    else avatarResetBtn.classList.add('hidden');

                    avatarResetBtn.onclick = async () => {
                        playClick();
                        Cosmetics.saveLocalCosmetics({ avatarUrl: '' });
                        playerData.avatarUrl = '';
                        if (upAvatar) upAvatar.innerHTML = Cosmetics.getAvatarContent(name, '');
                        avatarResetBtn.classList.add('hidden');
                        updateHeaderUserBadge();
                        showNotification(getText('avatarRemoved') || 'Аватар скинуто.');
                        if (myPlayerId) {
                            try {
                                await setDoc(doc(db, "global_leaderboard", myPlayerId), { avatarUrl: '' }, { merge: true });
                                await setDoc(doc(db, "user_progress", myPlayerId), { avatarUrl: '' }, { merge: true });
                            } catch (e) { console.warn(e); }
                            syncGlobalProgress();
                        }
                    };
                }
                if (avatarFileInput) {
                    avatarFileInput.onchange = async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                            showNotification(getText('authWaiting') || 'Обробка зображення...');
                            const compressedBase64 = await Cosmetics.compressImage(file, 128, 0.82);
                            Cosmetics.saveLocalCosmetics({ avatarUrl: compressedBase64 });
                            playerData.avatarUrl = compressedBase64;
                            if (upAvatar) upAvatar.innerHTML = Cosmetics.getAvatarContent(name, compressedBase64);
                            if (avatarResetBtn) avatarResetBtn.classList.remove('hidden');
                            updateHeaderUserBadge();
                            showNotification(getText('avatarUpdated') || 'Аватар успішно оновлено!');
                            if (myPlayerId) {
                                try {
                                    await setDoc(doc(db, "global_leaderboard", myPlayerId), { avatarUrl: compressedBase64 }, { merge: true });
                                    await setDoc(doc(db, "user_progress", myPlayerId), { avatarUrl: compressedBase64 }, { merge: true });
                                } catch (e) { console.warn(e); }
                                syncGlobalProgress();
                            }
                        } catch (err) {
                            console.error("Avatar compression error:", err);
                            showNotification(err.message || 'Помилка обробки зображення');
                        } finally {
                            avatarFileInput.value = '';
                        }
                    };
                }
            } else {
                if (avatarEditBtn) avatarEditBtn.classList.add('hidden');
                if (avatarResetBtn) avatarResetBtn.classList.add('hidden');
            }

            // ------------------------------------------
            // Дія виходу з акаунта (тільки для власного профілю)
            // ------------------------------------------
            const btnLogoutInProfile = document.getElementById('btn-logout');
            const authActionsBox = document.getElementById('user-profile-auth-actions');
            if (authActionsBox) {
                authActionsBox.style.display = isMe ? 'block' : 'none';
            }
            if (btnLogoutInProfile) {
                btnLogoutInProfile.style.display = isMe ? 'inline-flex' : 'none';
                const logoutIcon = btnLogoutInProfile.querySelector('.icon-logout-container');
                if (logoutIcon && !logoutIcon.hasChildNodes()) {
                    logoutIcon.innerHTML = icons.logout(16);
                }
            }

            // Кнопка швидких дій для системи друзів з підтримкою запитів
            const upBtnFriendAction = document.getElementById('up-btn-friend-action');
            const upFriendBtnText = document.getElementById('up-friend-btn-text');
            const upFriendBtnIcon = upBtnFriendAction?.querySelector('.btn-icon-friend-action');

            if (upBtnFriendAction) {
                if (!playerId || isMe) {
                    upBtnFriendAction.style.setProperty('display', 'none', 'important');
                } else {
                    upBtnFriendAction.style.removeProperty('display');
                    upBtnFriendAction.style.display = 'inline-flex';
                    const syncFriendBtnUI = () => {
                        const inFriends = isFriend(playerId);
                        const isPendingOut = hasOutgoingRequest(playerId);
                        const isPendingIn = hasIncomingRequest(playerId);

                        if (inFriends) {
                            upBtnFriendAction.className = 'modern-btn modern-btn-secondary';
                            if (upFriendBtnIcon) upFriendBtnIcon.innerHTML = icons.userCheck(15);
                            if (upFriendBtnText) upFriendBtnText.textContent = getText('profileInFriends') || 'У друзях';
                        } else if (isPendingOut) {
                            upBtnFriendAction.className = 'modern-btn modern-btn-secondary';
                            if (upFriendBtnIcon) upFriendBtnIcon.innerHTML = icons.clock(15);
                            if (upFriendBtnText) upFriendBtnText.textContent = getText('friendRequestPending') || 'Запит надіслано';
                        } else if (isPendingIn) {
                            upBtnFriendAction.className = 'modern-btn modern-btn-primary';
                            if (upFriendBtnIcon) upFriendBtnIcon.innerHTML = icons.userCheck(15);
                            if (upFriendBtnText) upFriendBtnText.textContent = getText('friendRequestAccept') || 'Прийняти запит';
                        } else {
                            upBtnFriendAction.className = 'modern-btn modern-btn-primary';
                            if (upFriendBtnIcon) upFriendBtnIcon.innerHTML = icons.userPlus(15);
                            if (upFriendBtnText) upFriendBtnText.textContent = getText('friendSendRequestBtn') || 'Надіслати запит';
                        }
                    };
                    syncFriendBtnUI();

                    upBtnFriendAction.onclick = async () => {
                        playClick();
                        try {
                            if (isFriend(playerId)) {
                                const confirmMsg = (getText('friendConfirmUnfriend') || 'Видалити гравця "{name}" з друзів?').replace('{name}', name);
                                if (!confirm(confirmMsg)) return;
                                await removeFriend(playerId);
                                showNotification((getText('friendRemoved') || 'Гравця "{name}" видалено з друзів.').replace('{name}', name));
                            } else if (hasOutgoingRequest(playerId)) {
                                const confirmMsg = (getText('friendConfirmCancel') || 'Скасувати запит до гравця "{name}"?').replace('{name}', name);
                                if (!confirm(confirmMsg)) return;
                                await cancelFriendRequest(playerId);
                                showNotification(getText('friendRequestDeclined') || 'Запит скасовано.');
                            } else if (hasIncomingRequest(playerId)) {
                                await acceptFriendRequest(playerId);
                                showNotification((getText('friendRequestAccepted') || 'Запит прийнято!').replace('{name}', name));
                            } else {
                                await sendFriendRequest(playerId, name);
                                showNotification((getText('friendRequestSent') || 'Запит надіслано гравцю "{name}"!').replace('{name}', name));
                            }
                            syncFriendBtnUI();
                            if (typeof updateFriendsBadge === 'function') updateFriendsBadge();
                            if (typeof renderFriendsList === 'function') renderFriendsList();
                        } catch (err) {
                            showNotification(err.message || 'Помилка');
                        }
                    };
                }
            }

            // Кнопки швидких дій для адміністратора
            const adminActions = document.getElementById('user-profile-admin-actions');
            const curUser = getCurrentUser();
            const isAdmin = Boolean(curUser?.role === 'admin' || curUser?.isAdmin);

            if (adminActions) {
                if (isAdmin) {
                    adminActions.classList.remove('hidden');

                    const upBtnAdminEdit = document.getElementById('up-btn-admin-edit');
                    const upBtnAdminDelete = document.getElementById('up-btn-admin-delete');

                    if (upBtnAdminEdit) {
                        upBtnAdminEdit.onclick = async () => {
                            playClick();
                            userProfileModal.classList.add('hidden');
                            const lb = document.getElementById('lb-modal');
                            if (lb) lb.remove();

                            if (adminModal) {
                                adminModal.classList.remove('hidden');
                                switchAdminTab('scores');
                                setTimeout(async () => {
                                    if (adminPlayerSearch) {
                                        adminPlayerSearch.value = name;
                                    }
                                    renderAdminPlayerOptions(name);
                                    if (adminSelectPlayer && playerId) {
                                        adminSelectPlayer.value = playerId;
                                        await loadSelectedPlayerScore();
                                        highlightSelectedPlayerInLevelTable();
                                    }
                                }, 200);
                            }
                        };
                    }

                    if (upBtnAdminDelete) {
                        const targetIsAdmin = Boolean(playerData?.isAdmin || playerData?.role === 'admin');
                        if (targetIsAdmin) {
                            upBtnAdminDelete.disabled = true;
                            upBtnAdminDelete.title = getText('adminCannotBeDeleted') || 'Акаунт адміністратора захищено від видалення.';
                            upBtnAdminDelete.style.opacity = '0.4';
                            upBtnAdminDelete.style.cursor = 'not-allowed';
                            upBtnAdminDelete.onclick = (e) => {
                                e.stopPropagation();
                                alert(getText('adminCannotBeDeleted') || 'Акаунт адміністратора захищено від видалення.');
                            };
                        } else {
                            upBtnAdminDelete.disabled = false;
                            upBtnAdminDelete.title = '';
                            upBtnAdminDelete.style.opacity = '1';
                            upBtnAdminDelete.style.cursor = 'pointer';
                            upBtnAdminDelete.onclick = async () => {
                                playClick();
                                if (!playerId) return;
                                await deletePlayerCompletely(playerId, name);
                                userProfileModal.classList.add('hidden');
                                const lb = document.getElementById('lb-modal');
                                if (lb) {
                                    loadLeaderboardData('global', lb, currentLeaderboardLimit);
                                }
                            };
                        }
                    }
                } else {
                    adminActions.classList.add('hidden');
                }
            }

            userProfileModal.classList.remove('hidden');
        };
        window.openPlayerProfileModal = openPlayerProfileModal;

        // ==========================================
        // Модальне вікно налаштувань (Settings Modal)
        // ==========================================
        const settingsModal = document.getElementById('settings-modal');
        const settingsCloseBtn = document.getElementById('settings-close-btn');
        const btnOpenSettings = document.getElementById('btn-open-settings');
        const formChangeUsername = document.getElementById('form-change-username');
        const formChangePassword = document.getElementById('form-change-password');
        const btnDeleteAccount = document.getElementById('btn-delete-account');

        function openSettingsModal() {
            if (!settingsModal) return;
            playClick();
            i18n.updateDOM();
            updateSettingsThemeUI();
            updateSettingsSoundUI();
            updateSettingsLangUI();
            updateFullscreenIcons();

            const currentUser = getCurrentUser();
            const accountSection = document.getElementById('settings-account-section');
            if (accountSection) {
                accountSection.style.display = (currentUser && currentUser.id) ? 'block' : 'none';
            }

            const isCurAdmin = Boolean(currentUser?.isAdmin || currentUser?.role === 'admin');
            if (btnDeleteAccount) {
                if (isCurAdmin) {
                    btnDeleteAccount.disabled = true;
                    btnDeleteAccount.title = getText('adminCannotBeDeleted') || 'Акаунт адміністратора захищено від видалення.';
                    btnDeleteAccount.style.opacity = '0.4';
                    btnDeleteAccount.style.cursor = 'not-allowed';
                } else {
                    btnDeleteAccount.disabled = false;
                    btnDeleteAccount.title = '';
                    btnDeleteAccount.style.opacity = '1';
                    btnDeleteAccount.style.cursor = 'pointer';
                }
            }

            // Очищення полів зворотного зв'язку
            const ufb = document.getElementById('settings-username-feedback');
            if (ufb) { ufb.textContent = ''; ufb.className = 'form-feedback-msg'; }
            const pfb = document.getElementById('settings-password-feedback');
            if (pfb) { pfb.textContent = ''; pfb.className = 'form-feedback-msg'; }

            settingsModal.classList.remove('hidden');
        }

        if (btnOpenSettings) btnOpenSettings.onclick = openSettingsModal;
        if (settingsCloseBtn) {
            settingsCloseBtn.onclick = () => {
                playClick();
                if (settingsModal) settingsModal.classList.add('hidden');
            };
        }

        // Зміна імені гравця
        if (formChangeUsername) {
            formChangeUsername.onsubmit = async (e) => {
                e.preventDefault();
                const currentUser = getCurrentUser();
                if (!currentUser || !currentUser.id) return;

                const input = document.getElementById('settings-new-username');
                const newName = input?.value.trim();
                const fb = document.getElementById('settings-username-feedback');
                const btn = document.getElementById('btn-save-username');
                if (!newName || newName.length < 3 || newName.length > 12) {
                    if (fb) { 
                        fb.className = 'form-feedback-msg error'; 
                        fb.textContent = getText('authUsernameLengthError') || "Ім'я користувача повинно містити від 3 до 12 символів."; 
                    }
                    return;
                }

                if (btn) { btn.disabled = true; btn.textContent = '...'; }
                try {
                    await updateUserUsername(currentUser.id, newName);
                    if (fb) {
                        fb.className = 'form-feedback-msg success';
                        fb.textContent = getText('usernameUpdated');
                    }
                    if (usernameSpan) usernameSpan.textContent = newName;
                    localStorage.setItem('playerName', newName);
                    showNotification(getText('usernameUpdated'));
                } catch (err) {
                    if (fb) {
                        fb.className = 'form-feedback-msg error';
                        fb.textContent = err.message || getText('usernameTaken');
                    }
                } finally {
                    if (btn) {
                        btn.disabled = false;
                        btn.textContent = getText('settingsChangeUsernameBtn');
                    }
                }
            };
        }

        // Зміна пароля
        if (formChangePassword) {
            formChangePassword.onsubmit = async (e) => {
                e.preventDefault();
                const currentUser = getCurrentUser();
                if (!currentUser || !currentUser.id) return;

                const currPassInput = document.getElementById('settings-curr-pass');
                const newPassInput = document.getElementById('settings-new-pass');
                const currPass = currPassInput?.value.trim();
                const newPass = newPassInput?.value.trim();
                const fb = document.getElementById('settings-password-feedback');
                const btn = document.getElementById('btn-save-password');

                if (!currPass || !newPass) return;
                if (btn) { btn.disabled = true; btn.textContent = '...'; }
                try {
                    await updateUserPassword(currentUser.id, currPass, newPass);
                    if (fb) {
                        fb.className = 'form-feedback-msg success';
                        fb.textContent = getText('passwordUpdated');
                    }
                    formChangePassword.reset();
                    showNotification(getText('passwordUpdated'));
                } catch (err) {
                    if (fb) {
                        fb.className = 'form-feedback-msg error';
                        fb.textContent = err.message;
                    }
                } finally {
                    if (btn) {
                        btn.disabled = false;
                        btn.textContent = getText('settingsChangePassBtn');
                    }
                }
            };
        }

        // Видалення власного акаунта назавжди
        if (btnDeleteAccount) {
            btnDeleteAccount.onclick = async () => {
                playClick();
                const currentUser = getCurrentUser();
                if (!currentUser || !currentUser.id) return;

                if (currentUser.isAdmin || currentUser.role === 'admin') {
                    alert(getText('adminCannotBeDeleted') || 'Акаунт адміністратора захищено від видалення.');
                    return;
                }

                const doDelete = await showCustomConfirm({
                    title: getText('confirmTitle') || 'Підтвердження',
                    message: getText('settingsDeleteConfirm') || 'Ви впевнені, що бажаєте безповоротно видалити свій акаунт?',
                    confirmText: getText('settingsDeleteAccount') || 'Видалити акаунт',
                    cancelText: getText('cancel') || 'Скасувати',
                    danger: true
                });
                if (!doDelete) return;

                btnDeleteAccount.disabled = true;
                btnDeleteAccount.textContent = '...';
                try {
                    await deleteCurrentUserAccount(currentUser.id);
                    clearLocalUserData();
                    if (settingsModal) settingsModal.classList.add('hidden');
                    initPlayerIdentity();
                    updateHeaderUserBadge();
                    if (typeof renderMenu === 'function') renderMenu();
                    showNotification(getText('settingsDeleteSuccess'));
                } catch (err) {
                    alert((getText('settingsDeleteError') || 'Помилка видалення акаунта: ') + (err.message || err));
                } finally {
                    btnDeleteAccount.disabled = false;
                    btnDeleteAccount.textContent = getText('settingsDeleteAccount');
                }
            };
        }

        const btnResetConf = document.getElementById('settings-reset-confirmations');
        if (btnResetConf) {
            btnResetConf.onclick = () => {
                playClick();
                localStorage.removeItem('neon_skip_admin_delete_confirm');
                showNotification(getText('confirmSettingsReset') || 'Налаштування підтверджень скинуто. Запити знову активні.');
            };
        }

        const authErrEl = document.getElementById('auth-error-msg');
        const clearAuthError = () => {
            if (authErrEl) {
                authErrEl.textContent = '';
                authErrEl.classList.add('hidden');
            }
        };
        if (authUserInput) authUserInput.addEventListener('input', clearAuthError);
        if (authPassInput) authPassInput.addEventListener('input', clearAuthError);

        const authTabLogin = document.getElementById('auth-tab-login');
        const authTabRegister = document.getElementById('auth-tab-register');
        if (authTabLogin) {
            authTabLogin.onclick = () => {
                playClick();
                setAuthMode(false);
            };
        }
        if (authTabRegister) {
            authTabRegister.onclick = () => {
                playClick();
                setAuthMode(true);
            };
        }

        if (btnOpenAuth && authModal) {
            btnOpenAuth.onclick = () => {
                playClick();
                setAuthMode(false);
                authModal.classList.remove('hidden');
                if (authUserInput) authUserInput.focus();
            };
        }

        if (authToggleMode) {
            authToggleMode.onclick = () => {
                playClick();
                setAuthMode(!isAuthRegisterMode);
            };
        }

        if (authForm) {
            authForm.onsubmit = async (e) => {
                e.preventDefault();
                const username = authUserInput?.value.trim();
                const password = authPassInput?.value.trim();
                if (!username || !password) return;

                if (isAuthRegisterMode && (username.length < 3 || username.length > 12)) {
                    if (authErrEl) {
                        authErrEl.textContent = getText('authUsernameLengthError') || "Ім'я користувача повинно містити від 3 до 12 символів.";
                        authErrEl.classList.remove('hidden');
                    } else {
                        alert(getText('authUsernameLengthError') || "Ім'я користувача повинно містити від 3 до 12 символів.");
                    }
                    return;
                }

                clearAuthError();
                authSubmit.disabled = true;
                authSubmit.innerText = getText('authWaiting') || 'Зачекайте...';

                try {
                    let user;
                    if (isAuthRegisterMode) {
                        user = await registerUser(username, password);
                        showNotification((getText('authRegisterSuccess') || 'Реєстрація успішна! Вітаємо, {username}').replace('{username}', user.username));
                    } else {
                        user = await loginUser(username, password);
                        showNotification((getText('authLoginSuccess') || 'Успішний вхід! Привіт, {username}').replace('{username}', user.username));
                    }
                    authModal.classList.add('hidden');
                    authForm.reset();
                    clearAuthError();
                } catch (err) {
                    if (authErrEl) {
                        authErrEl.textContent = err.message || String(err);
                        authErrEl.classList.remove('hidden');
                    } else {
                        alert(err.message || String(err));
                    }
                } finally {
                    authSubmit.disabled = false;
                    authSubmit.innerText = isAuthRegisterMode ? (getText('authRegisterSubmit') || 'Створити акаунт') : (getText('authLoginSubmit') || 'Увійти');
                }
            };
        }

        const btnGuestPlay = document.getElementById('auth-guest-play-btn');
        if (btnGuestPlay) {
            btnGuestPlay.onclick = () => {
                playClick();
                clearAuthError();
                authModal.classList.add('hidden');
                localStorage.setItem('neon_onboarding_shown', 'true');
                showNotification(getText('guestNotification') || 'Ви граєте як гість. Щоб зберегти аватарку та титули у хмарі, зареєструйтесь!');
            };
        }

        if (btnLogout) {
            btnLogout.onclick = async () => {
                playClick();
                const doLogout = await showCustomConfirm({
                    title: getText('confirmTitle') || 'Підтвердження',
                    message: getText('authLogoutConfirm') || 'Бажаєте вийти з акаунта?',
                    confirmText: getText('logout') || 'Вийти',
                    cancelText: getText('cancel') || 'Скасувати',
                    danger: false
                });
                if (doLogout) {
                    logoutUser();
                    // Повне очищення локального кешу та ізоляція перед переходом на гостьовий профіль
                    clearLocalUserData();
                    initPlayerIdentity();
                    updateHeaderUserBadge();
                    if (typeof renderMenu === 'function') renderMenu();
                    showNotification(getText('authLogoutSuccess') || 'Ви вийшли з системи.');
                }
            };
        }

        // Закриття модальних вікон по [x], кліку зовні або клавіші Escape
        document.querySelectorAll('.modal-close, .lb-close-btn, .close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const m = e.target.closest('.winner-overlay, .modal-overlay, .leaderboard-modal, .name-input-modal');
                if (m) m.classList.add('hidden');
            });
        });

        if (authModal) {
            authModal.addEventListener('mousedown', (e) => {
                if (e.target === authModal) authModal.classList.add('hidden');
            });
        }
        if (profileModal) {
            profileModal.addEventListener('mousedown', (e) => {
                if (e.target === profileModal) profileModal.classList.add('hidden');
            });
        }
        if (settingsModal) {
            settingsModal.addEventListener('mousedown', (e) => {
                if (e.target === settingsModal) settingsModal.classList.add('hidden');
            });
        }

        // ==========================================
        // Система друзів (Friends System Modal & Logic)
        // ==========================================
        const friendsModal = document.getElementById('friends-modal');
        const btnOpenFriends = document.getElementById('btn-open-friends');
        const friendsCloseBtn = document.getElementById('friends-close-btn');
        const friendsAddInput = document.getElementById('friends-add-input');
        const friendsAddBtn = document.getElementById('friends-add-btn');
        const friendsListContainer = document.getElementById('friends-list-container');
        const tabBtnFriends = document.getElementById('tab-btn-friends');
        const tabBtnRequests = document.getElementById('tab-btn-requests');
        const tabCountFriends = document.getElementById('tab-count-friends');
        const tabCountRequests = document.getElementById('tab-count-requests');

        let currentFriendsTab = 'friends';

        if (tabBtnFriends) {
            tabBtnFriends.onclick = () => {
                playClick();
                currentFriendsTab = 'friends';
                tabBtnFriends.classList.add('active');
                if (tabBtnRequests) tabBtnRequests.classList.remove('active');
                renderFriendsList();
            };
        }

        if (tabBtnRequests) {
            tabBtnRequests.onclick = () => {
                playClick();
                currentFriendsTab = 'requests';
                tabBtnRequests.classList.add('active');
                if (tabBtnFriends) tabBtnFriends.classList.remove('active');
                renderFriendsList();
            };
        }

        updateFriendsBadge = function() {
            const list = getCachedFriends();
            const incoming = getCachedIncomingRequests();
            const count = list.length;
            const inCount = incoming.length;

            const badgeHeader = document.getElementById('friends-badge-count');
            const badgeModal = document.getElementById('friends-modal-badge');

            if (tabCountFriends) tabCountFriends.textContent = count;
            if (tabCountRequests) {
                tabCountRequests.textContent = inCount;
                tabCountRequests.style.display = inCount > 0 ? 'inline-block' : 'none';
            }

            if (badgeHeader) {
                if (inCount > 0) {
                    badgeHeader.textContent = inCount;
                    badgeHeader.style.display = 'inline-flex';
                    badgeHeader.classList.add('visible', 'alert');
                } else {
                    badgeHeader.textContent = '';
                    badgeHeader.style.display = 'none';
                    badgeHeader.classList.remove('visible', 'alert');
                }
            }
            if (badgeModal) {
                badgeModal.textContent = inCount > 0 ? `${count} (+${inCount})` : count;
            }
        };

        renderFriendsList = function() {
            if (!friendsListContainer) return;
            updateFriendsBadge();

            if (currentFriendsTab === 'friends') {
                const list = getCachedFriends();
                if (!list || list.length === 0) {
                    friendsListContainer.innerHTML = `
                        <div class="friends-empty">
                            <div style="margin-bottom: 10px; opacity: 0.6; display: flex; justify-content: center;">${icons.users(38)}</div>
                            <div>${getText('friendsEmpty') || 'У вас поки немає доданих друзів. Знаходьте гравців у таблиці лідерів або надсилайте запит за ім\'ям!'}</div>
                        </div>
                    `;
                    return;
                }

                friendsListContainer.innerHTML = list.map(f => {
                    const fAvatarHtml = Cosmetics.getAvatarContent(f.name, f.avatarUrl);
                    const fFrameClass = Cosmetics.getFrameCssClass(f.selectedFrame);
                    const safeName = (f.name || 'Player').replace(/"/g, '&quot;');
                    const safeId = f.id || f.userId || '';
                    const idSnippet = safeId ? `ID: ${safeId.slice(0, 8)}...` : '';
                    const statusText = f.userStatus ? `«${escapeHtml(f.userStatus)}»` : idSnippet;
                    return `
                        <div class="friend-row" data-id="${safeId}">
                            <div class="friend-avatar ${fFrameClass}">${fAvatarHtml}</div>
                            <div class="friend-info" data-id="${safeId}" data-name="${safeName}">
                                <div class="friend-meta">
                                    <div class="friend-name">${safeName}</div>
                                    <div class="friend-stats-snippet">${statusText}</div>
                                </div>
                            </div>
                            <div class="friend-actions">
                                <button type="button" class="modern-btn modern-btn-secondary friend-view-btn" data-id="${safeId}" data-name="${safeName}" title="${getText('profileTitle') || 'Профіль'}">
                                    ${icons.user(14)}
                                </button>
                                <button type="button" class="modern-btn modern-btn-danger friend-del-btn" data-id="${safeId}" data-name="${safeName}" title="${getText('friendsRemove') || 'Видалити'}">
                                    ${icons.trash(14)}
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');

                friendsListContainer.querySelectorAll('.friend-info, .friend-view-btn').forEach(el => {
                    el.onclick = (e) => {
                        e.stopPropagation();
                        playClick();
                        const id = el.dataset.id;
                        const name = el.dataset.name;
                        if (openPlayerProfileModal) {
                            openPlayerProfileModal({ id, name, userId: id });
                        }
                    };
                });

                friendsListContainer.querySelectorAll('.friend-del-btn').forEach(btn => {
                    btn.onclick = async (e) => {
                        e.stopPropagation();
                        playClick();
                        const id = btn.dataset.id;
                        const name = btn.dataset.name;
                        if (id) {
                            const confirmMsg = (getText('friendConfirmUnfriend') || 'Видалити гравця "{name}" з друзів?').replace('{name}', name);
                            if (!confirm(confirmMsg)) return;
                            await removeFriend(id);
                            const msg = (getText('friendRemoved') || 'Гравця "{name}" видалено з друзів.').replace('{name}', name);
                            showNotification(msg);
                            renderFriendsList();
                            updateFriendsBadge();
                        }
                    };
                });
            } else {
                // Вкладка: Запити (Requests)
                const incoming = getCachedIncomingRequests();
                const outgoing = getCachedOutgoingRequests();

                if (incoming.length === 0 && outgoing.length === 0) {
                    friendsListContainer.innerHTML = `
                        <div class="friends-empty">
                            <div style="margin-bottom: 10px; opacity: 0.6; display: flex; justify-content: center;">${icons.clock(38)}</div>
                            <div>${getText('friendRequestsEmpty') || 'Немає активних запитів у друзі.'}</div>
                        </div>
                    `;
                    return;
                }

                let html = '';

                // Секція вхідних запитів
                if (incoming.length > 0) {
                    html += `<div style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--highlight); margin: 6px 0 10px 0;">${getText('friendIncomingTitle') || 'Вхідні запити'} (${incoming.length})</div>`;
                    html += incoming.map(req => {
                        const fromId = req.fromId || req.id || '';
                        const fromName = req.fromName || 'Player';
                        const initial = fromName.slice(0, 1).toUpperCase();
                        const safeName = fromName.replace(/"/g, '&quot;');
                        return `
                            <div class="friend-request-row" data-id="${fromId}">
                                <div class="friend-request-info">
                                    <div class="friend-avatar">${initial}</div>
                                    <div class="friend-meta">
                                        <div class="friend-name">${safeName}</div>
                                        <div class="friend-req-subtitle">${getText('profileAddFriend') || 'Надіслав(ла) запит'}</div>
                                    </div>
                                </div>
                                <div class="friend-request-actions">
                                    <button type="button" class="modern-btn modern-btn-primary friend-req-accept-btn" data-id="${fromId}" data-name="${safeName}" title="${getText('friendRequestAccept') || 'Прийняти'}">
                                        ${icons.check(14)} <span>${getText('friendRequestAccept') || 'Прийняти'}</span>
                                    </button>
                                    <button type="button" class="modern-btn modern-btn-danger friend-req-decline-btn" data-id="${fromId}" data-name="${safeName}" title="${getText('friendRequestDecline') || 'Відхилити'}">
                                        ${icons.close(14)}
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('');
                }

                // Секція вихідних запитів
                if (outgoing.length > 0) {
                    html += `<div style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin: 16px 0 10px 0;">${getText('friendOutgoingTitle') || 'Вихідні запити'} (${outgoing.length})</div>`;
                    html += outgoing.map(req => {
                        const toId = req.toId || req.id || '';
                        const toName = req.toName || 'Player';
                        const initial = toName.slice(0, 1).toUpperCase();
                        const safeName = toName.replace(/"/g, '&quot;');
                        return `
                            <div class="friend-request-row" data-id="${toId}">
                                <div class="friend-request-info">
                                    <div class="friend-avatar" style="opacity: 0.75;">${initial}</div>
                                    <div class="friend-meta">
                                        <div class="friend-name">${safeName}</div>
                                        <div class="friend-stats-snippet">${getText('friendRequestPending') || 'Очікує підтвердження'}</div>
                                    </div>
                                </div>
                                <div class="friend-request-actions">
                                    <button type="button" class="modern-btn modern-btn-secondary friend-req-cancel-btn" data-id="${toId}" data-name="${safeName}" title="${getText('friendRequestCancel') || 'Скасувати'}">
                                        ${icons.close(14)} <span>${getText('friendRequestCancel') || 'Скасувати'}</span>
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('');
                }

                friendsListContainer.innerHTML = html;

                // Обробники для кнопок прийняти/відхилити/скасувати
                friendsListContainer.querySelectorAll('.friend-req-accept-btn').forEach(btn => {
                    btn.onclick = async () => {
                        playClick();
                        const id = btn.dataset.id;
                        const name = btn.dataset.name;
                        btn.disabled = true;
                        try {
                            await acceptFriendRequest(id);
                            showNotification((getText('friendRequestAccepted') || 'Запит прийнято!').replace('{name}', name));
                            renderFriendsList();
                            updateFriendsBadge();
                        } catch (err) {
                            showNotification(err.message || 'Помилка');
                        }
                    };
                });

                friendsListContainer.querySelectorAll('.friend-req-decline-btn').forEach(btn => {
                    btn.onclick = async () => {
                        playClick();
                        const id = btn.dataset.id;
                        btn.disabled = true;
                        try {
                            await declineFriendRequest(id);
                            showNotification(getText('friendRequestDeclined') || 'Запит відхилено.');
                            renderFriendsList();
                            updateFriendsBadge();
                        } catch (err) {
                            showNotification(err.message || 'Помилка');
                        }
                    };
                });

                friendsListContainer.querySelectorAll('.friend-req-cancel-btn').forEach(btn => {
                    btn.onclick = async () => {
                        playClick();
                        const id = btn.dataset.id;
                        const name = btn.dataset.name;
                        const confirmMsg = (getText('friendConfirmCancel') || 'Скасувати запит до гравця "{name}"?').replace('{name}', name);
                        if (!confirm(confirmMsg)) return;
                        btn.disabled = true;
                        try {
                            await cancelFriendRequest(id);
                            showNotification(getText('friendRequestDeclined') || 'Запит скасовано.');
                            renderFriendsList();
                            updateFriendsBadge();
                        } catch (err) {
                            showNotification(err.message || 'Помилка');
                        }
                    };
                });
            }
        };

        async function openFriendsModal() {
            if (!friendsModal) return;
            playClick();
            friendsModal.classList.remove('hidden');
            await loadUserFriends().catch(e => console.warn(e));
            renderFriendsList();
        }

        function closeFriendsModal() {
            playClick();
            if (friendsModal) friendsModal.classList.add('hidden');
        }

        if (btnOpenFriends) btnOpenFriends.onclick = openFriendsModal;
        if (friendsCloseBtn) friendsCloseBtn.onclick = closeFriendsModal;
        if (friendsModal) {
            friendsModal.addEventListener('mousedown', (e) => {
                if (e.target === friendsModal) closeFriendsModal();
            });
        }

        const handleAddFriendSubmit = async () => {
            if (!friendsAddInput) return;
            const queryVal = friendsAddInput.value.trim();
            if (!queryVal) return;

            playClick();
            if (friendsAddBtn) friendsAddBtn.disabled = true;
            try {
                const curU = getCurrentUser();
                const myId = curU?.id || localStorage.getItem('playerId');
                const myName = curU?.username || localStorage.getItem('playerName');

                if (queryVal.toLowerCase() === myId?.toLowerCase() || (myName && queryVal.toLowerCase() === myName.toLowerCase())) {
                    showNotification(getText('cantAddSelf') || 'Ви не можете додати себе у друзі!');
                    return;
                }

                if (isFriend(queryVal)) {
                    showNotification(getText('alreadyFriends') || 'Цей гравець уже є у вашому списку друзів!');
                    return;
                }

                if (hasOutgoingRequest(queryVal)) {
                    showNotification(getText('friendAlreadySent') || 'Запит уже надіслано і очікує підтвердження!');
                    return;
                }

                // Global search
                const found = await searchPlayerGlobal(queryVal);
                let targetId = queryVal;
                let targetName = queryVal;

                if (found && found.length > 0) {
                    const exact = found.find(p => p.name.toLowerCase() === queryVal.toLowerCase() || p.id.toLowerCase() === queryVal.toLowerCase());
                    const target = exact || found[0];
                    targetId = target.id;
                    targetName = target.name;
                }

                if (targetId === myId) {
                    showNotification(getText('cantAddSelf') || 'Ви не можете додати себе у друзі!');
                    return;
                }

                if (isFriend(targetId)) {
                    showNotification(getText('alreadyFriends') || 'Цей гравець уже є у вашому списку друзів!');
                    return;
                }

                if (hasOutgoingRequest(targetId)) {
                    showNotification(getText('friendAlreadySent') || 'Запит уже надіслано і очікує підтвердження!');
                    return;
                }

                await sendFriendRequest(targetId, targetName);
                friendsAddInput.value = '';
                const msg = (getText('friendRequestSent') || 'Запит у друзі надіслано гравцю "{name}"!').replace('{name}', targetName);
                showNotification(msg);
                renderFriendsList();
                updateFriendsBadge();
            } catch (err) {
                showNotification(err.message || getText('friendNotFound') || 'Помилка');
            } finally {
                if (friendsAddBtn) friendsAddBtn.disabled = false;
            }
        };

        if (friendsAddBtn) friendsAddBtn.onclick = handleAddFriendSubmit;
        if (friendsAddInput) {
            friendsAddInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleAddFriendSubmit();
            });
        }

        // Початкове завантаження друзів та оновлення бейджа
        loadUserFriends().then(() => updateFriendsBadge()).catch(e => console.warn(e));

        // ==========================================
        // Магазин тем для ігрового поля (Field Themes Shop)
        // ==========================================
        const shopModal = document.getElementById('shop-modal');
        const btnOpenShop = document.getElementById('btn-open-shop');
        const shopCloseBtnEl = document.getElementById('shop-close-btn');
        const shopSearchInputEl = document.getElementById('shop-search-input');
        const shopSearchClearBtn = document.getElementById('shop-search-clear');
        const shopSortSelectEl = document.getElementById('shop-sort-select');
        const shopEmptyMsgEl = document.getElementById('shop-empty-msg');

        let shopSearchQuery = '';
        let shopSortMode = 'default';

        if (shopSearchInputEl) {
            shopSearchInputEl.addEventListener('input', () => {
                shopSearchQuery = shopSearchInputEl.value.trim().toLowerCase();
                if (shopSearchClearBtn) {
                    shopSearchClearBtn.classList.toggle('hidden', !shopSearchInputEl.value);
                }
                renderShop();
            });
        }

        if (shopSearchClearBtn) {
            shopSearchClearBtn.addEventListener('click', () => {
                if (shopSearchInputEl) {
                    shopSearchInputEl.value = '';
                    shopSearchQuery = '';
                    shopSearchClearBtn.classList.add('hidden');
                    shopSearchInputEl.focus();
                    renderShop();
                }
            });
        }

        if (shopSortSelectEl) {
            shopSortSelectEl.addEventListener('change', () => {
                shopSortMode = shopSortSelectEl.value || 'default';
                renderShop();
            });
        }

        updateShopCoins = function() {
            const { balance } = FieldThemes.getCoinsData(songsDB);
            const headerCoinEl = document.getElementById('header-coin-count');
            if (headerCoinEl) headerCoinEl.textContent = balance.toLocaleString();
            const shopBalanceEl = document.getElementById('shop-balance-amount');
            if (shopBalanceEl) shopBalanceEl.textContent = balance.toLocaleString();
        };

        // ==========================================
        // МАГАЗИН ТЕМ (Показує ТІЛЬКИ некуплені теми)
        // ==========================================
        renderShop = function() {
            const grid = document.getElementById('shop-themes-grid');
            if (!grid) return;
            updateShopCoins();

            const unlockedIds = FieldThemes.getUnlockedThemes();
            const allOwnedMsgEl = document.getElementById('shop-all-owned-msg');

            // Відображаємо виключно ще не придбані теми
            let themes = FieldThemes.FIELD_THEMES.filter(t => !unlockedIds.includes(t.id));

            // Якщо всі теми вже викуплено
            if (themes.length === 0 && !shopSearchQuery) {
                if (allOwnedMsgEl) allOwnedMsgEl.classList.remove('hidden');
                if (shopEmptyMsgEl) shopEmptyMsgEl.classList.add('hidden');
                grid.innerHTML = '';
                return;
            } else if (allOwnedMsgEl) {
                allOwnedMsgEl.classList.add('hidden');
            }

            // 1. Фільтрація за пошуковим запитом
            if (shopSearchQuery) {
                themes = themes.filter(theme => {
                    const name = (theme.customName || getText(theme.nameKey) || theme.id).toLowerCase();
                    const desc = (theme.customDesc || getText(theme.descKey) || '').toLowerCase();
                    const badge = (theme.customBadge || getText(theme.badgeKey) || '').toLowerCase();
                    return name.includes(shopSearchQuery) || desc.includes(shopSearchQuery) || badge.includes(shopSearchQuery);
                });
            }

            // 2. Сортування за ціною (з урахуванням діючих знижок)
            if (shopSortMode === 'priceAsc') {
                themes.sort((a, b) => FieldThemes.getThemeEffectivePrice(a) - FieldThemes.getThemeEffectivePrice(b));
            } else if (shopSortMode === 'priceDesc') {
                themes.sort((a, b) => FieldThemes.getThemeEffectivePrice(b) - FieldThemes.getThemeEffectivePrice(a));
            }

            // 3. Показ сповіщення, якщо за пошуком нічого не знайдено
            if (shopEmptyMsgEl) {
                shopEmptyMsgEl.classList.toggle('hidden', themes.length > 0);
            }

            grid.innerHTML = themes.map(theme => {
                const name = theme.customName || getText(theme.nameKey) || theme.id;
                const desc = theme.customDesc || getText(theme.descKey) || '';
                const badge = theme.customBadge || getText(theme.badgeKey) || '';

                let previewContent = '';
                if (theme.image) {
                    previewContent = `<img src="${theme.image}" alt="${name}" class="theme-card-img" />`;
                } else {
                    previewContent = `
                        <div style="width: 100%; height: 100%; background: ${theme.previewBg}; display: flex; align-items: center; justify-content: center; position: relative;">
                            <div style="position: absolute; width: 64px; height: 64px; border-radius: 50%; background: ${theme.accentColor}; opacity: 0.25; filter: blur(14px);"></div>
                            <div style="z-index: 1; display: flex; gap: 8px;">
                                <div style="width: 14px; height: 38px; border-radius: 4px; background: ${theme.colors.strings[2]}; box-shadow: 0 0 10px ${theme.accentColor};"></div>
                                <div style="width: 14px; height: 50px; border-radius: 4px; background: ${theme.colors.strings[3]}; box-shadow: 0 0 12px ${theme.accentColor};"></div>
                                <div style="width: 14px; height: 32px; border-radius: 4px; background: ${theme.colors.strings[1]}; box-shadow: 0 0 8px ${theme.accentColor};"></div>
                            </div>
                        </div>
                    `;
                }

                const isDiscount = Boolean(theme.isDiscountActive && typeof theme.effectivePrice === 'number' && theme.effectivePrice < theme.price);
                const finalPrice = isDiscount ? theme.effectivePrice : theme.price;

                let priceDisplay = '';
                let discountBadge = '';
                if (isDiscount) {
                    priceDisplay = `
                        <span class="theme-card-price theme-price-discounted">
                            <span class="theme-price-original"><s>${theme.price}</s></span>
                            ${icons.coin(16)} ${finalPrice}
                        </span>
                    `;
                    discountBadge = `<div class="theme-card-badge theme-badge-sale">🔥 -${theme.discountPercent}%</div>`;
                } else {
                    priceDisplay = `<span class="theme-card-price">${icons.coin(16)} ${finalPrice}</span>`;
                }

                const buyText = (getText('shopBuy') || 'Купити за {price} 🪙').replace('{price}', finalPrice);

                return `
                    <div class="shop-theme-card" data-card-theme-id="${theme.id}">
                        <div class="theme-card-preview">
                            ${previewContent}
                            ${discountBadge ? discountBadge : ''}
                            ${badge ? `<div class="theme-card-badge">${badge}</div>` : ''}
                        </div>
                        <div class="theme-card-body">
                            <div class="theme-card-title">
                                <span>${name}</span>
                            </div>
                            <div class="theme-card-desc">${desc}</div>
                            <div class="theme-card-footer">
                                ${priceDisplay}
                                <div style="display: flex; gap: 6px; align-items: center;">
                                    <button type="button" class="theme-action-btn btn-theme-preview" data-preview-theme="${theme.id}">
                                        ${getText('previewThemeBtn') || 'Опробувати'}
                                    </button>
                                    <button type="button" class="theme-action-btn btn-theme-buy" data-buy-theme="${theme.id}" data-price="${finalPrice}">
                                        ${buyText}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            grid.querySelectorAll('[data-buy-theme]').forEach(btn => {
                btn.onclick = async () => {
                    playClick();
                    const themeId = btn.getAttribute('data-buy-theme');
                    try {
                        const res = FieldThemes.purchaseTheme(themeId, songsDB);
                        if (res.success) {
                            showNotification(getText('shopBoughtSuccess') || 'Тему успішно придбано та додано до Кастомізації!');
                            applyActiveThemeVisuals();
                            renderShop();
                            if (typeof renderCustomizationModal === 'function') renderCustomizationModal();
                            syncGlobalProgress();
                        }
                    } catch (err) {
                        showNotification(err.message === "Недостатньо монет" ? (getText('shopNotEnoughCoins') || 'Недостатньо монет!') : err.message);
                    }
                };
            });

            grid.querySelectorAll('[data-preview-theme]').forEach(btn => {
                btn.onclick = () => {
                    playClick();
                    const themeId = btn.getAttribute('data-preview-theme');
                    openThemePreviewChooser(themeId, 'shop');
                };
            });
        };

        openShopModal = function() {
            if (!shopModal) return;
            playClick();
            i18n.updateDOM();
            if (shopSearchInputEl) {
                shopSearchInputEl.value = '';
                shopSearchQuery = '';
            }
            if (shopSearchClearBtn) shopSearchClearBtn.classList.add('hidden');
            if (shopSortSelectEl) {
                shopSortSelectEl.value = shopSortMode;
            }
            renderShop();
            shopModal.classList.remove('hidden');
        };

        closeShopModal = function() {
            if (shopModal) shopModal.classList.add('hidden');
        };

        const shopBottomCloseBtnEl = document.getElementById('shop-bottom-close-btn');
        if (shopBottomCloseBtnEl) shopBottomCloseBtnEl.onclick = () => { playClick(); closeShopModal(); };

        if (btnOpenShop) btnOpenShop.onclick = openShopModal;
        if (shopCloseBtnEl) shopCloseBtnEl.onclick = () => { playClick(); closeShopModal(); };
        if (shopModal) {
            shopModal.addEventListener('mousedown', (e) => {
                if (e.target === shopModal) closeShopModal();
            });
            shopModal.addEventListener('touchstart', (e) => {
                if (e.target === shopModal) closeShopModal();
            }, { passive: true });
        }

        // ==========================================
        // МОДАЛЬНЕ ВІКНО КАСТОМІЗАЦІЇ (Themes, Frames, Titles)
        // ==========================================
        const customizationModal = document.getElementById('customization-modal');
        const btnOpenCustomization = document.getElementById('btn-open-customization');
        const customizationCloseBtn = document.getElementById('customization-close-btn');
        const custBottomCloseBtn = document.getElementById('customization-bottom-close-btn');

        let activeCustTab = 'themes';

        function switchCustomizationTab(tabName) {
            activeCustTab = tabName;
            document.querySelectorAll('.cust-main-tab').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.custTab === tabName);
            });
            document.getElementById('cust-tab-themes')?.classList.toggle('hidden', tabName !== 'themes');
            document.getElementById('cust-tab-themes')?.classList.toggle('active', tabName === 'themes');

            document.getElementById('cust-tab-frames')?.classList.toggle('hidden', tabName !== 'frames');
            document.getElementById('cust-tab-frames')?.classList.toggle('active', tabName === 'frames');

            document.getElementById('cust-tab-titles')?.classList.toggle('hidden', tabName !== 'titles');
            document.getElementById('cust-tab-titles')?.classList.toggle('active', tabName === 'titles');

            if (tabName === 'themes') renderCustomizationThemes();
            else if (tabName === 'frames') renderCustomizationFrames();
            else if (tabName === 'titles') renderCustomizationTitles();
        }

        document.querySelectorAll('.cust-main-tab').forEach(btn => {
            btn.onclick = () => {
                playClick();
                switchCustomizationTab(btn.dataset.custTab);
            };
        });

        function renderCustomizationThemes() {
            const grid = document.getElementById('cust-themes-grid');
            if (!grid) return;

            const activeId = FieldThemes.getActiveThemeId();
            const unlockedIds = FieldThemes.getUnlockedThemes();

            // Показуємо всі розблоковані теми
            const themes = FieldThemes.FIELD_THEMES.filter(t => unlockedIds.includes(t.id));

            grid.innerHTML = themes.map(theme => {
                const isActive = (theme.id === activeId);
                const name = theme.customName || getText(theme.nameKey) || theme.id;
                const desc = theme.customDesc || getText(theme.descKey) || '';
                const badge = theme.customBadge || getText(theme.badgeKey) || '';

                let previewContent = '';
                if (theme.image) {
                    previewContent = `<img src="${theme.image}" alt="${name}" class="theme-card-img" />`;
                } else {
                    previewContent = `
                        <div style="width: 100%; height: 100%; background: ${theme.previewBg}; display: flex; align-items: center; justify-content: center; position: relative;">
                            <div style="position: absolute; width: 64px; height: 64px; border-radius: 50%; background: ${theme.accentColor}; opacity: 0.25; filter: blur(14px);"></div>
                            <div style="z-index: 1; display: flex; gap: 8px;">
                                <div style="width: 14px; height: 38px; border-radius: 4px; background: ${theme.colors.strings[2]}; box-shadow: 0 0 10px ${theme.accentColor};"></div>
                                <div style="width: 14px; height: 50px; border-radius: 4px; background: ${theme.colors.strings[3]}; box-shadow: 0 0 12px ${theme.accentColor};"></div>
                                <div style="width: 14px; height: 32px; border-radius: 4px; background: ${theme.colors.strings[1]}; box-shadow: 0 0 8px ${theme.accentColor};"></div>
                            </div>
                        </div>
                    `;
                }

                let actionBtnHtml = '';
                if (isActive) {
                    actionBtnHtml = `<button type="button" class="theme-action-btn btn-theme-equipped" disabled>${getText('shopEquipped') || 'Активна'}</button>`;
                } else {
                    actionBtnHtml = `<button type="button" class="theme-action-btn btn-theme-equip" data-cust-equip-theme="${theme.id}">${getText('shopEquip') || 'Одягнути'}</button>`;
                }

                return `
                    <div class="shop-theme-card ${isActive ? 'active-theme' : ''}" data-card-theme-id="${theme.id}">
                        <div class="theme-card-preview">
                            ${previewContent}
                            ${badge ? `<div class="theme-card-badge">${badge}</div>` : ''}
                        </div>
                        <div class="theme-card-body">
                            <div class="theme-card-title">
                                <span>${name}</span>
                                ${isActive ? `<span style="font-size: 0.78rem; color: #38bdf8; font-weight: 700;">● Активна</span>` : ''}
                            </div>
                            <div class="theme-card-desc">${desc}</div>
                            <div class="theme-card-footer" style="display: flex; gap: 6px; justify-content: flex-end;">
                                <button type="button" class="theme-action-btn btn-theme-preview" data-preview-theme="${theme.id}">
                                    ${getText('previewThemeBtn') || 'Опробувати'}
                                </button>
                                ${actionBtnHtml}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            grid.querySelectorAll('[data-cust-equip-theme]').forEach(btn => {
                btn.onclick = () => {
                    playClick();
                    const themeId = btn.getAttribute('data-cust-equip-theme');
                    const ok = FieldThemes.setActiveThemeId(themeId);
                    if (ok) {
                        applyActiveThemeVisuals();
                        renderCustomizationThemes();
                        syncGlobalProgress();
                    }
                };
            });

            grid.querySelectorAll('[data-preview-theme]').forEach(btn => {
                btn.onclick = () => {
                    playClick();
                    const themeId = btn.getAttribute('data-preview-theme');
                    openThemePreviewChooser(themeId, 'customization');
                };
            });
        }

        function renderCustomizationFrames() {
            const panelFrames = document.getElementById('cust-panel-frames');
            if (!panelFrames) return;
            const cosm = Cosmetics.getLocalCosmetics();

            panelFrames.innerHTML = Cosmetics.FRAMES.map(f => {
                const isUnlocked = cosm.unlockedFrames.includes(f.id);
                const isEquipped = cosm.selectedFrame === f.id;
                const frameName = getText(f.nameKey) || f.id;
                const frameDesc = getText(f.descKey) || '';
                const statusLabel = isEquipped 
                    ? (getText('custEquipped') || 'Обрано')
                    : (isUnlocked ? (getText('custEquip') || 'Обрати') : (getText('custLocked') || 'Заблоковано'));
                const statusCls = isEquipped ? 'equipped' : (isUnlocked ? 'unlocked' : 'locked');
                return `
                    <div class="cosmetic-item-card ${statusCls}" data-frame-id="${f.id}" title="${escapeHtml(frameDesc)}">
                        <div class="cust-frame-preview ${f.cssClass}">${isUnlocked ? '★' : '🔒'}</div>
                        <div class="cust-item-info">
                            <div class="cust-item-name">${escapeHtml(frameName)}</div>
                            <div class="cust-item-desc">${escapeHtml(frameDesc)}</div>
                        </div>
                        <span class="cust-status-badge ${statusCls}">${statusLabel}</span>
                    </div>
                `;
            }).join('');

            panelFrames.querySelectorAll('.cosmetic-item-card').forEach(card => {
                card.onclick = async () => {
                    const frameId = card.dataset.frameId;
                    const cosm = Cosmetics.getLocalCosmetics();
                    if (!cosm.unlockedFrames.includes(frameId)) {
                        playMiss();
                        return;
                    }
                    playClick();
                    Cosmetics.saveLocalCosmetics({ selectedFrame: frameId });
                    renderCustomizationFrames();
                    updateHeaderUserBadge();
                    const myPlayerId = localStorage.getItem('playerId');
                    if (myPlayerId) {
                        try {
                            await setDoc(doc(db, "global_leaderboard", myPlayerId), { selectedFrame: frameId }, { merge: true });
                            await setDoc(doc(db, "user_progress", myPlayerId), { selectedFrame: frameId }, { merge: true });
                        } catch (e) { console.warn(e); }
                        syncGlobalProgress();
                    }
                };
            });
        }

        function renderCustomizationTitles() {
            const panelTitles = document.getElementById('cust-panel-titles');
            if (!panelTitles) return;
            const cosm = Cosmetics.getLocalCosmetics();

            panelTitles.innerHTML = Cosmetics.TITLES.map(t => {
                const isUnlocked = cosm.unlockedTitles.includes(t.id);
                const isEquipped = cosm.selectedTitle === t.id;
                const titleName = getText(t.nameKey) || t.id;
                const titleDesc = getText(t.descKey) || '';
                const statusLabel = isEquipped 
                    ? (getText('custEquipped') || 'Обрано')
                    : (isUnlocked ? (getText('custEquip') || 'Обрати') : (getText('custLocked') || 'Заблоковано'));
                const statusCls = isEquipped ? 'equipped' : (isUnlocked ? 'unlocked' : 'locked');
                return `
                    <div class="cosmetic-item-card ${statusCls}" data-title-id="${t.id}" title="${escapeHtml(titleDesc)}">
                        <div class="cust-frame-preview" style="font-size: 0.95rem;">${isUnlocked ? '👑' : '🔒'}</div>
                        <div class="cust-item-info">
                            <div class="cust-item-name">${escapeHtml(titleName)}</div>
                            <div class="cust-item-desc">${escapeHtml(titleDesc)}</div>
                        </div>
                        <span class="cust-status-badge ${statusCls}">${statusLabel}</span>
                    </div>
                `;
            }).join('');

            panelTitles.querySelectorAll('.cosmetic-item-card').forEach(card => {
                card.onclick = async () => {
                    const titleId = card.dataset.titleId;
                    const cosm = Cosmetics.getLocalCosmetics();
                    if (!cosm.unlockedTitles.includes(titleId)) {
                        playMiss();
                        return;
                    }
                    playClick();
                    Cosmetics.saveLocalCosmetics({ selectedTitle: titleId });
                    renderCustomizationTitles();
                    const myPlayerId = localStorage.getItem('playerId');
                    if (myPlayerId) {
                        try {
                            await setDoc(doc(db, "global_leaderboard", myPlayerId), { selectedTitle: titleId }, { merge: true });
                            await setDoc(doc(db, "user_progress", myPlayerId), { selectedTitle: titleId }, { merge: true });
                        } catch (e) { console.warn(e); }
                        syncGlobalProgress();
                    }
                };
            });
        }

        renderCustomizationModal = function() {
            switchCustomizationTab(activeCustTab);
        };

        openCustomizationModal = function() {
            if (!customizationModal) return;
            playClick();
            i18n.updateDOM();
            renderCustomizationModal();
            customizationModal.classList.remove('hidden');
        };

        closeCustomizationModal = function() {
            if (customizationModal) customizationModal.classList.add('hidden');
        };

        if (btnOpenCustomization) btnOpenCustomization.onclick = openCustomizationModal;
        if (customizationCloseBtn) customizationCloseBtn.onclick = () => { playClick(); closeCustomizationModal(); };
        if (custBottomCloseBtn) custBottomCloseBtn.onclick = () => { playClick(); closeCustomizationModal(); };
        if (customizationModal) {
            customizationModal.addEventListener('mousedown', (e) => {
                if (e.target === customizationModal) closeCustomizationModal();
            });
            customizationModal.addEventListener('touchstart', (e) => {
                if (e.target === customizationModal) closeCustomizationModal();
            }, { passive: true });
        }

        // ==========================================
        // РЕЖИМ 20-СЕКУНДНОГО ТЕСТ-ДРАЙВУ ТЕМИ З АВТО-БОТОМ
        // ==========================================
        openThemePreviewChooser = function(themeId, returnModal = 'shop') {
            State.previewThemeId = themeId;
            State.previewReturnModal = returnModal;

            const modal = document.getElementById('theme-preview-modal');
            const themeNameEl = document.getElementById('theme-preview-theme-name');
            const trackSelect = document.getElementById('preview-track-select');
            if (!modal) return;

            const theme = FieldThemes.getThemeById(themeId);
            const localizedThemeName = theme ? (theme.customName || getText(theme.nameKey) || theme.id) : themeId;
            if (themeNameEl) {
                themeNameEl.textContent = `${getText('themeLabel') || 'Тема'}: ${localizedThemeName}`;
            }

            if (trackSelect && Array.isArray(songsDB)) {
                trackSelect.innerHTML = songsDB.map((s, idx) => {
                    return `<option value="${idx}">${escapeHtml(s.artist)} — ${escapeHtml(s.title)}</option>`;
                }).join('');
                if (State.currentSongIndex >= 0 && State.currentSongIndex < songsDB.length) {
                    trackSelect.value = String(State.currentSongIndex);
                }
            }

            modal.classList.remove('hidden');
        };

        startPreviewCountdown = function() {
            if (!State.isPreviewMode) return;
            if (State.previewTimerId) clearTimeout(State.previewTimerId);
            if (State.previewIntervalId) clearInterval(State.previewIntervalId);

            const hudBanner = document.getElementById('theme-preview-hud');
            const timerEl = document.getElementById('preview-hud-timer');
            if (hudBanner) hudBanner.classList.remove('hidden');

            let secondsLeft = 20;
            if (timerEl) timerEl.textContent = `${secondsLeft}s`;

            State.previewIntervalId = setInterval(() => {
                if (!State.isPreviewMode) {
                    clearInterval(State.previewIntervalId);
                    State.previewIntervalId = null;
                    return;
                }
                secondsLeft--;
                if (timerEl) timerEl.textContent = `${Math.max(0, secondsLeft)}s`;
                if (secondsLeft <= 0) {
                    clearInterval(State.previewIntervalId);
                    State.previewIntervalId = null;
                }
            }, 1000);

            State.previewTimerId = setTimeout(() => {
                if (State.isPreviewMode) {
                    exitThemePreview();
                }
            }, 20000);
        };

        startThemePreview = function(themeId, songIdx) {
            if (State.previewTimerId) {
                clearTimeout(State.previewTimerId);
                State.previewTimerId = null;
            }
            if (State.previewIntervalId) {
                clearInterval(State.previewIntervalId);
                State.previewIntervalId = null;
            }

            const previewModal = document.getElementById('theme-preview-modal');
            if (previewModal) previewModal.classList.add('hidden');
            if (shopModal) shopModal.classList.add('hidden');
            if (customizationModal) customizationModal.classList.add('hidden');

            State.previewOriginalTheme = FieldThemes.getActiveThemeId();
            State.previewOriginalBotState = Boolean(State.isBotEnabled);
            State.isPreviewMode = true;

            FieldThemes.setPreviewThemeOverride(themeId);
            applyActiveThemeVisuals();
            State.isBotEnabled = true;

            const hudBanner = document.getElementById('theme-preview-hud');
            if (hudBanner) hudBanner.classList.add('hidden');

            const sIdx = (typeof songIdx === 'number' && songIdx >= 0 && songIdx < songsDB.length) ? songIdx : 0;
            startGame(sIdx);
        };

        exitThemePreview = function() {
            if (State.previewTimerId) {
                clearTimeout(State.previewTimerId);
                State.previewTimerId = null;
            }
            if (State.previewIntervalId) {
                clearInterval(State.previewIntervalId);
                State.previewIntervalId = null;
            }

            const wasPreview = State.isPreviewMode;
            const retModal = State.previewReturnModal;
            const origTheme = State.previewOriginalTheme;
            const origBot = State.previewOriginalBotState;

            State.isPreviewMode = false;

            FieldThemes.setPreviewThemeOverride(null);
            applyActiveThemeVisuals();
            State.isBotEnabled = Boolean(origBot);

            cleanLevelRemnants();
            quitGame();

            const hudBanner = document.getElementById('theme-preview-hud');
            if (hudBanner) hudBanner.classList.add('hidden');

            if (wasPreview) {
                showNotification(getText('previewCompletedToast') || 'Тест-драйв теми завершено');
                if (retModal === 'shop') {
                    openShopModal();
                } else {
                    openCustomizationModal();
                }
            }
        };

        window.startThemePreview = startThemePreview;
        window.exitThemePreview = exitThemePreview;

        const btnStartThemePreview = document.getElementById('btn-start-theme-preview');
        if (btnStartThemePreview) {
            btnStartThemePreview.onclick = () => {
                const trackSelect = document.getElementById('preview-track-select');
                const songIdx = parseInt(trackSelect?.value || '0', 10);
                startThemePreview(State.previewThemeId, songIdx);
            };
        }

        const themePreviewCloseBtn = document.getElementById('theme-preview-close-btn');
        if (themePreviewCloseBtn) {
            themePreviewCloseBtn.onclick = () => {
                const modal = document.getElementById('theme-preview-modal');
                if (modal) modal.classList.add('hidden');
            };
        }

        const btnExitPreview = document.getElementById('btn-exit-theme-preview');
        if (btnExitPreview) {
            btnExitPreview.onclick = () => {
                exitThemePreview();
            };
        }

        // Початкове оновлення балансу монет
        updateShopCoins();

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (adminEditModal && !adminEditModal.classList.contains('hidden')) {
                    closeAdminEditModal();
                    return;
                }
                if (adminModal && !adminModal.classList.contains('hidden')) closeAdminPanel();
                if (authModal && !authModal.classList.contains('hidden')) authModal.classList.add('hidden');
                if (profileModal && !profileModal.classList.contains('hidden')) profileModal.classList.add('hidden');
                if (settingsModal && !settingsModal.classList.contains('hidden')) settingsModal.classList.add('hidden');
                if (userProfileModal && !userProfileModal.classList.contains('hidden')) userProfileModal.classList.add('hidden');
                if (friendsModal && !friendsModal.classList.contains('hidden')) closeFriendsModal();
                if (shopModal && !shopModal.classList.contains('hidden')) closeShopModal();
                if (customizationModal && !customizationModal.classList.contains('hidden')) closeCustomizationModal();
                const previewModal = document.getElementById('theme-preview-modal');
                if (previewModal && !previewModal.classList.contains('hidden')) previewModal.classList.add('hidden');
                const lbModal = document.getElementById('lb-modal');
                if (lbModal) {
                    lbModal.style.opacity = '0';
                    lbModal.style.transform = 'translate(-50%, -45%) scale(0.95)';
                    setTimeout(() => lbModal.remove(), 250);
                }
            }
        });
    }

    // ==========================================
    // Критичне оновлення безпеки. Система протидії експлойтам під час переривань роботи браузера.
    // ==========================================
    
    // Моя функція для гарантованого примусового зняття всіх натискань. Вона перешкоджає можливості "заморозити" довгу ноту і фармити на ній нескінченні очки.
    function forceReleaseAllInputs() {
        // 1. Повне скидання булевих прапорців натискань у масиві State.keyState.
        State.keyState = [false, false, false, false];

        // 2. Зняття CSS-класів активності з елементів доріжок та обнулення прозорості візуальних променів Canvas.
        laneElements.forEach(el => { if (el) el.classList.remove('active'); });
        laneKeyElements.forEach(el => { if (el) el.classList.remove('active'); });
        State.laneBeamAlpha = [0, 0, 0, 0];

        // 3. Найважливіший крок: примусовий розрив процесу утримання всіх активних довгих нот.
        // Я роблю це, щоб гравець не міг отримати перевагу від системного лагу або згорнутої вкладки.
        State.holdingTiles.forEach((tile, lane) => {
            if (tile) {
                tile.holding = false;
                // Я навмисно встановлюю прапорець released = true, щоб запустити анімацію зникнення ноти і показати гравцю, що вона "зірвалася".
                tile.released = true; 
                if (tile.fadeStartTime === 0) tile.fadeStartTime = Date.now();
                // Я вимикаю ефект візуального світлового променя на цих доріжках.
                toggleHoldEffect(lane, false);
            }
        });
        // Повністю очищую масив об'єктів нот, які зараз нібито "утримуються".
        State.holdingTiles = [null, null, null, null];
    }

    // Обробник події blur (втрата фокусу вікном). Спрацьовує при вхідному дзвінку, натисканні Alt+Tab тощо.
    window.addEventListener('blur', () => {
        forceReleaseAllInputs(); 
        if (State.isPlaying && !State.isPaused) {
            togglePauseGame(true); 
        }
    });

    // Обробник visibilitychange (зміна видимості документа). Надійно спрацьовує на мобільних пристроях, коли користувач згортає браузер або блокує екран.
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            forceReleaseAllInputs(); 
            if (State.isPlaying && !State.isPaused) {
                togglePauseGame(true); 
            }
        }
    });

    window.addEventListener('pagehide', () => {
        forceReleaseAllInputs();
        if (State.isPlaying && !State.isPaused) {
            togglePauseGame(true);
        }
    });

    function resizeCanvas() { 
        State.isMobile = window.innerWidth < 768 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0 && window.innerWidth <= 1024);
        const containerW = (gameContainer && gameContainer.clientWidth > 0) ? gameContainer.clientWidth : (window.innerWidth || 480);
        const containerH = (gameContainer && gameContainer.clientHeight > 0) ? gameContainer.clientHeight : (window.innerHeight || 800);
        if (canvas) {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5); 
            const targetW = Math.round(containerW * dpr);
            const targetH = Math.round(containerH * dpr);

            // Якщо розміри вже ідеально збігаються, уникаємо скидання полотна і повторної генерації спрайтів
            if (canvas.width === targetW && canvas.height === targetH && State.gameWidth === containerW && State.gameHeight === containerH) {
                return;
            }

            State.gameWidth = containerW;
            State.gameHeight = containerH;
            
            canvas.width = targetW;
            canvas.height = targetH;
            
            ctx.setTransform(1, 0, 0, 1, 0, 0); 
            ctx.scale(dpr, dpr); 
            
            const laneW = State.gameWidth / 4;
            const padding = 6;
            const w = laneW - (padding * 2);
            // Динамічна висота ноти для 100% збереження пропорцій ПК на смартфонах (співвідношення 210 / 113 ≈ 1.858)
            CONFIG.noteHeight = Math.round(w * 1.858);
            
            initGradients();
            const isLight = document.body.getAttribute('data-theme') === 'light';
            SpriteCache.init(w, CONFIG.noteHeight, laneW, isLight);
            if (!State.glowSprite) createGlowSprite(128);
            gameRect = canvas.getBoundingClientRect();
            pixiRenderer.resize(containerW, containerH, dpr);
        }
    }
    window.addEventListener('resize', resizeCanvas);

    async function syncThemeSettingsFromCloud() {
        try {
            const settings = await getThemeSettings();
            if (settings && typeof settings === 'object') {
                FieldThemes.applyThemeOverrides(settings);
                if (typeof renderShop === 'function' && shopModal && !shopModal.classList.contains('hidden')) {
                    renderShop();
                }
                if (typeof renderCustomizationThemes === 'function' && customizationModal && !customizationModal.classList.contains('hidden')) {
                    renderCustomizationThemes();
                }
            }
        } catch (e) {
            console.warn("syncThemeSettingsFromCloud error:", e);
        }
    }

    // Initial Start
    initControls();
    loadCloudSongs();
    syncThemeSettingsFromCloud();
    setTimeout(resizeCanvas, 100);

    window.__gameDebug = { 
        State, CONFIG, songsDB: () => songsDB, startGame, endGame, quitGame, 
        NotePool, analyzeAudio, audioBufferCache, tileMapCache, SpriteCache, 
        handleInputDown, handleInputUp, draw, FieldThemes, updateProgressBar, 
        cleanLevelRemnants, i18n, updateGameText,
        openThemePreviewChooser, startThemePreview, exitThemePreview,
        openCustomizationModal, closeCustomizationModal, openShopModal, closeShopModal,
        renderCustomizationModal, renderShop
    };
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootGame);
} else {
    bootGame();
}
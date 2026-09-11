// ==========================================
// DANCE UI: CONTROLLER FOR CLOUD TRACKS & MODALS
// ==========================================
import { 
  getCurrentUser, 
  loginUser, 
  registerUser, 
  logoutUser, 
  onAuthStateChanged 
} from "../services/auth.js";
import { 
  uploadTrack, 
  addTrackByUrl,
  getAllTracks, 
  deleteTrack, 
  calculateAudioDuration 
} from "../services/admin.js";
import { saveGameStats, getUserStats } from "../services/stats.js";
import { audioEngine } from "../audio/audioEngine.js";
import { DanceGame } from "../game/danceGame.js";

class DanceUI {
  constructor() {
    this.game = null;
    this.cloudTracks = [];
    this.currentLanguage = localStorage.getItem("siteLang") || "UA";
    this.currentTheme = localStorage.getItem("siteTheme") || "dark";
  }

  init() {
    this.bindDom();
    this.applyTheme(this.currentTheme);
    this.setupEvents();
    this.setupAuth();
    this.loadCloudSongs();
  }

  bindDom() {
    // Main layers
    this.menuLayer = document.getElementById("menu-layer");
    this.gameContainer = document.getElementById("game-container");
    this.songList = document.getElementById("song-list");
    this.searchInput = document.getElementById("song-search-input");
    this.noSongsMsg = document.getElementById("no-songs-msg");
    this.loader = document.getElementById("loader");

    // Game Canvas & HUD
    this.canvas = document.getElementById("rhythmCanvas");
    this.scoreDisplay = document.getElementById("score-display");
    this.comboDisplay = document.getElementById("combo-display");
    this.progressBar = document.getElementById("game-progress-bar");
    this.ratingContainer = document.getElementById("rating-container");
    this.starElements = [
      document.getElementById("star-1"),
      document.getElementById("star-2"),
      document.getElementById("star-3")
    ];

    // Modals
    this.pauseModal = document.getElementById("pause-modal");
    this.resultScreen = document.getElementById("result-screen");
    this.authModal = document.getElementById("auth-modal");
    this.adminModal = document.getElementById("admin-modal");
    this.leaderboardModal = document.getElementById("leaderboard-modal");

    // Top Controls
    this.themeToggle = document.getElementById("themeToggle");
    this.soundToggle = document.getElementById("soundToggle");
    this.langToggle = document.getElementById("langToggle");
    this.langDropdown = document.querySelector(".lang-dropdown");
    this.globalBackBtn = document.getElementById("global-back-btn");

    // Auth Elements
    this.btnOpenAuth = document.getElementById("btn-open-auth");
    this.btnOpenAdmin = document.getElementById("btn-open-admin");
    this.userBadge = document.getElementById("user-badge");
    this.usernameSpan = document.getElementById("username-span");
    this.btnLogout = document.getElementById("btn-logout");

    // Admin Upload Elements
    this.adminForm = document.getElementById("admin-track-form");
    this.adminTabFile = document.getElementById("admin-tab-file");
    this.adminTabUrl = document.getElementById("admin-tab-url");
    this.adminFileGroup = document.getElementById("admin-file-group");
    this.adminUrlGroup = document.getElementById("admin-url-group");
    this.adminFileInput = document.getElementById("admin-file-input");
    this.adminUrlInput = document.getElementById("admin-url-input");
    this.adminTitleInput = document.getElementById("admin-title-input");
    this.adminArtistInput = document.getElementById("admin-artist-input");
    this.adminDurationInput = document.getElementById("admin-duration-input");
    this.adminUploadBtn = document.getElementById("admin-upload-btn");
    this.adminProgressBar = document.getElementById("admin-progress-bar");
    this.adminProgressFill = document.getElementById("admin-progress-fill");
    this.adminTrackList = document.getElementById("admin-track-list");
    this.adminRefreshBtn = document.getElementById("admin-refresh-tracks");
    this.adminCloseBtn = document.getElementById("admin-close-btn");
    this.adminBottomCloseBtn = document.getElementById("admin-bottom-close-btn");
    this.adminUploadMode = "file";

    // Game Pause & Result buttons
    this.btnPause = document.getElementById("btn-pause");
    this.btnResume = document.getElementById("btn-resume");
    this.btnQuit = document.getElementById("btn-quit");
    this.btnRestart = document.getElementById("btn-restart");
    this.btnMenuEnd = document.getElementById("btn-menu-end");
  }

  setupEvents() {
    // Theme toggle
    this.themeToggle?.addEventListener("click", () => {
      audioEngine.playClick();
      const nextTheme = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
      this.applyTheme(nextTheme);
    });

    // Sound toggle
    this.soundToggle?.addEventListener("click", () => {
      audioEngine.playClick();
      const isMuted = audioEngine.toggleMute();
      this.soundToggle.innerText = isMuted ? "🔇" : "🔊";
    });

    // Language switcher
    this.langToggle?.addEventListener("click", (e) => {
      e.stopPropagation();
      audioEngine.playClick();
      this.langDropdown?.classList.toggle("show-dropdown");
    });

    document.addEventListener("click", () => {
      this.langDropdown?.classList.remove("show-dropdown");
    });

    document.querySelectorAll(".lang-dropdown button").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        audioEngine.playClick();
        const lang = btn.dataset.lang;
        this.applyLanguage(lang);
        this.langDropdown?.classList.remove("show-dropdown");
      });
    });

    // Search filter
    this.searchInput?.addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      this.filterSongs(q);
    });

    // Global back button (from game to menu)
    this.globalBackBtn?.addEventListener("click", () => {
      audioEngine.playClick();
      this.quitToMenu();
    });

    // Pause controls
    this.btnPause?.addEventListener("click", () => {
      if (this.game) {
        this.game.pause();
        this.pauseModal?.classList.remove("hidden");
      }
    });

    this.btnResume?.addEventListener("click", () => {
      audioEngine.playClick();
      this.pauseModal?.classList.add("hidden");
      if (this.game) this.game.resume();
    });

    this.btnQuit?.addEventListener("click", () => {
      audioEngine.playClick();
      this.pauseModal?.classList.add("hidden");
      this.quitToMenu();
    });

    // Results screen controls
    this.btnRestart?.addEventListener("click", () => {
      audioEngine.playClick();
      this.resultScreen?.classList.add("hidden");
      if (this.currentActiveTrack) {
        this.playSong(this.currentActiveTrack);
      }
    });

    this.btnMenuEnd?.addEventListener("click", () => {
      audioEngine.playClick();
      this.resultScreen?.classList.add("hidden");
      this.quitToMenu();
    });

    // Setup Admin Modal events
    this.btnOpenAdmin?.addEventListener("click", () => {
      audioEngine.playClick();
      this.openModal(this.adminModal);
      this.renderAdminTrackList();
    });

    // Admin tab switching (File in Storage vs Direct URL)
    this.adminTabFile?.addEventListener("click", () => {
      audioEngine.playClick();
      this.adminUploadMode = "file";
      if (this.adminFileGroup) this.adminFileGroup.style.display = "block";
      if (this.adminUrlGroup) this.adminUrlGroup.style.display = "none";
      if (this.adminFileInput) this.adminFileInput.required = true;
      if (this.adminUrlInput) this.adminUrlInput.required = false;
      this.adminTabFile.style.background = "var(--highlight)";
      this.adminTabFile.style.color = "#000";
      this.adminTabFile.style.borderColor = "var(--highlight)";
      this.adminTabUrl.style.background = "transparent";
      this.adminTabUrl.style.color = "var(--text-color)";
      this.adminTabUrl.style.borderColor = "rgba(255,255,255,0.2)";
    });

    this.adminTabUrl?.addEventListener("click", () => {
      audioEngine.playClick();
      this.adminUploadMode = "url";
      if (this.adminFileGroup) this.adminFileGroup.style.display = "none";
      if (this.adminUrlGroup) this.adminUrlGroup.style.display = "block";
      if (this.adminFileInput) this.adminFileInput.required = false;
      if (this.adminUrlInput) this.adminUrlInput.required = true;
      this.adminTabUrl.style.background = "var(--highlight)";
      this.adminTabUrl.style.color = "#000";
      this.adminTabUrl.style.borderColor = "var(--highlight)";
      this.adminTabFile.style.background = "transparent";
      this.adminTabFile.style.color = "var(--text-color)";
      this.adminTabFile.style.borderColor = "rgba(255,255,255,0.2)";
    });

    this.adminRefreshBtn?.addEventListener("click", () => {
      audioEngine.playClick();
      this.renderAdminTrackList();
      this.loadCloudSongs();
    });

    // Detect track duration when file selected in admin form
    this.adminFileInput?.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!this.adminTitleInput.value) {
        this.adminTitleInput.value = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
      }

      this.showToast("Аналіз тривалості аудіо...", "info");
      const duration = await calculateAudioDuration(file);
      if (duration > 0) {
        this.adminDurationInput.value = duration;
        this.showToast(`Тривалість визначена: ${duration} сек.`, "success");
      }
    });

    // Auto duration detection when direct URL is entered
    this.adminUrlInput?.addEventListener("blur", async () => {
      const url = this.adminUrlInput.value.trim();
      if (url && !this.adminDurationInput.value) {
        try {
          const audio = new Audio();
          audio.src = url;
          audio.addEventListener("loadedmetadata", () => {
            this.adminDurationInput.value = Math.round(audio.duration * 10) / 10;
          });
        } catch (e) {}
      }
    });

    // Admin track upload submit (File or URL)
    this.adminForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = this.adminTitleInput.value.trim();
      const artist = this.adminArtistInput.value.trim();
      const duration = parseFloat(this.adminDurationInput.value) || 0;

      try {
        this.adminUploadBtn.disabled = true;

        if (this.adminUploadMode === "url") {
          const url = this.adminUrlInput.value.trim();
          this.adminUploadBtn.innerText = "Збереження в Firestore...";
          await addTrackByUrl({ url, title, artist, duration });
          this.showToast("Трек за посиланням успішно додано до Firestore!", "success");
        } else {
          const file = this.adminFileInput.files[0];
          if (!file) throw new Error("Будь ласка, оберіть файл для завантаження.");

          this.adminProgressBar.style.display = "block";
          this.adminProgressFill.style.width = "0%";
          this.adminUploadBtn.innerText = "Обробка та завантаження...";

          const uploadRes = await uploadTrack({
            file,
            title,
            artist,
            duration,
            onProgress: (percent) => {
              this.adminProgressFill.style.width = `${percent}%`;
              this.adminUploadBtn.innerText = `Завантаження: ${percent}%`;
            }
          });

          if (uploadRes.isLocalFallback) {
            this.showToast("Файл збережено у браузері (IndexedDB) та в Firestore! Готовий до гри.", "info");
          } else {
            this.showToast("Трек успішно завантажено в Firebase Storage та Firestore!", "success");
          }
        }

        this.adminForm.reset();
        if (this.adminProgressBar) this.adminProgressBar.style.display = "none";
        this.adminUploadBtn.innerText = "Завантажити трек у хмару";
        this.adminUploadBtn.disabled = false;

        this.renderAdminTrackList();
        this.loadCloudSongs();
      } catch (err) {
        console.error("Upload error:", err);
        this.showToast(err.message, "error");
        this.adminUploadBtn.disabled = false;
        this.adminUploadBtn.innerText = "Завантажити трек у хмару";
        if (this.adminProgressBar) this.adminProgressBar.style.display = "none";
      }
    });

    // Close Admin Modal directly
    const closeAdminPanel = () => {
      audioEngine.playClick();
      this.closeModal(this.adminModal);
    };

    this.adminCloseBtn?.addEventListener("click", closeAdminPanel);
    this.adminBottomCloseBtn?.addEventListener("click", closeAdminPanel);

    // Setup Modal Close handlers (click on [x] or backdrop)
    document.querySelectorAll(".modal-close, .lb-close-btn, .close-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const modal = e.target.closest(".winner-overlay, .modal-overlay, .leaderboard-modal, .name-input-modal");
        if (modal) modal.classList.add("hidden");
      });
    });

    // Backdrop click closes modals (mousedown for immediate reliable response)
    [this.adminModal, this.authModal, this.leaderboardModal].forEach(modal => {
      modal?.addEventListener("mousedown", (e) => {
        if (e.target === modal) {
          audioEngine.playClick();
          modal.classList.add("hidden");
        }
      });
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".winner-overlay:not(.hidden), .modal-overlay:not(.hidden), .leaderboard-modal:not(.hidden), .name-input-modal:not(.hidden)")
          .forEach(m => m.classList.add("hidden"));
      }
    });
  }

  setupAuth() {
    // Auth button click
    this.btnOpenAuth?.addEventListener("click", () => {
      audioEngine.playClick();
      this.openModal(this.authModal);
    });

    this.btnLogout?.addEventListener("click", () => {
      audioEngine.playClick();
      logoutUser();
      this.showToast("Ви вийшли з профілю", "info");
    });

    // Auth Form Toggle (Login <-> Register)
    const authToggle = document.getElementById("auth-toggle-mode");
    const authTitle = document.getElementById("auth-title");
    const authSubmit = document.getElementById("auth-submit");
    let isRegister = false;

    authToggle?.addEventListener("click", () => {
      audioEngine.playClick();
      isRegister = !isRegister;
      if (isRegister) {
        authTitle.innerText = "Реєстрація";
        authSubmit.innerText = "Створити акаунт";
        authToggle.innerText = "Вже є акаунт? Увійти";
      } else {
        authTitle.innerText = "Вхід у гру";
        authSubmit.innerText = "Увійти";
        authToggle.innerText = "Немає акаунта? Зареєструватися";
      }
    });

    // Auth Form Submit
    const authForm = document.getElementById("auth-form-element");
    authForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("auth-input-user").value.trim();
      const password = document.getElementById("auth-input-pass").value.trim();

      try {
        authSubmit.disabled = true;
        authSubmit.innerText = "Шифрування (SHA-256)...";

        if (isRegister) {
          const user = await registerUser(username, password);
          this.showToast(
            user.isAdmin 
              ? `Вітаємо, ${user.username}! Вам видано права АДМІНІСТРАТОРА (перший гравець)! 👑`
              : `Реєстрація успішна! Вітаємо, ${user.username}!`,
            "success"
          );
        } else {
          const user = await loginUser(username, password);
          this.showToast(`З поверненням, ${user.username}!`, "success");
        }

        this.closeModal(this.authModal);
        authForm.reset();
      } catch (err) {
        this.showToast(err.message, "error");
      } finally {
        authSubmit.disabled = false;
        authSubmit.innerText = isRegister ? "Створити акаунт" : "Увійти";
      }
    });

    // Subscribe to Auth State Changes
    onAuthStateChanged((user) => {
      if (user) {
        this.btnOpenAuth.style.display = "none";
        this.userBadge.style.display = "inline-flex";
        this.usernameSpan.innerText = user.username;

        if (user.isAdmin) {
          this.btnOpenAdmin.style.display = "inline-flex";
        } else {
          this.btnOpenAdmin.style.display = "none";
        }
      } else {
        this.btnOpenAuth.style.display = "inline-flex";
        this.userBadge.style.display = "none";
        this.btnOpenAdmin.style.display = "none";
      }
    });
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("siteTheme", theme);
    if (this.themeToggle) {
      this.themeToggle.innerText = theme === "dark" ? "🌙" : "☀️";
    }
    if (this.game) {
      this.game.initGradients();
    }
  }

  applyLanguage(lang) {
    this.currentLanguage = lang;
    document.body.setAttribute("data-lang", lang);
    localStorage.setItem("siteLang", lang);
    if (this.langToggle) {
      this.langToggle.innerText = lang === "MEOW" ? "🐱" : lang;
    }
  }

  openModal(modal) {
    if (modal) {
      modal.classList.remove("hidden");
    }
  }

  closeModal(modal) {
    if (modal) {
      modal.classList.add("hidden");
    }
  }

  showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `game-notification ${type}`;
    toast.innerText = message;
    if (type === "error") toast.style.borderColor = "#ff4444";
    if (type === "success") toast.style.borderColor = "#00ff88";

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = "toastFadeOut 0.5s forwards";
      setTimeout(() => toast.remove(), 500);
    }, 3500);
  }

  /**
   * Loads tracks EXCLUSIVELY from Firebase Firestore
   */
  async loadCloudSongs() {
    if (!this.songList) return;
    this.songList.innerHTML = `
      <div style="text-align: center; color: var(--highlight); padding: 40px; font-size: 1.1rem;">
        Завантаження треків з хмари Firebase... ⚡
      </div>
    `;

    try {
      this.cloudTracks = await getAllTracks();
      this.renderSongList(this.cloudTracks);
    } catch (err) {
      console.error("Failed to fetch tracks from Firestore:", err);
      this.songList.innerHTML = `
        <div style="text-align: center; color: #ff5555; padding: 30px;">
          Помилка завантаження треків з Firestore: ${err.message}
        </div>
      `;
    }
  }

  renderSongList(tracks) {
    if (!this.songList) return;
    this.songList.innerHTML = "";

    if (!tracks || tracks.length === 0) {
      this.songList.innerHTML = `
        <div class="empty-cloud-msg" style="text-align: center; padding: 40px; background: var(--glass-bg); border: 2px dashed var(--glass-border); border-radius: 20px; margin: 20px auto; max-width: 550px;">
          <div style="font-size: 3rem; margin-bottom: 12px;">☁️ 🎹</div>
          <h3 style="color: var(--highlight); margin-bottom: 8px;">База треків порожня</h3>
          <p style="color: var(--text-color); opacity: 0.8; font-size: 0.95rem; line-height: 1.5;">
            У хмарі поки немає завантажених мелодій.<br>
            Увійдіть з правами адміністратора та завантажте треки (.ogg, .mp3, .mp4) через <b>Адмін-панель</b>!
          </p>
        </div>
      `;
      return;
    }

    tracks.forEach((song, idx) => {
      const card = document.createElement("div");
      card.className = "song-card";

      const mins = Math.floor((song.duration || 0) / 60);
      const secs = Math.floor((song.duration || 0) % 60).toString().padStart(2, "0");
      const durationStr = `${mins}:${secs}`;

      card.innerHTML = `
        <div class="song-info">
          <h3>${this.escapeHtml(song.title)} <span class="song-duration">${durationStr}</span></h3>
          <div class="song-meta-row">
            <span class="artist-name">${this.escapeHtml(song.artist)}</span>
            <span style="font-size: 0.72rem; background: ${song.audioUrl?.startsWith("indexeddb://") ? "rgba(255, 180, 0, 0.15)" : "rgba(102, 252, 241, 0.15)"}; border: 1px solid ${song.audioUrl?.startsWith("indexeddb://") ? "#ffb400" : "var(--highlight)"}; padding: 2px 8px; border-radius: 10px; color: ${song.audioUrl?.startsWith("indexeddb://") ? "#ffb400" : "var(--highlight)"};">
              ${song.audioUrl?.startsWith("indexeddb://") ? "💾 Local" : "☁️ Cloud"}
            </span>
          </div>
        </div>
        <div style="font-size: 1.6rem; margin-left: 10px; color: var(--highlight);">▶</div>
      `;

      card.addEventListener("click", () => {
        audioEngine.playClick();
        this.playSong(song);
      });
      card.addEventListener("mouseenter", () => audioEngine.playHover());

      this.songList.appendChild(card);
    });
  }

  filterSongs(query) {
    const cards = document.querySelectorAll(".song-card");
    let visibleCount = 0;

    cards.forEach(card => {
      const text = card.innerText.toLowerCase();
      const match = text.includes(query);
      card.style.display = match ? "flex" : "none";
      if (match) visibleCount++;
    });

    if (this.noSongsMsg) {
      this.noSongsMsg.classList.toggle("hidden", visibleCount > 0 || query === "");
    }
  }

  /**
   * Starts playing a song from Firebase Storage without micro-delays
   */
  async playSong(song) {
    this.currentActiveTrack = song;

    if (this.menuLayer) this.menuLayer.classList.add("hidden");
    if (this.gameContainer) this.gameContainer.classList.remove("hidden");
    if (this.loader) this.loader.classList.remove("hidden");

    try {
      if (!this.game) {
        this.game = new DanceGame(this.canvas, {
          onScoreUpdate: (stats) => this.handleScoreUpdate(stats),
          onRatingShow: (text, cls) => this.handleRatingShow(text, cls),
          onGameEnd: (res) => this.handleGameEnd(res)
        });
      }

      this.game.resize();

      // Decode audio and generate Pulse Engine notes
      await this.game.loadTrack(song);

      if (this.loader) this.loader.classList.add("hidden");

      // Start gameplay loop and zero-latency audio
      this.game.start();
    } catch (err) {
      console.error("Play error:", err);
      this.showToast("Помилка запуску треку: " + err.message, "error");
      this.quitToMenu();
    }
  }

  handleScoreUpdate(stats) {
    if (this.scoreDisplay) this.scoreDisplay.innerText = stats.score;
    if (this.comboDisplay) {
      this.comboDisplay.innerText = `Combo x${stats.combo}`;
      this.comboDisplay.style.opacity = stats.combo > 2 ? "1" : "0";
    }
    if (this.progressBar) {
      this.progressBar.style.width = `${Math.round(stats.progress * 100)}%`;
    }

    // Stars illumination
    this.starElements.forEach((star, idx) => {
      if (star) {
        if (idx < stats.stars) star.classList.add("active");
        else star.classList.remove("active");
      }
    });
  }

  handleRatingShow(text, className) {
    if (!this.ratingContainer) return;
    const badge = document.createElement("div");
    badge.className = `rating-badge ${className}`;
    badge.innerText = text;
    this.ratingContainer.appendChild(badge);

    setTimeout(() => badge.remove(), 700);
  }

  async handleGameEnd(result) {
    if (this.resultScreen) {
      const endTitle = document.getElementById("end-title");
      const finalScore = document.getElementById("final-score");
      const finalStars = document.getElementById("final-stars");

      if (endTitle) {
        endTitle.innerText = result.victory ? "ПРОЙДЕНО" : "ПОРАЗКА";
        endTitle.style.color = result.victory ? "#66FCF1" : "#FF0055";
      }
      if (finalScore) finalScore.innerText = result.score;
      if (finalStars) {
        let starsStr = "";
        for (let i = 0; i < 3; i++) {
          starsStr += i < result.stars ? "★" : "☆";
        }
        finalStars.innerText = starsStr;
      }

      this.resultScreen.classList.remove("hidden");
    }

    // Save encrypted stats to Firestore if logged in
    const user = getCurrentUser();
    if (user) {
      try {
        await saveGameStats(result);
        this.showToast("Статистика зашифрована на клієнті (AES-GCM) та збережена в базі!", "success");
      } catch (err) {
        console.warn("Stats save error:", err.message);
      }
    }
  }

  quitToMenu() {
    if (this.game) {
      this.game.stop();
    }
    if (this.loader) this.loader.classList.add("hidden");
    if (this.gameContainer) this.gameContainer.classList.add("hidden");
    if (this.menuLayer) this.menuLayer.classList.remove("hidden");
    this.loadCloudSongs();
  }

  /**
   * Renders track list inside Admin Modal
   */
  async renderAdminTrackList() {
    if (!this.adminTrackList) return;
    this.adminTrackList.innerHTML = `<div style="text-align: center; color: var(--text-color); opacity: 0.6; padding: 15px;">Завантаження списку...</div>`;

    try {
      const tracks = await getAllTracks();
      if (!tracks || tracks.length === 0) {
        this.adminTrackList.innerHTML = `<div style="text-align: center; color: var(--text-color); opacity: 0.6; padding: 15px;">Завантажених треків поки немає.</div>`;
        return;
      }

      this.adminTrackList.innerHTML = "";
      tracks.forEach(t => {
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.style.padding = "10px 14px";
        row.style.background = "rgba(255, 255, 255, 0.05)";
        row.style.borderRadius = "12px";
        row.style.marginBottom = "8px";

        const isLocal = t.audioUrl && t.audioUrl.startsWith("indexeddb://");
        row.innerHTML = `
          <div>
            <div style="font-weight: 700; color: #fff;">
              ${this.escapeHtml(t.title)}
              <span style="font-size: 0.7rem; background: ${isLocal ? "rgba(255, 180, 0, 0.15)" : "rgba(102, 252, 241, 0.15)"}; color: ${isLocal ? "#ffb400" : "var(--highlight)"}; padding: 2px 6px; border-radius: 6px; margin-left: 6px; border: 1px solid ${isLocal ? "#ffb400" : "rgba(102, 252, 241, 0.3)"};">
                ${isLocal ? "💾 IndexedDB" : "☁️ Storage"}
              </span>
            </div>
            <div style="font-size: 0.8rem; color: var(--highlight);">${this.escapeHtml(t.artist)} • ${t.duration || 0}s</div>
          </div>
          <button class="action-btn btn-danger btn-del" style="padding: 6px 14px; font-size: 0.85rem;">
            Видалити
          </button>
        `;

        row.querySelector(".btn-del").addEventListener("click", async () => {
          if (confirm(`Видалити трек "${t.title}"?`)) {
            try {
              await deleteTrack(t.id, t.storagePath, t.audioUrl);
              this.showToast("Трек успішно видалено", "success");
              this.renderAdminTrackList();
              this.loadCloudSongs();
            } catch (e) {
              this.showToast(e.message, "error");
            }
          }
        });

        this.adminTrackList.appendChild(row);
      });
    } catch (err) {
      this.adminTrackList.innerHTML = `<div style="color: #ff5555;">${err.message}</div>`;
    }
  }

  escapeHtml(str) {
    if (!str) return "";
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }
}

export const danceUI = new DanceUI();

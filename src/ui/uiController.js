import { resultModeLabel } from "../game/resultMetadata.js";
import { i18n } from "../i18n/index.js";
// ==========================================
// UI CONTROLLER & MODAL MANAGEMENT
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
  getAllTracks, 
  deleteTrack, 
  calculateAudioDuration 
} from "../services/admin.js";
import { getUserStats } from "../services/stats.js";
import { generateDemoSynthTrack } from "../audio/synthTrack.js";
import { NeonPianoGame } from "../game/pianoGame.js";

class UIController {
  constructor() {
    this.gameInstance = null;
    this.cachedDemoBuffer = null;
  }

  init() {
    this.bindDomElements();
    this.attachEventListeners();
    this.subscribeAuth();
    this.loadLobbyTracks();
  }

  bindDomElements() {
    // Views
    this.viewLobby = document.getElementById("view-lobby");
    this.viewGame = document.getElementById("view-game");
    this.gameCanvasContainer = document.getElementById("game-canvas-container");

    // Nav elements
    this.btnOpenAuth = document.getElementById("btn-open-auth");
    this.btnOpenAdmin = document.getElementById("btn-open-admin");
    this.btnOpenStats = document.getElementById("btn-open-stats");
    this.btnLogout = document.getElementById("btn-logout");
    this.userPill = document.getElementById("user-pill");
    this.usernameDisplay = document.getElementById("user-display-name");
    this.adminBadge = document.getElementById("admin-badge");

    // Modals
    this.modalAuth = document.getElementById("modal-auth");
    this.modalAdmin = document.getElementById("modal-admin");
    this.modalStats = document.getElementById("modal-stats");
    this.modalResults = document.getElementById("modal-results");

    // Auth Form
    this.authForm = document.getElementById("auth-form");
    this.authUsername = document.getElementById("auth-username");
    this.authPassword = document.getElementById("auth-password");
    this.authSubmitBtn = document.getElementById("auth-submit-btn");
    this.authModeToggle = document.getElementById("auth-mode-toggle");
    this.authTitle = document.getElementById("auth-modal-title");
    this.isRegisterMode = false;

    // Admin Upload Form
    this.adminForm = document.getElementById("admin-upload-form");
    this.adminFileInput = document.getElementById("admin-track-file");
    this.adminTitleInput = document.getElementById("admin-track-title");
    this.adminArtistInput = document.getElementById("admin-track-artist");
    this.adminDurationInput = document.getElementById("admin-track-duration");
    this.adminUploadBtn = document.getElementById("admin-upload-btn");
    this.adminProgressBar = document.getElementById("admin-progress-bar");
    this.adminProgressFill = document.getElementById("admin-progress-fill");
    this.adminTracksList = document.getElementById("admin-tracks-list");

    // Lobby tracks list
    this.tracksGrid = document.getElementById("tracks-grid");

    // Game HUD
    this.hudScore = document.getElementById("hud-score-val");
    this.hudCombo = document.getElementById("hud-combo-val");
    this.hudAccuracy = document.getElementById("hud-accuracy-val");
    this.btnExitGame = document.getElementById("btn-exit-game");

    // Results Modal Elements
    this.resultsGrade = document.getElementById("results-grade");
    this.resultsScore = document.getElementById("results-score");
    this.resultsAccuracy = document.getElementById("results-accuracy");
    this.resultsMaxCombo = document.getElementById("results-max-combo");
    this.resultsPerfects = document.getElementById("results-perfects");
    this.resultsGoods = document.getElementById("results-goods");
    this.resultsMisses = document.getElementById("results-misses");
    this.btnResultsLobby = document.getElementById("btn-results-lobby");
    this.btnResultsRetry = document.getElementById("btn-results-retry");

    // Stats Modal List
    this.userStatsList = document.getElementById("user-stats-list");

    // Toast Container
    this.toastContainer = document.getElementById("toast-container");
  }

  attachEventListeners() {
    // Auth Modal open/close
    this.btnOpenAuth?.addEventListener("click", () => this.openModal(this.modalAuth));
    this.btnLogout?.addEventListener("click", () => {
      logoutUser();
      this.showToast("Вы вышли из профиля", "info");
    });

    // Toggle between Login and Register
    this.authModeToggle?.addEventListener("click", () => {
      this.isRegisterMode = !this.isRegisterMode;
      if (this.isRegisterMode) {
        this.authTitle.textContent = "Регистрация";
        this.authSubmitBtn.textContent = "Создать аккаунт";
        this.authModeToggle.textContent = "Уже есть аккаунт? Войти";
      } else {
        this.authTitle.textContent = "Вход в аккаунт";
        this.authSubmitBtn.textContent = "Войти";
        this.authModeToggle.textContent = "Нет аккаунта? Зарегистрироваться";
      }
    });

    // Auth Form submit
    this.authForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = this.authUsername.value.trim();
      const password = this.authPassword.value.trim();

      try {
        this.authSubmitBtn.disabled = true;
        this.authSubmitBtn.textContent = "Обработка (шифрование)...";

        if (this.isRegisterMode) {
          const user = await registerUser(username, password);
          this.showToast(
            user.isAdmin 
              ? `Добро пожаловать, ${user.username}! Вам выданы права АДМИНИСТРАТОРА (первый пользователь)! 👑`
              : `Регистрация успешна! Добро пожаловать, ${user.username}!`,
            "success"
          );
        } else {
          const user = await loginUser(username, password);
          this.showToast(`С возвращением, ${user.username}!`, "success");
        }

        this.closeModal(this.modalAuth);
        this.authForm.reset();
      } catch (err) {
        this.showToast(err.message, "error");
      } finally {
        this.authSubmitBtn.disabled = false;
        this.authSubmitBtn.textContent = this.isRegisterMode ? "Создать аккаунт" : "Войти";
      }
    });

    // Admin Modal open/close
    this.btnOpenAdmin?.addEventListener("click", () => {
      this.openModal(this.modalAdmin);
      this.loadAdminTracksList();
    });

    // Audio file selection -> auto-calculate duration!
    this.adminFileInput?.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Auto-fill title from filename if empty
      if (!this.adminTitleInput.value) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
        this.adminTitleInput.value = cleanName;
      }

      this.showToast("Анализ длительности трека...", "info");
      const duration = await calculateAudioDuration(file);
      this.adminDurationInput.value = duration > 0 ? duration : "";
      if (duration > 0) {
        this.showToast(`Длительность: ${duration} сек.`, "success");
      }
    });

    // Admin track upload
    this.adminForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const file = this.adminFileInput.files[0];
      const title = this.adminTitleInput.value.trim();
      const artist = this.adminArtistInput.value.trim();
      const duration = parseFloat(this.adminDurationInput.value) || 0;
      const isPhonk = Boolean(document.getElementById('admin-phonk-checkbox')?.checked);

      try {
        this.adminUploadBtn.disabled = true;
        this.adminProgressBar.style.display = "block";
        this.adminProgressFill.style.width = "0%";

        await uploadTrack({
          file,
          title,
          artist,
          duration,
          isPhonk,
          onProgress: (percent) => {
            this.adminProgressFill.style.width = `${percent}%`;
            this.adminUploadBtn.textContent = `Загрузка: ${percent}%`;
          }
        });

        this.showToast("Трек успешно загружен в Firebase Storage и Firestore!", "success");
        this.adminForm.reset();
        this.adminProgressBar.style.display = "none";
        this.loadAdminTracksList();
        this.loadLobbyTracks();
      } catch (err) {
        this.showToast(err.message, "error");
      } finally {
        this.adminUploadBtn.disabled = false;
        this.adminUploadBtn.textContent = "Загрузить трек в базу";
      }
    });

    // Stats Modal
    this.btnOpenStats?.addEventListener("click", async () => {
      this.openModal(this.modalStats);
      await this.loadUserStatsList();
    });

    // Exit Game button
    this.btnExitGame?.addEventListener("click", () => {
      if (this.gameInstance) {
        this.gameInstance.destroy();
        this.gameInstance = null;
      }
      this.showView("lobby");
      this.loadLobbyTracks();
    });

    // Results modal buttons
    this.btnResultsLobby?.addEventListener("click", () => {
      this.closeModal(this.modalResults);
      this.showView("lobby");
      this.loadLobbyTracks();
    });

    this.btnResultsRetry?.addEventListener("click", () => {
      this.closeModal(this.modalResults);
      if (this.lastPlayedTrack) {
        this.startTrackGame(this.lastPlayedTrack);
      }
    });

    // Global Modal Close buttons (click on [x] or background overlay)
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) this.closeModal(overlay);
      });
    });

    document.querySelectorAll(".btn-close").forEach(btn => {
      btn.addEventListener("click", () => {
        const modal = btn.closest(".modal-overlay");
        if (modal) this.closeModal(modal);
      });
    });

    // ESC key closes any open modal
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay.open").forEach(modal => {
          this.closeModal(modal);
        });
      }
    });
  }

  subscribeAuth() {
    onAuthStateChanged((user) => {
      if (user) {
        this.btnOpenAuth.style.display = "none";
        this.userPill.style.display = "flex";
        this.btnLogout.style.display = "inline-flex";
        this.btnOpenStats.style.display = "inline-flex";
        this.usernameDisplay.textContent = user.username;

        // Hidden Admin Panel: visible strictly for admins!
        if (user.isAdmin) {
          this.btnOpenAdmin.style.display = "inline-flex";
          this.adminBadge.style.display = "inline-block";
        } else {
          this.btnOpenAdmin.style.display = "none";
          this.adminBadge.style.display = "none";
        }
      } else {
        this.btnOpenAuth.style.display = "inline-flex";
        this.userPill.style.display = "none";
        this.btnLogout.style.display = "none";
        this.btnOpenStats.style.display = "none";
        this.btnOpenAdmin.style.display = "none";
        this.adminBadge.style.display = "none";
      }
    });
  }

  showView(viewName) {
    if (viewName === "game") {
      this.viewLobby.classList.remove("active");
      this.viewGame.classList.add("active");
    } else {
      this.viewGame.classList.remove("active");
      this.viewLobby.classList.add("active");
    }
  }

  openModal(modalElement) {
    if (modalElement) modalElement.classList.add("open");
  }

  closeModal(modalElement) {
    if (modalElement) modalElement.classList.remove("open");
  }

  showToast(message, type = "info") {
    if (!this.toastContainer) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(15px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /**
   * Loads tracks from Firestore and updates Lobby grid
   */
  async loadLobbyTracks() {
    if (!this.tracksGrid) return;
    this.tracksGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">
        Загрузка треков из облака... ⚡
      </div>
    `;

    try {
      const tracks = await getAllTracks();
      this.tracksGrid.innerHTML = "";

      // Always include the built-in demo track first
      const demoTrack = {
        id: "demo_neon_anthem",
        title: "Cyber Neon Anthem",
        artist: "Antigravity Synth",
        duration: 40,
        isDemo: true
      };

      this.renderTrackCard(demoTrack);

      if (tracks && tracks.length > 0) {
        tracks.forEach(track => this.renderTrackCard(track));
      }
    } catch (err) {
      console.warn("Could not load tracks from Firestore:", err);
      // Still show demo track
      this.tracksGrid.innerHTML = "";
      this.renderTrackCard({
        id: "demo_neon_anthem",
        title: "Cyber Neon Anthem (Demo)",
        artist: "Antigravity Synth",
        duration: 40,
        isDemo: true
      });
    }
  }

  renderTrackCard(track) {
    const card = document.createElement("div");
    card.className = "track-card";

    const minutes = Math.floor((track.duration || 0) / 60);
    const seconds = Math.floor((track.duration || 0) % 60).toString().padStart(2, "0");
    const durationStr = `${minutes}:${seconds}`;

    card.innerHTML = `
      <div class="track-header">
        <div>
          <div class="track-title">${this.escapeHtml(track.title)}</div>
          <div class="track-artist">${this.escapeHtml(track.artist)}</div>
        </div>
        <div class="track-duration-badge">${durationStr}</div>
      </div>
      <div class="track-card-footer">
        <button class="play-track-btn" data-track-id="${track.id}">
          ▶ Играть трек
        </button>
      </div>
    `;

    card.querySelector(".play-track-btn").addEventListener("click", () => {
      this.startTrackGame(track);
    });

    this.tracksGrid.appendChild(card);
  }

  /**
   * Starts game with chosen track
   */
  async startTrackGame(track) {
    this.lastPlayedTrack = track;
    this.showToast(`Загрузка аудио без микро-задержек: ${track.title}...`, "info");

    try {
      this.showView("game");

      if (this.gameInstance) {
        this.gameInstance.destroy();
      }

      this.gameInstance = new NeonPianoGame(this.gameCanvasContainer, {
        onScoreUpdate: (stats) => {
          this.hudScore.textContent = stats.score;
          this.hudCombo.textContent = `${stats.combo}x`;
          this.hudAccuracy.textContent = `${stats.accuracy}%`;
        },
        onGameEnd: (result) => {
          this.showGameResults(result);
        }
      });

      if (track.isDemo) {
        // Generate or reuse offline synthwave audio buffer
        if (!this.cachedDemoBuffer) {
          this.cachedDemoBuffer = await generateDemoSynthTrack();
        }
        this.gameInstance.audioBuffer = this.cachedDemoBuffer;
        this.gameInstance.currentTrack = track;
        this.gameInstance.tiles = this.gameInstance.generateBeatmap(40, 125);
        this.gameInstance.totalNotes = this.gameInstance.tiles.length;
      } else {
        await this.gameInstance.loadTrack(track);
      }

      this.gameInstance.start();
      this.showToast("ИГРА НАЧАЛАСЬ! Клавиши: D, F, J, K (или нажимайте по дорожкам)", "success");
    } catch (err) {
      console.error("Failed to start game:", err);
      this.showToast("Ошибка запуска трека: " + err.message, "error");
      this.showView("lobby");
    }
  }

  showGameResults(result) {
    // Determine letter grade
    let grade = "C";
    if (result.accuracy >= 95) grade = "S";
    else if (result.accuracy >= 85) grade = "A";
    else if (result.accuracy >= 70) grade = "B";

    let mode = this.modalResults.querySelector('[data-result-mode]');
    if (!mode) {
      mode = document.createElement('p');
      mode.dataset.resultMode = '';
      this.resultsScore.parentElement.appendChild(mode);
    }
    mode.textContent = resultModeLabel(result, key => i18n.t(key));
    this.resultsGrade.textContent = grade;
    this.resultsScore.textContent = result.score;
    this.resultsAccuracy.textContent = `${result.accuracy}%`;
    this.resultsMaxCombo.textContent = `${result.maxCombo}x`;
    this.resultsPerfects.textContent = result.perfectCount;
    this.resultsGoods.textContent = result.goodCount;
    this.resultsMisses.textContent = result.missCount;

    const user = getCurrentUser();
    if (user) {
      this.showToast("Статистика зашифрована на клиенте и сохранена в базе!", "success");
    }

    this.openModal(this.modalResults);
  }

  /**
   * Loads Admin tracks management list
   */
  async loadAdminTracksList() {
    if (!this.adminTracksList) return;
    this.adminTracksList.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 15px;">Загрузка списка...</div>`;

    try {
      const tracks = await getAllTracks();
      if (!tracks || tracks.length === 0) {
        this.adminTracksList.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 15px;">Загруженных треков пока нет.</div>`;
        return;
      }

      this.adminTracksList.innerHTML = "";
      tracks.forEach(track => {
        const item = document.createElement("div");
        item.style.display = "flex";
        item.style.justifyContent = "space-between";
        item.style.alignItems = "center";
        item.style.padding = "10px 14px";
        item.style.background = "rgba(255, 255, 255, 0.05)";
        item.style.borderRadius = "12px";
        item.style.marginBottom = "8px";

        item.innerHTML = `
          <div>
            <div style="font-weight: 600; color: #fff;">${this.escapeHtml(track.title)}</div>
            <div style="font-size: 0.8rem; color: var(--neon-cyan);">${this.escapeHtml(track.artist)} • ${track.duration || 0}s</div>
          </div>
          <button class="btn btn-danger btn-delete-track" style="padding: 6px 12px; font-size: 0.8rem;">
            Удалить
          </button>
        `;

        item.querySelector(".btn-delete-track").addEventListener("click", async () => {
          if (confirm(`Удалить трек "${track.title}" из Firebase?`)) {
            try {
              await deleteTrack(track.id, track.storagePath);
              this.showToast("Трек удален", "success");
              this.loadAdminTracksList();
              this.loadLobbyTracks();
            } catch (err) {
              this.showToast(err.message, "error");
            }
          }
        });

        this.adminTracksList.appendChild(item);
      });
    } catch (err) {
      this.adminTracksList.innerHTML = `<div style="color: var(--neon-red);">${err.message}</div>`;
    }
  }

  /**
   * Loads user decrypted stats history
   */
  async loadUserStatsList() {
    if (!this.userStatsList) return;
    this.userStatsList.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">Расшифровка вашей статистики... 🔐</div>`;

    try {
      const stats = await getUserStats();
      if (!stats || stats.length === 0) {
        this.userStatsList.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">У вас пока нет сыгранных игр. Сыграйте раунд!</div>`;
        return;
      }

      this.userStatsList.innerHTML = "";
      stats.forEach(item => {
        const row = document.createElement("div");
        row.style.background = "rgba(255, 255, 255, 0.05)";
        row.style.borderRadius = "14px";
        row.style.padding = "14px";
        row.style.marginBottom = "10px";

        const dateStr = item.playedAt ? new Date(item.playedAt).toLocaleString() : "";

        row.innerHTML = `
          <div>${this.escapeHtml(resultModeLabel(item, key => i18n.t(key)))}</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-weight: 700; color: #fff;">${this.escapeHtml(item.trackTitle || "Трек")}</span>
            <span style="color: var(--neon-yellow); font-weight: 800;">${item.score} очков</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted);">
            <span>Точность: <strong style="color: var(--neon-cyan);">${item.accuracy}%</strong> | Макс. комбо: <strong>${item.maxCombo}x</strong></span>
            <span>${dateStr}</span>
          </div>
        `;

        this.userStatsList.appendChild(row);
      });
    } catch (err) {
      this.userStatsList.innerHTML = `<div style="color: var(--neon-red);">${err.message}</div>`;
    }
  }

  escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
}

export const ui = new UIController();

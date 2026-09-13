// ==========================================
// WEB AUDIO API SOUND ENGINE (ZERO-LATENCY)
// ==========================================
import { getAudioFromIndexedDB } from "../services/localAudioStorage.js";

export class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.analyser = null;
    this.dataArray = null;
    this.bufferCache = new Map();
    this.activeSource = null;
    this.startTime = 0;
    this.pauseOffset = 0;
    this.isPlaying = false;
    this.isPaused = false;
    this.isMuted = localStorage.getItem("isMuted") === "true";
    this.onEndedCallback = null;

    // SFX elements or synthesized fallbacks
    this.sfxClick = new Audio("audio/click.mp3");
    this.sfxHover = new Audio("audio/hover.mp3");
    this.sfxWin = new Audio("audio/win-bell.mp3");

    // Pre-lower SFX volume
    this.sfxClick.volume = 0.4;
    this.sfxHover.volume = 0.25;
    this.sfxWin.volume = 0.5;
  }

  /**
   * Initializes AudioContext on first user interaction.
   */
  async init() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx({
        latencyHint: "interactive",
        sampleRate: 44100
      });

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
      this.masterGain.connect(this.audioCtx.destination);

      // Real-time audio spectrum analyser for the in-game equalizer
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.connect(this.masterGain);
      this.analyser.fftSize = 64;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }

    if (this.audioCtx.state === "suspended") {
      await this.audioCtx.resume();
    }
  }

  /**
   * Fetches an audio file from Firebase Storage, IndexedDB, or URL and decodes it.
   * Completely eliminates streaming jitter, decode lag, and micro-delays.
   * 
   * @param {string} url Firebase Storage URL, direct web URL, or indexeddb:// URL
   * @param {string} cacheKey Unique track identifier
   * @returns {Promise<AudioBuffer>}
   */
  async loadTrackBuffer(url, cacheKey = url) {
    await this.init();

    if (this.bufferCache.has(cacheKey)) {
      return this.bufferCache.get(cacheKey);
    }

    try {
      let arrayBuffer;

      // Handle offline / IndexedDB storage
      if (url.startsWith("indexeddb://")) {
        const id = url.replace("indexeddb://", "");
        const rawData = await getAudioFromIndexedDB(id);
        if (!rawData) {
          throw new Error("Аудіофайл не знайдено в локальному сховищі браузера.");
        }
        if (rawData instanceof ArrayBuffer) {
          arrayBuffer = rawData;
        } else if (rawData instanceof Blob) {
          arrayBuffer = await rawData.arrayBuffer();
        } else {
          throw new Error("Невідомий формат даних у сховищі.");
        }
      } else {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Помилка завантаження аудіо (HTTP ${response.status})`);
        }
        arrayBuffer = await response.arrayBuffer();
      }

      const decodedBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
      this.bufferCache.set(cacheKey, decodedBuffer);
      return decodedBuffer;
    } catch (err) {
      console.error("AudioEngine: Decode error:", err);
      throw new Error("Не вдалося декодувати аудіо: " + err.message);
    }
  }

  /**
   * Starts playing decoded AudioBuffer with hardware-level zero latency.
   * 
   * @param {AudioBuffer} audioBuffer 
   * @param {object} options
   * @param {number} options.offset Start offset in seconds
   * @param {number} options.delay Lead-in delay in seconds (default 2s for rhythm prep)
   * @param {function} options.onEnded Callback when audio playback finishes
   */
  play(audioBuffer, { offset = 0, delay = 2.0, onEnded = null } = {}) {
    if (!this.audioCtx || !audioBuffer) return;

    this.stop();

    this.activeSource = this.audioCtx.createBufferSource();
    this.activeSource.buffer = audioBuffer;

    // Route: Source -> Analyser -> MasterGain -> Destination
    this.activeSource.connect(this.analyser);

    this.onEndedCallback = onEnded;
    const source = this.activeSource;
    this.activeSource.onended = () => {
      source.disconnect();
      if (this.activeSource === source && this.isPlaying && !this.isPaused) {
        this.activeSource = null;
        this.isPlaying = false;
        if (this.onEndedCallback) this.onEndedCallback();
      }
    };

    offset = Number.isFinite(offset) ? Math.min(Math.max(0, offset), audioBuffer.duration) : 0;
    delay = Number.isFinite(delay) ? Math.max(0, delay) : 0;
    const scheduledStartTime = this.audioCtx.currentTime + delay;
    this.startTime = scheduledStartTime - offset;
    this.pauseOffset = 0;
    this.isPlaying = true;
    this.isPaused = false;

    // Hardware dispatch
    this.activeSource.start(scheduledStartTime, offset);
  }

  /**
   * Returns current song playback time in seconds using hardware audio clock.
   */
  getCurrentTime() {
    if (!this.isPlaying) return 0;
    if (this.isPaused) return this.pauseOffset;
    return this.audioCtx.currentTime - this.startTime;
  }

  /**
   * Pauses audio playback
   */
  pause() {
    if (!this.isPlaying || this.isPaused) return;

    this.pauseOffset = this.getCurrentTime();
    this.isPaused = true;
    if (this.activeSource) {
      try {
        this.activeSource.onended = null;
        this.activeSource.stop();
        this.activeSource.disconnect();
      } catch (e) {}
      this.activeSource = null;
    }
  }

  /**
   * Resumes audio playback
   */
  resume(audioBuffer) {
    if (!this.isPaused || !audioBuffer) return;
    this.play(audioBuffer, {
      offset: Math.max(0, this.pauseOffset),
      delay: Math.max(0, -this.pauseOffset),
      onEnded: this.onEndedCallback
    });
  }

  /**
   * Stops audio playback
   */
  stop() {
    if (this.activeSource) {
      try {
        this.activeSource.onended = null;
        this.activeSource.stop();
        this.activeSource.disconnect();
      } catch (e) {}
      this.activeSource = null;
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.pauseOffset = 0;
  }

  /**
   * Mute toggle
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem("isMuted", this.isMuted);
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
    }
    return this.isMuted;
  }

  // UI SFX
  playClick() {
    if (this.isMuted) return;
    try {
      this.sfxClick.currentTime = 0;
      this.sfxClick.play().catch(() => {});
    } catch (e) {}
  }

  playHover() {
    if (this.isMuted) return;
    try {
      this.sfxHover.currentTime = 0;
      this.sfxHover.play().catch(() => {});
    } catch (e) {}
  }

  playWin() {
    if (this.isMuted) return;
    try {
      this.sfxWin.currentTime = 0;
      this.sfxWin.play().catch(() => {});
    } catch (e) {}
  }
}

export const audioEngine = new AudioEngine();

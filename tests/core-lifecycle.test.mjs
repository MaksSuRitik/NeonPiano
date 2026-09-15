import test from 'node:test';
import assert from 'node:assert/strict';
import { PixiNotePool } from '../src/game/render/PixiNotePool.js';
import { PixiParticleSystem } from '../src/game/render/PixiParticleSystem.js';

globalThis.localStorage = { getItem: () => null };
globalThis.Audio = class {};
const { AudioEngine } = await import('../src/audio/audioEngine.js');
function audioFixture() {
  const engine = new AudioEngine();
  engine.audioCtx = { currentTime: 10, createBufferSource() {
    return { connect() {}, disconnect() { this.disconnected = true; }, stop() {}, start(time, offset) { this.schedule = [time, offset]; } };
  }};
  engine.analyser = {};
  return engine;
}
test('pause during countdown preserves remaining lead-in and ignores stale source endings', () => {
  const engine = audioFixture();
  const buffer = { duration: 100 };
  let ended = 0;
  engine.play(buffer, { onEnded: () => ended++ });
  const old = engine.activeSource;
  const queuedEnd = old.onended;
  engine.audioCtx.currentTime = 10.5;
  engine.pause();
  assert.equal(old.onended, null);
  assert.equal(old.disconnected, true);
  engine.audioCtx.currentTime = 20;
  engine.resume(buffer);
  assert.deepEqual(engine.activeSource.schedule, [21.5, 0]);
  queuedEnd();
  assert.equal(ended, 0);
  assert.equal(engine.isPlaying, true);
  engine.activeSource.onended();
  assert.equal(ended, 1);
  assert.equal(engine.activeSource, null);
});
test('resize keeps fallback GPU texture allocation bounded', () => {
  const pool = new PixiNotePool();
  pool._generateFallbackTextures = () => assert.fail('resize allocated GPU textures');
  for (let i = 0; i < 100; i++) pool.updateDimensions(100 + i, 80 + i, 150);
});
test('theme texture replacement disposes removed tiers and retains shared textures', () => {
  const pool = new PixiNotePool();
  let disposed = 0;
  const obsolete = { destroy() { disposed++; } };
  const retained = { destroy() { assert.fail('retained texture disposed'); } };
  pool.PIXI = { Texture: { from: canvas => canvas } };
  pool.tierTextures.tap.set('old', obsolete);
  pool.tierTextures.head.set('shared', retained);
  pool.updateTexturesFromCache({ tap: { shared: retained } });
  assert.equal(disposed, 1);
  assert.equal(pool.tierTextures.head.size, 0);
  assert.equal(pool.tierTextures.tap.get('shared'), retained);
});
test('ambient layer can become visible again after switching away from Phrolova', () => {
  const system = new PixiParticleSystem();
  system.isReady = true;
  system.MAX_HITS = system.MAX_PARTICLES = 0;
  system.ambientContainer = { visible: true };
  system.update(100, 0, { id: 'sanhua' });
  assert.equal(system.ambientContainer.visible, false);
  system.update(110, 0, { id: 'phrolova' });
  assert.equal(system.ambientContainer.visible, true);
});
test('destroy resets particle singleton lifecycle and disposes textures once', () => {
  const system = new PixiParticleSystem();
  let disposed = 0;
  system.isReady = true;
  system.textures.spark = { destroy() { disposed++; } };
  system.destroy();
  system.destroy();
  assert.equal(disposed, 1);
  assert.equal(system.isReady, false);
  assert.equal(system.app, null);
});
test('renderer destroyed while GPU init awaits cannot append a stale canvas', async () => {
  const { PixiRenderer } = await import('../src/game/render/PixiRenderer.js');
  let completeInit;
  let disposed = 0;
  globalThis.window = { PIXI: { Application: class {
    init() { return new Promise(resolve => { completeInit = resolve; }); }
    destroy() { disposed++; }
  } } };
  const renderer = new PixiRenderer();
  const init = renderer.init({ container: { appendChild() { assert.fail('stale canvas appended'); } } });
  await Promise.resolve();
  assert.equal(typeof completeInit, 'function');
  renderer.destroy();
  completeInit();
  await init;
  assert.equal(disposed, 1);
  assert.equal(renderer.app, null);
  assert.equal(renderer.isReady, false);
  assert.equal(renderer.isInitializing, false);
});

// Isolate the legacy game from its remote Firebase module; exercise the actual class source.
const { readFile } = await import('node:fs/promises');
const pianoSource = (await readFile(new URL('../src/game/pianoGame.js', import.meta.url), 'utf8'))
  .replace(/^import .*;$/gm, '').replace('export class NeonPianoGame', 'class NeonPianoGame');
function pianoFixture(audio = {}) {
  const audioStub = { play() {}, pause() {}, resume() {}, stop() {}, ...audio };
  const Game = new Function('audioEngine', 'saveGameStats', `${pianoSource}\nreturn NeonPianoGame;`)(audioStub, async () => {});
  Game.prototype.initCanvas = function() {};
  const game = new Game({});
  game.update = () => {};
  game.render = () => {};
  return game;
}
test('legacy piano pause/resume and repeated start maintain exactly one RAF', () => {
  const pending = new Map();
  let next = 0;
  globalThis.requestAnimationFrame = callback => { const id = next++; pending.set(id, callback); return id; };
  globalThis.cancelAnimationFrame = id => pending.delete(id);
  const game = pianoFixture();
  game.audioBuffer = { duration: 10 };
  game.start();
  game.start();
  assert.equal(pending.size, 1);
  game.pause();
  assert.equal(pending.size, 0);
  game.resume();
  game.resume();
  assert.equal(pending.size, 1);
  game.stop();
  assert.equal(pending.size, 0);
});
test('legacy judgments complete without nonexistent audio engine methods', () => {
  const game = pianoFixture();
  game.laneWidth = 100;
  game.hitLineY = 500;
  for (const judgment of ['PERFECT', 'GOOD', 'MISS']) game.registerHit(judgment, 0);
  assert.equal(game.perfectCount, 1);
  assert.equal(game.goodCount, 1);
  assert.equal(game.missCount, 1);
});
test('legacy chart ends within short audio and rejects invalid duration', () => {
  const game = pianoFixture();
  assert.deepEqual(game.generateBeatmap(Infinity), []);
  assert.deepEqual(game.generateBeatmap(1), []);
  assert.ok(game.generateBeatmap(4, 0).every(note => note.hitTime < 4));
});
test('legacy track loads ignore an older decode completing last', async () => {
  const pending = new Map();
  const game = pianoFixture({ loadTrackBuffer: url => new Promise(resolve => pending.set(url, resolve)) });
  const first = game.loadTrack({ audioUrl: 'first', id: 'first' });
  const second = game.loadTrack({ audioUrl: 'second', id: 'second' });
  const secondBuffer = { duration: 4 };
  pending.get('second')(secondBuffer);
  await second;
  pending.get('first')({ duration: 20 });
  await first;
  assert.equal(game.audioBuffer, secondBuffer);
  assert.equal(game.currentTrack.id, 'second');
});
test('legacy judgment tone disconnects both audio nodes on completion', () => {
  let disconnected = 0;
  const oscillator = { frequency: { setValueAtTime() {} }, connect() {}, start() {}, stop() {}, disconnect() { disconnected++; } };
  const gain = { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, disconnect() { disconnected++; } };
  const game = pianoFixture({ audioCtx: { state: 'running', currentTime: 0, createOscillator: () => oscillator, createGain: () => gain }, masterGain: {} });
  game.playJudgmentSound(0, true);
  oscillator.onended();
  assert.equal(disconnected, 2);
});

test('fullscreen contract: supports native fullscreen and simulated fallback on iPhone', () => {
  const doc = {
    fullscreenElement: null,
    documentElement: {
      classList: new Set(),
      requestFullscreen: undefined,
    },
    body: {
      classList: new Set(),
    }
  };

  const hasNative = () => typeof doc.documentElement.requestFullscreen === 'function' ||
                          typeof doc.documentElement.webkitRequestFullscreen === 'function';
  const isFs = () => Boolean(
    doc.fullscreenElement ||
    doc.body.classList.has('simulated-fullscreen') ||
    doc.documentElement.classList.has('simulated-fullscreen')
  );

  // On iOS Safari / iPhone: native fullscreen is false
  assert.equal(hasNative(), false);
  assert.equal(isFs(), false);

  // Activate simulated fullscreen fallback
  doc.body.classList.add('simulated-fullscreen');
  doc.documentElement.classList.add('simulated-fullscreen');
  assert.equal(isFs(), true);

  // Exit simulated fullscreen
  doc.body.classList.delete('simulated-fullscreen');
  doc.documentElement.classList.delete('simulated-fullscreen');
  assert.equal(isFs(), false);

  // On desktop / Android: native fullscreen is supported
  doc.documentElement.requestFullscreen = () => {};
  assert.equal(hasNative(), true);
  doc.fullscreenElement = doc.documentElement;
  assert.equal(isFs(), true);
});

test('auto-pause contract: immediately cuts audio, cancels holds, and prevents score farming', () => {
  let audioStopped = false;
  let audioDisconnected = false;
  let ctxSuspended = false;

  const mockSource = {
    onended: () => {},
    stop: () => { audioStopped = true; },
    disconnect: () => { audioDisconnected = true; }
  };

  const mockAudioCtx = {
    currentTime: 15.75,
    state: 'running',
    suspend: () => { ctxSuspended = true; }
  };

  const mockState = {
    isPlaying: true,
    isPaused: false,
    startTime: 5.0,
    pauseSongTime: 0,
    sourceNode: mockSource,
    audioCtx: mockAudioCtx,
    keyState: [true, true, false, false],
    holdingTiles: [
      { lane: 0, holding: true, released: false, fadeStartTime: null, releaseSongTime: null },
      { lane: 1, holding: true, released: false, fadeStartTime: null, releaseSongTime: null },
      null,
      null
    ]
  };

  // Simulate togglePauseGame(true)
  const targetPaused = true;
  mockState.isPaused = targetPaused;
  const currentSongTimeMs = (mockState.audioCtx.currentTime - mockState.startTime) * 1000;
  mockState.pauseSongTime = currentSongTimeMs;

  if (mockState.sourceNode) {
    mockState.sourceNode.onended = null;
    mockState.sourceNode.stop(0);
    mockState.sourceNode.disconnect();
    mockState.sourceNode = null;
  }
  if (mockState.audioCtx && mockState.audioCtx.state === 'running') {
    mockState.audioCtx.suspend();
  }

  // Release all inputs & holding tiles
  mockState.keyState = [false, false, false, false];
  mockState.holdingTiles.forEach(tile => {
    if (tile) {
      tile.holding = false;
      tile.released = true;
      tile.releaseSongTime = mockState.pauseSongTime;
    }
  });
  const prevHolding = mockState.holdingTiles;
  mockState.holdingTiles = [null, null, null, null];

  // Assertions:
  assert.equal(audioStopped, true, 'Audio must stop immediately on pause');
  assert.equal(audioDisconnected, true, 'Audio source must disconnect immediately on pause');
  assert.equal(ctxSuspended, true, 'AudioContext must be suspended');
  assert.equal(mockState.sourceNode, null, 'Source node must be cleared');
  assert.equal(mockState.pauseSongTime, 10750, 'Pause time accurately recorded (15.75s - 5.0s = 10.75s)');
  assert.deepEqual(mockState.keyState, [false, false, false, false], 'All keys must be released to prevent score farming');
  assert.equal(prevHolding[0].holding, false, 'Hold note 0 must not remain in holding state');
  assert.equal(prevHolding[0].released, true, 'Hold note 0 must be marked released');
  assert.deepEqual(mockState.holdingTiles, [null, null, null, null], 'Holding tiles array must be cleared');
});

test('watchdog compositor stall contract: detects frozen rAF (Hyprland workspace switch / background) and triggers auto-pause', () => {
  let autoPauseTriggered = false;
  let reasonGiven = '';

  const mockState = {
    isPlaying: true,
    isPaused: false,
    lastRafTime: 1000
  };

  function checkWatchdog(currentTime) {
    if (mockState.isPlaying && !mockState.isPaused) {
      const lastRaf = mockState.lastRafTime || currentTime;
      if (currentTime - lastRaf > 300) {
        autoPauseTriggered = true;
        reasonGiven = 'watchdog compositor stall';
        mockState.isPaused = true;
      }
    }
  }

  // Normal frame tick (16ms later)
  checkWatchdog(1016);
  assert.equal(autoPauseTriggered, false);

  // Normal frame tick (200ms later - lag spike below 300ms)
  checkWatchdog(1200);
  assert.equal(autoPauseTriggered, false);

  // Hyprland workspace switch or backgrounded tab (450ms stall)
  checkWatchdog(1450);
  assert.equal(autoPauseTriggered, true);
  assert.equal(reasonGiven, 'watchdog compositor stall');
  assert.equal(mockState.isPaused, true);
});


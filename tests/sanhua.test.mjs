import test from 'node:test';
import assert from 'node:assert/strict';

let canvases = 0;
function context(alpha = 1) {
  const stack = [], draws = [];
  const c = {
    globalAlpha: alpha,
    globalCompositeOperation: 'source-over',
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    draws,
    canvas: { clientHeight: 800, width: 800, height: 600 },
    save() { stack.push({alpha:this.globalAlpha, composite:this.globalCompositeOperation}); },
    restore() { const state=stack.pop(); if(state) { this.globalAlpha=state.alpha; this.globalCompositeOperation=state.composite; } },
    createLinearGradient() { return { addColorStop() {} }; },
    createRadialGradient() { return { addColorStop() {} }; },
    drawImage(...args) { draws.push({ args, alpha: this.globalAlpha }); },
    beginPath() {},
    closePath() {},
    moveTo() {},
    lineTo() {},
    arc() {},
    rect() {},
    roundRect() {},
    fill() {},
    stroke() {},
    clip() {},
    fillRect() {},
    strokeRect() {}
  };
  return new Proxy(c, { get: (o, k) => (k in o ? o[k] : () => {}) });
}

globalThis.document = {
  createElement() {
    canvases++;
    return { width: 0, height: 0, getContext: () => context() };
  },
  body: { getAttribute: () => null }
};

globalThis.window = {
  GameState: { isMobile: true, combo: 800 },
  matchMedia: () => ({ matches: false })
};

const { SANHUA_THEME: S } = await import('../src/game/themes/sanhua.js');
const tile = { holding: true, hit: true };

test('bakeTapNote renders fractured shards strictly respecting note bounds', () => {
  const c = context(1);
  const rendered = S.bakeTapNote(c, 10, 20, 80, 40, false, 0);
  assert.equal(rendered, true);
  assert.equal(c.globalAlpha, 1);

  // Test across light and dark modes and combo tiers
  for (const tier of [0, 100, 200, 400, 800]) {
    const cDark = context(1);
    const cLight = context(1);
    assert.equal(S.bakeTapNote(cDark, 0, 0, 90, 45, false, tier), true);
    assert.equal(S.bakeTapNote(cLight, 0, 0, 90, 45, true, tier), true);
  }
});

test('drawHoldBody renders full-width Hiyuki energy body with top alpha fade and no tip canvas', () => {
  const c = context(0.8);
  // yTail = 100, tailH = 200 => bottom = 300, length = 200
  S.drawHoldBody(c, 10, 100, 90, 44, tile, false, 1234, 200, 250);
  // Should draw full-width continuous energy body strip directly from yTail
  assert.ok(c.draws.length >= 1);
  // Body is drawn at left (12) and yTail (100)
  assert.equal(c.draws[0].args[5], 12);
  assert.equal(c.draws[0].args[6], 100);
  assert.ok(c.draws.every(d => d.alpha <= 0.8));
});

test('drawNeck renders receptor head and bounds hold paint cache allocations', () => {
  const c = context(0.5);
  S.drawNeck(c, 10, 300, 90, 44, tile, false, 800);
  assert.equal(c.draws.length, 1);
  assert.equal(c.draws[0].alpha, 0.5);

  const allocated = canvases;
  // Repeat 50 times with various combos - cache should prevent runaway allocations
  for (let i = 0; i < 50; i++) {
    S.drawNeck(context(), 10, 300, 90, 44, tile, false, i * 20);
  }
  // Bounded cache entries (14 max per width/height)
  assert.ok(canvases - allocated <= 42);
});

test('failed and released hold notes render dead state cache entry', () => {
  const cNormal = context();
  const cReleased = context();
  const cFailed = context();

  S.drawHoldBody(cNormal, 0, 100, 90, 44, tile, false, 0, 200, 150);
  S.drawHoldBody(cReleased, 0, 100, 90, 44, tile, false, 0, 200, 150, null, true);
  S.drawHoldBody(cFailed, 0, 100, 90, 44, { ...tile, failed: true }, false, 0, 200, 150);

  assert.ok(cNormal.draws.length >= 1);
  assert.ok(cReleased.draws.length >= 1);
  assert.ok(cFailed.draws.length >= 1);
  // Dead hold note strip is distinct from active strip
  assert.notEqual(cNormal.draws[0].args[0], cReleased.draws[0].args[0]);
  assert.equal(cReleased.draws[0].args[0], cFailed.draws[0].args[0]);
});

test('T5 Blood-Moon shift triggers at 800+ combo with crimson obsidian palette', () => {
  const palBase = S._getPalette(0, false);
  const palT5 = S._getPalette(800, false);

  assert.notEqual(palBase.border, palT5.border);
  assert.equal(palT5.border, '#ff1744');
  assert.equal(palT5.bgTop, '#180308');

  // Verify hold paint cache separates T5 from base tier
  const cacheBase = S._getHoldPaintCache(90, 44, 0);
  const cacheT5 = S._getHoldPaintCache(90, 44, 800);
  assert.notEqual(cacheBase.strip, cacheT5.strip);
  assert.notEqual(cacheBase.cap, cacheT5.cap);
});


test('hold texture allocation stays bounded even for extremely long and shrinking holds', () => {
  const c = context(.37);
  S.drawHoldBody(c, 0, -50000, 90, 44, tile, false, 0, 50500, 400, 500);
  const texture = c.draws.at(-1).args[0], allocated = canvases;
  assert.equal(texture.height, 512);
  for (const length of [1, 10, 100, 1000, 100000]) {
    S.drawHoldBody(c, 0, 0, 90, 44, tile, false, 0, length, 400, length);
    assert.equal(c.draws.at(-1).args[0], texture);
  }
  assert.equal(canvases, allocated);
  assert.equal(c.globalAlpha, .37);
  assert.equal(c.globalCompositeOperation, 'source-over');
});

test('environment crossfades at 800 and keeps caller state and gameplay state untouched', () => {
  const c = context(.4), state = {gameWidth:400, gameHeight:720, combo:799};
  S.updateAndDrawAtmosphere(c, 0, 1, 0, state);
  const normal=c.draws.at(-1).args[0], allocated=canvases;
  state.combo=800;
  for(let i=1;i<=120;i++) S.updateAndDrawAtmosphere(c,i*16.67,1,0,state);
  assert.notEqual(c.draws.at(-1).args[0],normal);
  assert.ok(c.draws.at(-1).alpha>.39 && c.draws.at(-1).alpha<=.4);
  assert.equal(canvases,allocated);
  assert.equal(c.globalAlpha,.4);
  assert.equal(c.globalCompositeOperation,'source-over');
  assert.deepEqual(state,{gameWidth:400,gameHeight:720,combo:800});
});

test('prewarm initializes all tiers and guarantees zero canvas allocations when crossing combo 800', () => {
  // Prewarm for note width 95, headH 48
  S.prewarm(95, 48, 105, false, 400, 720);
  const canvasCountAfterPrewarm = canvases;

  // Render combo 799 hold note and neck
  const c = context(1.0);
  S.drawHoldBody(c, 10, 100, 95, 48, tile, false, 1000, 200, 799, 300);
  S.drawNeck(c, 10, 300, 95, 48, tile, false, 799);

  // Cross into combo 800 (T5 Blood Eclipse)
  S.drawHoldBody(c, 10, 100, 95, 48, tile, false, 1016, 200, 800, 300);
  S.drawNeck(c, 10, 300, 95, 48, tile, false, 800);

  // Assert ZERO new canvas elements were created during 799 -> 800 transition
  assert.equal(canvases, canvasCountAfterPrewarm, 'No new canvases should be created during 799 -> 800 combo threshold');
});


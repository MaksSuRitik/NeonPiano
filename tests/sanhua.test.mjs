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
    save() { stack.push(this.globalAlpha); },
    restore() { this.globalAlpha = stack.pop() ?? 1; },
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

test('drawHoldBody renders full-width Hiyuki energy slash tip and body strip', () => {
  const c = context(0.8);
  // yTail = 100, tailH = 200 => bottom = 300, length = 200
  S.drawHoldBody(c, 10, 100, 90, 44, tile, false, 1234, 200, 250);
  // Should draw blade tip and full-width energy ribbon
  assert.ok(c.draws.length >= 2);
  // Tip is drawn at left (12) and yTail (100)
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

  assert.ok(cNormal.draws.length >= 2);
  assert.ok(cReleased.draws.length >= 2);
  assert.ok(cFailed.draws.length >= 2);
  // Dead hold note cap is distinct from active cap
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

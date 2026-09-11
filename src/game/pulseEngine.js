// ==========================================
// PULSE ENGINE: PROCEDURAL RHYTHM NOTE GENERATOR
// ==========================================
// Analyzes raw PCM audio data, spectral flux, and energy to deterministically
// generate short taps and long hold notes across 4 lanes (S, D, J, K).

/**
 * Normalizes audio buffer values aggressively to enhance beat peaks.
 */
export function normalizeBufferAggressive(buffer) {
  const newData = new Float32Array(buffer.length);
  let maxAmp = 0;
  for (let i = 0; i < buffer.length; i += 500) {
    const val = Math.abs(buffer[i]);
    if (val > maxAmp) maxAmp = val;
  }
  const mult = 1.0 / (maxAmp || 0.01);
  for (let i = 0; i < buffer.length; i++) {
    const val = Math.abs(buffer[i] * mult);
    newData[i] = Math.pow(val, 0.95);
  }
  return newData;
}

/**
 * Calculates localized moving average energy over a sliding window.
 */
export function getLocalAverage(data, index, sampleRate, windowSec = 2.0) {
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

/**
 * Checks if a note has sustained energy (long hold note vs short tap).
 */
export function checkSustain(data, index, sampleRate, attackEnergy, localAvg) {
  const lookAheadSamples = Math.floor(sampleRate * 0.5);
  const startScan = index + Math.floor(sampleRate * 0.05);
  const endScan = Math.min(data.length, index + lookAheadSamples);

  let sum = 0, count = 0;
  for (let k = startScan; k < endScan; k += 100) {
    sum += Math.abs(data[k]);
    count++;
  }
  const sustainLevel = count > 0 ? sum / count : 0;
  const isLong = (sustainLevel > attackEnergy * 0.65) || (sustainLevel > localAvg * 1.2);

  if (!isLong) return { isLong: false, duration: 0 };

  let endIndex = index;
  const maxDurSamples = sampleRate * 3.0;

  for (let k = startScan; k < index + maxDurSamples; k += Math.floor(sampleRate * 0.1)) {
    if (k >= data.length) break;
    const val = Math.abs(data[k]);
    if (val < attackEnergy * 0.3 && val < localAvg) {
      endIndex = k;
      break;
    }
    endIndex = k;
  }
  return { isLong: true, duration: (endIndex - index) / sampleRate };
}

/**
 * Allocates notes intelligently among the 4 lanes to avoid overlapping notes.
 */
export function smartLaneAllocator(laneFreeTimes, count, currentTime, lastLane) {
  const available = [];
  for (let l = 0; l < 4; l++) {
    if (currentTime > laneFreeTimes[l]) available.push(l);
  }

  if (available.length < count) count = available.length;
  if (count === 0) return [];

  // Shuffle available lanes
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }

  if (count === 2 && available.length >= 2) {
    available.sort((a, b) => a - b);
    return [available[0], available[available.length - 1]];
  }
  return available.slice(0, count);
}

/**
 * Generates rhythmic tiles from decoded AudioBuffer.
 * 
 * @param {AudioBuffer} decodedAudio 
 * @param {string} songTitle Used to generate deterministic LCG seed
 * @param {object} config Speed and layout settings
 * @param {number} gameHeight Canvas height for accurate speed scaling
 * @returns {Array<object>} Array of tile objects
 */
export function generateTilesFromAudio(decodedAudio, songTitle, config, gameHeight = 600) {
  // 1. Create deterministic seed based on song title
  let seed = 0;
  for (let i = 0; i < songTitle.length; i++) {
    seed = ((seed << 5) - seed) + songTitle.charCodeAt(i);
    seed |= 0;
  }
  if (seed < 0) seed = -seed;
  if (seed === 0) seed = 12345;

  // Linear congruential generator for consistent note maps across replays
  const getStableRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const rawData = decodedAudio.getChannelData(0);
  const normalizedData = normalizeBufferAggressive(rawData);
  const sampleRate = decodedAudio.sampleRate;
  const duration = decodedAudio.duration;
  const tiles = [];

  const startSpeedMs = config.speedStart || 800;
  const endSpeedMs = config.speedEnd || 500;
  const hitPosition = config.hitPosition || 0.85;
  const noteHeight = config.noteHeight || 210;

  const trackHeight = gameHeight > 0 ? (gameHeight * hitPosition) : 600;
  const noteSizeFraction = noteHeight / trackHeight;

  const STEP_SIZE = Math.floor(sampleRate / 100);
  const laneFreeTime = [0, 0, 0, 0];
  let lastGenerationTime = 0;
  let lastLane = -1;
  let maxPossibleScore = 0;

  for (let i = STEP_SIZE; i < normalizedData.length; i += STEP_SIZE) {
    const time = i / sampleRate;
    let energy = 0;
    for (let j = 0; j < STEP_SIZE; j += 10) {
      const idx = i - j;
      if (idx >= 0 && idx < normalizedData.length) {
        energy += Math.abs(normalizedData[idx]);
      }
    }
    energy /= (STEP_SIZE / 10);

    const localAvg = getLocalAverage(normalizedData, i, sampleRate, 2.0);
    const threshold = Math.max(0.04, localAvg * (localAvg > 0.6 ? 0.15 : (localAvg > 0.4 ? 0.25 : 0.6)));

    let prevEnergy = 0;
    const prevIndex = i - (STEP_SIZE * 4);
    if (prevIndex > 0) {
      for (let j = 0; j < STEP_SIZE; j += 10) {
        const idx = prevIndex - j;
        if (idx >= 0) prevEnergy += Math.abs(normalizedData[idx]);
      }
      prevEnergy /= (STEP_SIZE / 10);
    }
    const flux = Math.max(0, energy - prevEnergy);

    const currentSpeedMs = startSpeedMs;
    const noteBlockTime = (currentSpeedMs / 1000) * noteSizeFraction;
    let minGap = noteBlockTime + 0.02;

    if (energy > 0.6 || localAvg > 0.5) minGap = noteBlockTime * 0.8;
    else if (energy > 0.4) minGap = noteBlockTime + 0.05;

    const timeSinceLast = time - lastGenerationTime;
    const isHit = flux > threshold;
    const isStream = (energy > localAvg * 0.9) && (energy > 0.35) && (timeSinceLast > minGap);

    if ((isHit && timeSinceLast > minGap) || isStream) {
      const sustainInfo = checkSustain(normalizedData, i, sampleRate, energy, localAvg);
      const type = (sustainInfo.isLong && sustainInfo.duration >= 0.4) ? "long" : "tap";
      const dur = type === "long" ? Math.min(sustainInfo.duration, 2.0) : 0;

      let notesCount = 1;
      if ((flux > 0.2 || energy > 0.8) && getStableRandom() > 0.6 && type !== "long") {
        notesCount = 2;
      }

      const lanes = smartLaneAllocator(laneFreeTime, notesCount, time, lastLane);

      if (lanes && lanes.length > 0) {
        lanes.forEach(lane => {
          let noteScore = 50;
          if (type === "long") noteScore += (dur * 1000 / 220 * 5) + 10;
          maxPossibleScore += noteScore;

          tiles.push({
            time: time * 1000, // In milliseconds
            duration: dur * 1000,
            endTime: (time + dur) * 1000,
            lane: lane,
            type: type,
            hit: false,
            holding: false,
            completed: false,
            failed: false,
            released: false,
            holdTicks: 0,
            hitAnimStart: 0,
            lastValidHoldTime: 0
          });

          const visualBuffer = type === "long" ? noteBlockTime * 0.5 : noteBlockTime;
          laneFreeTime[lane] = time + dur + visualBuffer + 0.05;
          lastLane = lane;
        });

        lastGenerationTime = type === "long" ? time + (dur * 0.5) : time;
      }
    }
  }

  return { tiles, maxPossibleScore };
}

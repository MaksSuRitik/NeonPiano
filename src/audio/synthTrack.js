// ==========================================
// PROCEDURAL SYNTHWAVE DEMO TRACK GENERATOR
// ==========================================
// Generates a rich cyberpunk synthwave AudioBuffer locally using OfflineAudioContext.
// Ensures "Неон Пиано" is 100% playable immediately even before tracks are uploaded to Firebase!

export async function generateDemoSynthTrack() {
  const sampleRate = 44100;
  const duration = 40; // 40 seconds demo track
  const bpm = 125;
  const beat = 60 / bpm;

  const offlineCtx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);

  // Bass chords progression: Am - F - C - G
  const chordRoots = [220, 174.61, 261.63, 196]; // A3, F3, C4, G3
  const arpeggioOffsets = [0, 3, 7, 12, 15, 12, 7, 3]; // Minor arpeggio intervals

  let time = 0;
  let chordIndex = 0;

  while (time < duration) {
    const root = chordRoots[chordIndex % chordRoots.length];

    // Bass synth note (every 2 beats)
    const bassOsc = offlineCtx.createOscillator();
    const bassGain = offlineCtx.createGain();
    bassOsc.type = "sawtooth";
    bassOsc.frequency.setValueAtTime(root / 4, time);

    bassGain.gain.setValueAtTime(0.001, time);
    bassGain.gain.linearRampToValueAtTime(0.2, time + 0.05);
    bassGain.gain.exponentialRampToValueAtTime(0.001, time + beat * 1.8);

    bassOsc.connect(bassGain);
    bassGain.connect(offlineCtx.destination);
    bassOsc.start(time);
    bassOsc.stop(time + beat * 1.8);

    // Arpeggio notes (16th notes)
    for (let step = 0; step < 8; step++) {
      const stepTime = time + step * (beat / 4);
      if (stepTime >= duration) break;

      const semitones = arpeggioOffsets[step % arpeggioOffsets.length];
      const noteFreq = root * Math.pow(2, semitones / 12);

      const arpOsc = offlineCtx.createOscillator();
      const arpGain = offlineCtx.createGain();
      arpOsc.type = "square";
      arpOsc.frequency.setValueAtTime(noteFreq, stepTime);

      arpGain.gain.setValueAtTime(0.001, stepTime);
      arpGain.gain.exponentialRampToValueAtTime(0.08, stepTime + 0.01);
      arpGain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.18);

      arpOsc.connect(arpGain);
      arpGain.connect(offlineCtx.destination);
      arpOsc.start(stepTime);
      arpOsc.stop(stepTime + 0.2);
    }

    // Kick & Snare rhythm
    for (let b = 0; b < 4; b++) {
      const beatTime = time + b * beat;
      if (beatTime >= duration) break;

      // Kick on beats 0 & 2
      if (b === 0 || b === 2) {
        const kick = offlineCtx.createOscillator();
        const kickGain = offlineCtx.createGain();
        kick.frequency.setValueAtTime(150, beatTime);
        kick.frequency.exponentialRampToValueAtTime(30, beatTime + 0.1);

        kickGain.gain.setValueAtTime(0.35, beatTime);
        kickGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.15);

        kick.connect(kickGain);
        kickGain.connect(offlineCtx.destination);
        kick.start(beatTime);
        kick.stop(beatTime + 0.16);
      }

      // Snare on beats 1 & 3
      if (b === 1 || b === 3) {
        const snareNoise = offlineCtx.createOscillator();
        const snareGain = offlineCtx.createGain();
        snareNoise.type = "triangle";
        snareNoise.frequency.setValueAtTime(240, beatTime);
        snareNoise.frequency.exponentialRampToValueAtTime(80, beatTime + 0.12);

        snareGain.gain.setValueAtTime(0.22, beatTime);
        snareGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.14);

        snareNoise.connect(snareGain);
        snareGain.connect(offlineCtx.destination);
        snareNoise.start(beatTime);
        snareNoise.stop(beatTime + 0.15);
      }
    }

    time += beat * 4;
    chordIndex++;
  }

  return await offlineCtx.startRendering();
}

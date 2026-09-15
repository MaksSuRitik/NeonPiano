// Hardcore is a modifier. Unknown legacy base difficulty stays unknown.
export function difficultyFromSpeed(speed) {
  return speed >= 1.35 ? 'hard' : speed >= 1.15 ? 'normal' : 'easy';
}

export function normalizeResultMetadata(record = {}) {
  const valid = value => ['easy', 'normal', 'hard'].includes(value);
  const legacy = record.difficulty === 'hardcore';
  const completed = Array.isArray(record.completedDifficulties) ? record.completedDifficulties : [];
  const difficulty = valid(record.difficulty) ? record.difficulty
    : valid(record.baseDifficulty) ? record.baseDifficulty
    : legacy && Number.isFinite(record.speed) && record.speed > 0 ? difficultyFromSpeed(record.speed) : '';
  const isHardcore = record.isHardcore === true || legacy;
  return {
    ...record,
    ...(legacy ? { legacyDifficulty: 'hardcore' } : {}),
    difficulty,
    isHardcore,
    hardcoreCompleted: record.hardcoreCompleted === true || isHardcore || completed.includes('hardcore'),
    completedDifficulties: [...new Set([...completed.filter(valid), ...(difficulty ? [difficulty] : [])])],
  };
}

export function resultModeLabel(record, text) {
  const result = normalizeResultMetadata(record);
  const key = { easy: 'diffEasy', normal: 'diffNormal', hard: 'diffHard' }[result.difficulty];
  return (key ? text(key) : '—') + (result.isHardcore ? ` • ${text('modHardcore')}` : '');
}

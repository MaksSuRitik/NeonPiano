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
    hardHardcoreCompleted: record.hardHardcoreCompleted === true || (difficulty === 'hard' && isHardcore),
    hardcoreCompleted: record.hardcoreCompleted === true || isHardcore || completed.includes('hardcore'),
    completedDifficulties: [...new Set([...completed.filter(valid), ...(difficulty ? [difficulty] : [])])],
  };
}

const escapeBadge = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function hardcoreBadge(record, text) {
  return record.isHardcore === true ? `<span class="track-diff-badge hardcore-modifier">${escapeBadge(text('modHardcore'))}</span>` : '';
}

export function resultBadges(record, text) {
  const key = {easy:'diffEasy',normal:'diffNormal',hard:'diffHard'}[record.difficulty];
  return `<span class="track-diff-badge ${key ? record.difficulty : ''}">${key ? escapeBadge(text(key)) : '—'}</span>${hardcoreBadge(record, text)}`;
}

export function resultModeLabel(record, text) {
  const result = normalizeResultMetadata(record);
  const key = { easy: 'diffEasy', normal: 'diffNormal', hard: 'diffHard' }[result.difficulty];
  return (key ? text(key) : '—') + (result.isHardcore ? ` • ${text('modHardcore')}` : '');
}

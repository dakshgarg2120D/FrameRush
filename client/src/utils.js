// Small display-only helpers. Nothing here decides scores or correctness.

// The exact "has guessed correctly" field name is not final yet (confirm with Bhavya).
// We accept a few likely names so a rename on the server only needs a change here.
export const isCorrect = (p) =>
  Boolean(p?.hasGuessedCorrectly ?? p?.hasGuessed ?? p?.guessedCorrectly ?? p?.correct ?? p?.guessed ?? false);

export const roundPoints = (p) => p?.roundScore ?? p?.pointsEarned ?? p?.roundPoints ?? null;

export function findMe(players = [], myId, name) {
  return (
    players.find((p) => myId && p.id === myId) ||
    players.find((p) => p.name === name) ||
    null
  );
}

// Sort by score (high to low). Equal scores share a rank.
export function rank(players = []) {
  const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  let current = 0;
  let prev = null;
  return sorted.map((p, i) => {
    if ((p.score || 0) !== prev) {
      current = i + 1;
      prev = p.score || 0;
    }
    return { ...p, rank: current };
  });
}

export const errMsg = (e) =>
  typeof e === 'string' ? e : e?.message || 'Something went wrong. Please try again.';

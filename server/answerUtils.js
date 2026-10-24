const gameData = require("./gameData");

// "  The Taj  Mahal! " -> "taj mahal". Exact matching only, no fuzzy logic.
function normalize(text) {
  return String(text || "")
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "") // strip accents
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(the|a|an) /, "");
}

function isCorrect(guess, item) {
  const g = normalize(guess);
  if (!g) return false;
  return item.acceptedAnswers.some((a) => normalize(a) === g);
}

// Pick n unique images (Fisher-Yates shuffle). Fewer than n if the dataset is small.
function pickRounds(n = 10) {
  const pool = [...gameData];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

// Safe-to-broadcast view of a round item (no answers).
function publicView(item) {
  return { id: item.id, imageUrl: item.imageUrl, category: item.category };
}

// Only send this in game:round-ended.
function displayAnswer(item) {
  return item.acceptedAnswers[0];
}

module.exports = { normalize, isCorrect, pickRounds, publicView, displayAnswer };
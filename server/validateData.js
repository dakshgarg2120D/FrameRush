// Run: node server/validateData.js
const fs = require("fs");
const path = require("path");
const data = require("./gameData");
const { normalize } = require("./answerUtils");

const IMG_DIR = path.join(__dirname, "..", "client", "public");
const errors = [], warnings = [];
const ids = new Set(), answerOwner = new Map();

if (data.length < 5) errors.push(`Only ${data.length} images; need at least 5.`);

for (const it of data) {
  if (ids.has(it.id)) errors.push(`Duplicate id: ${it.id}`);
  ids.add(it.id);

  const file = path.join(IMG_DIR, it.imageUrl);
  if (!fs.existsSync(file)) errors.push(`${it.id}: missing file ${it.imageUrl}`);
  else {
    const kb = fs.statSync(file).size / 1024;
    if (kb > 500) warnings.push(`${it.id}: ${Math.round(kb)} KB (consider compressing)`);
  }

  if (!Array.isArray(it.acceptedAnswers) || !it.acceptedAnswers.length)
    errors.push(`${it.id}: no accepted answers`);
  for (const a of it.acceptedAnswers || []) {
    if (a !== a.toLowerCase()) errors.push(`${it.id}: answer not lowercase: "${a}"`);
    const n = normalize(a);
    if (!n) errors.push(`${it.id}: empty answer after normalising: "${a}"`);
    if (answerOwner.has(n) && answerOwner.get(n) !== it.id)
      errors.push(`Answer "${a}" is shared by ${answerOwner.get(n)} and ${it.id}`);
    answerOwner.set(n, it.id);
    if (it.imageUrl.toLowerCase().includes(n.replace(/ /g, "-")))
      errors.push(`${it.id}: imageUrl reveals the answer ("${a}")`);
  }
  if (!["objects", "animals", "landmarks"].includes(it.category))
    errors.push(`${it.id}: bad category ${it.category}`);
  if (!["easy", "medium", "hard"].includes(it.difficulty))
    errors.push(`${it.id}: bad difficulty ${it.difficulty}`);
}

warnings.forEach((w) => console.log("WARN ", w));
errors.forEach((e) => console.log("FAIL ", e));
console.log(errors.length ? `\n${errors.length} problem(s).` : `\nPASS: ${data.length} images valid.`);
process.exit(errors.length ? 1 : 0);
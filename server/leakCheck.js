// Run with server already started: node server/leakCheck.js [http://localhost:3001]
// Needs: npm i -D socket.io-client   (in server/)
const { io } = require("socket.io-client");
const data = require("./gameData");
const { normalize } = require("./answerUtils");

const URL = process.argv[2] || "http://localhost:3001";
const answers = [...new Set(data.flatMap((d) => d.acceptedAnswers.map(normalize)))];
const leaks = [], seen = new Set();

function strip(v) { // ignore imageUrl values; that is checked by validateData.js
  return JSON.parse(JSON.stringify(v, (k, val) => (k === "imageUrl" ? undefined : val)));
}

function watch(name) {
  const s = io(URL);
  s.onAny((event, payload) => {
    seen.add(event);
    if (event === "game:round-ended" || event === "game:finished") return; // answer allowed here
    const text = JSON.stringify(strip(payload) ?? "");
    if (/acceptedAnswers/i.test(text)) leaks.push(`${name} ${event}: contains "acceptedAnswers"`);
    const norm = normalize(text.replace(/[{}\[\]":,]/g, " ")).split(" ");
    for (const a of answers) {
      if (!a.includes(" ") && norm.includes(a)) leaks.push(`${name} ${event}: contains answer word "${a}"`);
    }
  });
  s.on("connect", () => s.emit("matchmaking:join", { playerName: name }));
  return s;
}

const a = watch("LeakA"), b = watch("LeakB");
setTimeout(() => {
  a.close(); b.close();
  console.log("Events seen:", [...seen].join(", ") || "(none; is the server running?)");
  if (leaks.length) { console.log("FAIL\n" + [...new Set(leaks)].join("\n")); process.exit(1); }
  console.log("PASS: no answer data in pre-round-end events.");
}, 8000);
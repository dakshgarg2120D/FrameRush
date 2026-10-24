// Self-contained smoke test: starts the server with short timers and plays real games over Socket.IO.
const { spawn } = require("child_process");
const path = require("path");
const http = require("http");
const { io } = require("socket.io-client");
const data = require("../gameData");
const IMAGES = Array.isArray(data) ? data : data.images || data.gameData || [];

const PORT = 3055;
const URL = `http://localhost:${PORT}`;
const ROUND_MS = 2500;
let failures = 0;
const check = (cond, msg) => { console.log((cond ? "PASS " : "FAIL ") + msg); if (!cond) failures++; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const answerFor = (imageUrl) => IMAGES.find((i) => i.imageUrl === imageUrl).acceptedAnswers[0];

function makePlayer(name) {
  const s = io(URL, { transports: ["websocket"] });
  const p = { name, s, events: [], lastRound: 0, roundPoints: {}, onRound: null };
  for (const ev of ["matchmaking:waiting", "game:started", "game:state", "game:round-ended", "game:finished", "game:error", "game:guess-result"]) {
    s.on(ev, (d) => {
      p.events.push({ ev, d, t: Date.now() });
      if ((ev === "game:started" || ev === "game:state") && d.phase === "playing" && d.roundNumber !== p.lastRound) {
        p.lastRound = d.roundNumber;
        if (p.onRound) p.onRound(d.roundNumber, answerFor(d.imageUrl));
      }
      if (ev === "game:guess-result" && d.correct && d.pointsAwarded) p.roundPoints[p.lastRound] = d.pointsAwarded;
    });
  }
  p.of = (ev) => p.events.filter((e) => e.ev === ev).map((e) => e.d);
  p.waitFor = async (ev, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const f = p.of(ev); if (f.length) return f[f.length - 1]; await sleep(30); } return null; };
  return p;
}

async function main() {
  const server = spawn(process.execPath, ["index.js"], {
    cwd: path.join(__dirname, ".."),
    env: { ...process.env, PORT, ROUND_DURATION_MS: ROUND_MS, BETWEEN_ROUNDS_MS: 300, LOBBY_WAIT_MS: 300, TOTAL_ROUNDS: 10 },
  });
  server.stdout.on("data", () => {}); server.stderr.on("data", (d) => process.stderr.write("[server] " + d));
  await sleep(800);

  // ---------- Scenario 1: full 5-round game ----------
  console.log("\n--- Scenario 1: full game ---");
  const A = makePlayer("Alice"), B = makePlayer("Bob");
  await sleep(300);
  A.s.emit("matchmaking:join", { playerName: "Alice" });
  A.s.emit("matchmaking:join", { playerName: "Alice" }); // duplicate join
  const w = await A.waitFor("matchmaking:waiting", 3000);
  check(w && w.playersWaiting === 1, "single player sees waiting state with playersWaiting=1 (duplicate join not double-counted)");

  A.onRound = async (r, ans) => {
    if (r === 4) return; // nobody guesses in round 4 -> timeout
    A.s.emit("game:guess", { guess: "zzzz" });
    A.s.emit("game:guess", { guess: "   " });          // empty
    A.s.emit("game:guess", { guess: 12345 });          // invalid type
    await sleep(50);
    A.s.emit("game:guess", { guess: "  The " + ans.toUpperCase() + "!! " }); // normalization
    A.s.emit("game:guess", { guess: ans });            // duplicate correct
  };
  B.onRound = async (r, ans) => {
    if (r === 4) return;
    if (r === 3) { B.s.emit("game:guess", { guess: "wrong" }); return; }
    await sleep(400);
    B.s.emit("game:guess", { guess: ans });
  };
  B.s.emit("matchmaking:join", { playerName: "Bob" });

  const fin = await A.waitFor("game:finished", 40000);
  await sleep(200);
  check(!!fin, "game:finished received");
  check(!!B.of("game:finished").length, "both players received game:finished");
  const started = A.of("game:started")[0], startedB = B.of("game:started")[0];
  check(started && started.roomId === startedB.roomId, "both players in same room");
  check(started.players.length === 2 && started.totalRounds === 10, "2 players, 10 total rounds");

  const roundsA = A.of("game:round-ended"), roundsB = B.of("game:round-ended");
  check(roundsA.length === 10 && roundsB.length === 10, "10 rounds ended for both players");
  check(roundsA.every((r, i) => r.correctAnswer === roundsB[i].correctAnswer && r.roundNumber === i + 1), "both saw the same answers in the same order");

  const imgs = (P) => [...new Set(P.events.filter((e) => e.ev === "game:state" || e.ev === "game:started").map((e) => e.d.roundNumber + ":" + e.d.imageUrl))];
  check(JSON.stringify(imgs(A)) === JSON.stringify(imgs(B)), "both saw identical image per round");
  check(new Set(imgs(A).map((s) => s.split(":")[1])).size === 10, "10 distinct images used");

  // No answer leakage during play
  const live = [...A.of("game:started"), ...A.of("game:state")];
  const leak = JSON.stringify(live);
  check(!/acceptedAnswers|correctAnswer/.test(leak) && !IMAGES.some((i) => i.acceptedAnswers.some((a) => leak.toLowerCase().includes('"' + a + '"'))), "no answer key in started/state payloads");

  // Reveal & timer behaviour (round 1)
  const r1 = live.filter((d) => d.roundNumber === 1 && d.phase === "playing");
  check(r1[0].revealedPercent <= 15 && r1[0].timeLeft === Math.ceil(ROUND_MS / 1000), "round 1 starts mostly hidden with full timer");
  check(r1.every((d, i) => i === 0 || (d.revealedPercent >= r1[i - 1].revealedPercent && d.timeLeft <= r1[i - 1].timeLeft)), "reveal increases and timer decreases monotonically");

  // Scoring
  check(Object.values(A.roundPoints).every((p) => p >= 100 && p <= 1000), "points within 100..1000");
  check(A.roundPoints[1] > B.roundPoints[1], "faster guesser (Alice) scored more in round 1");
  check(!A.roundPoints[3] === false && !B.roundPoints[3], "round 3: Bob's wrong guess earned 0, Alice scored");
  check(!A.roundPoints[4] && !B.roundPoints[4], "round 4: timeout, no points");
  const sum = (P) => Object.values(P.roundPoints).reduce((a, b) => a + b, 0);
  const fa = fin.players.find((p) => p.name === "Alice").score, fb = fin.players.find((p) => p.name === "Bob").score;
  check(fa === sum(A) && fb === sum(B), `final scores equal sum of awarded points (Alice ${fa}, Bob ${fb}); duplicates not double-counted`);
  check(fin.winner && fin.winner.name === (fa >= fb ? "Alice" : "Bob") && fin.players[0].rank === 1, `winner announced: ${fin.winner && fin.winner.name}`);
  check(JSON.stringify(A.of("game:finished")) === JSON.stringify(B.of("game:finished")), "final results identical for both clients");
  const r5 = A.events.find((e) => e.ev === "game:round-ended" && e.d.roundNumber === 5);
  const r5start = A.events.find((e) => e.ev === "game:state" && e.d.roundNumber === 5);
  check(r5.t - r5start.t < ROUND_MS - 500, "round 5 ended early once everyone guessed");
  check(A.of("game:guess-result").some((g) => g.reason === "invalid") , "empty/invalid guesses rejected harmlessly");

  // Late guess after match is over
  A.s.emit("game:guess", { guess: "elephant" });
  const err = await A.waitFor("game:error", 1500);
  check(!!err, "guess outside a game returns game:error (no crash)");
  A.s.emit("matchmaking:join", { playerName: "" });
  await sleep(200);
  check(A.of("game:error").length >= 2, "empty display name rejected");

  // ---------- Scenario 2: disconnect ----------
  console.log("\n--- Scenario 2: disconnect mid-game ---");
  const C = makePlayer("Cara"), D = makePlayer("Dan");
  await sleep(200);
  C.s.emit("matchmaking:join", { playerName: "Cara" });
  D.s.emit("matchmaking:join", { playerName: "Dan" });
  await C.waitFor("game:started", 5000);
  await sleep(400);
  D.s.disconnect();
  const f2 = await C.waitFor("game:finished", 5000);
  check(f2 && f2.reason === "opponent_left" && f2.winner.name === "Cara", "remaining player gets game:finished (opponent_left) and wins by forfeit");
  const health = await new Promise((res) => http.get(URL + "/health", (r) => res(r.statusCode)).on("error", () => res(0)));
  check(health === 200, "server still healthy after disconnect");

  // ---------- Scenario 3: queue leave & rejoin ----------
  console.log("\n--- Scenario 3: leave queue / 4 players ---");
  const E = makePlayer("Eve");
  await sleep(200);
  E.s.emit("matchmaking:join", { playerName: "Eve" });
  await E.waitFor("matchmaking:waiting", 2000);
  E.s.disconnect();
  await sleep(200);
  const ps = ["P1", "P2", "P3", "P4"].map(makePlayer);
  await sleep(200);
  ps.forEach((p) => p.s.emit("matchmaking:join", { playerName: p.name }));
  const st = await ps[0].waitFor("game:started", 3000);
  check(st && st.players.length === 4 && !st.players.some((p) => p.name === "Eve"), "4 queued players start one 4-player match; departed queue member excluded");

  [A, B, C, D, ...ps].forEach((p) => p.s.disconnect());
  server.kill();
  console.log(failures ? `\n${failures} CHECK(S) FAILED` : "\nALL CHECKS PASSED");
  process.exit(failures ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
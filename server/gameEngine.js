// FrameRush game engine: matchmaking, rooms, rounds, scoring, timers.
// All state is in memory. The server is authoritative for time, answers and scores.

const crypto = require("crypto");
const rawData = require("./gameData");

// Accept `module.exports = [...]` or `module.exports = { images: [...] }` / `{ gameData: [...] }`
const IMAGES = Array.isArray(rawData)
  ? rawData
  : rawData.images || rawData.gameData || rawData.default || [];

const num = (v, d) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : d);

const CONFIG = {
  totalRounds: num(process.env.TOTAL_ROUNDS, 10),
  roundDurationMs: num(process.env.ROUND_DURATION_MS, 15000),
  betweenRoundsMs: num(process.env.BETWEEN_ROUNDS_MS, 4000),
  lobbyWaitMs: num(process.env.LOBBY_WAIT_MS, 3000), // extra wait for 3rd/4th player once 2 are queued
  minPlayers: 2,
  maxPlayers: 6,
  startRevealPercent: 10,
  tickMs: 1000,
  waitingBroadcastMs: 3000,
  maxGuessLength: 100,
  maxNameLength: 20,
};

// ---------- helpers ----------

function normalize(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip Latin accents
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}\s]/gu, " ") // drop punctuation
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(a|an|the) /, "");
}
const compact = (s) => s.replace(/\s/g, "");

function sanitizeName(name) {
  if (typeof name !== "string") return "";
  return name
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, CONFIG.maxNameLength);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickImages(count) {
  const picked = [];
  while (picked.length < count) picked.push(...shuffle(IMAGES)); // repeats only if fewer images than rounds
  return picked.slice(0, count);
}

// ---------- engine ----------

class GameEngine {
  constructor(io) {
    this.io = io;
    this.queue = []; // [{ id, name }]
    this.rooms = new Map(); // roomId -> room
    this.playerRoom = new Map(); // socketId -> roomId
    this.lobbyTimer = null;
    this.waitingInterval = null;
  }

  // ----- matchmaking -----

  joinQueue(socket, rawName) {
    const name = sanitizeName(rawName);
    if (!name) return this.error(socket, "Please enter a display name.");
    if (this.playerRoom.has(socket.id)) return this.error(socket, "You are already in a game.");

    const existing = this.queue.find((p) => p.id === socket.id);
    if (existing) {
      existing.name = name; // duplicate join: no second queue entry
    } else {
      this.queue.push({ id: socket.id, name });
    }
    this.evaluateQueue();
  }

  evaluateQueue() {
    if (this.queue.length === 0) {
      clearTimeout(this.lobbyTimer);
      this.lobbyTimer = null;
      clearInterval(this.waitingInterval);
      this.waitingInterval = null;
      return;
    }

    if (!this.waitingInterval) {
      this.waitingInterval = setInterval(() => this.broadcastWaiting(), CONFIG.waitingBroadcastMs);
    }

    if (this.queue.length >= CONFIG.maxPlayers) {
      this.startMatchFromQueue();
      return;
    }
    if (this.queue.length >= CONFIG.minPlayers) {
      if (!this.lobbyTimer) {
        this.lobbyTimer = setTimeout(() => this.startMatchFromQueue(), CONFIG.lobbyWaitMs);
      }
    } else {
      clearTimeout(this.lobbyTimer);
      this.lobbyTimer = null;
    }
    this.broadcastWaiting();
  }

  broadcastWaiting() {
    const enough = this.queue.length >= CONFIG.minPlayers;
    const message = enough
      ? "Opponent found! Starting in a moment..."
      : "Waiting for another player to join...";
    for (const p of this.queue) {
      this.io.to(p.id).emit("matchmaking:waiting", { message, playersWaiting: this.queue.length });
    }
  }

  startMatchFromQueue() {
    clearTimeout(this.lobbyTimer);
    this.lobbyTimer = null;
    // Keep only players whose sockets are still connected.
    this.queue = this.queue.filter((p) => this.io.sockets.sockets.has(p.id));
    const entries = this.queue.splice(0, CONFIG.maxPlayers);
    if (entries.length < CONFIG.minPlayers) {
      this.queue.unshift(...entries);
      this.evaluateQueue();
      return;
    }
    this.startMatch(entries);
    this.evaluateQueue(); // clean up timers if queue is now empty
  }

  // ----- match / rooms -----

  startMatch(entries) {
    if (IMAGES.length === 0) {
      for (const e of entries) this.error({ id: e.id }, "No game images are configured on the server.");
      return;
    }
    const roomId = "room_" + crypto.randomBytes(4).toString("hex");
    const room = {
      id: roomId,
      players: new Map(),
      images: pickImages(CONFIG.totalRounds),
      roundNumber: 0,
      round: null,
      phase: "playing",
      finished: false,
      tickTimer: null,
      endTimer: null,
      nextTimer: null,
    };
    for (const e of entries) {
      room.players.set(e.id, { id: e.id, name: e.name, score: 0, connected: true });
      this.playerRoom.set(e.id, roomId);
      const s = this.io.sockets.sockets.get(e.id);
      if (s) s.join(roomId);
    }
    this.rooms.set(roomId, room);
    this.startRound(room, true);
  }

  startRound(room, isFirst) {
    if (room.finished) return;
    clearTimeout(room.nextTimer);
    room.roundNumber += 1;
    const image = room.images[room.roundNumber - 1];
    const now = Date.now();
    room.phase = "playing";
    room.round = {
      number: room.roundNumber,
      image,
      startedAt: now,
      endsAt: now + CONFIG.roundDurationMs,
      correct: new Map(), // playerId -> points earned this round
      answers: new Set(),
      ended: false,
    };
    for (const a of image.acceptedAnswers || []) {
      const n = normalize(a);
      if (n) {
        room.round.answers.add(n);
        room.round.answers.add(compact(n));
      }
    }

    const roundNumber = room.roundNumber;
    clearInterval(room.tickTimer);
    clearTimeout(room.endTimer);
    room.tickTimer = setInterval(() => this.emitState(room), CONFIG.tickMs);
    room.endTimer = setTimeout(() => this.endRound(room, roundNumber), CONFIG.roundDurationMs);

    this.io.to(room.id).emit(isFirst ? "game:started" : "game:state", this.publicState(room));
  }

  publicState(room) {
    let timeLeft = 0;
    let revealedPercent = 100;
    if (room.phase === "playing" && room.round) {
      const elapsed = Math.min(Date.now() - room.round.startedAt, CONFIG.roundDurationMs);
      timeLeft = Math.ceil((CONFIG.roundDurationMs - elapsed) / 1000);
      const start = CONFIG.startRevealPercent;
      revealedPercent = Math.round(start + (100 - start) * (elapsed / CONFIG.roundDurationMs));
    }
    return {
      roomId: room.id,
      phase: room.phase, // "playing" | "round-ended"
      players: [...room.players.values()].map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
        connected: p.connected,
        hasGuessedCorrectly: !!(room.round && room.round.correct.has(p.id)),
      })),
      roundNumber: room.roundNumber,
      totalRounds: CONFIG.totalRounds,
      imageUrl: room.round ? room.round.image.imageUrl : null,
      revealedPercent,
      timeLeft,
    };
  }

  emitState(room) {
    if (room.finished || room.phase !== "playing") return;
    this.io.to(room.id).emit("game:state", this.publicState(room));
  }

  // ----- guesses -----

  handleGuess(socket, rawGuess) {
    const room = this.rooms.get(this.playerRoom.get(socket.id));
    if (!room || room.finished) return this.error(socket, "You are not in an active game.");
    const player = room.players.get(socket.id);
    const round = room.round;

    // Late guesses (after timer or after the round ended) are ignored.
    if (!round || round.ended || room.phase !== "playing" || Date.now() >= round.endsAt) {
      return this.guessResult(socket, { correct: false, pointsAwarded: 0, ignored: true, reason: "round-over" });
    }
    if (typeof rawGuess !== "string") return this.guessResult(socket, { correct: false, pointsAwarded: 0, ignored: true, reason: "invalid" });
    const guess = normalize(rawGuess.slice(0, CONFIG.maxGuessLength));
    if (!guess) return this.guessResult(socket, { correct: false, pointsAwarded: 0, ignored: true, reason: "invalid" });

    if (round.correct.has(socket.id)) {
      return this.guessResult(socket, { correct: true, pointsAwarded: 0, alreadyGuessed: true });
    }
    if (!round.answers.has(guess) && !round.answers.has(compact(guess))) {
      return this.guessResult(socket, { correct: false, pointsAwarded: 0 });
    }

    // Correct: 100 base + up to 900 for time remaining (server clock).
    const remainingMs = Math.max(0, round.endsAt - Date.now());
    const points = 100 + Math.round(900 * Math.min(1, remainingMs / CONFIG.roundDurationMs));
    player.score += points;
    round.correct.set(socket.id, points);

    this.guessResult(socket, { correct: true, pointsAwarded: points });
    this.emitState(room);
    this.checkAllGuessed(room);
  }

  checkAllGuessed(room) {
    const active = [...room.players.values()].filter((p) => p.connected);
    if (active.length > 0 && active.every((p) => room.round.correct.has(p.id))) {
      this.endRound(room, room.roundNumber);
    }
  }

  // ----- round / match end -----

  endRound(room, roundNumber) {
    if (room.finished || !room.round || room.round.ended || room.roundNumber !== roundNumber) return;
    room.round.ended = true;
    room.phase = "round-ended";
    clearInterval(room.tickTimer);
    clearTimeout(room.endTimer);

    const isFinal = room.roundNumber >= CONFIG.totalRounds;
    const players = [...room.players.values()];
    this.io.to(room.id).emit("game:round-ended", {
      roundNumber: room.roundNumber,
      correctAnswer: (room.round.image.acceptedAnswers || [])[0] || "",
      roundScores: players.map((p) => ({
        id: p.id,
        name: p.name,
        points: room.round.correct.get(p.id) || 0,
        correct: room.round.correct.has(p.id),
      })),
      nextRoundIn: isFinal ? 0 : Math.round(CONFIG.betweenRoundsMs / 1000),
      players: players.map((p) => ({ id: p.id, name: p.name, score: p.score, connected: p.connected })), // updated totals
    });

    room.nextTimer = setTimeout(
      () => (isFinal ? this.finishMatch(room) : this.startRound(room, false)),
      CONFIG.betweenRoundsMs
    );
  }

  finishMatch(room, reason) {
    if (room.finished) return;
    room.finished = true;
    clearInterval(room.tickTimer);
    clearTimeout(room.endTimer);
    clearTimeout(room.nextTimer);

    const all = [...room.players.values()];
    // If an opponent left and one player remains, the remaining player wins by forfeit.
    const eligible = reason === "opponent_left" ? all.filter((p) => p.connected) : all;
    const sorted = all.slice().sort((a, b) => b.score - a.score);
    let rank = 0;
    let prev = null;
    const ranked = sorted.map((p, i) => {
      if (p.score !== prev) rank = i + 1;
      prev = p.score;
      return { id: p.id, name: p.name, score: p.score, rank, connected: p.connected };
    });
    const topScore = Math.max(...eligible.map((p) => p.score));
    const winners = ranked.filter((p) => eligible.some((e) => e.id === p.id) && p.score === topScore);

    this.io.to(room.id).emit("game:finished", {
      players: ranked,
      winner: winners[0] || null,
      winners, // more than one entry means a tie
      reason: reason || "completed",
    });
    this.destroyRoom(room);
  }

  destroyRoom(room) {
    clearInterval(room.tickTimer);
    clearTimeout(room.endTimer);
    clearTimeout(room.nextTimer);
    for (const id of room.players.keys()) {
      this.playerRoom.delete(id);
      const s = this.io.sockets.sockets.get(id);
      if (s) s.leave(room.id);
    }
    this.rooms.delete(room.id);
  }

  // ----- disconnects -----

  handleDisconnect(socketId) {
    const qi = this.queue.findIndex((p) => p.id === socketId);
    if (qi !== -1) {
      this.queue.splice(qi, 1);
      this.evaluateQueue();
    }

    const room = this.rooms.get(this.playerRoom.get(socketId));
    if (!room) return;
    const player = room.players.get(socketId);
    if (player) player.connected = false;
    this.playerRoom.delete(socketId);

    const connected = [...room.players.values()].filter((p) => p.connected);
    if (connected.length === 0) return this.destroyRoom(room);
    if (connected.length < CONFIG.minPlayers) return this.finishMatch(room, "opponent_left");

    this.emitState(room); // scoreboard shows the player as disconnected
    if (room.phase === "playing") this.checkAllGuessed(room);
  }

  // ----- emit helpers -----

  error(socketLike, message) {
    this.io.to(socketLike.id).emit("game:error", { message });
  }

  guessResult(socket, payload) {
    this.io.to(socket.id).emit("game:guess-result", payload);
  }
}

module.exports = { GameEngine, CONFIG };
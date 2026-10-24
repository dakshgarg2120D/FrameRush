// FrameRush backend: Express + Socket.IO. Default port 3001.
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { GameEngine } = require("./server/gameEngine");

const PORT = Number(process.env.PORT) || 3001;

// Allowed browser origins: Vite dev server (localhost / LAN) plus anything in CLIENT_ORIGIN (comma-separated).
const extraOrigins = (process.env.CLIENT_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean);
const devOrigin =
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/;
function checkOrigin(origin, cb) {
  if (!origin || devOrigin.test(origin) || extraOrigins.includes(origin)) return cb(null, true);
  cb(new Error("Origin not allowed by CORS: " + origin));
}

const path = require("path");
const app = express();
const clientDist = path.join(__dirname, "client", "dist");

app.use(express.static(clientDist));

app.get("/", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.get("/health", (_req, res) => res.json({ ok: true }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: checkOrigin, methods: ["GET", "POST"] } });
const engine = new GameEngine(io);

function safe(socket, fn) {
  try {
    fn();
  } catch (err) {
    console.error("[handler error]", err);
    socket.emit("game:error", { message: "Something went wrong on the server." });
  }
}

io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  socket.on("matchmaking:join", (payload) =>
    safe(socket, () => engine.joinQueue(socket, payload && payload.playerName))
  );
  socket.on("game:guess", (payload) =>
    safe(socket, () => engine.handleGuess(socket, payload && payload.guess))
  );
  socket.on("disconnect", () => {
    console.log("disconnected:", socket.id);
    safe(socket, () => engine.handleDisconnect(socket.id));
  });
});

// Never let one bad event take the demo down.
process.on("uncaughtException", (e) => console.error("[uncaughtException]", e));
process.on("unhandledRejection", (e) => console.error("[unhandledRejection]", e));

server.listen(PORT, () => console.log(`FrameRush server listening on port ${PORT}`));

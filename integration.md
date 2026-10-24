# FrameRush Integration Guide

> Status notes marked **(verify)** have not been checked against the real repo yet.

## A. Files
| Path | Owner | Purpose |
|---|---|---|
| client/src/App.jsx, socket.js, components/* | Daksh | UI and Socket.IO client |
| server/index.js, gameEngine.js | Bhavya | Server, matchmaking, rounds, scoring |
| server/gameData.js | Mayank | Image metadata + accepted answers (server only) |
| server/answerUtils.js | Mayank | normalize, isCorrect, pickRounds, publicView |
| server/validateData.js | Mayank | Data/file validation |
| server/leakCheck.js | Mayank | Checks events for answer leaks |
| client/public/images/ | Mayank | Image assets + ATTRIBUTION.md |

## B. Event contract
| Event | Direction | Payload | Emitted when |
|---|---|---|---|
| matchmaking:join | C -> S | `{ playerName }` | Player clicks Play Now |
| game:guess | C -> S | `{ guess }` | Player submits a guess |
| matchmaking:waiting | S -> C | `{ message, playersWaiting }` | Player queued, not enough players |
| game:started | S -> C | `{ roomId, players, roundNumber, totalRounds, imageUrl, revealedPercent, timeLeft }` | Match/first round starts |
| game:state | S -> C | same fields as started, plus per-player `guessedCorrectly` | Every tick and on each guess |
| game:round-ended | S -> C | `{ roundNumber, correctAnswer, roundScores, nextRoundIn }` | Timer ends or all guessed |
| game:finished | S -> C | `{ players, winner }` | After final round |
| game:error | S -> C | `{ message }` | Invalid action, disconnect, etc. |

Players: `{ id, name, score, guessedCorrectly }`. `correctAnswer` appears **only** in `game:round-ended`.
If the real code differs, update this table to match the code (the code wins).

## C. Image data contract
`server/gameData.js` exports an array of `{ id, imageUrl, acceptedAnswers, category, difficulty }`.
- `imageUrl` is a path under `client/public`, e.g. `/images/animal-01.jpg`. Filenames are neutral so the URL does not leak the answer.
- `acceptedAnswers` are lowercase and stay on the server.
- Engine usage:
```js
const { pickRounds, isCorrect, publicView, displayAnswer } = require("./answerUtils");
const rounds = pickRounds(5);                 // 5 unique items
const pub = publicView(rounds[0]);            // safe for clients
if (isCorrect(guess, rounds[i])) { /* award points */ }
// in game:round-ended: correctAnswer: displayAnswer(rounds[i])
```
- Matching: lowercase, strip accents/punctuation, collapse spaces, drop leading "the/a/an", then exact comparison. No fuzzy matching.
- Rule: never emit the raw item object; always use `publicView`.

## D. Startup (verify scripts exist in each package.json)
```bash
# Terminal 1
cd server && npm install && npm run dev
# Terminal 2
cd client && npm install && npm run dev
```
Checks:
```bash
node server/validateData.js
cd server && npm i -D socket.io-client && node leakCheck.js http://localhost:3001   # server running
```
Set the client's server URL via env var (verify name, e.g. `VITE_SERVER_URL`); CORS on the server must allow the client origin.

## E. Known limitations
- Matchmaking and multiplayer: **NOT VERIFIED** yet.
- Images: pending download; see ATTRIBUTION.md.
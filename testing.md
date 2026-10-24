# FrameRush Testing Checklist
Mark each: PASS / FAIL / NOT TESTED. Record who tested and notes.

## Image and content
| Test | Status | Notes |
|---|---|---|
| Every image file exists (`node server/validateData.js`) | NOT TESTED | |
| Every image loads in browser (open each /images/... URL) | NOT TESTED | |
| No broken image paths | NOT TESTED | |
| Every image has valid accepted answers | NOT TESTED | |
| Backend can import gameData.js | NOT TESTED | |
| Five unique images selected per match (`pickRounds(5)`) | NOT TESTED | |
| Answer key not exposed before round end (`node server/leakCheck.js`) | NOT TESTED | Also check DevTools > Network > WS |
| imageUrl does not reveal answer | NOT TESTED | validateData checks this |
| Image files under ~500 KB | NOT TESTED | |

## Answer matching
| Input vs "taj mahal" | Expected | Status |
|---|---|---|
| `Taj Mahal` | accept | NOT TESTED |
| `  taj   mahal  ` | accept | NOT TESTED |
| `The Taj Mahal!` | accept | NOT TESTED |
| `taj` | accept (synonym) | NOT TESTED |
| `tajmahal` | reject (no fuzzy) | NOT TESTED |
| `` (empty) | reject | NOT TESTED |

## Multiplayer (two separate browser windows, one incognito)
| Test | Status | Notes |
|---|---|---|
| Two sessions connect to same server | NOT TESTED | |
| Both enter public matchmaking | NOT TESTED | |
| Both join the same room | NOT TESTED | |
| Both see same image and round number | NOT TESTED | |
| Reveal progression synchronized | NOT TESTED | |
| Countdown matches on both | NOT TESTED | |
| Correct guess accepted | NOT TESTED | |
| Incorrect guess gives no points, can retry | NOT TESTED | |
| No double points in one round | NOT TESTED | |
| Scores consistent on both clients | NOT TESTED | |
| Faster correct guess scores more | NOT TESTED | |
| Round ends on timer expiry | NOT TESTED | |
| Round ends early when all guessed | NOT TESTED | |
| Five rounds complete without crash | NOT TESTED | |
| Results screen shows correct winner | NOT TESTED | |
| Tie handled sensibly | NOT TESTED | |
| Player disconnect mid-game handled | NOT TESTED | |
| Play Again works | NOT TESTED | |
| Works on phone (same Wi-Fi) | NOT TESTED | |

## Bug log
| # | Description | Owner | Status |
|---|---|---|---|
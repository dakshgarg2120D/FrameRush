import { useEffect, useRef, useState } from 'react';
import { socket } from '../socket';
import { findMe, isCorrect, rank, roundPoints } from '../utils';

const RING = 2 * Math.PI * 34;

export default function GameScreen({ game, roundResult, myId, playerName, connection, error, onLeave }) {
  const { players = [], roundNumber, totalRounds, imageUrl, revealedPercent = 0, timeLeft } = game;
  const hasTime = typeof timeLeft === 'number';

  // Longest time seen this round, used only to size the timer ring.
  const maxTime = useRef(timeLeft || 1);
  const lastRound = useRef(roundNumber);
  if (lastRound.current !== roundNumber) {
    lastRound.current = roundNumber;
    maxTime.current = timeLeft || 1;
  }
  if (hasTime && timeLeft > maxTime.current) maxTime.current = timeLeft;
  const total = game.roundTime ?? game.totalTime ?? maxTime.current;

  const me = findMe(players, myId, playerName);
  const meRef = useRef(me);
  meRef.current = me;
  const iGuessed = isCorrect(me);

  const roundOver = Boolean(roundResult) || (hasTime && timeLeft <= 0);
  const locked = iGuessed || roundOver || connection !== 'connected';

  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [imgFailed, setImgFailed] = useState(false);
  const inputRef = useRef(null);

  // New round: reset input and feedback.
  useEffect(() => {
    setText('');
    setFeedback(null);
    setImgFailed(false);
    inputRef.current?.focus();
  }, [roundNumber]);

  // Server confirmed my guess was correct.
  useEffect(() => {
    if (iGuessed) setFeedback((f) => (f?.type === 'ok' ? f : { type: 'ok', text: 'Correct!' }));
  }, [iGuessed]);

  // The server answers every guess with `game:guess-result`.
  useEffect(() => {
    const onResult = (r) => {
      if (r?.correct) {
        setFeedback({ type: 'ok', text: r.pointsAwarded ? `Correct! +${r.pointsAwarded}` : 'Correct!' });
      } else if (r?.ignored) {
        if (r.reason === 'round-over') setFeedback({ type: 'info', text: 'Round over.' });
      } else {
        setFeedback({ type: 'bad', text: 'Not quite!' });
      }
    };
    socket.on('game:guess-result', onResult);
    return () => socket.off('game:guess-result', onResult);
  }, []);

  // Round finished.
  useEffect(() => {
    if (roundOver && !meRef.current?.hasGuessed && !isCorrect(meRef.current)) {
      setFeedback({ type: 'info', text: 'Round over.' });
    }
  }, [roundOver]);

  const submit = (e) => {
    e.preventDefault();
    const guess = text.trim();
    if (!guess || locked) return;
    setText('');

    socket.emit('game:guess', { guess });
    inputRef.current?.focus();
  };

  // Image clarity comes straight from the server's revealedPercent.
  const pct = roundOver ? 100 : Math.max(0, Math.min(100, Number(revealedPercent) || 0));
  const blur = ((100 - pct) / 100) * 20; // 20px blur at 0% clarity, 0px at 100%.
  const ranked = rank(players);
  const answer = roundResult?.correctAnswer ?? roundResult?.answer;
  const urgent = hasTime && timeLeft <= 5 && !roundOver;

  return (
    <main className="game">
      {connection !== 'connected' && (
        <div className="banner" role="alert">
          Connection lost. Trying to reconnect…
          <button className="btn btn-small" onClick={onLeave}>Leave</button>
        </div>
      )}
      {error && <div className="banner banner-soft" role="alert">{error}</div>}

      <header className="game-bar">
        <span className="pill">Round {roundNumber ?? '–'} of {totalRounds ?? '–'}</span>
        <div className={`timer ${urgent ? 'urgent' : ''}`} role="timer" aria-label={`${timeLeft ?? 0} seconds left`}>
          <svg viewBox="0 0 80 80" aria-hidden="true">
            <circle className="timer-track" cx="40" cy="40" r="34" />
            <circle
              className="timer-arc"
              cx="40"
              cy="40"
              r="34"
              strokeDasharray={RING}
              strokeDashoffset={RING * (1 - (hasTime ? Math.max(0, timeLeft) / total : 0))}
            />
          </svg>
          <span>{hasTime ? Math.max(0, Math.ceil(timeLeft)) : '–'}</span>
        </div>
        <button className="btn btn-small btn-ghost" onClick={onLeave}>Leave</button>
      </header>

      <div className="game-grid">
        <section className="stage-col">
          <div className="stage">
            {imageUrl && !imgFailed ? (
              <img
                key={imageUrl}
                src={imageUrl}
                alt="Hidden image to guess"
                className="stage-img"
                style={{ filter: `blur(${blur}px) saturate(${0.5 + pct / 200})`, transform: `scale(${pct >= 100 ? 1 : 1.12})` }}
                onError={() => setImgFailed(true)}
                draggable={false}
              />
            ) : (
              <div className="stage-empty">{imgFailed ? 'This image failed to load.' : 'Loading image…'}</div>
            )}
            <span className="corner tl" /><span className="corner tr" />
            <span className="corner bl" /><span className="corner br" />
          </div>
          <div className="clarity" aria-label={`Image ${Math.round(pct)} percent clear`}>
            <div className="clarity-fill" style={{ width: `${pct}%` }} />
          </div>

          {roundOver && (
            <div className="round-over">
              <strong>Round over.</strong>{' '}
              {answer ? <>The answer was <em>{answer}</em>.</> : 'Waiting for the next round…'}
            </div>
          )}

          <form className="guess" onSubmit={submit}>
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={locked ? (iGuessed ? 'You got it!' : 'Round over') : 'Type your guess'}
              disabled={locked}
              maxLength={40}
              autoComplete="off"
              autoCapitalize="none"
              aria-label="Your guess"
            />
            <button className="btn btn-primary" type="submit" disabled={locked || !text.trim()}>
              Submit Guess
            </button>
          </form>
          <p className={`feedback ${feedback?.type || ''}`} aria-live="polite">
            {feedback?.text || '\u00A0'}
          </p>
        </section>

        <aside className="panel board" aria-label="Scoreboard">
          <h2>Scoreboard</h2>
          <ul>
            {ranked.map((p) => {
              const mine = me && (p.id === me.id);
              const gained = roundPoints(p);
              return (
                <li key={p.id ?? p.name} className={`${mine ? 'me' : ''} ${isCorrect(p) ? 'got-it' : ''}`}>
                  <span className="rank">{p.rank}</span>
                  <span className="pname">{p.name}{mine ? ' (you)' : ''}{p.connected === false ? ' (left)' : ''}</span>
                  {isCorrect(p) && <span className="check" title="Guessed correctly">✓</span>}
                  <span className="score">
                    {p.score ?? 0}
                    {roundOver && gained ? <small>+{gained}</small> : null}
                  </span>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </main>
  );
}

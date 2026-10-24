import { findMe, rank } from '../utils';

export default function ResultsScreen({ players, winners: serverWinners, reason, myId, playerName, onPlayAgain, onHome }) {
  const ranked = rank(players);
  const me = findMe(players, myId, playerName);

  // Prefer the server's winners (it already handles forfeits); fall back to the top score.
  const top = ranked.length ? ranked[0].score || 0 : 0;
  const winners =
    Array.isArray(serverWinners) && serverWinners.length
      ? serverWinners
      : ranked.filter((p) => (p.score || 0) === top);
  const tie = winners.length > 1;
  const iWon = me && winners.some((w) => w.id === me.id);
  const winScore = winners[0]?.score ?? top;

  const names = winners.map((w) => w.name).join(' and ');
  const headline = !winners.length ? 'Match finished' : tie ? `It's a tie between ${names}` : `${winners[0].name} wins`;

  return (
    <main className="center-screen">
      <div className="panel results">
        <p className="pill">{iWon ? (tie ? 'You tied for first' : 'You won') : 'Final results'}</p>
        <h1 className="results-title">{headline}</h1>
        {winners.length > 0 && <p className="muted">{winScore} points{tie ? ' each' : ''}</p>}
        {reason === 'opponent_left' && (
          <p className="alert" role="status">The other players left, so the match ended early.</p>
        )}

        <ol className="podium">
          {ranked.map((p) => (
            <li key={p.id ?? p.name} className={winners.some((w) => w.id === p.id) ? 'first' : ''}>
              <span className="rank">{p.rank}</span>
              <span className="pname">{p.name}{me && p.id === me.id ? ' (you)' : ''}{p.connected === false ? ' (left)' : ''}</span>
              <span className="score">{p.score ?? 0}</span>
            </li>
          ))}
        </ol>

        <div className="row">
          <button className="btn btn-primary" onClick={onPlayAgain}>Play Again</button>
          <button className="btn btn-ghost" onClick={onHome}>Home</button>
        </div>
      </div>
    </main>
  );
}

import { findMe, rank } from '../utils';

export default function ResultsScreen({ players, myId, playerName, onPlayAgain, onHome }) {
  const ranked = rank(players);
  const top = ranked.length ? ranked[0].score || 0 : 0;
  const winners = ranked.filter((p) => (p.score || 0) === top);
  const tie = winners.length > 1;
  const me = findMe(players, myId, playerName);
  const iWon = me && winners.some((w) => w.id === me.id);

  const names = winners.map((w) => w.name).join(' and ');
  const headline = !ranked.length
    ? 'Match finished'
    : tie
      ? `It's a tie between ${names}`
      : `${winners[0].name} wins`;

  return (
    <main className="center-screen">
      <div className="panel results">
        <p className="pill">{iWon ? (tie ? 'You tied for first' : 'You won') : 'Final results'}</p>
        <h1 className="results-title">{headline}</h1>
        {ranked.length > 0 && <p className="muted">{top} points{tie ? ' each' : ''}</p>}

        <ol className="podium">
          {ranked.map((p) => (
            <li key={p.id ?? p.name} className={p.rank === 1 ? 'first' : ''}>
              <span className="rank">{p.rank}</span>
              <span className="pname">{p.name}{me && p.id === me.id ? ' (you)' : ''}</span>
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

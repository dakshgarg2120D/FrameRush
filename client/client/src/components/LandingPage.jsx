import { useState } from 'react';

const STEPS = [
  { title: 'The image starts blurred', text: 'Everyone in the match sees the same picture at the same moment.' },
  { title: 'Type a guess any time', text: 'Faster correct answers score more, so guessing early is a gamble worth taking.' },
  { title: 'Finish five rounds', text: 'The player with the most points at the end wins.' },
];

export default function LandingPage({ onPlay, defaultName, connection, error }) {
  const [name, setName] = useState(defaultName || '');

  const submit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onPlay(trimmed);
  };

  return (
    <main className="landing">
      <section className="hero">
        <div className="viewfinder" aria-hidden="false">
          <h1 className="logo">FrameRush</h1>
        </div>
        <p className="tagline">See it. Guess it. Beat everyone.</p>

        <form className="join-card" onSubmit={submit}>
          <label htmlFor="name">Your display name</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={16}
            placeholder="e.g. Daksh"
            autoComplete="nickname"
            autoFocus
          />
          <button className="btn btn-primary" type="submit" disabled={!name.trim()}>
            Play Now
          </button>
          <p className="hint">Matches run with 2 to 4 real players.</p>
          {(connection === 'error' || error) && (
            <p className="alert" role="alert">
              {error || "Can't reach the game server. Make sure the backend is running, then try again."}
            </p>
          )}
        </form>
      </section>

      <section className="how" aria-label="How to play">
        <h2>How to play</h2>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <span className="step-n">{i + 1}</span>
              <div>
                <strong>{s.title}</strong>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}

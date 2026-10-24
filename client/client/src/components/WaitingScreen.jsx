export default function WaitingScreen({ name, connection, error, onCancel, onRetry }) {
  const failed = connection === 'error' || connection === 'lost';

  return (
    <main className="center-screen">
      <div className="panel wait-card">
        {failed ? (
          <>
            <h2>Can't reach the server</h2>
            <p className="muted">
              Check that the backend is running and reachable, then try again.
            </p>
            <div className="row">
              <button className="btn btn-primary" onClick={onRetry}>Try again</button>
              <button className="btn btn-ghost" onClick={onCancel}>Back</button>
            </div>
          </>
        ) : (
          <>
            <div className="spinner" role="status" aria-label="Loading" />
            <h2>Finding players for {name}</h2>
            <p className="muted">
              The match starts as soon as enough real players join. Open FrameRush in a second
              browser window to test with two players.
            </p>
            {error && <p className="alert" role="alert">{error}</p>}
            <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          </>
        )}
      </div>
    </main>
  );
}

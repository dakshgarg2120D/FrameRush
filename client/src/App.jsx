import { useCallback, useEffect, useRef, useState } from 'react';
import { socket } from './socket';
import { errMsg } from './utils';
import { mockGame } from './mock';
import LandingPage from './components/LandingPage.jsx';
import WaitingScreen from './components/WaitingScreen.jsx';
import GameScreen from './components/GameScreen.jsx';
import ResultsScreen from './components/ResultsScreen.jsx';

// Dev-only visual preview: http://localhost:5173/?mock=game  (never active in production builds)
const MOCK = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('mock') : null;

export default function App() {
  const [screen, setScreen] = useState(
    MOCK === 'game' ? 'game' : MOCK === 'waiting' ? 'searching' : MOCK === 'results' ? 'results' : 'landing'
  );
  const [playerName, setPlayerName] = useState('');
  const [connection, setConnection] = useState('idle'); // idle | connected | lost | error
  const [game, setGame] = useState(MOCK ? mockGame : null);
  const [roundResult, setRoundResult] = useState(null);
  const [final, setFinal] = useState(MOCK === 'results' ? { players: mockGame.players } : null);
  const [error, setError] = useState('');
  const [myId, setMyId] = useState(MOCK ? 'mock_me' : null);

  const pendingName = useRef(null);
  const gameRef = useRef(null);
  gameRef.current = game;
  const screenRef = useRef(screen);
  screenRef.current = screen;

  useEffect(() => {
    if (MOCK) return undefined;

    const onConnect = () => {
      setConnection('connected');
      setMyId(socket.id);
      if (pendingName.current) {
        socket.emit('matchmaking:join', { playerName: pendingName.current });
        pendingName.current = null;
      }
    };
    const onDisconnect = (reason) => {
      if (reason === 'io client disconnect') return; // we left on purpose
      if (screenRef.current === 'game') {
        // The server cannot resume a match after a reconnect (new socket id), so end it cleanly.
        pendingName.current = null;
        socket.disconnect();
        setGame(null);
        setRoundResult(null);
        setFinal(null);
        setError('Connection lost, so the match ended. Press Play Now to start a new one.');
        setScreen('landing');
      }
      setConnection('lost');
    };
    const onConnectError = () => setConnection('error');

    const onWaiting = () => setScreen((s) => (s === 'game' || s === 'results' ? s : 'searching'));

    const onStarted = (data) => {
      setError('');
      setRoundResult(null);
      setGame(data);
      setScreen('game');
    };

    const onState = (data) => {
      setGame((prev) => ({ ...(prev || {}), ...data }));
      // A new round started: drop the previous round's result banner.
      setRoundResult((r) =>
        r && data.roundNumber !== undefined && data.roundNumber !== r.roundNumber ? null : r
      );
      setScreen((s) => (s === 'results' ? s : 'game'));
    };

    const onRoundEnded = (data) => {
      setRoundResult({ ...data, roundNumber: data?.roundNumber ?? gameRef.current?.roundNumber });
      // Merge final totals for the round into the scoreboard, keeping each player's correct flag.
      setGame((prev) => {
        const old = prev?.players || [];
        const list = Array.isArray(data?.players) ? data.players : old;
        const players = list.map((p) => {
          const rs = data?.roundScores?.find((r) => r.id === p.id);
          const before = old.find((o) => o.id === p.id);
          return {
            ...before,
            ...p,
            hasGuessedCorrectly: rs ? rs.correct : before?.hasGuessedCorrectly,
            roundPoints: rs ? rs.points : undefined,
          };
        });
        return { ...(prev || {}), players };
      });
    };

    const onFinished = (data) => {
      setFinal(data || {});
      setScreen('results');
    };

    const onError = (data) => setError(errMsg(data));

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('matchmaking:waiting', onWaiting);
    socket.on('game:started', onStarted);
    socket.on('game:state', onState);
    socket.on('game:round-ended', onRoundEnded);
    socket.on('game:finished', onFinished);
    socket.on('game:error', onError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('matchmaking:waiting', onWaiting);
      socket.off('game:started', onStarted);
      socket.off('game:state', onState);
      socket.off('game:round-ended', onRoundEnded);
      socket.off('game:finished', onFinished);
      socket.off('game:error', onError);
    };
  }, []);

  const startSearch = useCallback((name) => {
    setPlayerName(name);
    setError('');
    setGame(null);
    setRoundResult(null);
    setFinal(null);
    setScreen('searching');
    if (socket.connected) {
      socket.emit('matchmaking:join', { playerName: name });
    } else {
      pendingName.current = name;
      setConnection('idle');
      socket.connect();
    }
  }, []);

  const goHome = useCallback(() => {
    pendingName.current = null;
    socket.disconnect();
    setConnection('idle');
    setGame(null);
    setRoundResult(null);
    setFinal(null);
    setError('');
    setScreen('landing');
  }, []);

  const retry = useCallback(() => {
    setConnection('idle');
    pendingName.current = playerName;
    socket.connect();
  }, [playerName]);

  return (
    <div className="app">
      {MOCK && <div className="mock-banner">MOCK DATA: visual preview only</div>}

      {screen === 'landing' && (
        <LandingPage onPlay={startSearch} defaultName={playerName} connection={connection} error={error} />
      )}

      {screen === 'searching' && (
        <WaitingScreen
          name={playerName}
          connection={connection}
          error={error}
          onCancel={goHome}
          onRetry={retry}
        />
      )}

      {screen === 'game' && game && (
        <GameScreen
          game={game}
          roundResult={roundResult}
          myId={myId}
          playerName={playerName}
          connection={connection}
          error={error}
          onLeave={goHome}
        />
      )}

      {screen === 'results' && (
        <ResultsScreen
          players={final?.players || game?.players || []}
          winners={final?.winners}
          reason={final?.reason}
          myId={myId}
          playerName={playerName}
          onPlayAgain={() => startSearch(playerName)}
          onHome={goHome}
        />
      )}
    </div>
  );
}

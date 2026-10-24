// VISUAL DEVELOPMENT ONLY. Active only in `npm run dev` with ?mock=game|waiting|results
// in the URL. It is never used in a production build and never during the real demo.
const svg = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500">
     <rect width="800" height="500" fill="#2b2a6e"/>
     <circle cx="400" cy="250" r="150" fill="#ff5c7a"/>
     <rect x="250" y="200" width="300" height="100" rx="20" fill="#ffc43d"/>
     <circle cx="330" cy="250" r="30" fill="#0d0f2b"/><circle cx="470" cy="250" r="30" fill="#0d0f2b"/>
   </svg>`
);

export const mockGame = {
  roomId: 'mock_room',
  roundNumber: 2,
  totalRounds: 5,
  imageUrl: `data:image/svg+xml,${svg}`,
  revealedPercent: 45,
  timeLeft: 8,
  roundTime: 15,
  players: [
    { id: 'mock_me', name: 'You (mock)', score: 850, hasGuessed: false },
    { id: 'mock_b', name: 'Mock B', score: 1200, hasGuessed: true },
    { id: 'mock_c', name: 'Mock C', score: 500, hasGuessed: false },
  ],
};

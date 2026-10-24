const gameData = [
  {
    id: "monument_001",
    imageUrl: "/images/Monuments/Ajanta%20and%20Ellora%20Caves.jpg",
    acceptedAnswers: [
      "ajanta and ellora caves",
      "ajanta caves",
      "ellora caves",
      "ajanta and ellora"
    ],
    category: "monuments",
    difficulty: "medium"
  },
  {
    id: "monument_002",
    imageUrl: "/images/Monuments/Charminar.jpg",
    acceptedAnswers: ["charminar", "char minar", "charmeenar", "Charminar"],
    category: "monuments",
    difficulty: "easy"
  },
  {
    id: "monument_003",
    imageUrl: "/images/Monuments/Fatehpur%20Sikri.jpg",
    acceptedAnswers: ["fatehpur sikri", "fatehpur", "Fatehpur"],
    category: "monuments",
    difficulty: "medium"
  },
  {
    id: "monument_004",
    imageUrl: "/images/Monuments/Gateway%20of%20India.jpg",
    acceptedAnswers: ["gateway of india", "gateway india"],
    category: "monuments",
    difficulty: "easy"
  },
  {
    id: "monument_005",
    imageUrl: "/images/Monuments/Hampi.jpg",
    acceptedAnswers: ["hampi"],
    category: "monuments",
    difficulty: "easy"
  },
  {
    id: "monument_006",
    imageUrl: "/images/Monuments/Khajuraho%20Temples.jpg",
    acceptedAnswers: ["khajuraho temples", "khajuraho temple", "khajuraho"],
    category: "monuments",
    difficulty: "medium"
  },
  {
    id: "monument_007",
    imageUrl: "/images/Monuments/Konark%20Sun%20Temple.jpg",
    acceptedAnswers: ["konark sun temple", "konark temple", "sun temple"],
    category: "monuments",
    difficulty: "medium"
  },
  {
    id: "monument_008",
    imageUrl: "/images/Monuments/Mysore%20Palace.jpg",
    acceptedAnswers: ["mysore palace", "mysore"],
    category: "monuments",
    difficulty: "easy"
  },
  {
    id: "monument_009",
    imageUrl: "/images/Monuments/Qutub%20Minar.jpg",
    acceptedAnswers: ["qutub minar", "qutb minar", "qutub meenar"],
    category: "monuments",
    difficulty: "easy"
  },
  {
    id: "monument_010",
    imageUrl: "/images/Monuments/Red%20Fort.jpg",
    acceptedAnswers: ["red fort", "lal qila"],
    category: "monuments",
    difficulty: "easy"
  },
  {
    id: "monument_011",
    imageUrl: "/images/Monuments/Taj%20Mahal.jpg",
    acceptedAnswers: ["taj mahal", "taj"],
    category: "monuments",
    difficulty: "easy"
  },
  {
    id: "monument_012",
    imageUrl: "/images/Monuments/Victoria%20Memorial.jpg",
    acceptedAnswers: ["victoria memorial"],
    category: "monuments",
    difficulty: "medium"
  },
  {
    id: "monument_01301",
    imageUrl: "/images/character/akshay%20kumar.jpeg",
    acceptedAnswers: ["akshay kumar", "akshay"],
    category: "character",
    difficulty: "easy"
  },
  {
    id: "monument_01302",
    imageUrl: "/images/character/alia%20bhatt.jpeg",
    acceptedAnswers: ["alia bhatt", "alia"],
    category: "character",
    difficulty: "easy"
  },
  {
    id: "monument_01303",
    imageUrl: "/images/character/apj%20abdul%20kalam.jpeg",
    acceptedAnswers: ["apj abdul kalam", "abdul kalam", "kalam", "dr kalam"],
    category: "character",
    difficulty: "medium"
  },
  {
    id: "monument_01304",
    imageUrl: "/images/character/ashneer%20grover.jpeg",
    acceptedAnswers: ["ashneer grover", "ashneer"],
    category: "character",
    difficulty: "medium"
  },
  {
    id: "monument_01305",
    imageUrl: "/images/character/badshah.jpeg",
    acceptedAnswers: ["badshah"],
    category: "character",
    difficulty: "easy"
  },
  {
    id: "monument_01306",
    imageUrl: "/images/character/bill%20gates.jpeg",
    acceptedAnswers: ["bill gates", "gates", "bill gate"],
    category: "character",
    difficulty: "easy"
  },
  {
    id: "monument_01307",
    imageUrl: "/images/character/carryminati.jpeg",
    acceptedAnswers: ["carryminati", "carry minati", "carry", "ajey nagar", "ajay nagar"],
    category: "character",
    difficulty: "medium"
  },
  {
    id: "monument_01308",
    imageUrl: "/images/character/chaar%20diwari.jpeg",
    acceptedAnswers: ["chaar diwari", "char diwari"],
    category: "character",
    difficulty: "medium"
  },
  {
    id: "monument_01309",
    imageUrl: "/images/character/cristiano%20ronaldo.jpeg",
    acceptedAnswers: ["cristiano ronaldo", "ronaldo", "cr7"],
    category: "character",
    difficulty: "easy"
  },
  {
    id: "monument_01310",
    imageUrl: "/images/character/deepak%20kalal.jpeg",
    acceptedAnswers: ["deepak kalal"],
    category: "character",
    difficulty: "hard"
  },
  {
    id: "monument_01311",
    imageUrl: "/images/character/deepika%20padukone.jpeg",
    acceptedAnswers: ["deepika padukone", "deepika"],
    category: "character",
    difficulty: "easy"
  },
  {
    id: "monument_01312",
    imageUrl: "/images/character/dolly%20chaiwala.jpeg",
    acceptedAnswers: ["dolly chaiwala", "dolly chaiwalla", "dolly"],
    category: "character",
    difficulty: "easy"
  },
  {
    id: "monument_01313",
    imageUrl: "/images/character/dwyane%20johnson.jpeg",
    acceptedAnswers: ["dwayne johnson", "the rock", "rock"],
    category: "character",
    difficulty: "easy"
  },
  {
    id: "monument_01314",
    imageUrl: "/images/character/elon%20musk.jpeg",
    acceptedAnswers: ["elon musk", "musk"],
    category: "character",
    difficulty: "easy"
  },
  {
    id: "monument_01315",
    imageUrl: "/images/character/jasmine%20sandlas.jpeg",
    acceptedAnswers: ["jasmine sandlas"],
    category: "character",
    difficulty: "medium"
  },
  {
    id: "monument_01316",
    imageUrl: "/images/character/kapil%20sharma.jpeg",
    acceptedAnswers: ["kapil sharma", "kapil"],
    category: "character",
    difficulty: "easy"
  },
  {
    id: "monument_01317",
    imageUrl: "/images/character/karan%20aujla.jpeg",
    acceptedAnswers: ["karan aujla", "aujla"],
    category: "character",
    difficulty: "easy"
  },
  {
    id: "monument_01318",
    imageUrl: "/images/character/kk%20pant.jpeg",
    acceptedAnswers: ["kk pant"],
    category: "character",
    difficulty: "medium"
  },
  {
    id: "monument_01319",
    imageUrl: "/images/character/lionel%20messi.jpeg",
    acceptedAnswers: ["lionel messi", "messi"],
    category: "character",
    difficulty: "easy"
  },
  {
    id: "monument_01320",
    imageUrl: "/images/character/marie%20curie.jpeg",
    acceptedAnswers: ["marie curie", "madame curie", "curie"],
    category: "character",
    difficulty: "medium"
  },
  {
    id: "monument_01321",
    imageUrl: "/images/character/Mr.%20Beast.jpeg",
    acceptedAnswers: ["mr beast", "mrbeast", "jimmy donaldson"],
    category: "character",
    difficulty: "easy"
  },
  {
    id: "monument_01322",
    imageUrl: "/images/character/ms%20dhoni.jpeg",
    acceptedAnswers: ["ms dhoni", "dhoni", "mahendra singh dhoni", "mahi"],
    category: "character",
    difficulty: "easy"
  },
  {
    id: "monument_01323",
    imageUrl: "/images/character/nikola%20tesla.jpeg",
    acceptedAnswers: ["nikola tesla", "tesla"],
    category: "character",
    difficulty: "medium"
  },
  {
    id: "monument_01324",
    imageUrl: "/images/character/rajnikanth.jpeg",
    acceptedAnswers: ["rajnikanth", "rajinikanth", "rajnikant", "rajni"],
    category: "character",
    difficulty: "easy"
  },
  {
    id: "monument_01325",
    imageUrl: "/images/character/Rakhi%20Sawant.jpeg",
    acceptedAnswers: ["rakhi sawant"],
    category: "character",
    difficulty: "medium"
  },
  {
    id: "monument_01326",
    imageUrl: "/images/character/ramanujan.jpeg",
    acceptedAnswers: ["ramanujan", "srinivasa ramanujan"],
    category: "character",
    difficulty: "medium"
  },
  {
    id: "monument_01327",
    imageUrl: "/images/character/rihanna.jpeg",
    acceptedAnswers: ["rihanna"],
    category: "character",
    difficulty: "easy"
  },
  {
    id: "monument_01328",
    imageUrl: "/images/character/sabrina%20carpenter.jpg",
    acceptedAnswers: ["sabrina carpenter", "sabrina"],
    category: "character",
    difficulty: "easy"
  },
  {
    id: "monument_01329",
    imageUrl: "/images/character/samay%20raina.jpeg",
    acceptedAnswers: ["samay raina", "samay"],
    category: "character",
    difficulty: "easy"
  },
  {
    id: "monument_01330",
    imageUrl: "/images/character/shaan.jpeg",
    acceptedAnswers: ["shaan", "shantanu mukherjee"],
    category: "character",
    difficulty: "medium"
  },
  {
    id: "monument_01331",
    imageUrl: "/images/character/shakira.jpeg",
    acceptedAnswers: ["shakira"],
    category: "character",
    difficulty: "easy"
  },
  {
    id: "monument_01332",
    imageUrl: "/images/character/stephen%20hawking.jpeg",
    acceptedAnswers: ["stephen hawking", "hawking"],
    category: "character",
    difficulty: "medium"
  },
  {
    id: "monument_01333",
    imageUrl: "/images/character/steve%20jobs.jpeg",
    acceptedAnswers: ["steve jobs"],
    category: "character",
    difficulty: "easy"
  },
  {
    id: "monument_01334",
    imageUrl: "/images/character/suhani%20shah.jpeg",
    acceptedAnswers: ["suhani shah"],
    category: "character",
    difficulty: "medium"
  },
  {
    id: "monument_01335",
    imageUrl: "/images/character/sydney%20sweeney.jpeg",
    acceptedAnswers: ["sydney sweeney" , "sydney"],
    category: "character",
    difficulty: "easy"
  },
  {
    id: "monument_01336",
    imageUrl: "/images/character/tanmay%20bhat.jpeg",
    acceptedAnswers: ["tanmay bhat"],
    category: "character",
    difficulty: "easy"
  },
  {
    id: "monument_01337",
    imageUrl: "/images/character/taylor%20swift.jpeg",
    acceptedAnswers: ["taylor swift"],
    category: "character",
    difficulty: "easy"
  },
  {
    id: "monument_01338",
    imageUrl: "/images/character/virat%20kohli.jpeg",
    acceptedAnswers: ["virat kohli", "kohli"],
    category: "character",
    difficulty: "easy"
  }
];

module.exports = gameData;

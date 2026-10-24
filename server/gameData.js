// Server-side only. NEVER send acceptedAnswers to the client.
// Image filenames are neutral on purpose: the URL must not reveal the answer.
const gameData = [
  { id: "object_001", imageUrl: "./client/images/monuments/Charminar.jpg", acceptedAnswers: ["Charminar"], category: "monuments", difficulty: "easy" },
  { id: "object_002", imageUrl: "./client/images/objects/object-02.jpg", acceptedAnswers: ["camera"], category: "objects", difficulty: "easy" },
  { id: "object_003", imageUrl: "./client/images/objects/object-03.jpg", acceptedAnswers: ["umbrella"], category: "objects", difficulty: "easy" },
  { id: "object_004", imageUrl: "./client/images/objects/object-04.jpg", acceptedAnswers: ["guitar", "acoustic guitar"], category: "objects", difficulty: "medium" },
  { id: "animal_001", imageUrl: "./client/images/animals/animal-01.jpg", acceptedAnswers: ["elephant"], category: "animals", difficulty: "easy" },
  { id: "animal_002", imageUrl: "./client/images/animals/animal-02.jpg", acceptedAnswers: ["penguin"], category: "animals", difficulty: "easy" },
  { id: "animal_003", imageUrl: "./client/images/animals/animal-03.jpg", acceptedAnswers: ["giraffe"], category: "animals", difficulty: "easy" },
  { id: "animal_004", imageUrl: "./client/images/animals/animal-04.jpg", acceptedAnswers: ["owl"], category: "animals", difficulty: "medium" },
  { id: "animal_005", imageUrl: "./client/images/animals/animal-05.jpg", acceptedAnswers: ["tiger"], category: "animals", difficulty: "easy" },
  { id: "landmark_001", imageUrl: "./client/images/landmarks/landmark-01.jpg", acceptedAnswers: ["eiffel tower", "eiffel"], category: "landmarks", difficulty: "easy" },
  { id: "landmark_002", imageUrl: "./client/images/landmarks/landmark-02.jpg", acceptedAnswers: ["taj mahal", "taj"], category: "landmarks", difficulty: "easy" },
  { id: "landmark_003", imageUrl: "./client/images/landmarks/landmark-03.jpg", acceptedAnswers: ["statue of liberty", "lady liberty"], category: "landmarks", difficulty: "easy" },
  { id: "landmark_004", imageUrl: "./client/images/landmarks/landmark-04.jpg", acceptedAnswers: ["big ben", "elizabeth tower"], category: "landmarks", difficulty: "medium" },
];

module.exports = gameData;
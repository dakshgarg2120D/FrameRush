require("dotenv").config();

const fs = require("fs");
const path = require("path");

const API_KEY = process.env.PIXABAY_API_KEY;

if (!API_KEY) {
  throw new Error("Missing PIXABAY_API_KEY in server/.env");
}

const OUTPUT_DIR = path.join(
  __dirname,
  "../client/public/images"
);

const categories = [
  "panda",
  "tiger",
  "pizza",
  "waterfall",
  "guitar",
  "Eiffel Tower",
  "airplane",
  "elephant",
];

async function downloadImage(url, destination) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Image download failed: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  fs.writeFileSync(destination, buffer);
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const gameImages = [];

  for (const answer of categories) {
    console.log(`Searching Pixabay for: ${answer}`);

    const params = new URLSearchParams({
      key: API_KEY,
      q: answer,
      image_type: "photo",
      safesearch: "true",
      per_page: "5",
      order: "popular",
    });

    const apiUrl = `https://pixabay.com/api/?${params}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error(`Search failed for ${answer}`);
      continue;
    }

    const data = await response.json();

    // Choose the first result for this initial demo.
    const image = data.hits?.[0];

    if (!image) {
      console.log(`No images found for ${answer}`);
      continue;
    }

    const filename = `${answer
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-${image.id}.jpg`;

    const destination = path.join(OUTPUT_DIR, filename);

    try {
      await downloadImage(image.webformatURL, destination);

      gameImages.push({
        id: image.id,
        imageUrl: `/images/${filename}`,
        answer: answer.toLowerCase(),
        acceptedAnswers: [answer.toLowerCase()],
        sourcePage: image.pageURL,
        contributor: image.user,
      });

      console.log(`Downloaded ${filename}`);
    } catch (error) {
      console.error(`Failed to download ${answer}:`, error.message);
    }
  }

  fs.writeFileSync(
    path.join(__dirname, "gameData.json"),
    JSON.stringify(gameImages, null, 2)
  );

  console.log(`Finished. Downloaded ${gameImages.length} images.`);
}

main().catch(console.error);
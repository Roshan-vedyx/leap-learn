const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const serviceAccount = require("../../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Load JSON
const filePath = path.join(__dirname, "../data/words.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

// Upload each word
async function uploadWords() {
  for (const word of data.words) {
    await db.collection("words").doc(word.id).set(word);
    console.log(`✅ Uploaded: ${word.word}`);
  }
  console.log("🎉 All words uploaded!");
}

uploadWords().catch(console.error);

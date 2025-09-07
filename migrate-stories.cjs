// migrate-stories-final.js
// Run: node migrate-stories-final.js

const fs = require("fs");
const path = require("path");

function parseStoryText(storyText) {
  const blocks = [];
  let choicePointCounter = 0;

  // Split text by markers
  const rawBlocks = storyText.split(
    /\n\n+|\n(?=\[CHOICE POINT|\[CONSEQUENCE|\[PERSONAL REFLECTION|\[ACTION REFLECTION|\[FINAL CONCLUSION|\[STORY CONTINUATION)/
  );

  for (let block of rawBlocks) {
    block = block.trim();
    if (!block) continue;

    // Choice Point
    if (block.includes("[CHOICE POINT")) {
      choicePointCounter++;
      const lines = block.split(/\n/);
      const questionLine = lines[0].replace(/\[CHOICE POINT \d+\]/, "").trim();

      const choice = {
        type: "choice",
        question: questionLine,
        choiceId: choicePointCounter,
        options: [],
      };

      const optionMatches = block.match(/([A-C])\)\s*([^[]+)/g);
      if (optionMatches) {
        optionMatches.forEach((line) => {
          const match = line.match(/^([A-C])\)\s*(.+)$/);
          if (match) {
            choice.options.push({ letter: match[1], text: match[2].trim() });
          }
        });
      }

      if (choice.options.length > 0) blocks.push(choice);
    }

    // Consequence
    else if (block.includes("[CONSEQUENCE")) {
      const match = block.match(/\[CONSEQUENCE (\d*)([A-C])\]/);
      const letter = match ? match[2] : "A";
      const text = block.replace(/\[CONSEQUENCE \d*[A-C]\]/, "").trim();
      if (text) {
        blocks.push({
          type: "consequence",
          choiceId: choicePointCounter,
          choiceLetter: letter,
          text,
        });
      }
    }

    // Reflections, conclusion, continuation
    else if (block.includes("[PERSONAL REFLECTION]")) {
      blocks.push({
        type: "reflection",
        text: block.replace("[PERSONAL REFLECTION]", "").trim(),
      });
    } else if (block.includes("[ACTION REFLECTION]")) {
      blocks.push({
        type: "action",
        text: block.replace("[ACTION REFLECTION]", "").trim(),
      });
    } else if (block.includes("[FINAL CONCLUSION]")) {
      blocks.push({
        type: "conclusion",
        text: block.replace("[FINAL CONCLUSION]", "").trim(),
      });
    } else if (block.includes("[STORY CONTINUATION]")) {
      blocks.push({
        type: "narration",
        text: block.replace("[STORY CONTINUATION]", "").trim(),
      });
    }

    // Default narration
    else {
      const cleanText = block.replace(/\[.*?\]/g, "").trim();
      if (cleanText) {
        blocks.push({ type: "narration", text: cleanText });
      }
    }
  }

  return blocks;
}

function migrateStoryFile(filePath) {
  const fileName = path.basename(filePath, ".json");
  const dir = path.dirname(filePath);

  const jsonContent = fs.readFileSync(filePath, "utf8");
  const storyData = JSON.parse(jsonContent);

  // Backup original
  const backupPath = path.join(dir, `${fileName}_original.json`);
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, JSON.stringify(storyData, null, 2));
  }

  const sourceStories = storyData.original_stories || storyData.stories;
  if (!sourceStories) return;

  const newStoryData = { ...storyData, story_blocks: {} };

  for (const [level, storyText] of Object.entries(sourceStories)) {
    newStoryData.story_blocks[level] = storyText
      ? parseStoryText(storyText)
      : [];
  }

  fs.writeFileSync(filePath, JSON.stringify(newStoryData, null, 2));
  console.log(`✅ Migrated: ${filePath}`);
}

function migrateAllStories() {
  const storyDir = "./src/data/story-templates";

  const interests = fs
    .readdirSync(storyDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  interests.forEach((interest) => {
    const interestDir = path.join(storyDir, interest);
    const files = fs
      .readdirSync(interestDir)
      .filter(
        (file) => file.endsWith(".json") && !file.includes("_original.json")
      );

    files.forEach((file) => migrateStoryFile(path.join(interestDir, file)));
  });

  console.log("🎉 Migration complete!");
}

migrateAllStories();

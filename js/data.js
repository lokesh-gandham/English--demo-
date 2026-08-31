/* ==========================================================
   CONTENT — taken from the workbook, "Read and Reflect"
   (story: Aarav / Piku the Penguin / Kabir)
   Edit only this file to change questions.
   ========================================================== */
const GAME_DATA = {
  section: {
    id: "read-reflect",
    title: "Read and Reflect",
    skills: ["Conceptual Understanding", "Analytical Reasoning", "Critical Thinking"]
  },

  /* ---- Activity I : Match the words with their correct meanings ---- */
  match: {
    id: "match",
    title: "Word Link",
    kicker: "Activity I",
    hint: "Tap a word, then tap its meaning. Link all five to win!",
    pairs: [
      { word: "entire",    meaning: "whole or complete" },
      { word: "delicious", meaning: "very tasty" },
      { word: "strange",   meaning: "uncommon or surprising" },
      { word: "politely",  meaning: "speaking or acting in a kind way" },
      { word: "costumes",  meaning: "special clothes worn to look like someone or something else" }
    ]
  },

  /* ---- Activity II : Choose the correct option ---- */
  mcq: {
    id: "mcq",
    title: "Quick Pick",
    kicker: "Activity II",
    hint: "Beat the clock. Answer fast for bonus XP!",
    seconds: 15,
    questions: [
      {
        text: "Aarav lived in a beautiful city called ___.",
        options: ["Jaipur", "Nagpur", "Rampur"],
        answer: 2,
        why: "The story says Aarav's city was Rampur."
      },
      {
        text: "Piku the Penguin was eating a delicious ___.",
        options: ["roti roll", "pani puri", "samosa"],
        answer: 2,
        why: "Piku was happily munching a samosa."
      },
      {
        text: "Inside the bag were all the ___ costumes.",
        options: ["festival", "fancy dress", "funny"],
        answer: 1,
        why: "The bag was full of fancy dress costumes."
      }
    ]
  }
};

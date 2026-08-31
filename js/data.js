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
        answer: 0,
        why: "The story says Aarav's city was Jaipur."
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
  },

  /* ---- Show What You Know · Activity I ----
     Colour each proper noun to match its common noun.  ---- */
  colour: {
    id: "colour",
    title: "Candy Colour Crush",
    hint: "Tap a word candy, then tap the jar of its common noun!",
    jars: [
      { key: "girl", label: "girl", colour: "green" },
      { key: "city", label: "city", colour: "pink"  },
      { key: "cat",  label: "cat",  colour: "blue"  }
    ],
    candies: [
      { word: "Jaipur",    key: "city" },
      { word: "Snowy",     key: "cat"  },
      { word: "Smitha",    key: "girl" },
      { word: "Timmy",     key: "cat", done: true },   /* one is done for you */
      { word: "Priya",     key: "girl" },
      { word: "Delhi",     key: "city" },
      { word: "Krithi",    key: "girl" },
      { word: "Hyderabad", key: "city" },
      { word: "Leo",       key: "cat"  }
    ]
  }
,

  /* ==========================================================
     SHELF 2 · Show What You Know (workbook p.14)
     ========================================================== */

  /* II — circle the common nouns, underline the proper nouns */
  nounSort: {
    hint: "Send every word crate into the COMMON bin or the PROPER bin!",
    /* only the words that appear in the workbook sentences are tested,
       and each one is shown inside its own sentence                    */
    sentences: [
      { text: "Orio, the dog is running.",
        words: [ { word: "Orio", kind: "proper" }, { word: "dog", kind: "common" } ] },
      { text: "Reva has a ball.",
        words: [ { word: "Reva", kind: "proper" }, { word: "ball", kind: "common" } ] },
      { text: "My father went on a trip to Goa.",
        words: [ { word: "father", kind: "common" }, { word: "trip", kind: "common" },
                 { word: "Goa", kind: "proper" } ] },
      { text: "My mother is a teacher. Her name is Meena.",
        words: [ { word: "mother", kind: "common" }, { word: "teacher", kind: "common" },
                 { word: "Meena", kind: "proper" } ] },
      { text: "I saw a lion in the Nehru Zoological Park.",
        words: [ { word: "lion", kind: "common" },
                 { word: "Nehru Zoological Park", kind: "proper" } ] }
    ]
  },

  /* III — write three proper nouns for each common noun
     (the workbook lets the child invent names; these baskets of
      names are the suggested answers — edit freely)            */
  nounCatch: {
    hint: "Catch the three names that belong to the common noun. Dodge the rest!",
    rounds: [
      { common: "teacher", emoji: "", right: ["Meena", "Smitha", "Priya"],  wrong: ["chair", "pencil", "school"] },
      { common: "dog",     emoji: "", right: ["Totu", "Orio", "Snowy"],       wrong: ["puppy", "bone", "tail"] },
      { common: "house",   emoji: "", right: ["Rose Villa", "Green Nest", "Lake View"], wrong: ["roof", "door", "garden"] },
      { common: "biscuits",emoji: "", right: ["Good Day", "Marie Gold", "Oreo"], wrong: ["sugar", "packet", "crumbs"] }
    ]
  },

  /* ==========================================================
     SHELF 3 · Words in Action + The Real Good
     ========================================================== */

  /* p.15 listener's lab — the passage is read aloud by the browser.
     Replace `passage` with your own script if you have one.       */
  listen: {
    passage: "Rina lives in a small house with her mother, her father and her grandfather. " +
             "There are four members in her family. Every day her mother goes to work. " +
             "Her father helps with the cleaning. At night her grandfather tells her wonderful stories.",
    questions: [
      { text: "How many members are there in Rina's family?", options: ["five", "four", "three"], answer: 1 },
      { text: "Where does Rina's mother go every day?",       options: ["to market", "to work", "to school"], answer: 1 },
      { text: "Rina's father helps with ___.",                options: ["washing", "cooking", "cleaning"], answer: 2 },
      { text: "Who tells stories to Rina?",                   options: ["brother", "mother", "grandfather"], answer: 2 }
    ]
  },

  /* p.16 reader's room — read the paragraph, fill in the blanks */
  blanks: {
    paragraph: "In our classroom, there is a big poster on the wall. Next to it, there is an old globe. " +
               "Everyday, we have story time during which our teacher reads out a new story to us. " +
               "During lunchtime, we enjoy our meals together. Our classroom is an exciting place " +
               "where we learn and play everyday.",
    lines: [
      { before: "There is an old",              after: "next to the poster.", answer: "globe" },
      { before: "During story time, the teacher", after: "a new story to us.", answer: "reads" },
      { before: "During lunchtime, we enjoy our", after: "together.",          answer: "meals" },
      { before: "Our classroom is an",           after: "place.",              answer: "exciting" }
    ],
    extras: ["chair", "sings", "books", "sleepy"]
  },

  /* p.21 Read and Reflect (poem 'The Real Good') — I. match */
  poemMatch: {
    pairs: [
      { word: "share",  meaning: "to divide something between two or more people" },
      { word: "uplift", meaning: "lift to a higher position" },
      { word: "endure", meaning: "to suffer something painful" },
      { word: "spans",  meaning: "the length of time for which something lasts" },
      { word: "vast",   meaning: "extremely big" }
    ]
  },

  /* p.21 — II. choose the correct option */
  poemMcq: {
    questions: [
      { text: "Best friends ___ things.",                              options: ["fight for", "share", "break"], answer: 1 },
      { text: "In ___ times and ___, the bond will endure.",           options: ["good, bad", "small, big", "tall, short"], answer: 0 },
      { text: "Your friend is with you, in your ___ and your ___.",    options: ["home and school", "mind and heart", "car and bus"], answer: 1 }
    ]
  },

  /* p.23 — colour the word that does not rhyme with the first word */
  rhyme: {
    rounds: [
      { key: "bright", options: ["night", "spoon", "light"], odd: 1 },
      { key: "dew",    options: ["few",   "new",   "song"],  odd: 2 },
      { key: "feel",   options: ["doll",  "reel",  "peel"],  odd: 0 },
      { key: "green",  options: ["keen",  "air",   "seen"],  odd: 1 }
    ]
  },

  /* ==========================================================
     SHELF 4 · Sound Safari ('ai' words) + Verbs
     ========================================================== */

  /* p.24 — identify the images and write the 'ai' sounding words */
  aiSpell: {
    words: [
      { word: "grain", img: "../assets/img/grain.jpg" },
      { word: "nail",  img: "../assets/img/nail.jpg"  },
      { word: "paint", img: "../assets/img/paint.jpg" },
      { word: "snail", img: "../assets/img/snail.jpg" }
    ]
  },

  /* p.25 — colour the clouds that have 'ai' sounding words */
  aiClouds: {
    clouds: [
      { word: "pine", ai: false },
      { word: "main", ai: true  },
      { word: "bean", ai: false },
      { word: "sail", ai: true  },
      { word: "rail", ai: true  }
    ]
  },

  /* p.51 — tick the correct option (verb + s / es) */
  verbs: {
    rows: [
      { subject: "I",      options: ["speak", "speaks"], answer: 0 },
      { subject: "He",     options: ["win",   "wins"],   answer: 1 },
      { subject: "Smitha", options: ["hop",   "hops"],   answer: 1 },
      { subject: "You",    options: ["jump",  "jumps"],  answer: 0 },
      { subject: "People", options: ["talk",  "talks"],  answer: 0 },
      { subject: "We",     options: ["smile", "smiles"], answer: 0 }
    ]
  },

  /* ==========================================================
     SHELF 5 · Circus Story — fill in the blanks
     ========================================================== */
  circus: {
    clueBox: ["clowns", "unicycle", "canopy", "gymnastics"],
    intro: "Sohan went to a circus. He wants to tell his friends about it. Help him recollect the words.",
    story: "I visited the Grand Gemini circus held in the playground.",
    sentences: [
      { before: "I entered a", blank: "canopy", after: "." },
      { before: "The show began with the entry of two", blank: "clowns", after: "." },
      { before: "The artists performed", blank: "gymnastics", after: "." },
      { before: "A clown was riding a", blank: "unicycle", after: "." }
    ]
  }
};

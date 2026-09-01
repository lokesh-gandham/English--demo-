/* ==========================================================
   SHELF 2 · II — NOUN CONVEYOR   (workbook p.14, activity II)
   "Read the sentences. Circle the common nouns and underline the
   proper nouns."  The sentence stays on screen and only the words
   that belong to that sentence ride the belt — the word being
   judged is highlighted inside the sentence itself, and once it
   is sorted it keeps its workbook mark: common nouns circled,
   proper nouns underlined.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.nounSort;
  const stage = document.getElementById("stage");

  /* one flat queue, sentence by sentence, in reading order */
  const list = [];
  cfg.sentences.forEach((s, si) => s.words.forEach(w => list.push({ ...w, si })));

  const hud = new Hud(document.getElementById("hud"), {
    title: "Noun Conveyor", steps: list.length, lives: 0
  });

  let i = 0, done = 0, score = 0, ink = 0, mistakes = 0, busy = false;

  stage.innerHTML =
    '<div class="sentence-card" id="sentence"></div>' +
    '<div class="factory">' +
      '<div class="crate-lane"><div class="crate" id="crate"></div></div>' +
      '<div class="belt"><span></span><span></span><span></span><span></span><span></span></div>' +
      '<div class="bins">' +
        '<button class="bin common" data-kind="common">' +
          '<span class="bin-cap">🟢 COMMON NOUN</span><small>any person, place or thing</small>' +
        '</button>' +
        '<button class="bin proper" data-kind="proper">' +
          '<span class="bin-cap">🔵 PROPER NOUN</span><small>a special name — starts with a capital</small>' +
        '</button>' +
      '</div>' +
    '</div>';

  const crate = document.getElementById("crate");
  stage.querySelectorAll(".bin").forEach(b => b.onclick = () => sortIt(b.dataset.kind, b));

  show();

  /* ---------- the sentence, with its words marked ---------- */
  function paintSentence(){
    const item = list[i];
    const s    = cfg.sentences[item.si];
    let html   = s.text;

    s.words.forEach(w => {
      const pos    = list.findIndex(x => x.si === item.si && x.word === w.word);
      const sorted = pos < i;
      const cls = sorted ? (w.kind === "common" ? "w-circle" : "w-line") : "";
      if (cls) html = html.replace(w.word, '<span class="' + cls + '">' + w.word + '</span>');
    });

    document.getElementById("sentence").innerHTML =
      '<span class="s-num q-no">Q' + (item.si + 1) + '.</span> <span class="s-text">' + html + '</span>';
  }

  function show(){
    const item = list[i];
    crate.textContent = item.word;
    crate.className = "crate";
    void crate.offsetWidth;                 /* restart the ride animation */
    crate.classList.add("ride");
    paintSentence();
    hud.chip("score", "SCORE <b>" + String(score).padStart(5, "0") + "</b>");
    hud.chip("left",  "WORDS <b>" + (list.length - done) + "</b>");
  }

  function sortIt(kind, binEl){
    if (busy) return;
    busy = true;
    const item = list[i];

    if (item.kind === kind){
      Sfx.play("good");
      const streak = hud.win();
      score += 150 * streak; ink += 15;
      hud.addXp(15, null); hud.advance();
      hud.record(item.word, kind === "common" ? "common noun" : "proper noun");
      crate.classList.add("packed");
      binEl.classList.add("thump");
      setTimeout(() => binEl.classList.remove("thump"), 300);
      done++;
      popup({
        ok: true,
        title: kind === "common" ? "Circled!" : "Underlined!",
        text: "<b>" + item.word + "</b> is a " + kind + " noun." +
              (streak > 1 ? "<br>🔥 " + streak + " in a row" : ""),
        onClose(){
          busy = false;
          if (done === list.length) return finish();
          i++; show();
        }
      });
    } else {
      Sfx.play("bad");
      mistakes++; hud.streak = 0; hud.paint();
      crate.classList.add("reject");
      popup({
        ok: false,
        title: "Wrong bin!",
        text: "<b>" + item.word + "</b> is not a " + kind + " noun.<br>" +
              "A proper noun is a special name and starts with a capital letter.",
        onClose(){ busy = false; show(); }     /* the crate rides round again */
      });
    }
  }

  function finish(){
    const stars = mistakes === 0 ? 3 : mistakes <= 3 ? 2 : 1;
    showResult(stage, {
      gameId: "sort", xp: ink, stars,
      total: done + "/" + list.length,
      nextHref: "whack.html", nextLabel: "🔨 Next game ›"
    });
  }
})();

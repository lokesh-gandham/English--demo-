/* ==========================================================
   SHELF 3 · MEMORY MATCH   (workbook p.21, activity I)
   Pattern: Concentration / memory flip cards. Ten face-down
   cards — five poem words and five meanings. Flip two; a pair
   stays open, a mismatch flips back. Unlimited flips.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.poemMatch;
  const stage = document.getElementById("stage");
  const hud   = new Hud(document.getElementById("hud"), {
    title: "Memory Match", steps: cfg.pairs.length, lives: 0
  });

  const deck = shuffle(
    cfg.pairs.map(p => ({ key: p.word, face: p.word, type: "word" }))
      .concat(cfg.pairs.map(p => ({ key: p.word, face: p.meaning, type: "mean" })))
  );

  let first = null, busy = false, found = 0, flips = 0, score = 0, ink = 0, mistakes = 0;

  stage.innerHTML =
    '<p class="crush-hint">Flip two cards — find the word and its meaning!</p>' +
    '<div class="memo" id="memo">' +
      deck.map((c, i) =>
        '<div class="memo-card" data-i="' + i + '">' +
          '<div class="mc-inner">' +
            '<div class="mc-back">📖</div>' +
            '<div class="mc-face ' + c.type + '">' + c.face + '</div>' +
          '</div>' +
        '</div>').join("") +
    '</div>';

  const board = document.getElementById("memo");
  board.querySelectorAll(".memo-card").forEach(el => el.onclick = () => flip(el));
  readout();

  function readout(){
    hud.chip("score", "SCORE <b>" + String(score).padStart(5, "0") + "</b>");
    hud.chip("flips", "FLIPS <b>" + flips + "</b>");
  }

  function flip(el){
    if (busy) return;
    const i = +el.dataset.i;
    if (el.classList.contains("open") || el.classList.contains("won")) return;

    el.classList.add("open");
    if (!first){ first = { el, i }; return; }

    flips++; readout();
    busy = true;
    const a = deck[first.i], b = deck[i];

    if (a.key === b.key && first.i !== i){
      const streak = hud.win();
      score += 300 * streak; ink += 20;
      hud.addXp(20, null); hud.advance();
      first.el.classList.add("won"); el.classList.add("won");
      found++;
      const done = found === cfg.pairs.length;
      const one = first;
      popup({
        ok: true,
        title: "Pair found!",
        text: "<b>" + a.key + "</b> — " + (a.type === "mean" ? a.face : b.face) +
              (streak > 1 ? "<br>🔥 " + streak + " in a row" : ""),
        onClose(){ first = null; busy = false; if (done) finish(); }
      });
    } else {
      mistakes++; hud.streak = 0; hud.paint();
      const one = first; first = null;
      setTimeout(() => {
        one.el.classList.remove("open");
        el.classList.remove("open");
        busy = false;
      }, 900);
    }
  }

  function finish(){
    const stars = mistakes <= 2 ? 3 : mistakes <= 6 ? 2 : 1;
    showResult(stage, {
      gameId: "memory", xp: ink, stars,
      total: found + "/" + cfg.pairs.length,
      nextHref: "sling.html", nextLabel: "🎯 Next game ›"
    });
  }
})();

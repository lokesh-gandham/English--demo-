/* ==========================================================
   SHELF 2 · II — NOUN CONVEYOR   (workbook p.14, activity II)
   Pattern: factory conveyor-belt sorter. Word crates ride the
   belt; drop each into the COMMON bin or the PROPER bin before
   it reaches the end. Unlimited retries — a missed crate rides
   round again.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.nounSort;
  const stage = document.getElementById("stage");
  const queue = shuffle(cfg.words);
  const hud   = new Hud(document.getElementById("hud"), {
    title: "Noun Conveyor", steps: queue.length, lives: 0
  });

  let i = 0, done = 0, score = 0, ink = 0, mistakes = 0, busy = false;

  stage.innerHTML =
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

  function show(){
    const w = queue[i];
    crate.textContent = w.word;
    crate.className = "crate";
    void crate.offsetWidth;                 // restart the ride animation
    crate.classList.add("ride");
    hud.chip("score", "SCORE <b>" + String(score).padStart(5, "0") + "</b>");
    hud.chip("left",  "CRATES <b>" + (queue.length - done) + "</b>");
  }

  function sortIt(kind, binEl){
    if (busy) return;
    busy = true;
    const w = queue[i];

    if (w.kind === kind){
      const streak = hud.win();
      score += 150 * streak; ink += 15;
      hud.addXp(15, null); hud.advance();
      crate.classList.add("packed");
      binEl.classList.add("thump");
      setTimeout(() => binEl.classList.remove("thump"), 300);
      done++;
      popup({
        ok: true,
        title: "Packed!",
        text: "<b>" + w.word + "</b> is a " + kind + " noun." +
              (streak > 1 ? "<br>🔥 " + streak + " in a row" : ""),
        onClose(){
          busy = false;
          if (done === queue.length) return finish();
          i++; show();
        }
      });
    } else {
      mistakes++; hud.streak = 0; hud.paint();
      crate.classList.add("reject");
      popup({
        ok: false,
        title: "Wrong bin!",
        text: "<b>" + w.word + "</b> is not a " + kind + " noun.<br>" +
              "Remember: a proper noun is a special name and starts with a capital letter.",
        onClose(){ busy = false; show(); }        // the crate rides round again
      });
    }
  }

  function finish(){
    const stars = mistakes === 0 ? 3 : mistakes <= 3 ? 2 : 1;
    showResult(stage, {
      gameId: "sort", xp: ink, stars,
      total: done + "/" + queue.length,
      nextHref: "whack.html", nextLabel: "🔨 Next game ›"
    });
  }

  show();
})();

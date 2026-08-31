/* ==========================================================
   SHELF 4 · SPELLING BEE   (workbook p.24, spell well)
   Pattern: hangman / word-builder. A picture appears with empty
   letter slots; tap letters from the honeycomb to spell the
   'ai' word. Wrong letters buzz away, right ones fly into place.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.aiSpell;
  const list  = cfg.words;
  const stage = document.getElementById("stage");
  const hud   = new Hud(document.getElementById("hud"), {
    title: "Spelling Bee", steps: list.length, lives: 0
  });

  const ALPHA = "aegilnprst";           /* letters needed + a few extras */
  let i = 0, pos = 0, score = 0, ink = 0, mistakes = 0, busy = false;

  function render(){
    const w = list[i];
    pos = 0;
    stage.innerHTML =
      '<p class="crush-hint">Look at the picture and spell the <b>ai</b> word!</p>' +
      '<div class="bee">' +
        '<div class="pic">' + w.emoji + '</div>' +
        '<div class="slots-row" id="slots">' +
          w.word.split("").map((c, n) =>
            '<span class="lslot' + (c === "a" || c === "i" ? " ai" : "") + '" data-n="' + n + '"></span>').join("") +
        '</div>' +
        '<div class="hive" id="hive">' +
          shuffle(uniq(w.word.split("").concat(ALPHA.split("")))).map(c =>
            '<button class="hex" data-c="' + c + '">' + c + '</button>').join("") +
        '</div>' +
      '</div>';

    stage.querySelectorAll(".hex").forEach(b => b.onclick = () => tap(b));
    hud.chip("score", "SCORE <b>" + String(score).padStart(5, "0") + "</b>");
    hud.chip("word",  "WORD <b>" + (i + 1) + "/" + list.length + "</b>");
  }

  function uniq(a){ return a.filter((v, k) => a.indexOf(v) === k); }

  function tap(btn){
    if (busy) return;
    const w = list[i].word;
    const c = btn.dataset.c;

    if (c === w[pos]){
      const slot = stage.querySelector('.lslot[data-n="' + pos + '"]');
      slot.textContent = c;
      slot.classList.add("set");
      pos++;
      score += 60; ink += 6;
      hud.addXp(6, null);
      hud.chip("score", "SCORE <b>" + String(score).padStart(5, "0") + "</b>");

      if (pos === w.length){
        busy = true;
        const streak = hud.win();
        score += 250 * streak;
        hud.advance(); confetti(20);
        const last = i + 1 >= list.length;
        popup({
          ok: true,
          title: "Spelled it!",
          text: "<b>" + w + "</b> — listen for the <b>ai</b> sound." +
                (streak > 1 ? "<br>🔥 " + streak + " in a row" : ""),
          onClose(){
            busy = false;
            if (last) return finish();
            i++; render();
          }
        });
      }
    } else {
      mistakes++; hud.streak = 0; hud.paint();
      btn.classList.add("buzz");
      setTimeout(() => btn.classList.remove("buzz"), 420);
      busy = true;
      popup({
        ok: false,
        title: "Bzzz!",
        text: "That is not the next letter.<br>The word has <b>" + w.length + "</b> letters and starts with <b>" +
              w[0] + "</b>.",
        onClose(){ busy = false; }
      });
    }
  }

  function finish(){
    const stars = mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1;
    showResult(stage, {
      gameId: "spell", xp: ink, stars,
      total: list.length + "/" + list.length,
      nextHref: "clouds.html", nextLabel: "☁️ Next game ›"
    });
  }

  render();
})();

/* ==========================================================
   SHELF 3 · BALLOON POP   (workbook p.23)
   Pattern: balloon-burst arcade. Three balloons drift upward
   carrying words. Pop the one that does NOT rhyme with the key
   word before they float away — they come back if you miss.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.rhyme;
  const stage = document.getElementById("stage");
  const hud   = new Hud(document.getElementById("hud"), {
    title: "Balloon Pop", steps: cfg.rounds.length, lives: 0
  });

  const hues = ["#e5537b", "#3f9bd6", "#f0a51e", "#7aba4e"];
  let round = 0, score = 0, ink = 0, mistakes = 0, busy = false;

  function render(){
    const r = cfg.rounds[round];
    stage.innerHTML =
      '<p class="big-q"><span class="q-no">Q' + (round + 1) + '.</span> Which word doesn\'t rhyme with <b>' + r.key + '</b>?</p>' +
      '<div class="balloons">' +
    r.options.map((w, n) =>
      '<div class="balloon" data-n="' + n + '" style="--hue:' + hues[n % hues.length] +
           '; animation-delay:' + (n * .35) + 's">' +
        '<span>' + w.charAt(0).toUpperCase() + w.slice(1) + '</span><i class="string"></i>' +
      '</div>').join("") +
      '</div>';

    stage.querySelectorAll(".balloon").forEach(b => b.onclick = () => pop(b));
    hud.chip("score", "SCORE <b>" + String(score).padStart(5, "0") + "</b>");
    hud.chip("round", "ROUND <b>" + (round + 1) + "/" + cfg.rounds.length + "</b>");
  }

  function pop(el){
    if (busy) return;
    busy = true;
    const r = cfg.rounds[round];
    const n = +el.dataset.n;

    if (n === r.odd){
      Sfx.play("win");
      const streak = hud.win();
      score += 400 * streak; ink += 25;
      hud.addXp(25, null); hud.advance();
      el.classList.add("burst");
      confetti(18);
      const last = round + 1 >= cfg.rounds.length;
      popup({
        ok: true,
        title: "POP!",
        text: "<b>" + r.options[n].charAt(0).toUpperCase() + r.options[n].slice(1) + "</b> does not rhyme with <b>" + r.key + "</b>." +
              (streak > 1 ? "<br>🔥 " + streak + " in a row" : ""),
        onClose(){
          busy = false;
          if (last) return finish();
          round++; render();
        }
      });
    } else {
      Sfx.play("bad");
      mistakes++; hud.streak = 0; hud.paint();
      el.classList.add("wobble");
      setTimeout(() => el.classList.remove("wobble"), 500);
      popup({
        ok: false,
        title: "That one rhymes!",
        text: "<b>" + r.options[n].charAt(0).toUpperCase() + r.options[n].slice(1) + "</b> rhymes with <b>" + r.key + "</b>.<br>Listen again and pop another balloon.",
        onClose(){ busy = false; }
      });
    }
  }

  function finish(){
    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    showResult(stage, {
      gameId: "rhyme", xp: ink, stars,
      total: cfg.rounds.length + "/" + cfg.rounds.length,
      nextHref: "../index.html", nextLabel: "📚 Shelf ›"
    });
  }

  render();
})();

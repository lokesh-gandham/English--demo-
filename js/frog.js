/* ==========================================================
   SHELF 4 · VERB CROSSING   (workbook p.51, tick the option)
   Pattern: Frogger. The frog must cross the river. Each row is
   a subject with two stepping stones — hop onto the stone with
   the correct verb. A wrong stone sinks and the frog hops back.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.verbs;
  const rows  = cfg.rows;
  const stage = document.getElementById("stage");
  const hud   = new Hud(document.getElementById("hud"), {
    title: "Verb Crossing", steps: rows.length, lives: 0
  });

  let i = 0, score = 0, ink = 0, mistakes = 0, busy = false;

  function render(){
    stage.innerHTML =
      '<p class="crush-hint">Hop onto the stone with the correct verb. Add <b>s</b> only for he, she or one person!</p>' +
      '<div class="river">' +
        '<div class="bank top">🌴 &nbsp;&nbsp; HOME &nbsp;&nbsp; 🌴</div>' +
        rows.map((r, n) =>
          '<div class="row-line' + (n < i ? " crossed" : n === i ? " current" : "") + '" data-r="' + n + '">' +
            '<span class="subject">' + r.subject + '</span>' +
            r.options.map((o, k) =>
              '<button class="stone" data-r="' + n + '" data-k="' + k + '"' +
                (n === i ? "" : " disabled") + '>' + o + '</button>').join("") +
          '</div>').reverse().join("") +
        '<div class="bank bottom"><span class="frog" id="frog">🐸</span></div>' +
      '</div>';

    stage.querySelectorAll(".stone").forEach(b =>
      b.onclick = () => hop(+b.dataset.r, +b.dataset.k, b));
    hud.chip("score", "SCORE <b>" + String(score).padStart(5, "0") + "</b>");
    hud.chip("rows",  "ROW <b>" + (i + 1) + "/" + rows.length + "</b>");
  }

  function hop(r, k, el){
    if (busy || r !== i) return;
    busy = true;
    const row = rows[i];
    const frog = document.getElementById("frog");
    frog.classList.add("jump");
    setTimeout(() => frog.classList.remove("jump"), 400);

    if (k === row.answer){
      const streak = hud.win();
      score += 300 * streak; ink += 20;
      hud.addXp(20, null); hud.advance();
      el.classList.add("solid");
      const last = i + 1 >= rows.length;
      popup({
        ok: true,
        title: last ? "Safe on the bank!" : "Safe hop!",
        text: "<b>" + row.subject + " " + row.options[k] + "</b> is correct." +
              (streak > 1 ? "<br>🔥 " + streak + " in a row" : ""),
        onClose(){
          busy = false;
          if (last) return finish();
          i++; render();
        }
      });
    } else {
      mistakes++; hud.streak = 0; hud.paint();
      el.classList.add("sink");
      setTimeout(() => el.classList.remove("sink"), 600);
      popup({
        ok: false,
        title: "Splash!",
        text: "<b>" + row.subject + " " + row.options[k] + "</b> is not right.<br>" +
              "We do not add <b>s</b> after I, you, we, they or many people.",
        onClose(){ busy = false; }
      });
    }
  }

  function finish(){
    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    showResult(stage, {
      gameId: "frog", xp: ink, stars,
      total: rows.length + "/" + rows.length,
      nextHref: "../index.html", nextLabel: "📚 Shelf ›"
    });
  }

  render();
})();

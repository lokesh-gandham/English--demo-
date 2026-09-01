/* ==========================================================
   SHELF 3 · ARCHERY RANGE   (workbook p.16, fill in the blanks)
   Pattern: archery / target shooting. Three word targets slide
   across the range. Read the sentence, aim the bow and shoot
   the word that fills the blank.
   Controls: ← → aim, SPACE shoot, or click a target.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.blanks;
  const lines = cfg.lines;
  const stage = document.getElementById("stage");
  const hud   = new Hud(document.getElementById("hud"), {
    title: "Archery Range", steps: lines.length, lives: 0
  });

  let i = 0, aim = 1, arrows = 0, score = 0, ink = 0, mistakes = 0, busy = false;

  function optionsFor(n){
    const right = lines[n].answer;
    const pool  = shuffle(cfg.extras.concat(lines.filter((_, k) => k !== n).map(l => l.answer)));
    return shuffle([right, pool[0], pool[1]]);
  }

  let opts = optionsFor(0);

  function render(){
    const l = lines[i];
    opts = optionsFor(i);
    stage.innerHTML =
      '<p class="big-q"><span class="q-no">Q' + (i + 1) + '.</span> ' +
        l.before + ' <span class="blank"></span> ' + l.after + '</p>' +
      '<div class="range" id="range">' +
        '<div class="targets">' +
          opts.map((w, n) =>
            '<div class="bullseye" data-n="' + n + '" style="animation-delay:' + (n * -1.7) + 's">' +
              '<span class="tword">' + w.charAt(0).toUpperCase() + w.slice(1) + '</span>' +
            '</div>').join("") +
        '</div>' +
        '<div class="arrow" id="arrow">➵</div>' +
        '<div class="archer">🏹</div>' +
      '</div>';

    stage.querySelectorAll(".bullseye").forEach(t =>
      t.onclick = () => { if (!busy){ setAim(+t.dataset.n); shoot(); } });

    setAim(Math.min(aim, opts.length - 1));
    readout();
  }

  function readout(){
    hud.chip("score",  "SCORE <b>" + String(score).padStart(5, "0") + "</b>");
    hud.chip("arrows", "ARROWS <b>" + arrows + "</b>");
    hud.chip("blank",  "BLANK <b>" + (i + 1) + "/" + lines.length + "</b>");
  }

  function setAim(n){
    aim = Math.max(0, Math.min(opts.length - 1, n));
    stage.querySelectorAll(".bullseye").forEach((t, k) => t.classList.toggle("aimed", k === aim));
  }

  function shoot(){
    if (busy) return;
    busy = true; arrows++; readout();
    Sfx.play("launch");

    const arrow  = document.getElementById("arrow");
    const target = stage.querySelector('.bullseye[data-n="' + aim + '"]');
    arrow.style.opacity = "1";                    /* the arrow leaves the bow */
    const a = arrow.getBoundingClientRect();
    const t = target.getBoundingClientRect();
    arrow.style.transition = "transform .38s cubic-bezier(.4,0,.9,.6)";
    arrow.style.transform  = "translate(" + (t.left + t.width / 2 - a.left - a.width / 2) + "px," +
                             (t.top + t.height / 2 - a.top - a.height / 2) + "px)";

    setTimeout(() => resolve(target), 400);
  }

  function resolve(target){
    const l = lines[i];
    const word = opts[aim];

    if (word === l.answer){
      Sfx.play("win");
      const streak = hud.win();
      score += 400 * streak; ink += 25;
      hud.addXp(25, null); hud.advance();
      hud.record((l.before + " ___ " + l.after).trim(), word);
      target.classList.add("struck");
      confetti(18);
      const last = i + 1 >= lines.length;
      popup({
        ok: true,
        title: "BULLSEYE!",
        text: l.before + " <b>" + word + "</b> " + l.after +
              (streak > 1 ? "<br>🔥 " + streak + " in a row" : ""),
        onClose(){
          busy = false;
          if (last) return finish();
          i++; render();
        }
      });
    } else {
      Sfx.play("bad");
      mistakes++; hud.streak = 0; hud.paint();
      target.classList.add("missed");
      setTimeout(() => target.classList.remove("missed"), 500);
      popup({
        ok: false,
        title: "Missed the mark!",
        text: "<b>" + word + "</b> does not fit that sentence.<br>Read it again and take another arrow.",
        onClose(){
          busy = false;
          const arrow = document.getElementById("arrow");
          arrow.style.transition = "transform .25s ease, opacity .2s ease";
          arrow.style.transform  = "none";
          arrow.style.opacity    = "0";           /* back on the bow */
        }
      });
    }
  }

  function finish(){
    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    showResult(stage, {
      gameId: "archery", xp: ink, stars,
      total: lines.length + "/" + lines.length,
      nextHref: "bubble.html", nextLabel: "🫧 Next game ›"
    });
  }

  document.addEventListener("keydown", e => {
    if (document.querySelector(".modal")) return;
    if (e.key === "ArrowLeft"){ e.preventDefault(); setAim(aim - 1); }
    if (e.key === "ArrowRight"){ e.preventDefault(); setAim(aim + 1); }
    if (e.key === " "){ e.preventDefault(); shoot(); }
  });

  render();
})();

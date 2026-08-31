/* ==========================================================
   SHELF 3 · STORY CLIMB   (workbook p.15, listener's lab)
   Pattern: snakes-and-ladders style climb. The browser reads
   the passage aloud (press LISTEN as often as you like); each
   correct answer climbs one ladder rung toward the flag.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.listen;
  const qs    = cfg.questions;
  const stage = document.getElementById("stage");
  const hud   = new Hud(document.getElementById("hud"), {
    title: "Story Climb", steps: qs.length, lives: 0
  });

  let i = 0, score = 0, ink = 0, mistakes = 0, busy = false;

  function speak(){
    try{
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(cfg.passage);
      u.rate = .85; u.pitch = 1.05;
      speechSynthesis.speak(u);
    } catch(e){}
  }

  function render(){
    const q = qs[i];
    stage.innerHTML =
      '<div class="climb">' +
        '<div class="ladder">' +
          '<div class="flag">🚩</div>' +
          Array.from({length: qs.length}, (_, n) =>
            '<div class="rung' + (n < i ? " passed" : "") + '"></div>').join("") +
          '<div class="climber" id="climber" style="bottom:' + (8 + i * 21) + '%">🧗</div>' +
        '</div>' +
        '<div class="climb-main">' +
          '<button class="ctrl listen-btn" id="listenBtn">🔊 LISTEN TO THE STORY</button>' +
          '<p class="big-q">' + q.text.replace("___", '<span class="blank"></span>') + '</p>' +
          '<div class="rung-opts">' +
            q.options.map((o, n) =>
              '<button class="rung-opt" data-n="' + n + '">' +
                '<span class="key">' + "abc"[n] + '</span>' + o + '</button>').join("") +
          '</div>' +
        '</div>' +
      '</div>';

    document.getElementById("listenBtn").onclick = speak;
    stage.querySelectorAll(".rung-opt").forEach(b => b.onclick = () => answer(+b.dataset.n, b));
    hud.chip("score", "SCORE <b>" + String(score).padStart(5, "0") + "</b>");
    hud.chip("rung",  "RUNG <b>" + (i + 1) + "/" + qs.length + "</b>");
  }

  function answer(n, el){
    if (busy) return;
    busy = true;
    const q = qs[i];

    if (n === q.answer){
      Sfx.play("win");
      const streak = hud.win();
      score += 350 * streak; ink += 22;
      hud.addXp(22, null); hud.advance();
      el.classList.add("right");
      const climber = document.getElementById("climber");
      if (climber) climber.style.bottom = (8 + (i + 1) * 21) + "%";
      const last = i + 1 >= qs.length;
      popup({
        ok: true,
        title: last ? "You reached the flag!" : "Up you go!",
        text: "<b>" + q.options[n] + "</b> is right." +
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
      el.classList.add("wrongpick");
      setTimeout(() => el.classList.remove("wrongpick"), 450);
      popup({
        ok: false,
        title: "Listen again!",
        text: "That is not what the story said.<br>Press <b>🔊 LISTEN</b> and try once more.",
        onClose(){ busy = false; }
      });
    }
  }

  function finish(){
    try{ speechSynthesis.cancel(); } catch(e){}
    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    showResult(stage, {
      gameId: "listen", xp: ink, stars,
      total: qs.length + "/" + qs.length,
      nextHref: "archery.html", nextLabel: "🏹 Next game ›"
    });
  }

  render();
  setTimeout(speak, 600);
})();

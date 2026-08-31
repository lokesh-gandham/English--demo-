/* ==========================================================
   SHELF 1 · WORD CLAW   (workbook p.10, activity I)
   Pattern: arcade claw machine (UFO catcher). The word lights
   up on the marquee; slide the claw over the prize capsule
   holding its meaning and press GRAB.
   Controls: ◂ ▸ MOVE, SPACE / GRAB, or tap a capsule.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.match;
  const stage = document.getElementById("stage");
  const hud   = new Hud(document.getElementById("hud"), {
    title: "Word Claw", steps: cfg.pairs.length, lives: 0
  });

  const prizes = shuffle(cfg.pairs);        /* capsules in the pit  */
  const order  = shuffle(cfg.pairs);        /* order words come up  */
  let round = 0, won = 0, grabs = 0, score = 0, ink = 0, mistakes = 0;
  let claw = 0, busy = false;

  function sfx(kind){
    try{
      const ac = sfx.ac || (sfx.ac = new (window.AudioContext || window.webkitAudioContext)());
      if (ac.state === "suspended") ac.resume();
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      o.connect(g); g.connect(ac.destination);
      if (kind === "move"){ o.type = "square"; o.frequency.setValueAtTime(420, t);
        g.gain.setValueAtTime(.05, t); g.gain.exponentialRampToValueAtTime(.001, t + .07);
        o.start(t); o.stop(t + .08); return; }
      if (kind === "win"){ o.type = "triangle"; o.frequency.setValueAtTime(660, t);
        o.frequency.setValueAtTime(880, t + .1); o.frequency.setValueAtTime(1320, t + .2); }
      else if (kind === "drop"){ o.type = "sine"; o.frequency.setValueAtTime(500, t);
        o.frequency.exponentialRampToValueAtTime(180, t + .25); }
      else { o.type = "sawtooth"; o.frequency.setValueAtTime(220, t);
        o.frequency.exponentialRampToValueAtTime(80, t + .3); }
      g.gain.setValueAtTime(.13, t); g.gain.exponentialRampToValueAtTime(.001, t + .32);
      o.start(t); o.stop(t + .34);
    } catch(e){}
  }

  stage.innerHTML =
    '<div class="machine">' +
      '<div class="marquee">' +
        '<span class="mq-cap">GRAB THE MEANING OF</span>' +
        '<span class="mq-word" id="mqWord"></span>' +
        '<span class="mq-count">WON <b id="mqWon">0</b>/' + cfg.pairs.length + '</span>' +
      '</div>' +

      '<div class="glass" id="glass">' +
        '<div class="rail"></div>' +
        '<div class="claw" id="clawEl">' +
          '<i class="cable"></i>' +
          '<i class="arm left"></i><i class="arm right"></i>' +
        '</div>' +
        '<div class="pit">' +
          prizes.map((p, n) =>
            '<div class="capsule" data-w="' + p.word + '" data-n="' + n + '">' +
              '<span class="mean">' + p.meaning + '</span>' +
            '</div>').join("") +
        '</div>' +
        '' +
      '</div>' +

      '' +
    '</div>';

  const clawEl = document.getElementById("clawEl");
  stage.querySelectorAll(".capsule").forEach(c =>
    c.onclick = () => { if (!busy){ claw = +c.dataset.n; place(); grab(); } });

  next();

  /* ---------- helpers ---------- */
  function live(){ return [...stage.querySelectorAll(".capsule:not(.taken)")]; }

  function next(){
    document.getElementById("mqWord").textContent = order[round].word;
    document.getElementById("mqWon").textContent  = won;
    const first = live()[0];
    claw = first ? +first.dataset.n : 0;
    place(); readout();
  }

  function readout(){
    hud.chip("score", "SCORE <b>" + String(score).padStart(5, "0") + "</b>");
    hud.chip("grabs", "GRABS <b>" + grabs + "</b>");
  }

  function place(){
    const target = stage.querySelector('.capsule[data-n="' + claw + '"]');
    if (!target) return;
    const g = document.getElementById("glass").getBoundingClientRect();
    const r = target.getBoundingClientRect();
    clawEl.style.left = (r.left + r.width / 2 - g.left) + "px";
    stage.querySelectorAll(".capsule").forEach(c =>
      c.classList.toggle("under", +c.dataset.n === claw));
  }

  function move(d){
    if (busy) return;
    const list = live();
    if (!list.length) return;
    let k = list.findIndex(c => +c.dataset.n === claw);
    if (k < 0) k = 0;
    k = Math.max(0, Math.min(list.length - 1, k + d));
    claw = +list[k].dataset.n;
    sfx("move");
    place();
  }

  /* ---------- the grab ---------- */
  function grab(){
    if (busy) return;
    const capsule = stage.querySelector('.capsule[data-n="' + claw + '"]');
    if (!capsule || capsule.classList.contains("taken")) return;

    busy = true; grabs++; readout();
    sfx("drop");
    const c = clawEl.getBoundingClientRect();
    const t = capsule.getBoundingClientRect();
    clawEl.style.transform = "translateY(" + Math.max(0, t.top - c.bottom + 26) + "px)";

    setTimeout(() => {
      clawEl.classList.add("closed");
      setTimeout(() => resolve(capsule), 320);
    }, 620);
  }

  function resolve(capsule){
    const want = order[round].word;
    clawEl.style.transform = "none";        /* winch the claw back up */

    if (capsule.dataset.w === want){
      sfx("win");
      capsule.classList.add("lifted");
      setTimeout(() => {
        capsule.classList.add("taken");
        capsule.classList.remove("lifted");
        clawEl.classList.remove("closed");
      }, 900);

      const streak = hud.win();
      score += 400 * streak; ink += 25; won++;
      hud.addXp(25, null); hud.advance();
      document.getElementById("mqWon").textContent = won;
      confetti(20);

      const last = won === cfg.pairs.length;
      setTimeout(() => popup({
        ok: true,
        title: "PRIZE WON!",
        text: "<b>" + want + "</b> means<br>" + order[round].meaning +
              (streak > 1 ? "<br>🔥 " + streak + " in a row" : ""),
        onClose(){
          busy = false;
          if (last) return finish();
          round++; next();
        }
      }), 700);

    } else {
      sfx("slip");
      mistakes++; hud.streak = 0; hud.paint();
      capsule.classList.add("slipped");
      setTimeout(() => {
        capsule.classList.remove("slipped");
        clawEl.classList.remove("closed");
      }, 600);

      popup({
        ok: false,
        title: "It slipped!",
        text: "That capsule says<br><b>" + capsule.querySelector(".mean").textContent + "</b><br>" +
              "— not what <b>" + want + "</b> means. Move the claw and grab again.",
        onClose(){ busy = false; }
      });
    }
  }

  function finish(){
    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    showResult(stage, {
      gameId: "claw", xp: ink, stars,
      total: won + "/" + cfg.pairs.length,
      nextHref: "mcq.html", nextLabel: "🕹️ Next book ›"
    });
  }

  document.addEventListener("keydown", e => {
    if (document.querySelector(".modal")) return;
    if (e.key === "ArrowLeft"){ e.preventDefault(); move(-1); }
    if (e.key === "ArrowRight"){ e.preventDefault(); move(1); }
    if (e.key === " " || e.key === "ArrowDown"){ e.preventDefault(); grab(); }
  });

  window.addEventListener("resize", place);
})();

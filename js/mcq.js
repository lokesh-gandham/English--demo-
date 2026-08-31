/* ==========================================================
   BOOK II — WORD PINBALL  (Activity II : choose the correct option)
   The table sits straight on the page: question, three glowing
   targets, a ball and three buttons. Score lives in the header.
   Unlimited shots — every result shows a centred popup.
   Controls: ← / → flippers, SPACE launch, or tap a target.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.mcq;
  const qs    = cfg.questions;
  const stage = document.getElementById("stage");
  const hud   = new Hud(document.getElementById("hud"), {
    title: "Word Pinball", steps: qs.length, lives: 0        // unlimited shots
  });

  let stageIdx = 0, score = 0, ink = 0, misses = 0, tries = 0;
  let aim = 1, busy = false, over = false;

  /* ---------- sound: short synth blips, no audio files ---------- */
  let ac = null;
  function sfx(kind){
    try {
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === "suspended") ac.resume();
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      const t = ac.currentTime;
      if (kind === "flip"){
        o.type = "square"; o.frequency.setValueAtTime(320, t);
        g.gain.setValueAtTime(.06, t); g.gain.exponentialRampToValueAtTime(.001, t + .08);
        o.start(t); o.stop(t + .09);
      } else if (kind === "launch"){
        o.type = "sine"; o.frequency.setValueAtTime(200, t);
        o.frequency.exponentialRampToValueAtTime(900, t + .25);
        g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + .3);
        o.start(t); o.stop(t + .3);
      } else if (kind === "hit"){
        o.type = "triangle"; o.frequency.setValueAtTime(660, t);
        o.frequency.setValueAtTime(990, t + .09);
        o.frequency.setValueAtTime(1320, t + .18);
        g.gain.setValueAtTime(.16, t); g.gain.exponentialRampToValueAtTime(.001, t + .3);
        o.start(t); o.stop(t + .3);
      } else if (kind === "miss"){
        o.type = "sawtooth"; o.frequency.setValueAtTime(200, t);
        o.frequency.exponentialRampToValueAtTime(70, t + .35);
        g.gain.setValueAtTime(.13, t); g.gain.exponentialRampToValueAtTime(.001, t + .38);
        o.start(t); o.stop(t + .4);
      }
    } catch(e){}
  }

  /* ---------- header readout ---------- */
  function readout(){
    hud.chip("score", "SCORE <b>" + String(score).padStart(5, "0") + "</b>");
    hud.chip("shots", "SHOTS <b>" + tries + "</b>");
    hud.chip("stage", "STAGE <b>" + Math.min(stageIdx + 1, qs.length) + "/" + qs.length + "</b>");
  }

  /* ---------- one question ---------- */
  function render(){
    const q = qs[stageIdx];
    stage.innerHTML =
      '<p class="big-q"><span class="q-no">Q' + (stageIdx + 1) + '.</span> ' + q.text.replace("___", '<span class="blank"></span>') + '</p>' +
      '<div class="field" id="pf">' +
        '<div class="lanes">' +
          [0,1,2].map(n => '<div class="lane"></div>').join("") +
        '</div>' +
        '<div class="bumpers">' +
          q.options.map((text, n) =>
            '<div class="bumper" data-n="' + n + '">' +
              '<span class="cap">TARGET ' + "ABC"[n] + '</span>' +
              '<span class="val">' + text + '</span>' +
            '</div>').join("") +
        '</div>' +
        '<div class="ball" id="ball"></div>' +
      '</div>' +
      '<div class="pad">' +
        '<button class="ctrl" id="btnL">◂ FLIPPER</button>' +
        '<button class="ctrl plunge" id="btnGo">⚡ LAUNCH</button>' +
        '<button class="ctrl" id="btnR">FLIPPER ▸</button>' +
      '</div>';

    document.getElementById("btnL").onclick  = () => flip("l");
    document.getElementById("btnR").onclick  = () => flip("r");
    document.getElementById("btnGo").onclick = launch;
    stage.querySelectorAll(".bumper").forEach(b =>
      b.onclick = () => { if (busy) return; aim = +b.dataset.n; paintAim(); launch(); });

    readout();
    paintAim();
    resetBall();
  }

  function paintAim(){
    stage.querySelectorAll(".bumper").forEach((b, n) => b.classList.toggle("aimed", n === aim));
    stage.querySelectorAll(".lane").forEach((l, n) => l.classList.toggle("aim", n === aim));
    const ball = document.getElementById("ball");
    if (ball) ball.style.left = ["17%", "50%", "83%"][aim];
  }

  function resetBall(){
    const ball = document.getElementById("ball");
    ball.classList.remove("drain");
    ball.style.opacity = "1";
    ball.style.bottom = "14px";
  }

  function flip(side){
    if (busy || over) return;
    sfx("flip");
    aim = side === "l" ? Math.max(0, aim - 1) : Math.min(2, aim + 1);
    paintAim();
  }

  /* ---------- the shot ---------- */
  function launch(){
    if (busy || over) return;
    busy = true; tries++; readout();
    sfx("launch");
    const ball = document.getElementById("ball");
    const pf   = document.getElementById("pf");
    ball.style.bottom = (pf.clientHeight - 96) + "px";      // fly up into the target
    setTimeout(() => resolve(aim), 500);
  }

  function resolve(n){
    const q      = qs[stageIdx];
    const bumper = stage.querySelector('.bumper[data-n="' + n + '"]');

    if (n === q.answer){
      sfx("hit");
      bumper.classList.add("pop");
      setTimeout(() => bumper.classList.add("locked-in"), 420);

      const streak = hud.win();
      const gain   = 40 + (streak - 1) * 15;
      const points = 500 * streak;
      score += points; ink += gain;
      hud.addXp(gain, null);
      hud.advance();
      readout();

      setTimeout(() => popup({
        ok: true,
        title: "JACKPOT!",
        text: "<b>" + q.options[n] + "</b> is correct.<br>+" + points + " points" +
              (streak > 1 ? " · ×" + streak + " combo" : ""),
        btn: stageIdx + 1 < qs.length ? "Next ball ▸" : "See my score ▸",
        onClose(){
          busy = false;
          if (++stageIdx < qs.length) render();
          else finish();
        }
      }), 600);

    } else {
      sfx("miss");
      misses++;
      bumper.classList.add("dud");
      const ball = document.getElementById("ball");
      setTimeout(() => { ball.classList.add("drain"); ball.style.bottom = "-30px"; }, 220);

      setTimeout(() => popup({
        ok: false,
        title: "Ball drained!",
        text: "<b>" + q.options[n] + "</b> is not the right word.<br>Load another ball and try again.",
        btn: "Try again ↻",
        onClose(){
          busy = false;
          bumper.classList.remove("dud");
          resetBall();
        }
      }), 600);
    }
  }

  function finish(){
    over = true;
    const stars = misses === 0 ? 3 : misses <= 2 ? 2 : 1;
    showResult(stage, {
      gameId: "mcq", xp: ink, stars,
      total: qs.length + "/" + qs.length,
      nextHref: "claw.html", nextLabel: "🕹️ Play Book I ›"
    });
  }

  /* keyboard: flippers + plunger */
  document.addEventListener("keydown", e => {
    if (over || document.querySelector(".modal")) return;
    if (e.key === "ArrowLeft"){ e.preventDefault(); flip("l"); }
    if (e.key === "ArrowRight"){ e.preventDefault(); flip("r"); }
    if (e.key === " " || e.key === "Enter"){ e.preventDefault(); launch(); }
  });

  render();
})();

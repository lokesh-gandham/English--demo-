/* ==========================================================
   SHELF 3 · BUBBLE SHOOTER   (workbook p.21, activity I)
   Pattern: bubble shooter. Word bubbles float in a cluster at
   the top. The cannon loads a meaning — swing it left/right
   and fire the ball into the bubble that matches.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.poemMatch;
  const stage = document.getElementById("stage");
  const hud   = new Hud(document.getElementById("hud"), {
    title: "Bubble Shooter", steps: cfg.pairs.length, lives: 0
  });

  const bubbles = shuffle(cfg.pairs);           /* bubble order on screen */
  const shots   = shuffle(cfg.pairs);           /* order the meanings load */
  let shot = 0, popped = 0, score = 0, ink = 0, mistakes = 0, aim = 0, busy = false;

  function sfx(kind){
    try{
      const ac = sfx.ac || (sfx.ac = new (window.AudioContext || window.webkitAudioContext)());
      if (ac.state === "suspended") ac.resume();
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      o.connect(g); g.connect(ac.destination);
      if (kind === "pop"){ o.type = "sine"; o.frequency.setValueAtTime(900, t);
        o.frequency.exponentialRampToValueAtTime(1800, t + .12); }
      else { o.type = "sawtooth"; o.frequency.setValueAtTime(260, t);
        o.frequency.exponentialRampToValueAtTime(90, t + .28); }
      g.gain.setValueAtTime(.13, t); g.gain.exponentialRampToValueAtTime(.001, t + .3);
      o.start(t); o.stop(t + .32);
    } catch(e){}
  }

  stage.innerHTML =
    '<div class="shooter" id="shooter">' +
      '<div class="cluster">' +
        bubbles.map((p, n) =>
          '<div class="wbubble" data-w="' + p.word + '" data-n="' + n + '" ' +
               'style="animation-delay:' + (n * .4) + 's">' + p.word.charAt(0).toUpperCase() + p.word.slice(1) + '</div>').join("") +
      '</div>' +
      '<div class="ballpath" id="ball"></div>' +
      '<div class="cannon" id="cannon">' +
        '<div class="barrel" id="barrel"></div>' +
        '<div class="loaded" id="loaded"></div>' +
      '</div>' +
    '</div>' +
    '<div class="pad">' +
      '<button class="ctrl" id="left">◂ TURN</button>' +
      '<button class="ctrl plunge" id="fire">🫧 FIRE</button>' +
      '<button class="ctrl" id="right">TURN ▸</button>' +
    '</div>';

  document.getElementById("left").onclick  = () => setAim(aim - 1);
  document.getElementById("right").onclick = () => setAim(aim + 1);
  document.getElementById("fire").onclick  = fire;
  stage.querySelectorAll(".wbubble").forEach(b =>
    b.onclick = () => { if (!busy){ setAim(+b.dataset.n); fire(); } });

  load(); setAim(0); readout();

  function readout(){
    hud.chip("score", "SCORE <b>" + String(score).padStart(5, "0") + "</b>");
    hud.chip("left2", "BUBBLES <b>" + (cfg.pairs.length - popped) + "</b>");
  }

  function load(){
    document.getElementById("loaded").innerHTML =
      '<span class="q-no">Q' + (shot + 1) + '.</span> ' + shots[shot].meaning.charAt(0).toUpperCase() + shots[shot].meaning.slice(1);
  }

  function liveBubbles(){
    return [...stage.querySelectorAll(".wbubble:not(.gone)")];
  }

  function setAim(n){
    const live = liveBubbles();
    if (!live.length) return;
    aim = Math.max(0, Math.min(live.length - 1, n));
    live.forEach((b, k) => b.classList.toggle("aimed", k === aim));
    const target = live[aim];
    const barrel = document.getElementById("barrel");
    const c = document.getElementById("cannon").getBoundingClientRect();
    const t = target.getBoundingClientRect();
    const deg = Math.atan2(t.left + t.width / 2 - (c.left + c.width / 2),
                           c.top - (t.top + t.height / 2)) * 180 / Math.PI;
    barrel.style.transform = "rotate(" + deg + "deg)";
  }

  function fire(){
    if (busy) return;
    const live = liveBubbles();
    if (!live.length) return;
    busy = true;

    const target = live[aim];
    const ball   = document.getElementById("ball");
    const cannon = document.getElementById("cannon").getBoundingClientRect();
    const t      = target.getBoundingClientRect();
    const field  = document.getElementById("shooter").getBoundingClientRect();

    ball.textContent = "●";
    ball.style.transition = "none";
    ball.style.left = (cannon.left + cannon.width / 2 - field.left) + "px";
    ball.style.top  = (cannon.top - field.top - 10) + "px";
    ball.style.opacity = "1";
    void ball.offsetWidth;
    ball.style.transition = "left .32s linear, top .32s linear";
    ball.style.left = (t.left + t.width / 2 - field.left) + "px";
    ball.style.top  = (t.top + t.height / 2 - field.top) + "px";

    setTimeout(() => resolve(target), 350);
  }

  function resolve(target){
    const ball = document.getElementById("ball");
    ball.style.opacity = "0";
    const want = shots[shot].word;

    if (target.dataset.w === want){
      sfx("pop");
      const streak = hud.win();
      score += 350 * streak; ink += 22;
      hud.addXp(22, null); hud.advance();
      target.classList.add("popped");
      setTimeout(() => target.classList.add("gone"), 420);
      popped++; readout();
      const last = popped === cfg.pairs.length;
      popup({
        ok: true,
        title: "POP!",
        text: "<b>" + want + "</b> means " + shots[shot].meaning +
              (streak > 1 ? "<br>🔥 " + streak + " in a row" : ""),
        onClose(){
          busy = false;
          if (last) return finish();
          shot++; load(); setAim(0);
        }
      });
    } else {
      sfx("miss");
      mistakes++; hud.streak = 0; hud.paint();
      target.classList.add("bounce");
      setTimeout(() => target.classList.remove("bounce"), 500);
      popup({
        ok: false,
        title: "It bounced off!",
        text: "<b>" + target.dataset.w + "</b> does not mean that.<br>Turn the cannon and fire again.",
        onClose(){ busy = false; }
      });
    }
  }

  function finish(){
    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    showResult(stage, {
      gameId: "bubble", xp: ink, stars,
      total: popped + "/" + cfg.pairs.length,
      nextHref: "sling.html", nextLabel: "🎯 Next game ›"
    });
  }

  document.addEventListener("keydown", e => {
    if (document.querySelector(".modal")) return;
    if (e.key === "ArrowLeft"){ e.preventDefault(); setAim(aim - 1); }
    if (e.key === "ArrowRight"){ e.preventDefault(); setAim(aim + 1); }
    if (e.key === " "){ e.preventDefault(); fire(); }
  });
})();

/* ==========================================================
   SHELF 4 · CLOUD SLICE   (workbook p.25)
   "Colour the clouds that have 'ai' sounding words."
   Swipe across a cloud to colour it. An 'ai' cloud fills with
   colour and keeps a tick; a rain cloud turns grey and rumbles.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.aiClouds;
  const stage = document.getElementById("stage");
  const need  = cfg.clouds.filter(c => c.ai).length;
  const hud   = new Hud(document.getElementById("hud"), {
    title: "Cloud Slice", steps: need, lives: 0
  });

  const TINTS = ["t-pink", "t-gold", "t-green", "t-blue", "t-plum"];
  const LANES = 5;
  const laneBusy = new Array(LANES).fill(0);

  let coloured = 0, score = 0, ink = 0, mistakes = 0, combo = 0;
  let paused = false, over = false;

  stage.innerHTML =
    '<div class="skyfield" id="sky">' +
      '<div class="sun"></div>' +
      '<div class="haze h1"></div><div class="haze h2"></div><div class="haze h3"></div>' +
    '</div>';

  const sky = document.getElementById("sky");
  readout();

  /* ---------- a blade trail follows the pointer ---------- */
  sky.addEventListener("pointermove", e => {
    if (paused || over) return;
    const b = sky.getBoundingClientRect();
    const dot = document.createElement("i");
    dot.className = "blade";
    dot.style.left = (e.clientX - b.left) + "px";
    dot.style.top  = (e.clientY - b.top) + "px";
    sky.appendChild(dot);
    setTimeout(() => dot.remove(), 330);
  });

  /* ---------- send the clouds across, one per free lane ---------- */
  const queue = shuffle(cfg.clouds);
  let next = 0;
  const spawner = setInterval(() => {
    if (over || next >= queue.length) return clearInterval(spawner);
    launch(queue[next++]);
  }, 1100);
  launch(queue[next++]);

  function freeLane(){
    let best = 0, oldest = Infinity;
    for (let i = 0; i < LANES; i++){
      if (laneBusy[i] < oldest){ oldest = laneBusy[i]; best = i; }
    }
    laneBusy[best] = Date.now();
    return best;
  }

  function readout(){
    hud.chip("score", "SCORE <b>" + String(score).padStart(5, "0") + "</b>");
    hud.chip("left",  "AI CLOUDS <b>" + (need - coloured) + "</b>");
  }

  function launch(c){
    if (over) return;
    const lane = freeLane();
    const el = document.createElement("div");
    el.className = "cloud";
    el.innerHTML = '<span class="c-tick">✓</span><span class="c-text">' + c.word.charAt(0).toUpperCase() + c.word.slice(1) + '</span>';
    el.style.top = (6 + lane * 17) + "%";
    el.style.animationDuration = (11 + Math.random() * 4) + "s";
    sky.appendChild(el);

    const item = { el, data: c, done: false };
    const hit = () => { if (!paused && !over) slice(item); };
    el.addEventListener("pointerenter", hit);
    el.addEventListener("click", hit);
    el.addEventListener("animationend", () => {
      el.remove();
      /* the sky never empties: any cloud you have not dealt with sails round again */
      if (!item.done && !over) setTimeout(() => launch(c), 400 + Math.random() * 600);
    });
  }

  /* ---------- colouring a cloud ---------- */
  function slice(item){
    if (item.done || over) return;
    const c = item.data;
    item.done = true;

    if (c.ai){
      Sfx.play("win");
      combo++;
      const gain = 300 * Math.max(1, combo);
      score += gain; ink += 20; coloured++;
      hud.win(); hud.addXp(20, null); hud.advance(); readout();

      item.el.classList.add("coloured", TINTS[coloured % TINTS.length]);
      burst(item.el, true);
      floatScore(item.el, "+" + gain + (combo > 1 ? "  ×" + combo : ""));

      if (coloured === need) return finish();
    } else {
      Sfx.play("bad");
      combo = 0;
      mistakes++; hud.streak = 0; hud.paint();
      item.el.classList.add("rain");
      burst(item.el, false);
      paused = true;
      popup({
        ok: false,
        title: "Rain cloud!",
        text: "<b>" + c.word + "</b> does not have the <b>ai</b> sound.<br>" +
              "Listen for the <b>ai</b> in rail, sail and main.",
        onClose(){ paused = false; }
      });
    }
  }

  /* ---------- effects ---------- */
  function burst(el, good){
    const r = el.getBoundingClientRect();
    const tones = good ? ["#fff","#ffe08a","#8fd0ee","#ff9cc6"] : ["#8b93a1","#6b7280","#aab2bd"];
    for (let i = 0; i < 16; i++){
      const s = document.createElement("i");
      s.className = "spark";
      s.style.left = (r.left + r.width / 2) + "px";
      s.style.top  = (r.top + r.height / 2) + "px";
      s.style.background = tones[i % tones.length];
      s.style.setProperty("--dx", (Math.random() * 220 - 110) + "px");
      s.style.setProperty("--dy", (Math.random() * 180 - 90) + "px");
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 800);
    }
  }

  function floatScore(el, text){
    const b = sky.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const p = document.createElement("div");
    p.className = "score-pop";
    p.textContent = text;
    p.style.left = (r.left + r.width / 2 - b.left) + "px";
    p.style.top  = (r.top - b.top) + "px";
    sky.appendChild(p);
    setTimeout(() => p.remove(), 900);
  }

  function finish(){
    over = true;
    setTimeout(() => {
      const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
      showResult(stage, {
        gameId: "clouds", xp: ink, stars,
        total: coloured + "/" + need,
        nextHref: "duck.html", nextLabel: "🐦 Next game ›"
      });
    }, 900);
  }
})();

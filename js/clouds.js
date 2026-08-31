/* ==========================================================
   SHELF 4 · CLOUD SLICE   (workbook p.25)
   Pattern: Fruit-Ninja style slicing. Clouds drift across the
   sky; swipe (or click) only the ones carrying an 'ai' word.
   Slicing a wrong cloud rains on you; missing an 'ai' cloud
   sends it round again.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.aiClouds;
  const stage = document.getElementById("stage");
  const need  = cfg.clouds.filter(c => c.ai).length;
  const hud   = new Hud(document.getElementById("hud"), {
    title: "Cloud Slice", steps: need, lives: 0
  });

  let sliced = 0, score = 0, ink = 0, mistakes = 0, paused = false, over = false;
  const live = [];

  stage.innerHTML =
    '<div class="skyfield" id="sky"><canvas id="trail"></canvas></div>';

  const sky = document.getElementById("sky");
  readout();

  shuffle(cfg.clouds).forEach((c, n) => setTimeout(() => launch(c), n * 900));

  function readout(){
    hud.chip("score", "SCORE <b>" + String(score).padStart(5, "0") + "</b>");
    hud.chip("left",  "AI CLOUDS <b>" + (need - sliced) + "</b>");
  }

  function launch(c){
    if (over) return;
    const el = document.createElement("div");
    el.className = "cloud";
    el.innerHTML = '<span>' + c.word + '</span>';
    el.style.top = (8 + Math.random() * 62) + "%";
    el.style.animationDuration = (9 + Math.random() * 5) + "s";
    sky.appendChild(el);
    const item = { el, data: c, gone: false };
    live.push(item);

    el.addEventListener("pointerenter", () => { if (!paused) slice(item); });
    el.addEventListener("click", () => { if (!paused) slice(item); });
    el.addEventListener("animationend", () => {
      if (item.gone) return;
      el.remove();
      if (c.ai && !over){                      /* an 'ai' cloud escaped — send it back */
        setTimeout(() => launch(c), 400);
      }
    });
  }

  function slice(item){
    if (item.gone || over) return;
    item.gone = true;
    const c = item.data;

    if (c.ai){
      Sfx.play("win");
      item.el.classList.add("cut");
      setTimeout(() => item.el.remove(), 500);
      const streak = hud.win();
      sliced++; score += 300 * streak; ink += 20;
      hud.addXp(20, null); hud.advance(); readout();
      puff(item.el, true);
      if (sliced === need) return finish();
    } else {
      Sfx.play("bad");
      mistakes++; hud.streak = 0; hud.paint();
      item.el.classList.add("rain");
      paused = true;
      puff(item.el, false);
      popup({
        ok: false,
        title: "Rain cloud!",
        text: "<b>" + c.word + "</b> does not have the <b>ai</b> sound.",
        onClose(){
          paused = false;
          item.el.remove();
        }
      });
    }
  }

  function puff(el, good){
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 12; i++){
      const s = document.createElement("i");
      s.className = "spark";
      s.style.left = (r.left + r.width / 2) + "px";
      s.style.top  = (r.top + r.height / 2) + "px";
      s.style.background = good ? ["#fff","#bfe9ff","#7ec8ec"][i % 3] : "#7a6a55";
      s.style.setProperty("--dx", (Math.random() * 180 - 90) + "px");
      s.style.setProperty("--dy", (Math.random() * 160 - 80) + "px");
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 800);
    }
  }

  function finish(){
    over = true;
    setTimeout(() => {
      const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
      showResult(stage, {
        gameId: "clouds", xp: ink, stars,
        total: sliced + "/" + need,
        nextHref: "duck.html", nextLabel: "🐦 Next game ›"
      });
    }, 700);
  }
})();

/* ==========================================================
   SHELF 2 · III — NAME CATCHER  (workbook p.14, activity III)
   Pattern: falling-objects catcher (Kaboom / Egg Catch). Words
   drop from the sky; slide the basket under the three proper
   nouns that belong to the common noun and let the rest fall.
   Move with ← → , the mouse, or by dragging.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.nounCatch;
  const stage = document.getElementById("stage");
  const hud   = new Hud(document.getElementById("hud"), {
    title: "Name Catcher", steps: cfg.rounds.length, lives: 0
  });

  let round = 0, caught = 0, score = 0, ink = 0, mistakes = 0;
  let basketX = 50, drops = [], timer = null, spawner = null, over = false;

  function render(){
    const r = cfg.rounds[round];
    caught = 0; drops = [];
    stage.innerHTML =
      '<p class="crush-hint">' + cfg.hint + '</p>' +
      '<div class="target-word">' + r.emoji + ' &nbsp;<b>' + r.common + '</b>' +
        '<span>catch <b class="got">0</b>/3 names</span></div>' +
      '<div class="sky" id="sky">' +
        '<div class="basket" id="basket">🧺</div>' +
      '</div>';

    const sky = document.getElementById("sky");
    sky.addEventListener("pointermove", e => {
      const b = sky.getBoundingClientRect();
      basketX = Math.max(6, Math.min(94, (e.clientX - b.left) / b.width * 100));
      place();
    });
    place();
    start();
  }

  function place(){
    const b = document.getElementById("basket");
    if (b) b.style.left = basketX + "%";
  }

  function start(){
    const r = cfg.rounds[round];
    const pool = shuffle(r.right.map(w => ({ w, good:true }))
                 .concat(r.wrong.map(w => ({ w, good:false }))));
    let n = 0;
    clearInterval(spawner); clearInterval(timer);

    spawner = setInterval(() => {
      if (n >= pool.length){ clearInterval(spawner); return; }
      spawn(pool[n++]);
    }, 1100);
    spawn(pool[n++]);

    timer = setInterval(tick, 30);
  }

  function spawn(item){
    const sky = document.getElementById("sky");
    if (!sky) return;
    const el = document.createElement("div");
    el.className = "drop" + (item.good ? "" : " bad-drop");
    el.textContent = item.w;
    el.style.left = (10 + Math.random() * 76) + "%";
    el.style.top = "-8%";
    sky.appendChild(el);
    drops.push({ el, y: -8, x: parseFloat(el.style.left), good: item.good, word: item.w, dead: false });
  }

  function tick(){
    const sky = document.getElementById("sky");
    if (!sky) return;
    drops.forEach(d => {
      if (d.dead) return;
      d.y += 0.75;
      d.el.style.top = d.y + "%";

      /* basket zone */
      if (d.y > 74 && d.y < 90 && Math.abs(d.x - basketX) < 13){
        d.dead = true; d.el.remove();
        collect(d);
      } else if (d.y > 104){
        d.dead = true; d.el.remove();
        if (d.good) miss(d);            /* a needed name hit the floor */
      }
    });
  }

  function collect(d){
    if (d.good){
      caught++; score += 200; ink += 12;
      hud.win(); hud.addXp(12, null);
      const got = stage.querySelector(".got");
      if (got) got.textContent = caught;
      burst(true);
      if (caught === 3) roundWon();
    } else {
      mistakes++; hud.streak = 0; hud.paint();
      burst(false);
      pause();
      popup({
        ok: false,
        title: "Not a name!",
        text: "<b>" + d.word + "</b> is a common noun, not a name for " +
              cfg.rounds[round].common + ".",
        onClose(){ resume(); }
      });
    }
  }

  function miss(d){
    mistakes++;
    hud.streak = 0; hud.paint();
    pause();
    popup({
      ok: false,
      title: "It slipped past!",
      text: "<b>" + d.word + "</b> was one of the names. It will fall again — get under it!",
      onClose(){ respawn(d.word); resume(); }
    });
  }

  function respawn(word){ spawn({ w: word, good: true }); }
  function pause(){ clearInterval(timer); timer = null; }
  function resume(){ if (!timer && !over) timer = setInterval(tick, 30); }

  function burst(good){
    const b = document.getElementById("basket");
    if (!b) return;
    b.classList.add(good ? "yay" : "oops");
    setTimeout(() => b.classList.remove("yay", "oops"), 320);
  }

  function roundWon(){
    clearInterval(spawner); pause();
    hud.advance();
    const last = round + 1 >= cfg.rounds.length;
    popup({
      ok: true,
      title: "Basket full!",
      text: "You caught all three names for <b>" + cfg.rounds[round].common + "</b>.",
      onClose(){
        if (last) return finish();
        round++; render();
      }
    });
  }

  function finish(){
    over = true;
    clearInterval(spawner); clearInterval(timer);
    const stars = mistakes === 0 ? 3 : mistakes <= 3 ? 2 : 1;
    showResult(stage, {
      gameId: "catch", xp: ink, stars,
      total: cfg.rounds.length + "/" + cfg.rounds.length,
      nextHref: "../index.html", nextLabel: "📚 Shelf ›"
    });
  }

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft"){ basketX = Math.max(6, basketX - 7); place(); }
    if (e.key === "ArrowRight"){ basketX = Math.min(94, basketX + 7); place(); }
  });

  render();
})();

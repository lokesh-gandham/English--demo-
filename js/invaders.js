/* ==========================================================
   SHELF 4 · LETTER INVADERS   (workbook p.24, spell well)
   Pattern: Space Invaders. Letter aliens march down the sky.
   Look at the picture and blast the letters in the right order
   to spell the 'ai' word. A wrong shot bounces off the shield.
   Controls: ← → move the ship, SPACE fires, or tap an alien.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.aiSpell;
  const list  = cfg.words;
  const stage = document.getElementById("stage");
  const hud   = new Hud(document.getElementById("hud"), {
    title: "Letter Invaders", steps: list.length, lives: 0
  });

  const EXTRA = "begkoprstu".split("");
  let i = 0, pos = 0, shipX = 50, score = 0, ink = 0, mistakes = 0, busy = false;
  let march = null;

  function sfx(kind){
    try{
      const ac = sfx.ac || (sfx.ac = new (window.AudioContext || window.webkitAudioContext)());
      if (ac.state === "suspended") ac.resume();
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      o.connect(g); g.connect(ac.destination);
      if (kind === "laser"){ o.type = "square"; o.frequency.setValueAtTime(1200, t);
        o.frequency.exponentialRampToValueAtTime(300, t + .18); }
      else if (kind === "boom"){ o.type = "triangle"; o.frequency.setValueAtTime(420, t);
        o.frequency.exponentialRampToValueAtTime(70, t + .3); }
      else { o.type = "sawtooth"; o.frequency.setValueAtTime(160, t);
        o.frequency.exponentialRampToValueAtTime(80, t + .25); }
      g.gain.setValueAtTime(.13, t); g.gain.exponentialRampToValueAtTime(.001, t + .3);
      o.start(t); o.stop(t + .32);
    } catch(e){}
  }

  function render(){
    const w = list[i];
    pos = 0;
    const letters = shuffle(
      w.word.split("").concat(shuffle(EXTRA).slice(0, Math.max(3, 9 - w.word.length)))
    );

    stage.innerHTML =
      '<div class="invader-top">' +
        '<span class="slots-row">' +
          w.word.split("").map((c, n) =>
            '<span class="lslot" data-n="' + n + '"></span>').join("") +
        '</span>' +
      '</div>' +
      '<div class="space" id="space">' +
        '<div class="pic-hero"><img src="' + w.img + '" alt=""></div>' +
        '<div class="fleet">' +
          letters.map((c, n) =>
            '<button class="alien" data-c="' + c + '" style="animation-delay:' + (n * .18) + 's">' +
              '<span class="ltr">' + c.toUpperCase() + '</span>' +
            '</button>').join("") +
        '</div>' +
        '<div class="laser" id="laser"></div>' +
        '<div class="ship" id="ship">' +
          '<span class="s-barrel"></span>' +
          '<span class="s-body"></span>' +
          '<span class="s-glow"></span>' +
        '</div>' +
      '</div>' +
      '<div class="pad">' +
        '<button class="ctrl" id="mL">◂ MOVE</button>' +
        '<button class="ctrl plunge" id="fire">⚡ FIRE</button>' +
        '<button class="ctrl" id="mR">MOVE ▸</button>' +
      '</div>';

    document.getElementById("mL").onclick   = () => move(-8);
    document.getElementById("mR").onclick   = () => move(8);
    document.getElementById("fire").onclick = fireAtNearest;
    stage.querySelectorAll(".alien").forEach(a => a.onclick = () => shoot(a));

    place(); readout();
  }

  function readout(){
    hud.chip("score", "SCORE <b>" + String(score).padStart(5, "0") + "</b>");
    hud.chip("word",  "WORD <b>" + (i + 1) + "/" + list.length + "</b>");
  }

  function place(){
    const ship = document.getElementById("ship");
    if (ship) ship.style.left = shipX + "%";
  }

  function move(d){
    if (busy) return;
    shipX = Math.max(5, Math.min(95, shipX + d));
    place();
  }

  /* the FIRE button shoots whatever alien the ship is under */
  function fireAtNearest(){
    if (busy) return;
    const space = document.getElementById("space").getBoundingClientRect();
    const x = space.left + space.width * shipX / 100;
    let best = null, bestD = 1e9;
    stage.querySelectorAll(".alien:not(.dead)").forEach(a => {
      const r = a.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - x);
      if (d < bestD){ bestD = d; best = a; }
    });
    if (best) shoot(best);
  }

  function shoot(alien){
    if (busy || alien.classList.contains("dead")) return;
    busy = true;
    sfx("laser");

    const space = document.getElementById("space").getBoundingClientRect();
    const a = alien.getBoundingClientRect();
    shipX = (a.left + a.width / 2 - space.left) / space.width * 100;
    place();

    const laser = document.getElementById("laser");
    laser.style.left = shipX + "%";
    laser.style.height = (space.bottom - a.bottom) + "px";
    laser.classList.add("on");
    setTimeout(() => laser.classList.remove("on"), 220);

    setTimeout(() => hit(alien), 230);
  }

  function hit(alien){
    const w = list[i].word;
    const c = alien.dataset.c;

    if (c === w[pos]){
      sfx("boom");
      alien.classList.add("dead");
      const slot = stage.querySelector('.lslot[data-n="' + pos + '"]');
      slot.textContent = c.toUpperCase();
      slot.classList.add("set");
      pos++;
      score += 120; ink += 8;
      hud.addXp(8, null); readout();

      if (pos === w.length){
        const streak = hud.win();
        score += 400 * streak;
        hud.advance(); confetti(22);
        const last = i + 1 >= list.length;
        popup({
          ok: true,
          title: "WORD CLEARED!",
          text: "<b>" + w + "</b> — hear the <b>ai</b> sound." +
                (streak > 1 ? "<br>🔥 " + streak + " in a row" : ""),
          onClose(){
            busy = false;
            if (last) return finish();
            i++; render();
          }
        });
        return;
      }
      busy = false;
    } else {
      sfx("bad");
      mistakes++; hud.streak = 0; hud.paint();
      alien.classList.add("shielded");
      setTimeout(() => alien.classList.remove("shielded"), 500);
      popup({
        ok: false,
        title: "Shield up!",
        text: "That is not the next letter.<br>You need letter <b>" + (pos + 1) + "</b> of <b>" +
              w.length + "</b> — the word starts with <b>" + w[0] + "</b>.",
        onClose(){ busy = false; }
      });
    }
  }

  function finish(){
    clearInterval(march);
    const stars = mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1;
    showResult(stage, {
      gameId: "invaders", xp: ink, stars,
      total: list.length + "/" + list.length,
      nextHref: "clouds.html", nextLabel: "☁️ Next game ›"
    });
  }

  document.addEventListener("keydown", e => {
    if (document.querySelector(".modal")) return;
    if (e.key === "ArrowLeft"){ e.preventDefault(); move(-8); }
    if (e.key === "ArrowRight"){ e.preventDefault(); move(8); }
    if (e.key === " "){ e.preventDefault(); fireAtNearest(); }
  });

  render();
})();

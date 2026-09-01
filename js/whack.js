/* ==========================================================
   SHELF 2 · III — MOLE WHACK   (workbook p.14, activity III)
   Arcade whack-a-mole. A wooden mallet follows the pointer and
   swings on every click; moles pop out of the burrows holding
   word signs. Smash the three names that belong to the common
   noun — the hedgehogs carry common nouns, leave them alone.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.nounCatch;
  const stage = document.getElementById("stage");
  const hud   = new Hud(document.getElementById("hud"), {
    title: "Mole Whack", steps: cfg.rounds.length, lives: 0
  });

  const HOLES = 6;
  let round = 0, hitCount = 0, score = 0, ink = 0, mistakes = 0, combo = 0;
  let timer = null, paused = false, over = false;
  let hitWords = new Set();

  function sfx(kind){
    try{
      const ac = sfx.ac || (sfx.ac = new (window.AudioContext || window.webkitAudioContext)());
      if (ac.state === "suspended") ac.resume();
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      o.connect(g); g.connect(ac.destination);
      if (kind === "swing"){ o.type = "sine"; o.frequency.setValueAtTime(900, t);
        o.frequency.exponentialRampToValueAtTime(300, t + .09);
        g.gain.setValueAtTime(.05, t); g.gain.exponentialRampToValueAtTime(.001, t + .1);
        o.start(t); o.stop(t + .11); return; }
      if (kind === "bonk"){ o.type = "square"; o.frequency.setValueAtTime(190, t);
        o.frequency.exponentialRampToValueAtTime(60, t + .18); g.gain.setValueAtTime(.18, t); }
      else if (kind === "pop"){ o.type = "triangle"; o.frequency.setValueAtTime(520, t);
        o.frequency.exponentialRampToValueAtTime(900, t + .12); g.gain.setValueAtTime(.09, t); }
      else { o.type = "sawtooth"; o.frequency.setValueAtTime(300, t);
        o.frequency.exponentialRampToValueAtTime(100, t + .3); g.gain.setValueAtTime(.13, t); }
      g.gain.exponentialRampToValueAtTime(.001, t + .32);
      o.start(t); o.stop(t + .34);
    } catch(e){}
  }

  /* ---------- build ---------- */
  function render(){
    const r = cfg.rounds[round];
    hitCount = 0;
    stage.innerHTML =
      '<div class="whack-top">' +
        '<span class="wt-emoji">' + r.emoji + '</span>' +
        '<span class="wt-word"><span class="q-no">Q' + (round + 1) + '.</span> ' + r.common.charAt(0).toUpperCase() + r.common.slice(1) + '</span>' +
        '<span class="wt-goal">smash <b class="got">0</b> / 3 names</span>' +
        '<span class="combo" id="combo"></span>' +
      '</div>' +

      '<div class="yard" id="yard">' +
        '<div class="fence"></div>' +
        '<div class="holes">' +
          Array.from({length: HOLES}, (_, n) =>
            '<div class="burrow" data-h="' + n + '">' +
              '<span class="hole"></span>' +
              '<button class="mole" data-h="' + n + '">' +
                '<span class="face"></span>' +
                '<span class="sign"></span>' +
              '</button>' +
              '<span class="hole-lip"></span>' +
            '</div>').join("") +
        '</div>' +
        '<div class="mallet" id="mallet">🔨</div>' +
      '</div>';

    const yard   = document.getElementById("yard");
    const mallet = document.getElementById("mallet");

    yard.addEventListener("pointermove", e => {
      const b = yard.getBoundingClientRect();
      mallet.style.left = (e.clientX - b.left) + "px";
      mallet.style.top  = (e.clientY - b.top) + "px";
    });
    yard.addEventListener("pointerdown", () => {
      sfx("swing");
      mallet.classList.add("swing");
      setTimeout(() => mallet.classList.remove("swing"), 260);
    });

    stage.querySelectorAll(".mole").forEach(m => m.onclick = () => whack(m));
    readout();
    clearInterval(timer);
    timer = setInterval(pop, 1200);
    pop(); setTimeout(pop, 260);
  }

  function readout(){
    hud.chip("score", "SCORE <b>" + String(score).padStart(5, "0") + "</b>");
    hud.chip("round", "ROUND <b>" + (round + 1) + "/" + cfg.rounds.length + "</b>");
  }

  function showCombo(){
    const el = document.getElementById("combo");
    if (!el) return;
    if (combo > 1){
      el.textContent = "×" + combo + " COMBO";
      el.classList.add("on");
      setTimeout(() => el.classList.remove("on"), 900);
    } else el.textContent = "";
  }

  /* ---------- moles ---------- */
  function pop(){
    if (paused || over) return;
    const r = cfg.rounds[round];
    const free = [...stage.querySelectorAll(".mole")].filter(m => !m.classList.contains("up"));
    if (!free.length) return;

    const mole = free[(Math.random() * free.length) | 0];
    const good = Math.random() < .55;
    const availRight = r.right.filter(w => !hitWords.has(w));
    const word = good
      ? (availRight.length ? availRight[(Math.random() * availRight.length) | 0] : r.wrong[(Math.random() * r.wrong.length) | 0])
      : r.wrong[(Math.random() * r.wrong.length) | 0];

    mole.dataset.good = good ? "1" : "0";
    mole.dataset.word = word;
    mole.querySelector(".sign").textContent = word.charAt(0).toUpperCase() + word.slice(1);
    mole.classList.toggle("spiky", !good);
    mole.classList.add("up");

    setTimeout(() => mole.classList.remove("up"), 1500 + Math.random() * 800);
  }

  function whack(mole){
    if (!mole.classList.contains("up") || paused || over) return;
    const good = mole.dataset.good === "1";
    const yard = document.getElementById("yard");

    mole.classList.remove("up");
    mole.classList.add(good ? "bonked" : "missed");
    setTimeout(() => mole.classList.remove("bonked", "missed"), 400);
    dust(mole);
    yard.classList.add("shake");
    setTimeout(() => yard.classList.remove("shake"), 240);

    if (good){
      sfx("bonk");
      combo++;
      hitWords.add(mole.dataset.word);
      const streak = hud.win();
      hitCount++; score += 250 * Math.max(1, combo); ink += 15;
      hud.addXp(15, null); readout(); showCombo();
      const got = stage.querySelector(".got");
      if (got) got.textContent = hitCount;
      shout(mole, combo > 1 ? "BONK ×" + combo + "!" : "BONK!", true);
      if (hitCount >= 3) return roundWon();
    } else {
      sfx("ouch");
      combo = 0;
      mistakes++; hud.streak = 0; hud.paint(); showCombo();
      shout(mole, "OUCH!", false);
      paused = true;
      popup({
        ok: false,
        title: "Wrong mole!",
        text: "<b>" + mole.dataset.word + "</b> is a common noun — not a name for " +
              cfg.rounds[round].common + ".",
        onClose(){ paused = false; }
      });
    }
  }

  /* ---------- impact effects ---------- */
  function shout(mole, text, good){
    const b = document.createElement("div");
    b.className = "bonk" + (good ? "" : " bad");
    b.textContent = text;
    const r = mole.getBoundingClientRect();
    b.style.left = (r.left + r.width / 2) + "px";
    b.style.top  = (r.top - 6) + "px";
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 800);
  }

  function dust(mole){
    const r = mole.getBoundingClientRect();
    for (let i = 0; i < 10; i++){
      const s = document.createElement("i");
      s.className = "spark";
      s.style.left = (r.left + r.width / 2) + "px";
      s.style.top  = (r.bottom - 12) + "px";
      s.style.background = ["#d9c39a","#b79a6a","#8a6f45"][i % 3];
      s.style.setProperty("--dx", (Math.random() * 170 - 85) + "px");
      s.style.setProperty("--dy", (-30 - Math.random() * 90) + "px");
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 750);
    }
  }

  function roundWon(){
    paused = true;
    clearInterval(timer);
    hud.advance();
    hud.record("Three proper nouns for " + cfg.rounds[round].common, [...hitWords].join(", "));
    const last = round + 1 >= cfg.rounds.length;
    popup({
      ok: true,
      title: "Round cleared!",
      text: "You smashed all three names for <b>" + cfg.rounds[round].common + "</b>.",
      onClose(){
        paused = false;
        if (last) return finish();
        round++; combo = 0; hitWords = new Set(); render();
      }
    });
  }

  function finish(){
    over = true; clearInterval(timer);
    const stars = mistakes === 0 ? 3 : mistakes <= 3 ? 2 : 1;
    showResult(stage, {
      gameId: "whack", xp: ink, stars,
      total: cfg.rounds.length + "/" + cfg.rounds.length,
      nextHref: "../index.html", nextLabel: "📚 Shelf ›"
    });
  }

  render();
})();

/* ==========================================================
   SHELF 2 · III — MOLE WHACK   (workbook p.14, activity III)
   Pattern: Whack-a-Mole. Moles pop out of the burrows holding
   words. Smash only the three names that belong to the common
   noun — hit a common noun and the mole laughs at you.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.nounCatch;
  const stage = document.getElementById("stage");
  const hud   = new Hud(document.getElementById("hud"), {
    title: "Mole Whack", steps: cfg.rounds.length, lives: 0
  });

  const HOLES = 6;
  let round = 0, hitCount = 0, score = 0, ink = 0, mistakes = 0;
  let timer = null, paused = false, over = false;

  function sfx(kind){
    try{
      const ac = sfx.ac || (sfx.ac = new (window.AudioContext || window.webkitAudioContext)());
      if (ac.state === "suspended") ac.resume();
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      o.connect(g); g.connect(ac.destination);
      if (kind === "bonk"){ o.type = "square"; o.frequency.setValueAtTime(180, t);
        o.frequency.exponentialRampToValueAtTime(60, t + .18); g.gain.setValueAtTime(.16, t);
        g.gain.exponentialRampToValueAtTime(.001, t + .2); o.start(t); o.stop(t + .22); }
      else { o.type = "sawtooth"; o.frequency.setValueAtTime(300, t);
        o.frequency.exponentialRampToValueAtTime(110, t + .3); g.gain.setValueAtTime(.12, t);
        g.gain.exponentialRampToValueAtTime(.001, t + .32); o.start(t); o.stop(t + .34); }
    } catch(e){}
  }

  function render(){
    const r = cfg.rounds[round];
    hitCount = 0;
    stage.innerHTML =
      '<div class="target-word">' + r.emoji + ' &nbsp;<b>' + r.common + '</b>' +
        '<span>smash <b class="got">0</b>/3 names</span></div>' +
      '<div class="field-grass" id="grass">' +
        Array.from({length: HOLES}, (_, n) =>
          '<div class="burrow" data-h="' + n + '">' +
            '<div class="mound"></div>' +
            '<button class="mole" data-h="' + n + '"><span class="face">🐹</span><span class="word"></span></button>' +
          '</div>').join("") +
      '</div>';

    stage.querySelectorAll(".mole").forEach(m => m.onclick = () => whack(m));
    readout();
    clearInterval(timer);
    timer = setInterval(pop, 850);
    pop();
  }

  function readout(){
    hud.chip("score", "SCORE <b>" + String(score).padStart(5, "0") + "</b>");
    hud.chip("round", "ROUND <b>" + (round + 1) + "/" + cfg.rounds.length + "</b>");
  }

  function pop(){
    if (paused || over) return;
    const r = cfg.rounds[round];
    const free = [...stage.querySelectorAll(".mole")].filter(m => !m.classList.contains("up"));
    if (!free.length) return;

    const mole = free[(Math.random() * free.length) | 0];
    const good = Math.random() < .55;
    const word = good
      ? r.right[(Math.random() * r.right.length) | 0]
      : r.wrong[(Math.random() * r.wrong.length) | 0];

    mole.dataset.good = good ? "1" : "0";
    mole.dataset.word = word;
    mole.querySelector(".word").textContent = word;
    mole.querySelector(".face").textContent = good ? "🐹" : "🦔";
    mole.classList.add("up");

    setTimeout(() => mole.classList.remove("up"), 1500 + Math.random() * 700);
  }

  function whack(mole){
    if (!mole.classList.contains("up") || paused || over) return;
    const good = mole.dataset.good === "1";
    mole.classList.remove("up");

    if (good){
      sfx("bonk");
      const streak = hud.win();
      hitCount++; score += 250 * streak; ink += 15;
      hud.addXp(15, null); readout();
      const got = stage.querySelector(".got");
      if (got) got.textContent = hitCount;
      bonk(mole, true);
      if (hitCount >= 3) return roundWon();
    } else {
      sfx("miss");
      mistakes++; hud.streak = 0; hud.paint();
      bonk(mole, false);
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

  function bonk(mole, good){
    const b = document.createElement("div");
    b.className = "bonk" + (good ? "" : " bad");
    b.textContent = good ? "BONK!" : "OOPS!";
    const r = mole.getBoundingClientRect();
    b.style.left = (r.left + r.width / 2) + "px";
    b.style.top  = (r.top - 10) + "px";
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 700);
  }

  function roundWon(){
    paused = true;
    clearInterval(timer);
    hud.advance();
    const last = round + 1 >= cfg.rounds.length;
    popup({
      ok: true,
      title: "All three smashed!",
      text: "You found every name for <b>" + cfg.rounds[round].common + "</b>.",
      onClose(){
        paused = false;
        if (last) return finish();
        round++; render();
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

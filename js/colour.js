/* ==========================================================
   SHELF 2 · CANDY COLOUR CRUSH
   Show What You Know · Activity I — colour every proper noun
   in the colour of its common noun. Colour all three of a set
   and they crush like candy.
   Tap a candy then a jar, or tap a jar then a candy.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.colour;
  const stage = document.getElementById("stage");
  const hud   = new Hud(document.getElementById("hud"), {
    title: "Candy Colour Crush", steps: cfg.jars.length, lives: 0
  });

  const colourOf = {};
  cfg.jars.forEach(j => colourOf[j.key] = j.colour);

  let picked = null, armedJar = null, score = 0, ink = 0, mistakes = 0;
  let crushedSets = 0;
  const total = cfg.candies.length;
  const state = cfg.candies.map(c => ({ ...c, set: c.done ? c.key : null }));
  let solved = state.filter(c => c.set).length;      /* the one done for you */

  /* ---------- sound ---------- */
  let ac = null;
  function sfx(kind){
    try{
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === "suspended") ac.resume();
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      o.connect(g); g.connect(ac.destination);
      if (kind === "pick"){
        o.type = "sine"; o.frequency.setValueAtTime(720, t);
        g.gain.setValueAtTime(.07, t); g.gain.exponentialRampToValueAtTime(.001, t + .1);
        o.start(t); o.stop(t + .11);
      } else if (kind === "good"){
        o.type = "triangle"; o.frequency.setValueAtTime(700, t);
        o.frequency.setValueAtTime(950, t + .08);
        g.gain.setValueAtTime(.13, t); g.gain.exponentialRampToValueAtTime(.001, t + .22);
        o.start(t); o.stop(t + .24);
      } else if (kind === "crush"){
        o.type = "square"; o.frequency.setValueAtTime(520, t);
        o.frequency.exponentialRampToValueAtTime(1600, t + .3);
        g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + .35);
        o.start(t); o.stop(t + .36);
      } else if (kind === "bad"){
        o.type = "sawtooth"; o.frequency.setValueAtTime(220, t);
        o.frequency.exponentialRampToValueAtTime(90, t + .3);
        g.gain.setValueAtTime(.11, t); g.gain.exponentialRampToValueAtTime(.001, t + .32);
        o.start(t); o.stop(t + .34);
      }
    } catch(e){}
  }

  /* ---------- build ---------- */
  function render(){
    stage.innerHTML =
      '<div class="crush">' +
        '<p class="crush-hint">' + cfg.hint + '</p>' +
        '<div class="jars">' +
          cfg.jars.map(j =>
            '<div class="jar ' + j.colour + '" data-key="' + j.key + '">' +
              '<small>common noun</small>' + j.label +
              '<span class="count" data-count="' + j.key + '">0/3</span>' +
            '</div>').join("") +
        '</div>' +
        '<div class="board">' +
          state.map((c, i) =>
            '<div class="candy' + (c.set ? " " + colourOf[c.set] + " solved" : "") + '" data-i="' + i + '">' +
              c.word + (c.set ? '<span class="tick">✓</span>' : "") +
            '</div>').join("") +
        '</div>' +
      '</div>';

    stage.querySelectorAll(".jar").forEach(j => j.onclick = () => tapJar(j));
    stage.querySelectorAll(".candy").forEach(c => c.onclick = () => tapCandy(c));
    counts();
    readout();
  }

  function readout(){
    hud.chip("score", "SCORE <b>" + String(score).padStart(5, "0") + "</b>");
    hud.chip("left",  "LEFT <b>" + (total - solved) + "</b>");
  }

  function counts(){
    cfg.jars.forEach(j => {
      const n = state.filter(c => c.set === j.key).length;
      const el = stage.querySelector('[data-count="' + j.key + '"]');
      if (el) el.textContent = n + "/3";
    });
  }

  /* ---------- interaction ---------- */
  function tapCandy(el){
    const i = +el.dataset.i;
    if (state[i].set) return;                       // already coloured
    if (armedJar){ colour(i, armedJar, el); return; }
    sfx("pick");
    stage.querySelectorAll(".candy.picked").forEach(c => c.classList.remove("picked"));
    if (picked === i){ picked = null; return; }
    picked = i; el.classList.add("picked");
  }

  function tapJar(jarEl){
    const key = jarEl.dataset.key;
    if (picked !== null){
      colour(picked, key, stage.querySelector('.candy[data-i="' + picked + '"]'));
      return;
    }
    sfx("pick");
    stage.querySelectorAll(".jar.armed").forEach(j => j.classList.remove("armed"));
    if (armedJar === key){ armedJar = null; return; }
    armedJar = key; jarEl.classList.add("armed");
  }

  function clearPicks(){
    picked = null;
    stage.querySelectorAll(".candy.picked").forEach(c => c.classList.remove("picked"));
  }

  /* ---------- colouring ---------- */
  function colour(i, key, el){
    const c = state[i];

    if (c.key === key){
      sfx("good");
      c.set = key; solved++;
      score += 200; ink += 15;
      hud.addXp(15, null);
      el.classList.remove("picked");
      el.classList.add(colourOf[key], "solved");
      el.insertAdjacentHTML("beforeend", '<span class="tick">✓</span>');
      clearPicks(); counts(); readout();
      checkSet(key);
    } else {
      sfx("bad");
      mistakes++;
      hud.streak = 0; hud.paint();
      el.classList.add("wrong");
      setTimeout(() => el.classList.remove("wrong"), 420);
      clearPicks();
      popup({
        ok: false,
        title: "Not that colour!",
        text: "<b>" + c.word + "</b> is not a " + key + ".<br>Try another jar."
      });
    }
  }

  /* ---------- a full set of three crushes ---------- */
  function checkSet(key){
    const group = state.map((c, i) => ({ c, i })).filter(o => o.c.key === key);
    if (!group.every(o => o.c.set)) return;

    crushedSets++;
    const streak = hud.win();
    const bonus  = 500 * streak;
    score += bonus; ink += 40;
    hud.addXp(40, null);
    hud.advance();
    readout();
    sfx("crush");

    group.forEach(o => {
      const el = stage.querySelector('.candy[data-i="' + o.i + '"]');
      if (!el) return;
      burst(el, colourOf[key]);
      el.classList.add("crushed");
      /* candy pops, then settles back coloured so the answer stays on show */
      setTimeout(() => { el.classList.remove("crushed"); el.classList.add("settled"); }, 500);
    });

    const label = cfg.jars.find(j => j.key === key).label;
    const done  = crushedSets === cfg.jars.length;
    setTimeout(() => popup({
      ok: true,
      title: "CRUSH!  +" + bonus,
      text: "All three <b>" + label + "</b> names are coloured." +
            (streak > 1 ? "<br>×" + streak + " combo!" : ""),
      onClose(){ if (done) finish(); }
    }), 520);
  }

  function burst(el, colourName){
    const tones = {
      green: ["#8fd06a","#c9edb2","#4fae3f"],
      pink : ["#ff8fbe","#ffcfe4","#e0468a"],
      blue : ["#7ec8ec","#c6e9fa","#2f9fd0"]
    }[colourName];
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 16; i++){
      const s = document.createElement("i");
      s.className = "spark";
      s.style.left = (r.left + r.width / 2) + "px";
      s.style.top  = (r.top + r.height / 2) + "px";
      s.style.background = tones[i % tones.length];
      s.style.setProperty("--dx", (Math.random() * 200 - 100) + "px");
      s.style.setProperty("--dy", (Math.random() * 200 - 120) + "px");
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 800);
    }
  }

  function finish(){
    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    showResult(stage, {
      gameId: "colour", xp: ink, stars,
      total: solved + "/" + total,
      nextHref: "match.html", nextLabel: "🪶 Shelf 1 ›"
    });
  }

  render();
})();

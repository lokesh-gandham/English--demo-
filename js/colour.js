/* ==========================================================
   SHELF 2 · CANDY COLOUR CRUSH   (workbook p.14, activity I)
   Colour every proper noun in the colour of its common noun.
   The board explains itself: three glass jars fill up with the
   names you drop in, Timmy already sits in the blue jar as the
   worked example, and a step banner shows 1) pick a name
   2) pick its jar.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.colour;
  const stage = document.getElementById("stage");
  const hud   = new Hud(document.getElementById("hud"), {
    title: "Candy Colour Crush", steps: cfg.jars.length, lives: 0
  });

  const colourOf = {}, labelOf = {};
  cfg.jars.forEach(j => { colourOf[j.key] = j.colour; labelOf[j.key] = j.label; });

  const state = cfg.candies.map(c => ({ ...c, set: c.done ? c.key : null }));
  const total = state.length;
  let solved  = state.filter(c => c.set).length;      /* the one done for you */
  let picked = null, score = 0, ink = 0, mistakes = 0, crushed = 0, busy = false;

  /* ---------- sound ---------- */
  function sfx(kind){
    try{
      const ac = sfx.ac || (sfx.ac = new (window.AudioContext || window.webkitAudioContext)());
      if (ac.state === "suspended") ac.resume();
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      o.connect(g); g.connect(ac.destination);
      if (kind === "pick"){ o.type = "sine"; o.frequency.setValueAtTime(760, t);
        g.gain.setValueAtTime(.07, t); g.gain.exponentialRampToValueAtTime(.001, t + .1);
        o.start(t); o.stop(t + .11); return; }
      if (kind === "good"){ o.type = "triangle"; o.frequency.setValueAtTime(700, t);
        o.frequency.setValueAtTime(1000, t + .08); }
      else if (kind === "crush"){ o.type = "square"; o.frequency.setValueAtTime(520, t);
        o.frequency.exponentialRampToValueAtTime(1700, t + .3); }
      else { o.type = "sawtooth"; o.frequency.setValueAtTime(230, t);
        o.frequency.exponentialRampToValueAtTime(90, t + .3); }
      g.gain.setValueAtTime(.13, t); g.gain.exponentialRampToValueAtTime(.001, t + .32);
      o.start(t); o.stop(t + .34);
    } catch(e){}
  }

  /* ---------- build ---------- */
  stage.innerHTML =
    '<div class="steps" id="steps">' +
      '<span class="step s1"><i>1</i> Tap a name</span>' +
      '<span class="step-arrow">➜</span>' +
      '<span class="step s2"><i>2</i> Tap the jar it belongs to</span>' +
    '</div>' +

    '<div class="jars">' +
      cfg.jars.map(j =>
        '<button class="jar ' + j.colour + '" data-key="' + j.key + '">' +
          '<span class="jar-lid"></span>' +
          '<span class="jar-body">' +
            '<span class="jar-liquid" data-liquid="' + j.key + '"></span>' +
            '<span class="jar-names" data-names="' + j.key + '"></span>' +
            '<span class="jar-shine"></span>' +
          '</span>' +
          '<span class="jar-tag">' + j.label.charAt(0).toUpperCase() + j.label.slice(1) + ' <b data-count="' + j.key + '">0/3</b></span>' +
        '</button>').join("") +
    '</div>' +

    '<div class="tray">' +
      '<span class="tray-cap">proper nouns waiting to be coloured</span>' +
      '<div class="candies">' +
        state.map((c, i) =>
          '<button class="candy' + (c.set ? " done " + colourOf[c.set] : "") + '" data-i="' + i + '">' +
            '<span class="c-word">' + c.word + '</span>' +
            (c.set ? '<span class="c-tick">✓</span><span class="c-eg">example</span>' : "") +
          '</button>').join("") +
      '</div>' +
    '</div>';

  stage.querySelectorAll(".jar").forEach(j => j.onclick = () => tapJar(j));
  stage.querySelectorAll(".candy").forEach(c => c.onclick = () => tapCandy(c));

  state.forEach(c => { if (c.set) addName(c.set, c.word); });
  counts(); readout(); step(1);

  /* ---------- ui helpers ---------- */
  function readout(){
    hud.chip("score", "SCORE <b>" + String(score).padStart(5, "0") + "</b>");
    hud.chip("left",  "LEFT <b>" + (total - solved) + "</b>");
  }

  function counts(){
    cfg.jars.forEach(j => {
      const n   = state.filter(c => c.set === j.key).length;
      const el  = stage.querySelector('[data-count="' + j.key + '"]');
      const liq = stage.querySelector('[data-liquid="' + j.key + '"]');
      if (el)  el.textContent = n + "/3";
      if (liq) liq.style.height = (10 + n * 30) + "%";
    });
  }

  function addName(key, word){
    const box = stage.querySelector('[data-names="' + key + '"]');
    if (!box) return;
    const chip = document.createElement("span");
    chip.className = "n-chip";
    chip.textContent = word;
    box.appendChild(chip);
  }

  function step(n){
    const s = document.getElementById("steps");
    s.classList.toggle("on1", n === 1);
    s.classList.toggle("on2", n === 2);
    stage.querySelectorAll(".jar").forEach(j => j.classList.toggle("waiting", n === 2));
  }

  /* ---------- interaction ---------- */
  function tapCandy(el){
    if (busy) return;
    const i = +el.dataset.i;
    if (state[i].set) return;
    sfx("pick");
    stage.querySelectorAll(".candy.picked").forEach(c => c.classList.remove("picked"));
    if (picked === i){ picked = null; step(1); return; }
    picked = i;
    el.classList.add("picked");
    step(2);
  }

  function tapJar(jarEl){
    if (busy) return;
    if (picked === null){
      jarEl.classList.add("nudge");
      setTimeout(() => jarEl.classList.remove("nudge"), 400);
      return;
    }
    drop(picked, jarEl.dataset.key, jarEl);
  }

  /* ---------- dropping a name into a jar ---------- */
  function drop(i, key, jarEl){
    const c  = state[i];
    const el = stage.querySelector('.candy[data-i="' + i + '"]');

    if (c.key === key){
      busy = true;
      sfx("good");
      fly(el, jarEl, () => {
        c.set = key; solved++;
        score += 200; ink += 15;
        hud.addXp(15, null);
        el.classList.remove("picked");
        el.classList.add("done", colourOf[key]);
        el.insertAdjacentHTML("beforeend", '<span class="c-tick">✓</span>');
        addName(key, c.word);
        counts(); readout();
        picked = null; step(1);
        busy = false;
        checkSet(key);
      });
    } else {
      sfx("bad");
      mistakes++; hud.streak = 0; hud.paint();
      el.classList.add("wrong");
      jarEl.classList.add("nudge");
      setTimeout(() => { el.classList.remove("wrong"); jarEl.classList.remove("nudge"); }, 450);
      popup({
        ok: false,
        title: "Wrong jar!",
        text: "<b>" + c.word + "</b> is not the name of a <b>" + labelOf[key] + "</b>.<br>" +
              "Look at the three jars and pick another one."
      });
    }
  }

  /* the tapped name flies into the jar */
  function fly(el, jarEl, done){
    const a = el.getBoundingClientRect();
    const b = jarEl.getBoundingClientRect();
    const ghost = el.cloneNode(true);
    ghost.className = "candy flying";
    ghost.style.left   = a.left + "px";
    ghost.style.top    = a.top + "px";
    ghost.style.width  = a.width + "px";
    ghost.style.height = a.height + "px";
    document.body.appendChild(ghost);
    requestAnimationFrame(() => {
      ghost.style.transform =
        "translate(" + (b.left + b.width / 2 - a.left - a.width / 2) + "px," +
                       (b.top + b.height * .55 - a.top - a.height / 2) + "px) scale(.35)";
      ghost.style.opacity = ".25";
    });
    setTimeout(() => { ghost.remove(); done(); }, 460);
  }

  /* ---------- a full jar ---------- */
  function checkSet(key){
    const group = state.filter(c => c.key === key);
    if (!group.every(c => c.set)) return;

    crushed++;
    const streak = hud.win();
    const bonus  = 500 * streak;
    score += bonus; ink += 40;
    hud.addXp(40, null); hud.advance(); readout();
    sfx("crush");

    const jarEl = stage.querySelector('.jar[data-key="' + key + '"]');
    jarEl.classList.add("full");
    burst(jarEl, colourOf[key]);

    const done = crushed === cfg.jars.length;
    setTimeout(() => popup({
      ok: true,
      title: "JAR FULL!  +" + bonus,
      text: "All three <b>" + labelOf[key] + "</b> names are coloured." +
            (streak > 1 ? "<br>×" + streak + " combo!" : ""),
      onClose(){ if (done) finish(); }
    }), 320);
  }

  function burst(el, colourName){
    const tones = {
      green: ["#8fd06a","#c9edb2","#4fae3f"],
      pink : ["#ff8fbe","#ffcfe4","#e0468a"],
      blue : ["#7ec8ec","#c6e9fa","#2f9fd0"]
    }[colourName];
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 18; i++){
      const s = document.createElement("i");
      s.className = "spark";
      s.style.left = (r.left + r.width / 2) + "px";
      s.style.top  = (r.top + r.height / 2) + "px";
      s.style.background = tones[i % tones.length];
      s.style.setProperty("--dx", (Math.random() * 220 - 110) + "px");
      s.style.setProperty("--dy", (Math.random() * 200 - 130) + "px");
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 800);
    }
  }

  function finish(){
    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    showResult(stage, {
      gameId: "colour", xp: ink, stars,
      total: solved + "/" + total,
      nextHref: "sort.html", nextLabel: "📦 Next game ›"
    });
  }
})();

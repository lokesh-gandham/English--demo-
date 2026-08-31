/* ==========================================================
   SHELF 4 · VERB SHOOTING GALLERY   (workbook p.51)
   Pattern: Duck Hunt. Two verb ducks fly across the range for
   each subject. Move the crosshair and shoot the duck carrying
   the correct verb.
   Controls: mouse to aim + click, or ← → and SPACE.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.verbs;
  const rows  = cfg.rows;
  const stage = document.getElementById("stage");
  const hud   = new Hud(document.getElementById("hud"), {
    title: "Verb Gallery", steps: rows.length, lives: 0
  });

  let i = 0, aim = 0, shots = 0, score = 0, ink = 0, mistakes = 0, busy = false;

  function sfx(kind){
    try{
      const ac = sfx.ac || (sfx.ac = new (window.AudioContext || window.webkitAudioContext)());
      if (ac.state === "suspended") ac.resume();
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      o.connect(g); g.connect(ac.destination);
      if (kind === "bang"){ o.type = "square"; o.frequency.setValueAtTime(700, t);
        o.frequency.exponentialRampToValueAtTime(90, t + .16); }
      else { o.type = "sawtooth"; o.frequency.setValueAtTime(200, t);
        o.frequency.exponentialRampToValueAtTime(70, t + .3); }
      g.gain.setValueAtTime(.15, t); g.gain.exponentialRampToValueAtTime(.001, t + .3);
      o.start(t); o.stop(t + .32);
    } catch(e){}
  }

  function render(){
    const r = rows[i];
    stage.innerHTML =
      '<div class="gallery-top"><span class="q-no">Q' + (i + 1) + '.</span> Which verb goes with <b>' + r.subject + '</b>?</div>' +
      '<div class="gallery" id="gal">' +
        '<div class="hills"></div>' +
        r.options.map((o, n) =>
          '<div class="duck" data-n="' + n + '" style="top:' + (18 + n * 34) + '%;' +
               'animation-duration:' + (7 + n * 1.5) + 's; animation-delay:' + (-1.6 - n * 2.6) + 's">' +
            '<span class="wing">🦆</span><span class="verb">' + r.subject + " " + o + '</span>' +
          '</div>').join("") +
        '<div class="crosshair" id="cross">⊕</div>' +
        '<div class="flash" id="flash"></div>' +
      '</div>' +
      '<div class="pad">' +
        '<button class="ctrl" id="up">▲ TARGET</button>' +
        '<button class="ctrl plunge" id="fire">🔫 SHOOT</button>' +
        '<button class="ctrl" id="down">TARGET ▼</button>' +
      '</div>';

    document.getElementById("up").onclick   = () => setAim(aim - 1);
    document.getElementById("down").onclick = () => setAim(aim + 1);
    document.getElementById("fire").onclick = fire;
    stage.querySelectorAll(".duck").forEach(d =>
      d.onclick = () => { if (!busy){ setAim(+d.dataset.n); fire(); } });

    setAim(0); readout();
  }

  function readout(){
    hud.chip("score", "SCORE <b>" + String(score).padStart(5, "0") + "</b>");
    hud.chip("shots", "SHOTS <b>" + shots + "</b>");
    hud.chip("row",   "ROW <b>" + (i + 1) + "/" + rows.length + "</b>");
  }

  function setAim(n){
    aim = Math.max(0, Math.min(rows[i].options.length - 1, n));
    const ducks = stage.querySelectorAll(".duck");
    ducks.forEach((d, k) => d.classList.toggle("locked", k === aim));
    const cross = document.getElementById("cross");
    const gal   = document.getElementById("gal").getBoundingClientRect();
    const d     = ducks[aim].getBoundingClientRect();
    cross.style.top  = (d.top + d.height / 2 - gal.top) + "px";
    cross.style.left = (d.left + d.width / 2 - gal.left) + "px";
  }

  function fire(){
    if (busy) return;
    busy = true; shots++; readout();
    sfx("bang");
    const flash = document.getElementById("flash");
    flash.classList.add("on");
    setTimeout(() => flash.classList.remove("on"), 120);

    const duck = stage.querySelector('.duck[data-n="' + aim + '"]');
    const r = rows[i];

    setTimeout(() => {
      if (aim === r.answer){
        const streak = hud.win();
        score += 350 * streak; ink += 22;
        hud.addXp(22, null); hud.advance();
        duck.classList.add("shot");
        const last = i + 1 >= rows.length;
        popup({
          ok: true,
          title: "HIT!",
          text: "<b>" + r.subject + " " + r.options[aim] + "</b> is correct." +
                (streak > 1 ? "<br>🔥 " + streak + " in a row" : ""),
          onClose(){
            busy = false;
            if (last) return finish();
            i++; render();
          }
        });
      } else {
        sfx("miss");
        mistakes++; hud.streak = 0; hud.paint();
        duck.classList.add("dodge");
        setTimeout(() => duck.classList.remove("dodge"), 600);
        popup({
          ok: false,
          title: "It flew away!",
          text: "<b>" + r.subject + " " + r.options[aim] + "</b> is not right.<br>" +
                "Add <b>s</b> only for he, she or one person — never after I, you, we or many.",
          onClose(){ busy = false; }
        });
      }
    }, 220);
  }

  function finish(){
    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    showResult(stage, {
      gameId: "duck", xp: ink, stars,
      total: rows.length + "/" + rows.length,
      nextHref: "../index.html", nextLabel: "📚 Shelf ›"
    });
  }

  document.addEventListener("keydown", e => {
    if (document.querySelector(".modal")) return;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft"){ e.preventDefault(); setAim(aim - 1); }
    if (e.key === "ArrowDown" || e.key === "ArrowRight"){ e.preventDefault(); setAim(aim + 1); }
    if (e.key === " "){ e.preventDefault(); fire(); }
  });

  render();
})();

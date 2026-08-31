/* ==========================================================
   SHELF 3 · WORD SLINGSHOT   (workbook p.21, activity II)
   Pattern: Angry-Birds style launcher. Pull the slingshot to
   set the angle, fire the stone at the answer crate. A hit
   smashes it; a miss bounces off and you reload.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.poemMcq;
  const qs    = cfg.questions;
  const stage = document.getElementById("stage");
  const hud   = new Hud(document.getElementById("hud"), {
    title: "Word Slingshot", steps: qs.length, lives: 0
  });

  let i = 0, aim = 1, shots = 0, score = 0, ink = 0, mistakes = 0, busy = false;

  function render(){
    const q = qs[i];
    stage.innerHTML =
      '<p class="big-q">' + q.text.replace(/___/g, '<span class="blank"></span>') + '</p>' +
      '<div class="sling-field" id="field">' +
        '<div class="crates">' +
          q.options.map((o, n) =>
            '<div class="crate-target" data-n="' + n + '"><span>' + o + '</span></div>').join("") +
        '</div>' +
        '<div class="sling">' +
          '<div class="band" id="band"></div>' +
          '<div class="stone" id="stone">🪨</div>' +
          '<div class="fork">🪝</div>' +
        '</div>' +
      '</div>' +
      '<div class="pad">' +
        '<button class="ctrl" id="aimL">◀ AIM</button>' +
        '<button class="ctrl plunge" id="fire">🎯 FIRE</button>' +
        '<button class="ctrl" id="aimR">AIM ▶</button>' +
      '</div>';

    document.getElementById("aimL").onclick = () => setAim(aim - 1);
    document.getElementById("aimR").onclick = () => setAim(aim + 1);
    document.getElementById("fire").onclick = fire;
    stage.querySelectorAll(".crate-target").forEach(c =>
      c.onclick = () => { if (!busy){ setAim(+c.dataset.n); fire(); } });

    setAim(aim); readout();
  }

  function readout(){
    hud.chip("score", "SCORE <b>" + String(score).padStart(5, "0") + "</b>");
    hud.chip("shots", "SHOTS <b>" + shots + "</b>");
  }

  function setAim(n){
    aim = Math.max(0, Math.min(2, n));
    stage.querySelectorAll(".crate-target").forEach((c, k) => c.classList.toggle("aimed", k === aim));
    const band = document.getElementById("band");
    if (band) band.style.transform = "rotate(" + (-18 + aim * 18) + "deg)";
  }

  function fire(){
    if (busy) return;
    busy = true; shots++; readout();
    const stone  = document.getElementById("stone");
    const target = stage.querySelector('.crate-target[data-n="' + aim + '"]');
    const f = document.getElementById("field").getBoundingClientRect();
    const t = target.getBoundingClientRect();
    const s = stone.getBoundingClientRect();

    stone.style.transition = "transform .55s cubic-bezier(.3,-0.3,.5,1)";
    stone.style.transform = "translate(" + (t.left + t.width / 2 - s.left - s.width / 2) + "px," +
                            (t.top + t.height / 2 - s.top - s.height / 2) + "px) rotate(540deg)";

    setTimeout(() => resolve(target), 580);
  }

  function resolve(target){
    const q = qs[i];

    if (aim === q.answer){
      const streak = hud.win();
      score += 450 * streak; ink += 28;
      hud.addXp(28, null); hud.advance();
      target.classList.add("smashed");
      confetti(20);
      const last = i + 1 >= qs.length;
      popup({
        ok: true,
        title: "SMASH!",
        text: "<b>" + q.options[aim] + "</b> is correct." +
              (streak > 1 ? "<br>🔥 " + streak + " in a row" : ""),
        onClose(){
          busy = false;
          if (last) return finish();
          i++; render();
        }
      });
    } else {
      mistakes++; hud.streak = 0; hud.paint();
      target.classList.add("bounced");
      setTimeout(() => target.classList.remove("bounced"), 500);
      popup({
        ok: false,
        title: "It bounced off!",
        text: "<b>" + q.options[aim] + "</b> is not the right word.<br>Reload and aim again.",
        onClose(){
          busy = false;
          const stone = document.getElementById("stone");
          stone.style.transition = "transform .3s ease";
          stone.style.transform = "none";
        }
      });
    }
  }

  function finish(){
    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    showResult(stage, {
      gameId: "sling", xp: ink, stars,
      total: qs.length + "/" + qs.length,
      nextHref: "rhyme.html", nextLabel: "🎈 Next game ›"
    });
  }

  document.addEventListener("keydown", e => {
    if (document.querySelector(".modal")) return;
    if (e.key === "ArrowLeft"){ e.preventDefault(); setAim(aim - 1); }
    if (e.key === "ArrowRight"){ e.preventDefault(); setAim(aim + 1); }
    if (e.key === " "){ e.preventDefault(); fire(); }
  });

  render();
})();

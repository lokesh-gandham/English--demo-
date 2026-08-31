/* ==========================================================
   SHELF 3 · WORD DROP   (workbook p.16, reader's room)
   Pattern: Tetris-style block drop. A word block slides across
   the top — move it with ← → and press DROP (or tap a slot) to
   land it in a blank. A wrong word bounces out.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.blanks;
  const stage = document.getElementById("stage");
  const hud   = new Hud(document.getElementById("hud"), {
    title: "Word Drop", steps: cfg.lines.length, lives: 0
  });

  const bank = shuffle(cfg.lines.map(l => l.answer).concat(cfg.extras));
  let block = 0, filled = 0, slot = 0, score = 0, ink = 0, mistakes = 0, busy = false;

  function render(){
    stage.innerHTML =
      '<p class="crush-hint">Read the paragraph, then drop each word into its blank.</p>' +
      '<div class="para">' + cfg.paragraph + '</div>' +
      '<div class="dropzone">' +
        '<div class="falling" id="falling">' + bank[block] + '</div>' +
      '</div>' +
      '<div class="slots" id="slots">' +
        cfg.lines.map((l, n) =>
          '<div class="slot' + (l.filled ? " filled" : "") + '" data-n="' + n + '">' +
            '<span class="s-before">' + l.before + '</span>' +
            '<span class="s-gap">' + (l.filled || "&nbsp;") + '</span>' +
            '<span class="s-after">' + l.after + '</span>' +
          '</div>').join("") +
      '</div>' +
      '<div class="pad">' +
        '<button class="ctrl" id="bLeft">◀</button>' +
        '<button class="ctrl plunge" id="bDrop">⬇ DROP</button>' +
        '<button class="ctrl" id="bRight">▶</button>' +
        '<button class="ctrl" id="bSkip">↻ NEXT WORD</button>' +
      '</div>';

    document.getElementById("bLeft").onclick  = () => move(-1);
    document.getElementById("bRight").onclick = () => move(1);
    document.getElementById("bDrop").onclick  = drop;
    document.getElementById("bSkip").onclick  = nextWord;
    stage.querySelectorAll(".slot").forEach(s =>
      s.onclick = () => { slot = +s.dataset.n; aim(); drop(); });

    aim(); readout();
  }

  function readout(){
    hud.chip("score", "SCORE <b>" + String(score).padStart(5, "0") + "</b>");
    hud.chip("left",  "BLANKS <b>" + (cfg.lines.length - filled) + "</b>");
  }

  function aim(){
    const slots = stage.querySelectorAll(".slot");
    slots.forEach((s, n) => s.classList.toggle("aimed", n === slot));
    const f = document.getElementById("falling");
    if (f) f.style.left = (12 + slot * (76 / Math.max(1, cfg.lines.length - 1))) + "%";
  }

  function move(d){
    if (busy) return;
    slot = Math.max(0, Math.min(cfg.lines.length - 1, slot + d));
    aim();
  }

  function nextWord(){
    if (busy) return;
    let n = block;
    do { n = (n + 1) % bank.length; } while (used(bank[n]) && n !== block);
    block = n;
    const f = document.getElementById("falling");
    if (f) f.textContent = bank[block];
  }

  function used(w){ return cfg.lines.some(l => l.filled === w); }

  function drop(){
    if (busy) return;
    const line = cfg.lines[slot];
    if (line.filled) return;
    busy = true;
    const word = bank[block];
    const f = document.getElementById("falling");
    f.classList.add("dropping");

    setTimeout(() => {
      if (word === line.answer){
        const streak = hud.win();
        score += 300 * streak; ink += 20;
        hud.addXp(20, null); hud.advance();
        line.filled = word; filled++;
        const done = filled === cfg.lines.length;
        popup({
          ok: true,
          title: "Locked in!",
          text: "<b>" + word + "</b> fits that blank." +
                (streak > 1 ? "<br>🔥 " + streak + " in a row" : ""),
          onClose(){
            busy = false;
            if (done) return finish();
            nextFree(); render();
          }
        });
      } else {
        mistakes++; hud.streak = 0; hud.paint();
        popup({
          ok: false,
          title: "It bounced out!",
          text: "<b>" + word + "</b> does not fit there.<br>Read the sentence again and try another word.",
          onClose(){ busy = false; f.classList.remove("dropping"); }
        });
      }
    }, 420);
  }

  function nextFree(){
    const n = cfg.lines.findIndex(l => !l.filled);
    slot = n < 0 ? 0 : n;
    if (used(bank[block])) nextWord();
  }

  function finish(){
    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    showResult(stage, {
      gameId: "blanks", xp: ink, stars,
      total: filled + "/" + cfg.lines.length,
      nextHref: "memory.html", nextLabel: "🃏 Next game ›"
    });
  }

  document.addEventListener("keydown", e => {
    if (document.querySelector(".modal")) return;
    if (e.key === "ArrowLeft"){ e.preventDefault(); move(-1); }
    if (e.key === "ArrowRight"){ e.preventDefault(); move(1); }
    if (e.key === "ArrowUp"){ e.preventDefault(); nextWord(); }
    if (e.key === " " || e.key === "ArrowDown"){ e.preventDefault(); drop(); }
  });

  render();
})();

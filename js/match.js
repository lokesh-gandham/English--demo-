/* ==========================================================
   BOOK I — The Lost Dictionary
   Activity I : match the words with their correct meanings.
   Mechanic: drag a quill from a word to a meaning; a wet ink
   line follows the pointer and dries into place when correct.
   Tapping word then meaning works too (touch friendly).
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.match;
  const stage = document.getElementById("stage");
  const hud   = new Hud(document.getElementById("hud"), {
    title: "The Lost Dictionary", steps: cfg.pairs.length, lives: 3, lifeIcon: "🖋️"
  });

  const words    = shuffle(cfg.pairs);
  const meanings = shuffle(cfg.pairs);

  stage.innerHTML =
    '<div class="kicker">Activity I · Read and Reflect</div>' +
    '<h2>🪶 The Lost Dictionary</h2>' +
    '<p class="hint">Drag your quill from a word to its meaning — or tap one, then the other.</p>' +
    '<div class="inkboard" id="board">' +
      '<svg id="ink"></svg>' +
      '<div class="cols">' +
        '<div><div class="col-title">Words</div><div id="wordCol">' +
          words.map(p => '<div class="slip word" data-w="' + p.word + '">' + p.word +
                         '<span class="dot r"></span></div>').join("") +
        '</div></div>' +
        '<div><div class="col-title">Meanings</div><div id="meanCol">' +
          meanings.map(p => '<div class="slip meaning" data-w="' + p.word + '"><span class="dot l"></span>' +
                            p.meaning + '</div>').join("") +
        '</div></div>' +
      '</div>' +
    '</div>' +
    '<div class="feedback" id="fb">Five words lost their meanings. Link them all!</div>';

  const board = document.getElementById("board");
  const svg   = document.getElementById("ink");
  const fb    = document.getElementById("fb");

  let picked = null, temp = null, solved = 0, ink = 0, mistakes = 0, over = false;

  const say = (t, ok) => { fb.textContent = t; fb.className = "feedback " + (ok ? "good" : "bad"); };

  /* --- geometry: anchor point of a slip, in board coordinates --- */
  function anchor(slip){
    const b = board.getBoundingClientRect();
    const r = slip.getBoundingClientRect();
    const isWord = slip.classList.contains("word");
    return {
      x: (isWord ? r.right : r.left) - b.left,
      y: r.top + r.height / 2 - b.top
    };
  }

  function makePath(a, b, colour, wet){
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const mid = (a.x + b.x) / 2;
    p.setAttribute("d", "M " + a.x + " " + a.y + " C " + mid + " " + a.y + ", " + mid + " " + b.y + ", " + b.x + " " + b.y);
    p.setAttribute("stroke", colour);
    p.setAttribute("stroke-width", wet ? 4 : 5);
    p.setAttribute("fill", "none");
    p.setAttribute("stroke-linecap", "round");
    if (wet) p.setAttribute("stroke-dasharray", "8 7");
    svg.appendChild(p);
    return p;
  }

  /* --- selection + linking --- */
  function select(slip){
    if (picked) picked.classList.remove("sel");
    picked = slip;
    slip.classList.add("sel");
  }

  function clearTemp(){
    if (temp){ temp.remove(); temp = null; }
    document.querySelectorAll(".slip.hover-target").forEach(s => s.classList.remove("hover-target"));
  }

  function drop(target, ev){
    if (over || !picked || !target || target === picked) return;
    if (target.classList.contains("linked") || picked.classList.contains("linked")) return;
    // both slips must come from different columns
    if (target.classList.contains("word") === picked.classList.contains("word")){
      select(target); clearTemp(); return;
    }

    const word = picked.classList.contains("word") ? picked : target;
    const mean = picked.classList.contains("word") ? target : picked;

    if (word.dataset.w === mean.dataset.w){
      const streak = hud.win();
      const gain = 20 + (streak - 1) * 5;
      ink += gain;
      word.classList.remove("sel"); mean.classList.remove("sel");
      word.classList.add("linked"); mean.classList.add("linked");
      makePath(anchor(word), anchor(mean), "#1f8a7a", false);
      hud.addXp(gain, ev);
      hud.advance();
      say("Ink dried! “" + word.dataset.w + "” is back on the page." + (streak > 1 ? "  🔥 " + streak + " in a row!" : ""), true);
      picked = null; clearTemp();
      if (++solved === cfg.pairs.length){ over = true; setTimeout(finish, 900); }
    } else {
      mistakes++;
      const left = hud.hit();
      splat(target);
      target.classList.add("blot");
      picked.classList.add("blot");
      const old = picked;
      setTimeout(() => {
        target.classList.remove("blot");
        old.classList.remove("blot", "sel");
      }, 420);
      picked = null; clearTemp();
      say(left ? "Ink blot! That is not the meaning. " + left + " quill" + (left === 1 ? "" : "s") + " left."
               : "Out of quills — the page could not be finished.", false);
      if (!left){ over = true; setTimeout(finish, 900); }
    }
  }

  function splat(slip){
    const b = board.getBoundingClientRect();
    const r = slip.getBoundingClientRect();
    const s = document.createElement("div");
    s.className = "splat";
    s.style.left = (r.left - b.left + r.width * (.2 + Math.random() * .6)) + "px";
    s.style.top  = (r.top  - b.top  - 6) + "px";
    board.appendChild(s);
    setTimeout(() => s.remove(), 1400);
  }

  /* --- pointer handling: works for both drag and tap --- */
  board.addEventListener("pointerdown", e => {
    const slip = e.target.closest(".slip");
    if (!slip || slip.classList.contains("linked") || over) return;
    e.preventDefault();
    if (picked === slip){ slip.classList.remove("sel"); picked = null; clearTemp(); return; }
    // tap mode: a slip from the other column completes the link
    if (picked && slip.classList.contains("word") !== picked.classList.contains("word")){
      drop(slip, e);
      return;
    }
    select(slip);
  });

  board.addEventListener("pointermove", e => {
    if (!picked || over) return;
    const b = board.getBoundingClientRect();
    if (temp) temp.remove();
    temp = makePath(anchor(picked), { x:e.clientX - b.left, y:e.clientY - b.top }, "#7b3f2a", true);

    const under = document.elementFromPoint(e.clientX, e.clientY);
    const slip  = under && under.closest ? under.closest(".slip") : null;
    document.querySelectorAll(".slip.hover-target").forEach(s => s.classList.remove("hover-target"));
    if (slip && slip !== picked && !slip.classList.contains("linked") &&
        slip.classList.contains("word") !== picked.classList.contains("word")){
      slip.classList.add("hover-target");
    }
  });

  board.addEventListener("pointerup", e => {
    if (!picked || over) return;
    const under = document.elementFromPoint(e.clientX, e.clientY);
    const slip  = under && under.closest ? under.closest(".slip") : null;
    clearTemp();
    if (slip && slip !== picked) drop(slip, e);   // dragged onto a slip
  });

  /* redraw the dried lines if the page is resized */
  window.addEventListener("resize", () => {
    svg.innerHTML = "";
    document.querySelectorAll("#wordCol .slip.linked").forEach(w => {
      const m = document.querySelector('#meanCol .slip.linked[data-w="' + w.dataset.w + '"]');
      if (m) makePath(anchor(w), anchor(m), "#1f8a7a", false);
    });
  });

  function finish(){
    const stars = solved === cfg.pairs.length
      ? (mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1)
      : (solved >= 3 ? 1 : 0);
    showResult(stage, {
      gameId: "match", xp: ink, stars,
      total: solved + "/" + cfg.pairs.length,
      nextHref: "mcq.html", nextLabel: "🦉 Next book ›"
    });
  }
})();

/* ==========================================================
   BOOK II — The Story Thief
   Activity II : choose the correct option.
   Mechanic: a thief runs off with torn pages. Each correct
   option flies a page back into the book and pulls the thief
   closer; a wrong one (or a burnt-out lantern) lets him run.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.mcq;
  const stage = document.getElementById("stage");
  const qs    = cfg.questions;
  const hud   = new Hud(document.getElementById("hud"), {
    title: "The Story Thief", steps: qs.length, lives: 3, lifeIcon: "📄"
  });

  let i = 0, ink = 0, correct = 0, wrong = 0, locked = false;
  let timer = null, left = 0;

  function render(){
    const q = qs[i];
    const opts = q.options.map((text, n) =>
      '<button class="opt" data-n="' + n + '">' +
        '<span class="key">' + "ABC"[n] + '</span>' + text +
      '</button>').join("");

    stage.innerHTML =
      '<div class="kicker">Activity II · Read and Reflect</div>' +
      '<h2>🦉 The Story Thief</h2>' +
      '<p class="hint">Pick the right word to snatch the page back before the lantern burns out!</p>' +

      '<div class="chase">' +
        '<div class="road"></div>' +
        '<span class="runner" id="runner" style="transform:translateX(' + (correct * 60) + 'px)">🏃‍♂️</span>' +
        '<span class="pagesLeft" id="pages">' +
          qs.map((_, n) => '<span class="' + (n < correct ? "" : "gone") + '">📄</span>').join("") +
        '</span>' +
        '<span style="font-size:34px">🕵️</span>' +
      '</div>' +

      '<div class="lantern">' +
        '<span class="flame">🏮</span>' +
        '<span class="wick"><i id="wick"></i></span>' +
        '<b id="clock">' + cfg.seconds + 's</b>' +
      '</div>' +

      '<p class="q-text">Page ' + (i + 1) + ' of ' + qs.length + ' — ' + q.text.replace("___", '<span class="blank"></span>') + '</p>' +
      '<div class="opts">' + opts + '</div>' +
      '<div class="feedback" id="fb"></div>';

    stage.querySelectorAll(".opt").forEach(b =>
      b.addEventListener("click", ev => answer(parseInt(b.dataset.n, 10), b, ev)));

    startClock();
  }

  function startClock(){
    left = cfg.seconds * 10;                    // tenths of a second
    const wick  = document.getElementById("wick");
    const clock = document.getElementById("clock");
    clearInterval(timer);
    timer = setInterval(() => {
      left--;
      wick.style.width = (left / (cfg.seconds * 10) * 100) + "%";
      clock.textContent = Math.ceil(left / 10) + "s";
      if (left <= 0){ clearInterval(timer); timeUp(); }
    }, 100);
  }

  function timeUp(){
    if (locked) return;
    locked = true; wrong++;
    hud.hit();
    document.getElementById("runner").classList.add("hit");
    stage.querySelectorAll(".opt").forEach(b => {
      b.disabled = true;
      if (parseInt(b.dataset.n, 10) === qs[i].answer) b.classList.add("right");
    });
    say("The lantern burnt out — the thief kept that page!", false);
    next(1600);
  }

  function answer(n, btn, ev){
    if (locked) return;
    locked = true;
    clearInterval(timer);
    const q = qs[i];
    stage.querySelectorAll(".opt").forEach(b => b.disabled = true);

    if (n === q.answer){
      const streak = hud.win();
      const speed  = Math.round(left / 10);                 // seconds remaining
      const gain   = 25 + speed * 2 + (streak - 1) * 5;     // faster + streak = more ink
      ink += gain; correct++;
      btn.classList.add("right");
      hud.addXp(gain, ev);
      hud.advance();
      document.getElementById("runner").style.transform = "translateX(" + (correct * 60) + "px)";
      const pages = document.getElementById("pages").children;
      if (pages[correct - 1]) pages[correct - 1].classList.remove("gone");
      say("Page recovered! +" + gain + " ink" + (streak > 1 ? "  🔥 " + streak + " in a row!" : ""), true);
    } else {
      wrong++;
      hud.hit();
      btn.classList.add("wrongpick");
      document.getElementById("runner").classList.add("hit");
      stage.querySelectorAll(".opt").forEach(b => {
        if (parseInt(b.dataset.n, 10) === q.answer) b.classList.add("right");
      });
      say("The thief slipped away with that page!", false);
    }
    next(1700);
  }

  function say(text, ok){
    const fb = document.getElementById("fb");
    fb.textContent = text;
    fb.className = "feedback " + (ok ? "good" : "bad");
  }

  function next(delay){
    setTimeout(() => {
      locked = false;
      if (++i < qs.length && hud.lives > 0) render();
      else finish();
    }, delay);
  }

  function finish(){
    clearInterval(timer);
    const stars = correct === qs.length ? 3 : correct === qs.length - 1 ? 2 : correct >= 1 ? 1 : 0;
    showResult(stage, {
      gameId: "mcq", xp: ink, stars,
      total: correct + "/" + qs.length,
      nextHref: "match.html", nextLabel: "🪶 Play Book I ›"
    });
  }

  render();
})();

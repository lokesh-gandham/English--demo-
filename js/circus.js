/* ==========================================================
   SHELF 5 · CIRCUS STORY — Trapeze Catch   (workbook p.55)
   Fill-in-the-blank game with a swinging trapeze hero.
   The child picks the right acrobat card to fill each blank.
   Right/wrong popups with voice, final result.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.circus;
  const stage = document.getElementById("stage");
  const hud   = new Hud(document.getElementById("hud"), {
    title: "Circus Story", steps: cfg.sentences.length, lives: 0
  });

  let i = 0, score = 0, ink = 0, mistakes = 0, busy = false;
  const shuffledClues = shuffle(cfg.clueBox);
  const usedWords = new Set();
  const imgMap = {
    "clowns": "../assets/images/clawn.png",
    "unicycle": "../assets/images/unicycle.png",
    "gymnastics": "../assets/images/gymnastics.png",
    "canopy": "../assets/images/canopy.png"
  };

  function render(){
    const s = cfg.sentences[i];
    stage.innerHTML =
      '<div class="circus-wrap">' +
        '<div class="circus-stage">' +

          '<div class="circus-q">' +
            '<p class="big-q">' +
              '<span class="q-no">Q' + (i + 1) + '.</span> ' +
              s.before + ' <span class="blank" id="blankSlot"></span>' + s.after +
            '</p>' +
            '<div class="trapeze-rig" id="heroRig">' +
              '<div class="bar-rope"></div>' +
              '<div class="hero-acrobat">🤸</div>' +
            '</div>' +
          '</div>' +

          '<div class="acrobats-row" id="acrobatDeck">' +
            shuffledClues.map((w, n) =>
              '<div class="acrobat-card" data-n="' + n + '" data-word="' + w + '">' +
                '<img class="acrobat-icon" src="' + imgMap[w] + '" alt="' + w + '">' +
                '<span class="word-label">' + w.charAt(0).toUpperCase() + w.slice(1) + '</span>' +
              '</div>'
            ).join("") +
          '</div>' +

        '</div>' +
      '</div>';

    stage.querySelectorAll(".acrobat-card").forEach(c => c.onclick = () => answer(+c.dataset.n, c));
    hud.chip("score", "SCORE <b>" + String(score).padStart(5, "0") + "</b>");
    hud.chip("left", "WORDS <b>" + (cfg.sentences.length - i) + "</b>");
  }

  function answer(n, el){
    if (busy) return;
    busy = true;
    const s = cfg.sentences[i];
    const word = shuffledClues[n];
    const correct = word === s.blank;

    const hero = document.getElementById("heroRig");
    if (hero && el){
      const stageEl = el.closest(".circus-stage");
      const stageRect = stageEl.getBoundingClientRect();
      const cardRect = el.getBoundingClientRect();
      const targetX = cardRect.left + cardRect.width / 2 - stageRect.left;
      const targetY = cardRect.top - stageRect.top - 40;
      hero.style.transition = "none";
      hero.style.left = targetX + "px";
      hero.style.top = targetY + "px";
      hero.style.animation = "none";
      hero.offsetHeight;
      hero.style.transition = "left .35s ease-in, top .35s ease-in";
      setTimeout(() => {
        hero.style.transition = "left .5s ease-out, top .5s ease-out";
        hero.style.left = "50%";
        hero.style.top = "100%";
        hero.style.animation = "";
      }, 380);
    }

    if (correct){
      Sfx.play("good");
      const streak = hud.win();
      score += 300 * streak; ink += 20;
      hud.addXp(20, null); hud.advance();
      hud.record((s.before + " ___ " + s.after).trim(), word);
      el.classList.add("correct");
      usedWords.add(word);

      const slot = document.getElementById("blankSlot");
      slot.textContent = word.charAt(0).toUpperCase() + word.slice(1);
      slot.classList.add("filled");

      confetti(15);

      const last = i + 1 >= cfg.sentences.length;
      setTimeout(() => popup({
        ok: true,
        title: "Catch!",
        text: "<b>" + word.charAt(0).toUpperCase() + word.slice(1) + "</b> caught on the trapeze!" +
              (streak > 1 ? "<br>🔥 " + streak + " in a row" : ""),
        onClose(){
          busy = false;
          if (last) return finish();
          i++; render();
        }
      }), 600);
    } else {
      Sfx.play("bad");
      mistakes++; hud.streak = 0; hud.paint();
      el.classList.add("wrong");
      setTimeout(() => el.classList.remove("wrong"), 500);
      popup({
        ok: false,
        title: "Missed!",
        text: "<b>" + word.charAt(0).toUpperCase() + word.slice(1) + "</b> doesn't fit here.<br>Read the sentence again and catch another acrobat.",
        onClose(){ busy = false; }
      });
    }
  }

  function finish(){
    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    showResult(stage, {
      gameId: "circus", xp: ink, stars,
      total: cfg.sentences.length + "/" + cfg.sentences.length,
      nextHref: "../index.html", nextLabel: "📚 Shelf ›"
    });
  }

  render();
})();

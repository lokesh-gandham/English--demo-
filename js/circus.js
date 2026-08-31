/* ==========================================================
   SHELF 5 · CIRCUS STORY   (workbook p.55)
   Fill-in-the-blank game. A circus story with a clue box.
   The child picks the right word from the clue box to fill
   each blank. Right/wrong popups with voice, final result.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.circus;
  const stage = document.getElementById("stage");
  const hud   = new Hud(document.getElementById("hud"), {
    title: "Circus Story", steps: cfg.sentences.length, lives: 0
  });

  let i = 0, score = 0, ink = 0, mistakes = 0, busy = false;
  const shuffledClues = shuffle(cfg.clueBox);

  function render(){
    const s = cfg.sentences[i];
    stage.innerHTML =
      '<div class="circus-wrap">' +
        '<div class="circus-intro">' +
          '<p class="circus-story">' + cfg.intro + '</p>' +
          '<p class="circus-visit">' + cfg.story + '</p>' +
        '</div>' +

        '<div class="circus-cluebox">' +
          '<span class="cluebox-title">Clue Box</span>' +
          '<div class="cluebox-words">' +
            shuffledClues.map(w =>
              '<span class="clue-word" data-w="' + w + '">' + w.charAt(0).toUpperCase() + w.slice(1) + '</span>'
            ).join("") +
          '</div>' +
        '</div>' +

        '<div class="circus-q">' +
          '<p class="big-q">' +
            '<span class="q-no">Q' + (i + 1) + '.</span> ' +
            s.before + ' <span class="blank" id="blankSlot"></span>' + s.after +
          '</p>' +
        '</div>' +

        '<div class="circus-options">' +
          shuffledClues.map((w, n) =>
            '<button class="circus-opt" data-n="' + n + '">' +
              w.charAt(0).toUpperCase() + w.slice(1) +
            '</button>'
          ).join("") +
        '</div>' +
      '</div>';

    stage.querySelectorAll(".circus-opt").forEach(b => b.onclick = () => answer(+b.dataset.n, b));
    hud.chip("score", "SCORE <b>" + String(score).padStart(5, "0") + "</b>");
    hud.chip("left", "WORDS <b>" + (cfg.sentences.length - i) + "</b>");
  }

  function answer(n, el){
    if (busy) return;
    busy = true;
    const s = cfg.sentences[i];
    const word = shuffledClues[n];
    const correct = word === s.blank;

    if (correct){
      Sfx.play("good");
      const streak = hud.win();
      score += 300 * streak; ink += 20;
      hud.addXp(20, null); hud.advance();
      el.classList.add("correct");

      const slot = document.getElementById("blankSlot");
      slot.textContent = word.charAt(0).toUpperCase() + word.slice(1);
      slot.classList.add("filled");

      const last = i + 1 >= cfg.sentences.length;
      setTimeout(() => popup({
        ok: true,
        title: "Correct!",
        text: "<b>" + word.charAt(0).toUpperCase() + word.slice(1) + "</b> fits perfectly!" +
              (streak > 1 ? "<br>🔥 " + streak + " in a row" : ""),
        onClose(){
          busy = false;
          if (last) return finish();
          i++; render();
        }
      }), 500);
    } else {
      Sfx.play("bad");
      mistakes++; hud.streak = 0; hud.paint();
      el.classList.add("wrong");
      setTimeout(() => el.classList.remove("wrong"), 400);
      popup({
        ok: false,
        title: "Not quite!",
        text: "<b>" + word.charAt(0).toUpperCase() + word.slice(1) + "</b> doesn't fit here.<br>Read the sentence again and pick another word.",
        onClose(){ busy = false; }
      });
    }
  }

  function readSentence(){
    try{
      if (!window.speechSynthesis) return;
      speechSynthesis.cancel();
      const s = cfg.sentences[i];
      const text = s.before + " " + s.blank + " " + s.after;
      const u = new SpeechSynthesisUtterance(text);
      if (typeof VOICE !== "undefined" && VOICE) u.voice = VOICE;
      u.rate = .9; u.pitch = 1.05;
      speechSynthesis.speak(u);
    } catch(e){}
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

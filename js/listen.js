/* ==========================================================
   SHELF 3 · STORY CLIMB   (workbook p.15, listener's lab)
   A mountain climb. The radio plays the story about Rina and its
   speaker bars dance while it talks. Every right answer sends the
   climber up to the next ledge; the summit flag is the goal.
   ========================================================== */
(function(){
  const cfg   = GAME_DATA.listen;
  const qs    = cfg.questions;
  const stage = document.getElementById("stage");
  const hud   = new Hud(document.getElementById("hud"), {
    title: "Story Climb", steps: qs.length, lives: 0
  });

  let i = 0, score = 0, ink = 0, mistakes = 0, busy = false;

  /* ---------- the radio: play / pause the story ----------
     The button owns its own state, so a late onstart event from the
     speech engine can never overwrite a pause the child just made. */
  let storyState = "idle";                 /* idle | playing | paused */

  function paintRadio(){
    const r = document.getElementById("radio");
    if (!r) return;
    r.classList.toggle("playing", storyState === "playing");
    r.querySelector(".r-icon").textContent = storyState === "playing" ? "⏸" : "▶";
    r.querySelector(".r-text").textContent =
      storyState === "playing" ? "PAUSE THE STORY" :
      storyState === "paused"  ? "RESUME THE STORY" : "PLAY THE STORY";
  }

  function toggleStory(){
    try{
      if (!window.speechSynthesis) return;

      if (storyState === "playing"){
        speechSynthesis.pause();
        storyState = "paused"; paintRadio(); return;
      }
      if (storyState === "paused"){
        speechSynthesis.resume();
        storyState = "playing"; paintRadio(); return;
      }

      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(cfg.passage);
      u.rate = .88; u.pitch = 1.05;
      if (typeof VOICE !== "undefined" && VOICE) u.voice = VOICE;
      u.onend    = () => { storyState = "idle"; paintRadio(); };
      u.onerror  = () => { storyState = "idle"; paintRadio(); };
      speechSynthesis.speak(u);
      storyState = "playing"; paintRadio();
    } catch(e){}
  }

  function stopStory(){
    try{ speechSynthesis.cancel(); } catch(e){}
    storyState = "idle"; paintRadio();
  }

  function render(){
    const q = qs[i];
    stage.innerHTML =
      '<div class="mountain">' +

        '<div class="cliff">' +
          '<div class="summit"><span class="flag">🚩</span></div>' +
          '<div class="rope"></div>' +
          Array.from({length: qs.length}, (_, n) =>
            '<div class="ledge' + (n < i ? " passed" : n === i ? " next" : "") + '"' +
                 ' style="bottom:' + (18 + n * 19) + '%">' +
              '<span class="ledge-no">' + (n + 1) + '</span>' +
            '</div>').join("") +
          '<div class="climber" id="climber" style="bottom:' + (13 + i * 19) + '%">🧗</div>' +
        '</div>' +

        '<div class="climb-panel">' +
          '<button class="radio" id="radio">' +
            '<span class="r-icon">▶</span>' +
            '<span class="r-text">PLAY THE STORY</span>' +
            '<span class="bars"><i></i><i></i><i></i><i></i><i></i></span>' +
          '</button>' +
          '<p class="big-q">' + q.text.replace("___", '<span class="blank"></span>') + '</p>' +
          '<div class="rocks">' +
            q.options.map((o, n) =>
              '<button class="rock" data-n="' + n + '">' +
                '<span class="key">' + "abc"[n] + '</span>' + o +
              '</button>').join("") +
          '</div>' +
        '</div>' +
      '</div>';

    document.getElementById("radio").onclick = toggleStory;
    paintRadio();
    stage.querySelectorAll(".rock").forEach(b => b.onclick = () => answer(+b.dataset.n, b));
    hud.chip("score", "SCORE <b>" + String(score).padStart(5, "0") + "</b>");
    hud.chip("ledge", "LEDGE <b>" + (i + 1) + "/" + qs.length + "</b>");
  }

  function answer(n, el){
    if (busy) return;
    busy = true;
    const q = qs[i];
    const climber = document.getElementById("climber");

    if (n === q.answer){
      Sfx.play("win");
      const streak = hud.win();
      score += 350 * streak; ink += 22;
      hud.addXp(22, null); hud.advance();
      el.classList.add("right");
      if (climber){
        climber.classList.add("hop");
        climber.style.bottom = (13 + (i + 1) * 19) + "%";
        setTimeout(() => climber.classList.remove("hop"), 600);
      }
      puff(climber);
      const last = i + 1 >= qs.length;
      setTimeout(() => popup({
        ok: true,
        title: last ? "Summit reached!" : "Up you go!",
        text: "<b>" + q.options[n] + "</b> is right." +
              (streak > 1 ? "<br>🔥 " + streak + " in a row" : ""),
        onClose(){
          busy = false;
          if (last) return finish();
          i++; render();
        }
      }), 420);
    } else {
      Sfx.play("bad");
      mistakes++; hud.streak = 0; hud.paint();
      el.classList.add("crumble");
      if (climber) climber.classList.add("slip");
      setTimeout(() => {
        el.classList.remove("crumble");
        if (climber) climber.classList.remove("slip");
      }, 600);
      popup({
        ok: false,
        title: "Careful!",
        text: "That rock crumbled — it is not what the story said.<br>" +
              "Press <b>PLAY THE STORY</b> and listen once more.",
        onClose(){ busy = false; }
      });
    }
  }

  function puff(el){
    if (!el) return;
    const r = el.getBoundingClientRect();
    for (let k = 0; k < 10; k++){
      const s = document.createElement("i");
      s.className = "spark";
      s.style.left = (r.left + r.width / 2) + "px";
      s.style.top  = (r.bottom - 6) + "px";
      s.style.background = ["#e8ddc6","#c9b795","#9c8a68"][k % 3];
      s.style.setProperty("--dx", (Math.random() * 120 - 60) + "px");
      s.style.setProperty("--dy", (20 + Math.random() * 50) + "px");
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 700);
    }
  }

  function finish(){
    stopStory();
    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    showResult(stage, {
      gameId: "listen", xp: ink, stars,
      total: qs.length + "/" + qs.length,
      nextHref: "archery.html", nextLabel: "🏹 Next game ›"
    });
  }

  render();
})();

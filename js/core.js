/* ==========================================================
   Core helpers: saved progress, HUD, effects
   Shared by index.html and every game page.
   ========================================================== */
const Store = {
  KEY: "word-library-v1",
  read(){
    try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; }
    catch(e){ return {}; }
  },
  write(data){ try { localStorage.setItem(this.KEY, JSON.stringify(data)); } catch(e){} },
  game(id){ return this.read()[id] || { xp:0, stars:0, done:false }; },
  totalXp(){ return Object.values(this.read()).reduce((s,g)=> s + (g.xp||0), 0); },
  /* keeps the best result only */
  save(id, res){
    const d = this.read();
    const prev = d[id] || { xp:0, stars:0 };
    d[id] = { xp:Math.max(prev.xp, res.xp), stars:Math.max(prev.stars, res.stars), done:true };
    this.write(d);
  },
  reset(){ this.write({}); }
};

/* ---------- background alphabet ---------- */
function floaties(count){
  const box = document.getElementById("floaties");
  if (!box) return;
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ?!,.".split("");
  for (let i = 0; i < (count || 20); i++){
    const s = document.createElement("span");
    s.textContent = letters[(Math.random()*letters.length)|0];
    s.style.left = Math.random()*100 + "vw";
    s.style.fontSize = (24 + Math.random()*54) + "px";
    s.style.animationDuration = (18 + Math.random()*22) + "s";
    s.style.animationDelay = (-Math.random()*30) + "s";
    box.appendChild(s);
  }
}

/* ---------- little effects ---------- */
function popXp(amount, x, y){
  const el = document.createElement("div");
  el.className = "pop-xp";
  el.textContent = "+" + amount + " ink";
  el.style.left = (x - 34) + "px";
  el.style.top  = (y - 22) + "px";
  document.body.appendChild(el);
  setTimeout(()=> el.remove(), 1000);
}

function confetti(count){
  const colors = ["#e0a52b","#1f8a7a","#b8385a","#6b4a9c","#3d86c6","#f6c95a"];
  for (let i = 0; i < (count || 60); i++){
    const c = document.createElement("i");
    c.className = "confetti";
    c.style.left = Math.random()*100 + "vw";
    c.style.background = colors[(Math.random()*colors.length)|0];
    c.style.animationDuration = (1.6 + Math.random()*1.4) + "s";
    c.style.animationDelay = (Math.random()*.5) + "s";
    document.body.appendChild(c);
    setTimeout(()=> c.remove(), 3600);
  }
}

function shuffle(arr){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--){
    const j = (Math.random()*(i+1))|0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- shared HUD ---------- */
class Hud {
  constructor(root, opts){
    this.maxLives = opts.lives === undefined ? 3 : opts.lives;
    this.lives = this.maxLives;
    this.lifeIcon = opts.lifeIcon || "🩸";
    this.xp = 0; this.streak = 0; this.steps = opts.steps; this.step = 0;
    this.root = root;
    root.innerHTML =
      '<a class="back" href="../index.html"><span class="b-arrow">&#8249;</span> Shelf</a>' +
      '<span class="title">' + opts.title + '</span>' +
      '<span class="spacer"></span>' +
      (this.maxLives ? '<span class="chip" data-lives></span>' : "") +
      '<span class="chip">🔥 <b data-streak>0</b></span>' +
      '<span class="chip">🪶 <b data-xp>0</b> Ink</span>' +
      '<span class="chip timer-chip" data-timer>⏱ <b data-clock>2:00</b></span>' +
      '<button type="button" class="chip assess-btn" data-assess>📋 Assessment <b data-answered>0</b>/' + this.steps + '</button>';
    this.el = {
      lives : root.querySelector("[data-lives]"),
      streak: root.querySelector("[data-streak]"),
      xp    : root.querySelector("[data-xp]"),
      timer   : root.querySelector("[data-timer]"),
      clock   : root.querySelector("[data-clock]"),
      assess  : root.querySelector("[data-assess]"),
      answered: root.querySelector("[data-answered]")
    };
    this.answers = [];
    this.el.assess.addEventListener("click", () => showAssessment(this));
    Hud.active = this;
    this.startTimer(opts.time === undefined ? 120 : opts.time);
    this.paint();
  }

  /* ---- the assessment log: only what the child has actually answered ---- */
  record(question, answer){
    this.answers.push({ q: String(question || ""), a: String(answer || "") });
    this.paint();
  }

  /* ---- one countdown for the whole game ---- */
  startTimer(seconds){
    this.stopTimer();
    if (!seconds){ if (this.el.timer) this.el.timer.style.display = "none"; return; }
    this.left = seconds;
    this.paintClock();
    this._tick = setInterval(() => {
      this.left--;
      this.paintClock();
      if (this.left <= 0){ this.stopTimer(); timeUp(this); }
    }, 1000);
  }
  stopTimer(){ if (this._tick){ clearInterval(this._tick); this._tick = null; } }
  paintClock(){
    if (!this.el.clock) return;
    const left = Math.max(0, this.left);
    this.el.clock.textContent = Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0");
    this.el.timer.classList.toggle("low", left <= 30);
  }
  paint(){
    if (this.el.lives) this.el.lives.innerHTML =
      this.lifeIcon.repeat(this.lives) +
      '<span class="dead">' + this.lifeIcon.repeat(this.maxLives - this.lives) + '</span>';
    this.el.streak.textContent = this.streak;
    this.el.xp.textContent = this.xp;
    this.el.answered.textContent = this.answers.length;
  }
  /* extra readout chips in the header, e.g. hud.chip("score", "SCORE 00500") */
  chip(key, text){
    let el = this.root.querySelector('[data-chip="' + key + '"]');
    if (!el){
      el = document.createElement("span");
      el.className = "chip readout-chip";
      el.setAttribute("data-chip", key);
      this.root.insertBefore(el, this.el.timer);
    }
    el.innerHTML = text;
  }
  addXp(n, ev){
    this.xp += n; this.paint();
    if (ev) popXp(n, ev.clientX, ev.clientY);
  }
  hit(){ this.lives = Math.max(0, this.lives - 1); this.streak = 0; this.paint(); return this.lives; }
  win(){ this.streak++; this.paint(); return this.streak; }
  advance(){ this.step++; this.paint(); }
}

/* ---------- assessment sheet ----------
   Lists only the questions the child has already answered, so the
   ones still to come are never given away.                        */
function showAssessment(hud, onClose){
  const wrap = document.createElement("div");
  wrap.className = "modal";
  const rows = hud.answers.length
    ? hud.answers.map((r, n) =>
        '<li><b class="as-n">' + (n + 1) + '</b>' +
          '<span class="as-q">' + r.q + '</span>' +
          '<span class="as-a">' + r.a + '</span></li>').join("")
    : '<li class="as-empty">Nothing answered yet. Answer a question and it appears here.</li>';
  wrap.innerHTML =
    '<div class="modal-card assess-card">' +
      '<h3>📋 Assessment</h3>' +
      '<p class="as-count">Answered <b>' + hud.answers.length + '</b> of ' + hud.steps + '</p>' +
      '<ol class="as-list">' + rows + '</ol>' +
      '<div class="actions" style="justify-content:center">' +
        '<button class="btn teal" data-close>Close</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(wrap);
  const close = () => {
    wrap.remove();
    document.removeEventListener("keydown", onKey);
    if (onClose) onClose();
  };
  const onKey = e => { if (e.key === "Escape"){ e.preventDefault(); close(); } };
  wrap.querySelector("[data-close]").onclick = close;
  wrap.addEventListener("click", e => { if (e.target === wrap) close(); });
  document.addEventListener("keydown", onKey);
}

/* ---------- the two minutes are over ---------- */
function timeUp(hud){
  if (document.querySelector(".timeup")) return;
  /* freeze the game underneath: the sheet swallows every click and key */
  document.querySelectorAll(".modal").forEach(m => m.remove());
  const stage = document.getElementById("stage");
  if (stage) stage.style.pointerEvents = "none";
  document.addEventListener("keydown", e => {
    if (document.querySelector(".timeup")){ e.stopPropagation(); e.preventDefault(); }
  }, true);
  try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch(e){}

  const wrap = document.createElement("div");
  wrap.className = "modal timeup";
  wrap.innerHTML =
    '<div class="modal-card bad">' +
      '<div class="modal-face">⏰</div>' +
      '<h3>Time is up!</h3>' +
      '<p>The two minutes are over. You answered <b>' + hud.answers.length + '</b> of ' +
        hud.steps + '. Play again to finish the book.</p>' +
      '<div class="actions" style="justify-content:center">' +
        '<button class="btn" onclick="location.reload()">🔁 Play again</button>' +
        '<button class="btn teal" data-sheet>📋 Assessment</button>' +
        '<a class="btn gold" href="../index.html">📚 Back to shelf</a>' +
      '</div>' +
    '</div>';
  document.body.appendChild(wrap);
  wrap.querySelector("[data-sheet]").onclick = () => {
    wrap.style.display = "none";                       /* one sheet on screen at a time */
    showAssessment(hud, () => { wrap.style.display = ""; });
  };
  popSound(false, "Time is up. Play again.");
}

/* ---------- end-of-game screen ---------- */
function showResult(stage, o){
  if (Hud.active) Hud.active.stopTimer();
  Store.save(o.gameId, { xp:o.xp, stars:o.stars });
  if (o.stars > 0) confetti(o.stars * 40);
  const face = o.stars === 3 ? "🏆" : o.stars === 2 ? "🎉" : o.stars === 1 ? "👍" : "💪";
  const msg  = o.stars === 3 ? "Perfect! The page is fully restored."
             : o.stars === 2 ? "Well done! Almost perfect."
             : o.stars === 1 ? "Good try! Play again for more stars."
             : "Don't give up — open the book again!";
  stage.innerHTML =
    '<div class="result-panel"><div class="result">' +
      '<div class="big">' + face + '</div>' +
      '<div class="starrow">' +
        [1,2,3].map(i => '<span class="' + (i <= o.stars ? "on" : "") + '">★</span>').join("") +
      '</div>' +
      '<h2>' + msg + '</h2>' +
      '<p>Your best result is saved on the shelf.</p>' +
      '<div class="scoreline">' +
        '<div><b>' + o.xp + '</b><small>ink earned</small></div>' +
        '<div><b>' + o.total + '</b><small>correct</small></div>' +
        '<div><b>' + o.stars + '/3</b><small>stars</small></div>' +
      '</div>' +
      '<div class="actions" style="justify-content:center">' +
        '<button class="btn" onclick="location.reload()">🔁 Play again</button>' +
        (o.nextHref ? '<a class="btn teal" href="' + o.nextHref + '">' + (o.nextLabel || "Next book ›") + '</a>' : "") +
        '<a class="btn gold" href="../index.html">📚 Back to shelf</a>' +
      '</div>' +
    '</div></div>';
}

/* ---------- shared arcade sound kit (the Word Claw voices) ----------
   Sfx.play("tap" | "move" | "launch" | "good" | "win" | "bad")        */
const Sfx = {
  ctx(){
    if (!this._c){
      try { this._c = new (window.AudioContext || window.webkitAudioContext)(); }
      catch(e){ return null; }
    }
    if (this._c.state === "suspended") this._c.resume();
    return this._c;
  },
  play(kind){
    const ac = this.ctx();
    if (!ac) return;
    const t = ac.currentTime, g = ac.createGain();
    g.connect(ac.destination);
    const tone = (type, from, to, dur, at) => {
      const o = ac.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(from, t + (at || 0));
      if (to) o.frequency.exponentialRampToValueAtTime(to, t + (at || 0) + dur);
      o.connect(g); o.start(t + (at || 0)); o.stop(t + (at || 0) + dur + .02);
    };
    if (kind === "tap"){        tone("sine", 760, null, .09);
      g.gain.setValueAtTime(.07, t); g.gain.exponentialRampToValueAtTime(.001, t + .1); }
    else if (kind === "move"){  tone("square", 420, null, .07);
      g.gain.setValueAtTime(.05, t); g.gain.exponentialRampToValueAtTime(.001, t + .08); }
    else if (kind === "launch"){ tone("sine", 200, 900, .25);
      g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + .3); }
    else if (kind === "good"){  tone("triangle", 700, null, .1); tone("triangle", 1000, null, .12, .09);
      g.gain.setValueAtTime(.13, t); g.gain.exponentialRampToValueAtTime(.001, t + .26); }
    else if (kind === "win"){   tone("triangle", 660, null, .1); tone("triangle", 880, null, .1, .09);
      tone("triangle", 1320, null, .14, .18);
      g.gain.setValueAtTime(.15, t); g.gain.exponentialRampToValueAtTime(.001, t + .38); }
    else {                      tone("sawtooth", 230, 85, .3);
      g.gain.setValueAtTime(.13, t); g.gain.exponentialRampToValueAtTime(.001, t + .34); }
  }
};

/* ---------- the spoken right / wrong voice every popup uses ----------
   A boy / male English voice says "Correct!" or "Try again".
   A game can override the words with  popup({ say: "..." }).        */
let VOICE = null;
function pickVoice(){
  try{
    const all = speechSynthesis.getVoices();
    if (!all.length) return;
    const male = /ravi|david|mark|george|guy|james|william|daniel|alex|male/i;
    VOICE = all.find(v => /^en/i.test(v.lang) && male.test(v.name))   /* a boy voice */
         || all.find(v => male.test(v.name))
         || all.find(v => /^en/i.test(v.lang))
         || all[0] || null;
  } catch(e){}
}
try{
  pickVoice();
  if (window.speechSynthesis) speechSynthesis.onvoiceschanged = pickVoice;
} catch(e){}

function popSound(ok, phrase){
  try{
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const line = phrase || (ok
      ? ["Correct!", "Well done!", "That's right!"][(Math.random() * 3) | 0]
      : ["Try again", "Not quite, try again"][(Math.random() * 2) | 0]);
    const u = new SpeechSynthesisUtterance(line);
    if (!VOICE) pickVoice();
    if (VOICE) u.voice = VOICE;
    u.lang   = (VOICE && VOICE.lang) || "en-IN";
    u.rate   = 1;
    u.pitch  = ok ? 1.15 : 0.95;
    u.volume = 1;
    speechSynthesis.speak(u);
  } catch(e){}
}

/* ---------- centered right / wrong popup (auto-closes) ---------- */
function popup(o){
  const wrap = document.createElement("div");
  wrap.className = "modal";
  wrap.innerHTML =
    '<div class="modal-card' + (o.ok ? "" : " bad") + '">' +
      '<div class="modal-face">' + (o.ok ? "🎉" : "😕") + '</div>' +
      '<h3>' + o.title + '</h3>' +
      '<p>' + o.text + '</p>' +
    '</div>';
  document.body.appendChild(wrap);
  popSound(!!o.ok, o.say);
  const close = () => {
    if (!wrap.isConnected) return;
    wrap.remove();
    document.removeEventListener("keydown", onKey);
    if (o.onClose) o.onClose();
  };
  const onKey = e => { if (e.key === "Enter" || e.key === " " || e.key === "Escape"){ e.preventDefault(); close(); } };
  wrap.addEventListener("click", e => { if (e.target === wrap) close(); });
  document.addEventListener("keydown", onKey);
  if (o.ok) confetti(26);
  setTimeout(close, o.ok ? 1200 : 1500);
  return close;
}

/* ---------- workbook instruction strip, shown above every game ---------- */
function brief(id){
  const box = document.getElementById("brief");
  const info = (typeof GAME_INFO !== "undefined") && GAME_INFO[id];
  if (!box || !info) return;
  box.innerHTML =
    '<span class="b-tag">' + info.tag + '</span>' +
    '<b class="b-task">' + info.task + '</b>' +
    '<span class="b-how">' + info.how + '</span>';
}

/* ---------- in-page confirm dialog (never uses the browser popup) ---------- */
function confirmBox(o){
  const wrap = document.createElement("div");
  wrap.className = "modal";
  wrap.innerHTML =
    '<div class="modal-card ask">' +
      '<div class="modal-face">' + (o.face || "❗") + '</div>' +
      '<h3>' + o.title + '</h3>' +
      '<p>' + o.text + '</p>' +
      '<div class="ask-btns">' +
        '<button class="btn ghost" data-no>' + (o.cancel || "Cancel") + '</button>' +
        '<button class="btn gold" data-yes>' + (o.ok || "Yes") + '</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(wrap);

  const close = () => {
    wrap.remove();
    document.removeEventListener("keydown", onKey);
  };
  const onKey = e => {
    if (e.key === "Escape"){ e.preventDefault(); close(); }
    if (e.key === "Enter"){ e.preventDefault(); close(); if (o.onOk) o.onOk(); }
  };
  wrap.querySelector("[data-no]").onclick  = close;
  wrap.querySelector("[data-yes]").onclick = () => { close(); if (o.onOk) o.onOk(); };
  wrap.addEventListener("click", e => { if (e.target === wrap) close(); });
  document.addEventListener("keydown", onKey);
  wrap.querySelector("[data-yes]").focus();
}

/* ---------- keep the page column on whole pixels ----------
   A scrollbar makes the viewport an odd width, so an auto-centred
   column lands on a half pixel and every glyph inside is drawn
   blurred. Rounding the left margin keeps text crisp.            */
function snapWrap(){
  const w = document.querySelector(".wrap");
  if (!w) return;
  w.style.marginLeft = "0px";
  w.style.marginRight = "0px";
  const avail = document.documentElement.clientWidth;
  const width = Math.round(w.getBoundingClientRect().width);
  w.style.marginLeft = Math.max(0, Math.floor((avail - width) / 2)) + "px";
}
window.addEventListener("resize", snapWrap);
window.addEventListener("load", snapWrap);
snapWrap();

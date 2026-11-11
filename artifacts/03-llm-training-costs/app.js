(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var ICE = "#A8DDEB", SAND = "#D9BE93", MUT = "#8C98A7", FAINT = "#566171";
  var tip = document.getElementById("tip");
  var seed = 11;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  function el(tag, attrs, parent, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function showTip(html, ev) { tip.innerHTML = html; tip.style.opacity = 1; moveTip(ev); }
  function moveTip(ev) {
    var x = ev.clientX + 14, y = ev.clientY + 14, r = tip.getBoundingClientRect();
    if (x + r.width > window.innerWidth - 8) x = ev.clientX - r.width - 14;
    if (y + r.height > window.innerHeight - 8) y = ev.clientY - r.height - 14;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  function hideTip() { tip.style.opacity = 0; }
  function bindTip(node, html) {
    node.addEventListener("mousemove", function (ev) { showTip(html, ev); });
    node.addEventListener("mouseleave", hideTip);
  }
  function fmtMoney(v) {
    if (v >= 1e9) return "$" + (v / 1e9).toFixed(v >= 1e10 ? 0 : 1).replace(/\.0$/, "") + "B";
    if (v >= 1e6) return "$" + (v / 1e6).toFixed(v >= 1e8 ? 0 : 1).replace(/\.0$/, "") + "M";
    if (v >= 1e3) return "$" + (v / 1e3).toFixed(0) + "K";
    return "$" + Math.round(v);
  }
  function fmtNum(v) { return Math.round(v).toLocaleString("en-US"); }
  function fmtBig(v) {
    if (v >= 1e9) return (v / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
    if (v >= 1e6) return (v / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (v >= 1e4) return (v / 1e3).toFixed(0) + "K";
    return fmtNum(v);
  }
  function sci(v) {
    var e = Math.floor(Math.log10(v)), m = v / Math.pow(10, e);
    var sup = String(e).split("").map(function (d) { return "⁰¹²³⁴⁵⁶⁷⁸⁹"[+d]; }).join("");
    return m.toFixed(1) + " × 10" + sup;
  }

  /* ---------- starfield (fixed background) ---------- */
  (function sky() {
    var s = document.getElementById("sky");
    s.setAttribute("viewBox", "0 0 1600 1000");
    s.setAttribute("preserveAspectRatio", "xMidYMid slice");
    for (var i = 0; i < 380; i++) {
      var r = rnd() < .97 ? .3 + rnd() * .7 : 1 + rnd() * .6;
      el("circle", { cx: (rnd() * 1600).toFixed(1), cy: (rnd() * 1000).toFixed(1), r: r.toFixed(2),
        fill: rnd() < .2 ? "#CFE9F2" : "#ffffff", opacity: (.12 + rnd() * .5).toFixed(2) }, s);
    }
  })();

  /* ---------- log bar chart ---------- */
  function logBars(svg, rows, opts) {
    while (svg.lastChild && svg.lastChild.tagName !== "title") svg.removeChild(svg.lastChild);
    var vb = svg.viewBox.baseVal, W = vb.width, H = vb.height;
    var L = opts.left || 150, R = opts.right || 90, T = 8, B = 26, lo = opts.lo, hi = opts.hi;
    var X = function (v) { return L + (Math.log10(v) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo)) * (W - L - R); };
    var band = (H - T - B) / rows.length, bh = Math.min(14, band * .45);
    opts.ticks.forEach(function (t) {
      el("line", { x1: X(t), x2: X(t), y1: T, y2: H - B, "class": "grid" }, svg);
      el("text", { x: X(t), y: H - 8, "text-anchor": "middle", "class": "tick" }, svg, opts.tickFmt(t));
    });
    el("line", { x1: L, x2: L, y1: T, y2: H - B, "class": "axis" }, svg);
    rows.forEach(function (r, i) {
      var y = T + i * band + (band - bh) / 2, w = Math.max(3, X(r.value) - L);
      var g = el("g", { "class": "row" }, svg);
      el("text", { x: L - 12, y: y + bh / 2 + 4, "text-anchor": "end", "class": "lab" }, g, r.label);
      el("rect", { x: L, y: y, width: w, height: bh, rx: 2, "class": "bar" + (r.est ? " est" : "") }, g);
      el("circle", { cx: L + w, cy: y + bh / 2, r: 3, fill: r.est ? SAND : "#fff" }, g);
      el("text", { x: L + w + 10, y: y + bh / 2 + 4, "class": "val" }, g, r.text);
      bindTip(el("rect", { x: 0, y: T + i * band, width: W, height: band, "class": "hit" }, g), r.tip);
    });
  }

  /* ---------- star chart ---------- */
  (function star() {
    var s = document.getElementById("star"), W = 1100, H = 560, L = 70, R = 20, T = 20, B = 40;
    var x0 = 2016.8, x1 = 2028;
    var X = function (y) { return L + (y - x0) / (x1 - x0) * (W - L - R); };
    var Y = function (v) { return T + (1 - (Math.log10(v) - 2) / 8) * (H - T - B); };
    var d = el("defs", {}, s);
    var fog = el("linearGradient", { id: "fog", x1: "0", x2: "1" }, d);
    el("stop", { offset: "0", "stop-color": "#03050A", "stop-opacity": "0" }, fog);
    el("stop", { offset: ".35", "stop-color": "#0A0F1A", "stop-opacity": ".8" }, fog);
    el("stop", { offset: "1", "stop-color": "#03050A", "stop-opacity": ".95" }, fog);
    var glow = el("radialGradient", { id: "pg" }, d);
    el("stop", { offset: "0", "stop-color": ICE, "stop-opacity": ".55" }, glow);
    el("stop", { offset: "1", "stop-color": ICE, "stop-opacity": "0" }, glow);
    for (var e = 2; e <= 10; e++) {
      var y = Y(Math.pow(10, e));
      el("line", { x1: L, x2: W - R, y1: y, y2: y, stroke: "#fff", "stroke-opacity": e % 3 === 0 ? .08 : .04 }, s);
      var lab = e < 3 ? "$100" : e < 6 ? "$" + Math.pow(10, e - 3) + "K" : e < 9 ? "$" + Math.pow(10, e - 6) + "M" : "$" + Math.pow(10, e - 9) + "B";
      el("text", { x: L - 12, y: y + 4, "text-anchor": "end", "class": "tick" }, s, lab);
    }
    for (var yr = 2017; yr <= 2028; yr++) {
      el("line", { x1: X(yr), x2: X(yr), y1: T, y2: H - B, stroke: "#fff", "stroke-opacity": .035 }, s);
      el("text", { x: X(yr), y: H - 14, "text-anchor": "middle", "class": "tick" }, s, yr);
    }
    var pts = [];
    for (var t = 2023.2; t <= 2027.9; t += .05) pts.push(X(t).toFixed(1) + "," + Y(78e6 * Math.pow(2.4, t - 2023.2)).toFixed(1));
    el("polyline", { points: pts.join(" "), fill: "none", stroke: ICE, "stroke-opacity": .35, "stroke-dasharray": "3 6" }, s);
    el("line", { x1: X(2025.9), x2: W - R, y1: Y(1e9), y2: Y(1e9), stroke: ICE, "stroke-opacity": .25, "stroke-dasharray": "1 4" }, s);
    el("rect", { x: X(2025.75), y: T - 4, width: W - R - X(2025.75) + 4, height: H - B - T + 8, fill: "url(#fog)" }, s);
    for (var k = 0; k < 60; k++) el("circle", { cx: X(2026) + rnd() * (X(2028) - X(2026)), cy: T + rnd() * (H - B - T), r: .4 + rnd() * .8, fill: "#fff", opacity: .05 + rnd() * .25 }, s);
    el("line", { x1: X(2025.75), x2: X(2025.75), y1: T, y2: H - B, stroke: ICE, "stroke-opacity": .18 }, s);
    el("text", { x: X(2026.95), y: Y(3e4), "text-anchor": "middle", "font-family": "Unbounded", "font-size": 17, "letter-spacing": "5", fill: "#E4EBF2", "fill-opacity": ".6" }, s, "UNCHARTED");
    el("text", { x: X(2026.95), y: Y(3e4) + 22, "text-anchor": "middle", "font-size": 11.5, fill: MUT }, s, "2026 and beyond");
    el("text", { x: X(2026.95), y: Y(1e9) + 22, "text-anchor": "middle", "font-size": 11.5, fill: ICE, "fill-opacity": ".85" }, s, "$1B+ runs projected by 2027");
    el("text", { x: X(2026.95), y: Y(1e9) + 38, "text-anchor": "middle", "font-size": 10.5, fill: MUT }, s, "if costs keep growing 2.4× a year");

    var P = [
      { n: "Transformer", y: 2017.45, v: 930, k: "e", lab: "~$930", dx: 14, dy: 4, tip: "<b>Original Transformer, 2017</b><br>About $930 in compute.<br>Stanford AI Index 2024 with Epoch AI." },
      { n: "GPT-3", y: 2020.4, k: "u", lab: "cost never disclosed", tip: "<b>GPT-3, 2020</b><br>OpenAI never disclosed the cost. Known: 175B parameters, 300B tokens, 3.14 × 10²³ FLOPs, 14.8 days." },
      { n: "GPT-4", y: 2023.2, v: 78e6, k: "e", lab: "~$78M", dx: -14, dy: 2, a: "end", tip: "<b>GPT-4, 2023</b><br>About $78 million in compute (Stanford AI Index 2024). Sam Altman has said the total was over $100 million." },
      { n: "Llama 2 70B", y: 2023.55, v: 2.58e6, k: "m", lab: "~$2.6M", dx: 14, dy: 4, tip: "<b>Llama 2 70B, 2023</b><br>My estimate: 1,720,320 A100 GPU hours (Meta) × an assumed $1.50 per hour." },
      { n: "Gemini Ultra", y: 2023.93, v: 191e6, k: "e", lab: "~$191M", dx: -14, dy: -16, a: "end", tip: "<b>Gemini 1.0 Ultra, 2023</b><br>About $191 million in compute (Stanford AI Index 2024)." },
      { n: "Claude 3.5 Sonnet", y: 2024.4, v: [2e7, 9e7], k: "s", lab: "\"a few $10M's\"", tip: "<b>Claude 3.5 Sonnet, 2024</b><br>Anthropic's CEO said it cost \"a few $10M's\" to train (Amodei, 2025). Shown as a range." },
      { n: "Llama 3.1 405B", y: 2024.8, v: 77.1e6, k: "m", lab: "~$77M", dx: 14, dy: 4, tip: "<b>Llama 3.1 405B, 2024</b><br>My estimate: 30.84M H100 GPU hours (Meta) × an assumed $2.50 per hour." },
      { n: "Grok 4", y: 2025.45, v: 490e6, k: "e", lab: "~$490M", dx: -14, dy: -14, a: "end", tip: "<b>Grok 4, 2025</b><br>About $490 million (Epoch AI estimate, September 2025)." }
    ];
    P.forEach(function (p) {
      var x = X(p.y), g = el("g", { "class": "pt" }, s), hy;
      if (p.k === "u") {
        hy = Y(300);
        el("circle", { cx: x, cy: hy, r: 9, fill: "none", stroke: FAINT, "stroke-width": 1.2, "stroke-dasharray": "2 2" }, g);
        el("text", { x: x, y: hy + 4, "text-anchor": "middle", "font-size": 11, fill: MUT }, g, "?");
        el("text", { x: x + 16, y: hy - 2, "font-size": 12.5, fill: "#C9D3DD", "font-weight": 500 }, g, p.n);
        el("text", { x: x + 16, y: hy + 13, "font-size": 11, fill: MUT }, g, p.lab);
      } else if (p.k === "s") {
        var ya = Y(p.v[0]), yb = Y(p.v[1]); hy = (ya + yb) / 2;
        el("line", { x1: x, x2: x, y1: ya, y2: yb, stroke: ICE, "stroke-width": 1.6, "stroke-dasharray": "1.5 4", "stroke-linecap": "round" }, g);
        el("line", { x1: x - 5, x2: x + 5, y1: ya, y2: ya, stroke: ICE, "stroke-opacity": .6 }, g);
        el("line", { x1: x - 5, x2: x + 5, y1: yb, y2: yb, stroke: ICE, "stroke-opacity": .6 }, g);
        el("text", { x: x, y: ya + 20, "text-anchor": "middle", "font-size": 12.5, fill: "#C9D3DD", "font-weight": 500 }, g, p.n);
        el("text", { x: x, y: ya + 35, "text-anchor": "middle", "font-size": 11, fill: ICE }, g, p.lab);
      } else {
        hy = Y(p.v);
        el("circle", { cx: x, cy: hy, r: 18, fill: "url(#pg)", "class": "halo", opacity: .7 }, g);
        if (p.k === "e") { el("circle", { cx: x, cy: hy, r: 6, fill: "none", stroke: ICE, "stroke-width": 1.5 }, g); el("circle", { cx: x, cy: hy, r: 2, fill: "#fff" }, g); }
        else { el("rect", { x: x - 4.5, y: hy - 4.5, width: 9, height: 9, transform: "rotate(45 " + x + " " + hy + ")", fill: "none", stroke: SAND, "stroke-width": 1.5 }, g); el("circle", { cx: x, cy: hy, r: 1.6, fill: SAND }, g); }
        var a = p.a || "start";
        el("text", { x: x + p.dx, y: hy + p.dy - 2, "text-anchor": a, "font-size": 12.5, fill: "#C9D3DD", "font-weight": 500 }, g, p.n);
        el("text", { x: x + p.dx, y: hy + p.dy + 13, "text-anchor": a, "font-size": 11, fill: p.k === "m" ? SAND : ICE }, g, p.lab);
      }
      bindTip(el("circle", { cx: x, cy: hy, r: 22, fill: "transparent" }, g), p.tip);
    });
  })();

  /* ---------- tokens chart ---------- */
  (function tokens() {
    var svg = document.querySelector("#chart-tokens svg");
    var rows = [
      { label: "GPT-3 (2020)", v: 0.3, tip: "<b>GPT-3</b><br>300 billion tokens (Brown et al., 2020)" },
      { label: "Llama 2 (2023)", v: 2.0, tip: "<b>Llama 2</b><br>2 trillion tokens (Meta model card)" },
      { label: "Llama 3.1 (2024)", v: 15.6, tip: "<b>Llama 3.1 405B</b><br>15.6 trillion tokens (Llama Team, 2024)" }
    ];
    var W = 360, H = 170, L = 112, R = 50, T = 8, B = 26;
    var X = function (v) { return L + v / 16 * (W - L - R); };
    var band = (H - T - B) / rows.length, bh = 12;
    [0, 4, 8, 12, 16].forEach(function (t) {
      el("line", { x1: X(t), x2: X(t), y1: T, y2: H - B, "class": "grid" }, svg);
      el("text", { x: X(t), y: H - 8, "text-anchor": "middle", "class": "tick" }, svg, t + "T");
    });
    rows.forEach(function (r, i) {
      var y = T + i * band + (band - bh) / 2, w = Math.max(3, X(r.v) - L);
      var g = el("g", { "class": "row" }, svg);
      el("text", { x: L - 10, y: y + 10, "text-anchor": "end", "class": "lab" }, g, r.label);
      el("rect", { x: L, y: y, width: w, height: bh, rx: 2, "class": "bar" }, g);
      el("text", { x: L + w + 8, y: y + 10, "class": "val" }, g, r.v + "T");
      bindTip(el("rect", { x: 0, y: T + i * band, width: W, height: band, "class": "hit" }, g), r.tip);
    });
  })();

  /* ---------- energy chart with unit toggle ---------- */
  var HOME_KWH = 10791;
  var energy = [
    { label: "GPT-3 (2020)", mwh: 1287, src: "Published estimate (Patterson et al., 2021)" },
    { label: "Llama 2, all sizes (2023)", mwh: 1324.6, est: true, src: "My estimate: 3,311,616 GPU hours × 400 W (Meta model card)" },
    { label: "Llama 3.1 405B (2024)", mwh: 21588, est: true, src: "My estimate: 30.84M GPU hours × 700 W, GPUs only" },
    { label: "Grok 4 (2025)", mwh: 310000, src: "Third party estimate, 310 GWh (Epoch AI, 2025)" }
  ];
  function drawEnergy(unit) {
    var svg = document.querySelector("#chart-energy svg");
    var rows = energy.map(function (r) {
      var homes = r.mwh * 1000 / HOME_KWH;
      return { label: r.label, est: r.est, value: unit === "homes" ? homes : r.mwh,
        text: unit === "homes" ? fmtNum(homes) + " homes" : fmtNum(r.mwh) + " MWh",
        tip: "<b>" + r.label + "</b><br>" + fmtNum(r.mwh) + " MWh, about " + fmtNum(homes) + " US homes for a year.<br>" + r.src };
    });
    logBars(svg, rows, unit === "homes"
      ? { lo: 10, hi: 1e5, left: 190, right: 120, ticks: [10, 100, 1e3, 1e4, 1e5], tickFmt: function (t) { return fmtBig(t); } }
      : { lo: 100, hi: 1e6, left: 190, right: 120, ticks: [100, 1e3, 1e4, 1e5, 1e6], tickFmt: function (t) { return fmtBig(t) + " MWh"; } });
  }
  drawEnergy("mwh");
  Array.prototype.forEach.call(document.querySelectorAll(".unit-toggle button"), function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".unit-toggle button").forEach(function (x) { x.classList.toggle("on", x === b); });
      drawEnergy(b.getAttribute("data-unit"));
    });
  });

  /* ---------- interruption strip ---------- */
  (function interrupts() {
    var s = document.getElementById("interrupts"), W = 1000;
    el("rect", { x: 0, y: 6, width: W, height: 44, fill: "#fff", "fill-opacity": .02, stroke: ICE, "stroke-opacity": .2 }, s);
    for (var i = 0; i < 466; i++) {
      var x = 2 + rnd() * (W - 4), planned = i >= 419;
      el("line", { x1: x, x2: x, y1: 9, y2: 47, stroke: planned ? SAND : ICE, "stroke-opacity": planned ? .7 : .4, "stroke-width": planned ? 1 : .8 }, s);
    }
    el("text", { x: 0, y: 66, "class": "tick" }, s, "DAY 1");
    el("text", { x: W, y: 66, "text-anchor": "end", "class": "tick" }, s, "DAY 54");
  })();

  /* ---------- launch sequence ---------- */
  var ICONS = {
    collect: '<path d="M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    clean: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    tokenize: '<rect x="3" y="7" width="5" height="10" rx="1.5"/><rect x="9.5" y="7" width="5" height="10" rx="1.5"/><rect x="16" y="7" width="5" height="10" rx="1.5"/>',
    pretrain: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
    evaluate: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    sft: '<path d="M4 5h16v10H8l-4 4z"/><path d="M8 9h8M8 12h5"/>',
    align: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    deploy: '<path d="M5 15c-1 1-2 5-2 5s4-1 5-2"/><path d="M9 15l-3-3c1-4 5-9 12-9 0 7-5 11-9 12z"/><circle cx="14.5" cy="9.5" r="1.5"/>'
  };
  var STEPS = [
    { k: "collect", t: "Collect data", d: "Gather text and code from web crawls, books, papers, and licensed sources.", ex: "Llama 3.1 used about 15 trillion tokens with a December 2023 cutoff.", m: [4, 1, 1, 2, 2] },
    { k: "clean", t: "Clean and filter", d: "Remove duplicates, spam, personal data, and low quality pages, then balance the mix.", ex: "Llama 3's mix: 50% general, 25% math and reasoning, 17% code, 8% multilingual.", m: [4, 2, 1, 2, 3] },
    { k: "tokenize", t: "Tokenize", d: "Split text into tokens, the word pieces the model actually reads and predicts.", ex: "GPT-3 trained on 300 billion tokens.", m: [3, 1, 1, 1, 1] },
    { k: "pretrain", t: "Pretrain", d: "Predict the next token trillions of times across thousands of GPUs, adjusting billions of weights.", ex: "Llama 3.1 405B: 16,384 H100s and 30.84M GPU hours.", m: [3, 4, 4, 4, 3] },
    { k: "evaluate", t: "Evaluate and checkpoint", d: "Track loss, run benchmarks, and save checkpoints so failures do not wipe out progress.", ex: "466 interruptions in 54 days of Llama 3 pretraining.", m: [1, 2, 2, 2, 3] },
    { k: "sft", t: "Supervised fine tuning", d: "Train on curated prompt and response examples so the model follows instructions.", ex: "InstructGPT relied on about 40 hired contractors.", m: [2, 2, 1, 2, 4] },
    { k: "align", t: "Align and red team", d: "Use human or AI feedback (RLHF, Constitutional AI, DPO) and safety testing to shape behavior.", ex: "Claude uses Constitutional AI; Llama 3 ran six rounds of feedback training.", m: [2, 2, 2, 3, 4] },
    { k: "deploy", t: "Deploy and serve", d: "Package the model behind an API or app. Every user request now costs compute, indefinitely.", ex: "Training is a one time cost; serving millions of users is an ongoing one.", m: [1, 3, 3, 4, 3] }
  ];
  var RES = ["DATA", "COMPUTE", "ENERGY", "TIME", "PEOPLE"];
  var mount = document.getElementById("pipeline-mount");
  STEPS.forEach(function (s, i) {
    var core = i === 3, div = document.createElement("article");
    div.className = "step" + (core ? " core" : "");
    var meters = RES.map(function (r, j) {
      var bars = "";
      for (var b = 1; b <= 4; b++) bars += '<span class="' + (b <= s.m[j] ? "on" : "") + '"></span>';
      return "<span>" + r + '</span><span class="meter" aria-label="' + r + " " + s.m[j] + ' of 4">' + bars + "</span>";
    }).join("");
    div.innerHTML = '<div class="num">STAGE 0' + (i + 1) + (core ? " · CORE" : "") + '</div><div class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[s.k] + "</svg></div>" +
      "<h3>" + s.t + "</h3><p>" + s.d + '</p><div class="ex">' + s.ex + '</div><div class="meters">' + meters + "</div>";
    mount.appendChild(div);
  });

  /* ---------- model cards with signal strength ---------- */
  var MODELS = [
    { org: "Meta · 2024", name: "Llama 3.1 405B", sig: 4, label: "Disclosed",
      rows: [["Parameters", "405 billion"], ["Data", "15.6 trillion tokens"], ["Compute", "3.8 × 10²⁵ FLOPs; 30.84M H100 GPU hours"], ["Hardware", "16,384 H100 GPUs"], ["Emissions", "8,930 t CO₂e (location based)"], ["Cost", "~$77M (my estimate)"]],
      src: "Llama Team, 2024; Llama 3.1 model card" },
    { org: "Meta · 2023", name: "Llama 2 70B", sig: 4, label: "Disclosed",
      rows: [["Parameters", "70 billion"], ["Data", "2 trillion tokens"], ["Compute", "1,720,320 A100 GPU hours"], ["Time", "January to July 2023 (all sizes)"], ["Emissions", "291 t CO₂e, offset by Meta"], ["Cost", "~$2.6M (my estimate)"]],
      src: "Meta Llama 2 model card, 2023" },
    { org: "OpenAI · 2020", name: "GPT-3", sig: 3, label: "Disclosed, cost withheld",
      rows: [["Parameters", "175 billion"], ["Data", "300 billion tokens"], ["Compute", "3.14 × 10²³ FLOPs"], ["Hardware", "~10,000 V100 GPUs"], ["Time", "14.8 days"], ["Energy", "1,287 MWh, 552 t CO₂e"]],
      src: "Brown et al., 2020; Patterson et al., 2021" },
    { org: "xAI · 2023 to 2025", name: "Grok family", sig: 2, label: "Partial + estimates",
      rows: [["Grok 1", "314B mixture of experts, 25% of weights active per token (open weights)"], ["Grok 3", "\"10X more compute than Grok 2\" on the ~100,000 H100 Colossus cluster"], ["Grok 4", "~$490M and 310 GWh (estimate)"]],
      src: "xAI, 2024; Tom's Hardware, 2025; Epoch AI, 2025" },
    { org: "OpenAI · 2023", name: "GPT-4", sig: 1, label: "Estimate",
      rows: [["Parameters", "Not disclosed"], ["Data", "Not disclosed"], ["Compute cost", "~$78 million (estimate)"], ["CEO comment", "Total cost was more than $100 million"], ["Hardware", "Not disclosed"]],
      src: "Stanford AI Index 2024; Altman, MIT event, April 2023" },
    { org: "Google · 2023", name: "Gemini 1.0 Ultra", sig: 1, label: "Estimate",
      rows: [["Parameters", "Not disclosed"], ["Data", "Not disclosed (multimodal)"], ["Hardware", "Large fleet of TPUv4 chips across multiple data centers"], ["Compute cost", "~$191 million (estimate)"]],
      src: "Gemini Team, 2023; Stanford AI Index 2024" },
    { org: "Anthropic · 2024", name: "Claude 3.5 Sonnet", sig: 1, label: "Statement only",
      rows: [["Parameters", "Not disclosed (a mid sized model)"], ["Method", "Pretraining plus human feedback and Constitutional AI"], ["Cost", "\"A few $10M's\" per Anthropic's CEO"], ["Hardware", "Not disclosed"]],
      src: "Amodei, 2025; Bai et al., 2022" },
    { org: "Unknown · 2026+", name: "Next frontier model", sig: 0, label: "Not yet observed",
      rows: [["Cost", "Projected past $1B if the 2.4× yearly trend holds"], ["Data", "May reach the limit of public human text"], ["Everything else", "Unknown"]],
      src: "Cottier et al., 2024; Villalobos et al., 2024" }
  ];
  var mm = document.getElementById("models-mount");
  MODELS.forEach(function (m) {
    var bars = "";
    for (var i = 1; i <= 4; i++) bars += '<i class="' + (i <= m.sig ? "on" : "") + '" style="height:' + (6 + i * 4) + 'px"></i>';
    var a = document.createElement("article");
    a.className = "model";
    if (m.sig === 0) a.style.borderStyle = "dashed";
    a.innerHTML = '<div class="top"><div><div class="org">' + m.org + "</div><h3>" + m.name + '</h3></div><div class="sigwrap"><span class="bars" aria-label="Signal ' + m.sig + ' of 4">' + bars + '</span><span class="badge">' + m.label + "</span></div></div>" +
      "<dl>" + m.rows.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + r[1] + "</dd>"; }).join("") + "</dl>" +
      '<div class="src">Source: ' + m.src + "</div>";
    mm.appendChild(a);
  });

  /* ---------- calculator ---------- */
  var GPU = { v100: { tf: 125e12, w: 300, price: 1.0 }, a100: { tf: 312e12, w: 400, price: 1.5 }, h100: { tf: 989e12, w: 700, price: 2.5 } };
  var PRESETS = [
    { name: "GPT-3", p: 175, t: 300, gpu: "v100", n: 10000, cmp: "Published for GPT-3: 3.14 × 10²³ FLOPs and 14.8 days on about 10,000 V100s. A longer real run than this estimate means the hardware ran well below 40% utilization." },
    { name: "Llama 2 70B", p: 70, t: 2000, gpu: "a100", n: 2048, cmp: "Published for Llama 2 70B: 1,720,320 A100 GPU hours. The estimate lands within about 10%." },
    { name: "Llama 3.1 405B", p: 405, t: 15600, gpu: "h100", n: 16384, cmp: "Published for Llama 3.1 405B: 3.8 × 10²⁵ FLOPs and 30.84M H100 GPU hours. The gap from this estimate reflects restarts, failures, and real world efficiency." },
    { name: "Small 7B model", p: 7, t: 2000, gpu: "a100", n: 256, cmp: "A 7B model on 2 trillion tokens is within reach of a well funded company or university, which is why most organizations fine tune existing models instead of pretraining large ones." }
  ];
  var $ = function (id) { return document.getElementById(id); };
  var pbox = $("presets");
  PRESETS.forEach(function (pr, i) {
    var b = document.createElement("button"); b.type = "button"; b.textContent = pr.name;
    b.addEventListener("click", function () {
      $("in-params").value = pr.p; $("in-tokens").value = pr.t; $("in-gpu").value = pr.gpu; $("in-gpus").value = pr.n;
      $("in-mfu").value = 40; $("in-price").value = GPU[pr.gpu].price.toFixed(2);
      pbox.querySelectorAll("button").forEach(function (x) { x.classList.toggle("on", x === b); });
      $("compare").textContent = pr.cmp; $("compare").style.display = "block";
      calc();
    });
    pbox.appendChild(b);
    if (i === 2) setTimeout(function () { b.click(); }, 0);
  });
  $("in-gpu").addEventListener("change", function () { $("in-price").value = GPU[$("in-gpu").value].price.toFixed(2); calc(); });
  ["in-params", "in-tokens", "in-gpus", "in-mfu", "in-price", "in-pue"].forEach(function (id) {
    $(id).addEventListener("input", function () {
      pbox.querySelectorAll("button").forEach(function (x) { x.classList.remove("on"); });
      $("compare").style.display = "none";
      calc();
    });
  });
  function calc() {
    var P = parseFloat($("in-params").value) * 1e9, D = parseFloat($("in-tokens").value) * 1e9;
    var g = GPU[$("in-gpu").value], n = Math.max(1, parseInt($("in-gpus").value, 10) || 1);
    var mfu = Math.min(0.8, Math.max(0.05, (parseFloat($("in-mfu").value) || 40) / 100));
    var price = parseFloat($("in-price").value) || 0, pue = parseFloat($("in-pue").value) || 1;
    if (!(P > 0 && D > 0)) return;
    var flops = 6 * P * D, hours = flops / (g.tf * mfu * 3600), days = hours / n / 24, mwh = hours * g.w * pue / 1e6;
    $("o-cost").textContent = fmtMoney(hours * price);
    $("o-flops").textContent = sci(flops);
    $("o-hours").textContent = fmtBig(hours);
    $("o-days").textContent = days >= 10 ? fmtNum(days) : days.toFixed(1);
    $("o-mwh").textContent = fmtNum(mwh);
    $("o-homes").textContent = fmtNum(mwh * 1000 / HOME_KWH);
    $("o-tpp").textContent = fmtNum(D / P);
  }
  calc();
})();

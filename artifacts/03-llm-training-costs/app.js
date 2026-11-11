(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var tip = document.getElementById("tip");

  function el(tag, attrs, parent, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function showTip(html, ev) {
    tip.innerHTML = html; tip.style.opacity = 1; moveTip(ev);
  }
  function moveTip(ev) {
    var x = ev.clientX + 14, y = ev.clientY + 14;
    var r = tip.getBoundingClientRect();
    if (x + r.width > window.innerWidth - 8) x = ev.clientX - r.width - 14;
    if (y + r.height > window.innerHeight - 8) y = ev.clientY - r.height - 14;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  function hideTip() { tip.style.opacity = 0; }

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

  /* horizontal log bar chart */
  function logBars(svg, rows, opts) {
    while (svg.lastChild && svg.lastChild.tagName !== "title") svg.removeChild(svg.lastChild);
    var vb = svg.viewBox.baseVal, W = vb.width, H = vb.height;
    var L = opts.left || 150, R = opts.right || 90, T = 8, B = 26;
    var lo = opts.lo, hi = opts.hi;
    var X = function (v) { return L + (Math.log10(v) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo)) * (W - L - R); };
    var band = (H - T - B) / rows.length, bh = Math.min(22, band * 0.62);
    opts.ticks.forEach(function (t) {
      el("line", { x1: X(t), x2: X(t), y1: T, y2: H - B, "class": "grid" }, svg);
      el("text", { x: X(t), y: H - 8, "text-anchor": "middle" }, svg, opts.tickFmt(t));
    });
    el("line", { x1: L, x2: L, y1: T, y2: H - B, "class": "axis" }, svg);
    rows.forEach(function (r, i) {
      var y = T + i * band + (band - bh) / 2;
      var g = el("g", { "class": "row" }, svg);
      el("text", { x: L - 10, y: y + bh / 2 + 4, "text-anchor": "end", "class": "lab" }, g, r.label);
      var w = Math.max(3, X(r.value) - L);
      el("path", { d: "M" + L + "," + y + " h" + (w - 4) + " a4,4 0 0 1 4,4 v" + (bh - 8) + " a4,4 0 0 1 -4,4 h" + -(w - 4) + " z",
        "class": "bar" + (r.est ? " est" : "") }, g);
      el("text", { x: L + w + 6, y: y + bh / 2 + 4, "class": "val" }, g, r.text);
      var hit = el("rect", { x: 0, y: T + i * band, width: W, height: band, "class": "hit" }, g);
      hit.addEventListener("mousemove", function (ev) { showTip(r.tip, ev); });
      hit.addEventListener("mouseleave", hideTip);
    });
  }

  /* ---------- hero cost chart ---------- */
  var costRows = [
    { label: "Transformer (2017)", value: 930, text: "~$930", tip: "<b>Original Transformer, 2017</b><br>About $930 in compute. Source: Stanford AI Index 2024 with Epoch AI." },
    { label: "Llama 2 70B (2023)", value: 2.58e6, est: true, text: "~$2.6M", tip: "<b>Llama 2 70B, 2023</b><br>My estimate: 1,720,320 A100 GPU hours (Meta) × an assumed $1.50 per hour." },
    { label: "GPT-4 (2023)", value: 78e6, text: "~$78M", tip: "<b>GPT-4, 2023</b><br>About $78 million in compute. Source: Stanford AI Index 2024. Sam Altman has said the total was more than $100 million." },
    { label: "Llama 3.1 405B (2024)", value: 77.1e6, est: true, text: "~$77M", tip: "<b>Llama 3.1 405B, 2024</b><br>My estimate: 30.84M H100 GPU hours (Meta) × an assumed $2.50 per hour." },
    { label: "Gemini Ultra (2023)", value: 191e6, text: "~$191M", tip: "<b>Gemini 1.0 Ultra, 2023</b><br>About $191 million in compute. Source: Stanford AI Index 2024." },
    { label: "Grok 4 (2025)", value: 490e6, text: "~$490M", tip: "<b>Grok 4, 2025</b><br>About $490 million. Source: Epoch AI estimate, September 2025." }
  ];
  logBars(document.querySelector("#chart-cost svg"), costRows, {
    lo: 100, hi: 1e9, left: 150, right: 70, ticks: [100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9],
    tickFmt: function (t) { return fmtMoney(t).replace("$1000", "$1K"); }
  });

  /* ---------- tokens chart (linear) ---------- */
  (function tokens() {
    var svg = document.querySelector("#chart-tokens svg");
    var rows = [
      { label: "GPT-3 (2020)", v: 0.3, tip: "<b>GPT-3</b><br>300 billion tokens (Brown et al., 2020)" },
      { label: "Llama 2 (2023)", v: 2.0, tip: "<b>Llama 2</b><br>2 trillion tokens (Meta model card)" },
      { label: "Llama 3.1 (2024)", v: 15.6, tip: "<b>Llama 3.1 405B</b><br>15.6 trillion tokens (Llama Team, 2024)" }
    ];
    var W = 360, H = 170, L = 112, R = 50, T = 8, B = 26;
    var X = function (v) { return L + v / 16 * (W - L - R); };
    var band = (H - T - B) / rows.length, bh = 22;
    [0, 4, 8, 12, 16].forEach(function (t) {
      el("line", { x1: X(t), x2: X(t), y1: T, y2: H - B, "class": "grid" }, svg);
      el("text", { x: X(t), y: H - 8, "text-anchor": "middle" }, svg, t + "T");
    });
    rows.forEach(function (r, i) {
      var y = T + i * band + (band - bh) / 2, w = Math.max(4, X(r.v) - L);
      var g = el("g", { "class": "row" }, svg);
      el("text", { x: L - 10, y: y + 15, "text-anchor": "end", "class": "lab" }, g, r.label);
      el("path", { d: "M" + L + "," + y + " h" + (w - 4) + " a4,4 0 0 1 4,4 v" + (bh - 8) + " a4,4 0 0 1 -4,4 h" + -(w - 4) + " z", "class": "bar" }, g);
      el("text", { x: L + w + 6, y: y + 15, "class": "val" }, g, r.v + "T");
      var hit = el("rect", { x: 0, y: T + i * band, width: W, height: band, "class": "hit" }, g);
      hit.addEventListener("mousemove", function (ev) { showTip(r.tip, ev); });
      hit.addEventListener("mouseleave", hideTip);
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
      return {
        label: r.label, est: r.est,
        value: unit === "homes" ? homes : r.mwh,
        text: unit === "homes" ? fmtNum(homes) + " homes" : fmtNum(r.mwh) + " MWh",
        tip: "<b>" + r.label + "</b><br>" + fmtNum(r.mwh) + " MWh, about " + fmtNum(homes) + " US homes for a year.<br>" + r.src
      };
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

  /* ---------- pipeline ---------- */
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
  var RES = ["Data", "Compute", "Energy", "Time", "People"];
  var mount = document.getElementById("pipeline-mount");
  STEPS.forEach(function (s, i) {
    var div = document.createElement("article");
    div.className = "step";
    var meters = RES.map(function (r, j) {
      var bars = "";
      for (var b = 1; b <= 4; b++) bars += '<span class="' + (b <= s.m[j] ? "on" : "") + '"></span>';
      return "<span>" + r + '</span><span class="meter" aria-label="' + r + " " + s.m[j] + ' of 4">' + bars + "</span>";
    }).join("");
    div.innerHTML = '<div class="n" aria-hidden="true">' + (i + 1) + '</div><div class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[s.k] + "</svg></div>" +
      "<h3>" + s.t + "</h3><p>" + s.d + '</p><div class="ex">' + s.ex + '</div><div class="meters">' + meters + "</div>";
    mount.appendChild(div);
  });

  /* ---------- model cards ---------- */
  var MODELS = [
    { org: "OpenAI", name: "GPT-3", year: 2020, badge: "disclosed", label: "Disclosed",
      rows: [["Parameters", "175 billion"], ["Data", "300 billion tokens"], ["Compute", "3.14 × 10²³ FLOPs"], ["Hardware", "~10,000 V100 GPUs"], ["Time", "14.8 days"], ["Energy", "1,287 MWh, 552 t CO₂e"]],
      src: "Brown et al., 2020; Patterson et al., 2021" },
    { org: "OpenAI", name: "GPT-4", year: 2023, badge: "estimate", label: "Estimate",
      rows: [["Parameters", "Not disclosed"], ["Data", "Not disclosed"], ["Compute cost", "~$78 million (estimate)"], ["CEO comment", "Total cost was more than $100 million"], ["Hardware", "Not disclosed"]],
      src: "Stanford AI Index 2024; Altman, MIT event, April 2023" },
    { org: "Meta", name: "Llama 2 70B", year: 2023, badge: "disclosed", label: "Disclosed",
      rows: [["Parameters", "70 billion"], ["Data", "2 trillion tokens"], ["Compute", "1,720,320 A100 GPU hours"], ["Time", "January to July 2023 (all sizes)"], ["Emissions", "291 t CO₂e, offset by Meta"], ["Cost", "~$2.6M (my estimate)"]],
      src: "Meta Llama 2 model card, 2023" },
    { org: "Meta", name: "Llama 3.1 405B", year: 2024, badge: "disclosed", label: "Disclosed",
      rows: [["Parameters", "405 billion"], ["Data", "15.6 trillion tokens"], ["Compute", "3.8 × 10²⁵ FLOPs; 30.84M H100 GPU hours"], ["Hardware", "16,384 H100 GPUs"], ["Emissions", "8,930 t CO₂e (location based)"], ["Cost", "~$77M (my estimate)"]],
      src: "Llama Team, 2024; Llama 3.1 model card" },
    { org: "Google", name: "Gemini 1.0 Ultra", year: 2023, badge: "estimate", label: "Estimate",
      rows: [["Parameters", "Not disclosed"], ["Data", "Not disclosed (multimodal)"], ["Hardware", "Large fleet of TPUv4 chips across multiple data centers"], ["Compute cost", "~$191 million (estimate)"]],
      src: "Gemini Team, 2023; Stanford AI Index 2024" },
    { org: "Anthropic", name: "Claude 3.5 Sonnet", year: 2024, badge: "statement", label: "Statement",
      rows: [["Parameters", "Not disclosed (a mid sized model)"], ["Training method", "Pretraining plus human feedback and Constitutional AI"], ["Cost", "\"A few $10M's\" per Anthropic's CEO"], ["Hardware", "Not disclosed"]],
      src: "Amodei, 2025; Bai et al., 2022" },
    { org: "xAI", name: "Grok family", year: "2023 to 2025", badge: "estimate", label: "Mixed",
      rows: [["Grok 1", "314B mixture of experts, 25% of weights active per token (open weights)"], ["Grok 3", "\"10X more compute than Grok 2\" on the ~100,000 H100 Colossus cluster"], ["Grok 4", "~$490M and 310 GWh (estimate)"]],
      src: "xAI, 2024; Tom's Hardware, 2025; Epoch AI, 2025" }
  ];
  var mm = document.getElementById("models-mount");
  MODELS.forEach(function (m) {
    var a = document.createElement("article");
    a.className = "model";
    a.innerHTML = '<div class="top"><div><div class="org">' + m.org + " &middot; " + m.year + "</div><h3>" + m.name + '</h3></div><span class="badge b-' + m.badge + '">' + m.label + "</span></div>" +
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
    var flops = 6 * P * D;
    var hours = flops / (g.tf * mfu * 3600);
    var days = hours / n / 24;
    var mwh = hours * g.w * pue / 1e6;
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

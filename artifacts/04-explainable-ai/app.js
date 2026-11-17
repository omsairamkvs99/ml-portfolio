(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  function el(t, a, p, x) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (x !== undefined) e.textContent = x; if (p) p.appendChild(e); return e; }
  var seed = 5; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  /* hero: network inside the glass cube */
  (function () {
    var g = document.getElementById("inside");
    var cols = [[110, [175, 215, 255]], [165, [165, 200, 235, 270]], [220, [180, 215, 250, 285]], [275, [170, 205, 240, 275]], [330, [195, 235]]];
    var pts = cols.map(function (c) { return c[1].map(function (y) { return [c[0], y]; }); });
    for (var l = 0; l < pts.length - 1; l++) pts[l].forEach(function (a) { pts[l + 1].forEach(function (b) {
      var w = rnd() * 2 - 1;
      el("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: w > 0 ? "#2F5BEA" : "#E2733A", "stroke-opacity": .25 + Math.abs(w) * .5, "stroke-width": .6 + Math.abs(w) * 1.8 }, g);
    }); });
    pts.forEach(function (layer) { layer.forEach(function (p) { el("circle", { cx: p[0], cy: p[1], r: 6.5, fill: "#fff", stroke: "#1E3FB0", "stroke-width": 1.8 }, g); }); });
    var hi = [[165, 200], [220, 250], [275, 205]];
    hi.forEach(function (p) { el("circle", { cx: p[0], cy: p[1], r: 11, fill: "none", stroke: "#E2733A", "stroke-width": 2 }, g); });
    var box = document.getElementById("cube"), btn = document.getElementById("xray"), lab = document.getElementById("xray-label");
    btn.addEventListener("click", function () { var o = box.classList.toggle("open"); lab.textContent = o ? "Close the box" : "X-ray the model"; });
    setTimeout(function () { box.classList.add("open"); lab.textContent = "Close the box"; }, 1400);
  })();

  /* challenges */
  var ICO = {
    scale: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    super: '<circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/>',
    story: '<path d="M4 5h16v10H8l-4 4z"/><path d="M9 9h.01M12 9h.01M15 9h.01"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    data: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
  };
  var CH = [
    ["scale", "Massive scale", "Behavior emerges from billions of parameters interacting at once. No single neuron or weight explains an answer.", "Llama 3.1 405B has 405 billion parameters (Meta, 2024)."],
    ["super", "Tangled concepts", "Models pack more concepts than they have neurons, so one neuron can respond to many unrelated ideas. This is called superposition.", "Elhage et al., 2022"],
    ["story", "Explanations after the fact", "When asked why, a model generates a plausible explanation, but that story may not match the computation that actually produced the answer.", "Claude admitted a hint only 25% of the time (Anthropic, 2025a)."],
    ["eye", "Attention is not an answer", "Heatmaps of what a model \"attends to\" look like explanations, but different attention patterns can lead to the same prediction.", "Jain & Wallace, 2019"],
    ["data", "Inherited bias", "Models absorb the biases and errors of web scale training data, and those patterns are hard to trace back to any one source.", "Bias is one of HELM's seven metrics (Liang et al., 2022)."],
    ["lock", "Closed models, new rules", "Leading models are proprietary, and the GPT-4 report withholds architecture and data details, even as regulators begin requiring documentation.", "OpenAI, 2023; European Commission, n.d."]
  ];
  var cm = document.getElementById("chal");
  CH.forEach(function (c, i) {
    var d = document.createElement("article"); d.className = "card";
    d.innerHTML = '<span class="num">0' + (i + 1) + '</span><span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICO[c[0]] + "</svg></span><h3>" + c[1] + "</h3><p>" + c[2] + '</p><div class="fact">' + c[3] + "</div>";
    cm.appendChild(d);
  });

  /* faithfulness bars animate in */
  var bars = document.querySelectorAll(".fbar .said");
  function fill() { bars.forEach(function (b) { b.style.width = b.getAttribute("data-w") + "%"; }); }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { fill(); io.disconnect(); } }); }, { threshold: .4 });
    io.observe(document.querySelector(".faith"));
  } else fill();

  /* threshold demo (simulated scores) */
  var apps = [];
  for (var i = 0; i < 100; i++) {
    var risky = i < 30;
    var s = risky ? Math.min(.98, Math.max(.05, .68 + (rnd() - .5) * .62)) : Math.min(.95, Math.max(.02, .32 + (rnd() - .5) * .62));
    apps.push({ r: risky, s: s });
  }
  apps.sort(function () { return rnd() - .5; });
  var dots = document.getElementById("dots");
  apps.forEach(function () { dots.appendChild(document.createElement("i")); });
  function pct(v) { return isFinite(v) ? Math.round(v * 100) + "%" : "n/a"; }
  function run() {
    var t = parseFloat(document.getElementById("th").value), tp = 0, fp = 0, fn = 0, tn = 0;
    document.getElementById("thv").textContent = t.toFixed(2);
    apps.forEach(function (a, i) {
      var f = a.s >= t, c = a.r && f ? "tp" : !a.r && f ? "fp" : a.r ? "fn" : "tn";
      if (c === "tp") tp++; else if (c === "fp") fp++; else if (c === "fn") fn++; else tn++;
      dots.children[i].className = c;
    });
    document.getElementById("cm").innerHTML =
      '<div></div><div class="h">Actually risky</div><div class="h">Actually safe</div>' +
      '<div class="h">Flagged</div><div class="c tp"><b>' + tp + '</b>caught</div><div class="c fp"><b>' + fp + '</b>false alarms</div>' +
      '<div class="h">Cleared</div><div class="c fn"><b>' + fn + '</b>missed</div><div class="c tn"><b>' + tn + '</b>correctly cleared</div>';
    document.getElementById("m-acc").textContent = pct((tp + tn) / 100);
    document.getElementById("m-pre").textContent = pct(tp / (tp + fp));
    document.getElementById("m-rec").textContent = pct(tp / (tp + fn));
  }
  document.getElementById("th").addEventListener("input", run);
  run();

  /* solutions ladder */
  var LAD = [
    ["Outside in", "Ask and attribute", "Study inputs and outputs without opening the model. Cheapest, least faithful.", [
      ["All major labs", "Chain of thought and reasoning modes", "Models are prompted, or built, to show step by step reasoning. Useful for spotting errors, but not a guaranteed view of the real process.", "", "Wei et al., 2022; Anthropic, 2025a"],
      ["Open source methods", "LIME and SHAP", "Estimate which parts of an input pushed a prediction up or down by testing small changes to it.", "", "Ribeiro et al., 2016; Lundberg & Lee, 2017"]]],
    ["Documentation", "Disclose and describe", "Publish what the model is, how it was trained, and where it should not be used.", [
      ["Google research origin", "Model cards", "A standard short report on a model's intended use, evaluation results, and limits, now common across the industry.", "", "Mitchell et al., 2019"],
      ["Meta", "Open weights and detailed cards", "Llama releases publish training data size, compute, and emissions, and open weights let outside researchers inspect the model directly.", "", "Meta, 2024"]]],
    ["Internals", "Attention and probing", "Look at which parts of the network activate for a given prediction.", [
      ["Meta FAIR", "LM Transparency Tool", "An open source tool that traces a prediction back through the model to the attention heads and neurons that mattered most.", "", "Tufanov et al., 2024"],
      ["Caution", "Attention maps are a clue, not an answer", "Attention shows where a model looked, not necessarily why it decided, so it should be checked against other evidence.", "", "Jain & Wallace, 2019"]]],
    ["Features", "Find the concepts inside", "Sparse autoencoders untangle neurons into human readable concepts.", [
      ["Anthropic", "Millions of features in Claude 3 Sonnet", "Turning up one feature made Claude answer as if it were the Golden Gate Bridge, proving the features actually drive behavior.", "Millions", "Anthropic, 2024"],
      ["OpenAI and Google DeepMind", "GPT-4 and Gemma Scope", "OpenAI found 16 million features in GPT-4. Google DeepMind released over 400 open sparse autoencoders for Gemma 2 with more than 30 million features.", "16M / 30M+", "OpenAI, 2024; Google DeepMind, 2024"]]],
    ["Circuits", "Trace the reasoning", "Map how features connect step by step to produce an answer. Most faithful, most expensive.", [
      ["Anthropic", "Circuit tracing in Claude 3.5 Haiku", "Showed the model plans rhyming words before writing a line of poetry, and does arithmetic differently from how it describes it.", "", "Anthropic, 2025b"],
      ["The limit", "Still only a fraction", "Even on prompts of a few dozen words, the method captures only part of the computation and takes hours of human effort to read.", "", "Anthropic, 2025b"]]]
  ];
  var lad = document.getElementById("ladder");
  LAD.forEach(function (r, i) {
    var row = document.createElement("div"); row.className = "rung";
    row.innerHTML = '<div class="side"><span class="k">DEPTH ' + (i + 1) + " &middot; " + r[0].toUpperCase() + "</span><h3>" + r[1] + "</h3><p>" + r[2] + '</p></div><div class="cards">' +
      r[3].map(function (c) { return '<div class="card"><span class="who">' + c[0] + "</span><h4>" + c[1] + "</h4><p>" + c[2] + "</p>" + (c[3] ? '<span class="big">' + c[3] + "<small>features</small></span>" : "") + '<span class="src">' + c[4] + "</span></div>"; }).join("") + "</div>";
    lad.appendChild(row);
  });
})();

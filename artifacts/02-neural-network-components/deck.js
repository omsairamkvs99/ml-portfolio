(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var stage = document.getElementById("stage");
  var counter = document.getElementById("counter");
  var progress = document.getElementById("progress");
  var current = 0;

  function svgEl(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  /* ---------------- navigation ---------------- */
  function fit() {
    var vp = document.querySelector(".viewport");
    var s = Math.min(vp.clientWidth / 1280, vp.clientHeight / 720) * 0.97;
    stage.style.transform = "scale(" + s + ")";
  }
  function show(i) {
    current = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach(function (s, n) { s.classList.toggle("active", n === current); });
    counter.textContent = (current + 1) + " / " + slides.length;
    progress.style.width = ((current + 1) / slides.length * 100) + "%";
    try { history.replaceState(null, "", "#" + (current + 1)); } catch (e) {}
    if (slides[current].querySelector("#gd")) gdStart();
  }
  document.getElementById("prev").addEventListener("click", function () { show(current - 1); });
  document.getElementById("next").addEventListener("click", function () { show(current + 1); });
  document.addEventListener("keydown", function (e) {
    if (e.target.tagName === "BUTTON" && (e.key === " " || e.key === "Enter")) return;
    if (["ArrowRight", "PageDown", " "].indexOf(e.key) > -1) { e.preventDefault(); show(current + 1); }
    else if (["ArrowLeft", "PageUp"].indexOf(e.key) > -1) { e.preventDefault(); show(current - 1); }
    else if (e.key === "Home") show(0);
    else if (e.key === "End") show(slides.length - 1);
    else if (e.key === "f" || e.key === "F") toggleFull();
  });
  var tx = null;
  document.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    tx = null;
  });
  function toggleFull() {
    if (!document.fullscreenElement) { (document.documentElement.requestFullscreen || function () {}).call(document.documentElement); }
    else if (document.exitFullscreen) document.exitFullscreen();
  }
  document.getElementById("btn-full").addEventListener("click", toggleFull);
  document.getElementById("btn-pdf").addEventListener("click", function () { window.print(); });
  window.addEventListener("resize", fit);
  document.addEventListener("fullscreenchange", function () { setTimeout(fit, 60); });

  /* ---------------- architecture diagram (animated) ---------------- */
  (function arch() {
    var svg = document.getElementById("arch");
    var layers = [2, 4, 4, 1];
    var xs = [90, 270, 450, 620];
    var names = ["Input", "Hidden 1", "Hidden 2", "Output"];
    var pos = layers.map(function (n, li) {
      var gap = 82, top = 235 - (n - 1) * gap / 2;
      var arr = [];
      for (var i = 0; i < n; i++) arr.push([xs[li], top + i * gap]);
      return arr;
    });
    var edges = [];
    var eg = svgEl("g", {}, svg);
    for (var l = 0; l < layers.length - 1; l++) {
      pos[l].forEach(function (a) {
        pos[l + 1].forEach(function (b) {
          var w = Math.random() * 2 - 1;
          svgEl("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: w > 0 ? "#9DB7CA" : "#EDC49A",
            "stroke-width": 0.8 + Math.abs(w) * 2.6, "stroke-opacity": 0.85 }, eg);
          edges.push({ a: a, b: b, layer: l });
        });
      });
    }
    var ng = svgEl("g", {}, svg);
    var nodes = [];
    pos.forEach(function (layer, li) {
      layer.forEach(function (p, i) {
        var cls = li === 0 ? "node in" : li === layers.length - 1 ? "node out" : "node";
        nodes.push({ el: svgEl("circle", { cx: p[0], cy: p[1], r: 22, "class": cls }, ng), li: li });
        if (li === 0) { var t = svgEl("text", { x: p[0], y: p[1] + 5, "text-anchor": "middle", "class": "lbl" }, ng); t.textContent = "x" + (i + 1); }
        if (li === layers.length - 1) { var t2 = svgEl("text", { x: p[0], y: p[1] + 5, "text-anchor": "middle", style: "fill:#fff;font-size:14px;font-weight:600" }, ng); t2.textContent = "ŷ"; }
      });
      var lab = svgEl("text", { x: xs[li], y: 440, "text-anchor": "middle", "class": "lbl" }, svg); lab.textContent = names[li];
      var sub = svgEl("text", { x: xs[li], y: 460, "text-anchor": "middle", "class": "sub" }, svg);
      sub.textContent = layers[li] + (layers[li] === 1 ? " neuron" : " neurons");
    });
    var pg = svgEl("g", {}, svg);
    var pulses = edges.map(function (e) { return { e: e, el: svgEl("circle", { r: 4.2, "class": "pulse", opacity: 0 }, pg) }; });
    var T = 1100; // ms per layer
    function frame(t) {
      var cycle = (t % (T * 3 + 700)) / T; // 3 layer hops plus a pause
      pulses.forEach(function (p) {
        var local = cycle - p.e.layer;
        if (local >= 0 && local <= 1) {
          var k = local;
          p.el.setAttribute("cx", p.e.a[0] + (p.e.b[0] - p.e.a[0]) * k);
          p.el.setAttribute("cy", p.e.a[1] + (p.e.b[1] - p.e.a[1]) * k);
          p.el.setAttribute("opacity", Math.sin(Math.PI * k) * 0.95 + 0.05);
        } else p.el.setAttribute("opacity", 0);
      });
      nodes.forEach(function (n) {
        var hit = cycle - n.li;
        var glow = hit >= 0 && hit < 0.35 ? 1 - hit / 0.35 : 0;
        n.el.setAttribute("stroke-width", 2 + glow * 3);
        n.el.style.stroke = glow > 0 ? "#E8963A" : "";
      });
      requestAnimationFrame(frame);
    }
    if (!window.matchMedia || !window.matchMedia("(prefers-reduced-motion: reduce)").matches) requestAnimationFrame(frame);
  })();

  /* ---------------- activation function charts ---------------- */
  (function acts() {
    var grid = document.getElementById("actgrid");
    var defs = [
      { name: "ReLU", eq: "f(z) = max(0, z)", f: function (z) { return Math.max(0, z); }, lo: -1, hi: 3, note: "Default in deep networks. Fast and simple, but neurons can get stuck at zero." },
      { name: "Tanh", eq: "f(z) = tanh(z)", f: Math.tanh, lo: -1.2, hi: 1.2, note: "S shaped, centered on zero, outputs between −1 and 1." },
      { name: "Sigmoid", eq: "f(z) = 1 / (1 + e^−z)", f: function (z) { return 1 / (1 + Math.exp(-z)); }, lo: -0.1, hi: 1.1, note: "Squashes to 0 to 1, so it suits probability outputs." },
      { name: "Linear", eq: "f(z) = z", f: function (z) { return z; }, lo: -3, hi: 3, note: "No bend at all. Stacked linear layers stay one straight line." }
    ];
    defs.forEach(function (d) {
      var box = document.createElement("div"); box.className = "act";
      box.innerHTML = "<h3>" + d.name + "</h3><div class='eq'>" + d.eq + "</div>";
      var W = 250, H = 120, pad = 10;
      var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, width: "100%", height: H, role: "img", "aria-label": d.name + " curve" });
      var X = function (z) { return pad + (z + 3) / 6 * (W - 2 * pad); };
      var Y = function (v) { return H - pad - (v - d.lo) / (d.hi - d.lo) * (H - 2 * pad); };
      svgEl("line", { x1: pad, x2: W - pad, y1: Y(0), y2: Y(0), stroke: "#D5DDD7" }, svg);
      svgEl("line", { x1: X(0), x2: X(0), y1: pad, y2: H - pad, stroke: "#D5DDD7" }, svg);
      var pts = [];
      for (var z = -3; z <= 3.001; z += 0.05) pts.push(X(z).toFixed(1) + "," + Math.max(pad, Math.min(H - pad, Y(d.f(z)))).toFixed(1));
      svgEl("polyline", { points: pts.join(" "), fill: "none", stroke: "#1F2E2A", "stroke-width": 2.6, "stroke-linejoin": "round" }, svg);
      box.appendChild(svg);
      var p = document.createElement("p"); p.className = "tiny"; p.style.margin = "4px 0 0"; p.textContent = d.note;
      box.appendChild(p);
      grid.appendChild(box);
    });
  })();

  /* ---------------- loss curve chart ---------------- */
  (function lossChart() {
    var svg = document.getElementById("losschart");
    var W = 520, H = 300, L = 50, R = 20, T = 20, B = 44;
    var X = function (e) { return L + e / 100 * (W - L - R); };
    var Y = function (v) { return T + (1 - v / 0.7) * (H - T - B); };
    svgEl("line", { x1: L, y1: H - B, x2: W - R, y2: H - B, stroke: "#9AA9A3" }, svg);
    svgEl("line", { x1: L, y1: T, x2: L, y2: H - B, stroke: "#9AA9A3" }, svg);
    var tx = svgEl("text", { x: (L + W - R) / 2, y: H - 10, "text-anchor": "middle", "class": "sub" }, svg); tx.textContent = "Epochs";
    var ty = svgEl("text", { x: 16, y: (T + H - B) / 2, "text-anchor": "middle", "class": "sub", transform: "rotate(-90 16 " + (T + H - B) / 2 + ")" }, svg); ty.textContent = "Loss";
    function curve(fn, color, w, dash) {
      var pts = [];
      for (var e = 0; e <= 100; e += 1) pts.push(X(e).toFixed(1) + "," + Y(fn(e)).toFixed(1));
      svgEl("polyline", { points: pts.join(" "), fill: "none", stroke: color, "stroke-width": w, "stroke-dasharray": dash || "" }, svg);
    }
    curve(function (e) { return 0.62 * Math.exp(-e / 14) + 0.012; }, "#1F2E2A", 2.8);
    curve(function (e) { return 0.64 * Math.exp(-e / 15) + 0.05 + (e > 45 ? (e - 45) * 0.0012 : 0); }, "#E8963A", 2.8, "7 5");
    var l1 = svgEl("text", { x: X(48), y: Y(0.012) + 18, "class": "sub" }, svg); l1.textContent = "training loss";
    var l2 = svgEl("text", { x: X(48), y: Y(0.09) - 10, "class": "sub", style: "fill:#B9774B" }, svg); l2.textContent = "test loss";
    svgEl("line", { x1: X(92), y1: Y(0.014), x2: X(92), y2: Y(0.105), stroke: "#B9574B", "stroke-width": 1.5 }, svg);
    svgEl("line", { x1: X(92), y1: Y(0.105), x2: X(92), y2: Y(0.22), stroke: "#B9574B", "stroke-width": 1, "stroke-dasharray": "2 3" }, svg);
    var g = svgEl("text", { x: X(92), y: Y(0.22) - 6, "text-anchor": "middle", "class": "sub", style: "fill:#B9574B;font-weight:600" }, svg); g.textContent = "overfitting gap";
    var n = svgEl("text", { x: W - R, y: T + 8, "text-anchor": "end", "class": "sub" }, svg); n.textContent = "Illustration";
  })();

  /* ---------------- gradient descent animation ---------------- */
  var gd = { lr: 0.08, timer: null };
  function gdStart() {
    var svg = document.getElementById("gd");
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var W = 560, H = 300, L = 30, R = 30, T = 24, B = 40;
    var f = function (w) { return w * w; };            // loss surface
    var df = function (w) { return 2 * w; };
    var X = function (w) { return L + (w + 3) / 6 * (W - L - R); };
    var Y = function (v) { return T + (1 - v / 9) * (H - T - B); };
    var pts = [];
    for (var w = -3; w <= 3.001; w += 0.05) pts.push(X(w).toFixed(1) + "," + Y(f(w)).toFixed(1));
    svgEl("polyline", { points: pts.join(" "), fill: "none", stroke: "#1F2E2A", "stroke-width": 3 }, svg);
    svgEl("line", { x1: L, x2: W - R, y1: H - B, y2: H - B, stroke: "#9AA9A3" }, svg);
    var a = svgEl("text", { x: W - R, y: H - 14, "text-anchor": "end", "class": "sub" }, svg); a.textContent = "weight value";
    var b = svgEl("text", { x: L, y: 16, "class": "sub" }, svg); b.textContent = "loss";
    var m = svgEl("text", { x: X(0), y: H - B + 18, "text-anchor": "middle", "class": "sub", style: "fill:#69A297;font-weight:600" }, svg); m.textContent = "minimum";
    var trail = svgEl("g", {}, svg);
    var ball = svgEl("circle", { r: 9, fill: "#E8963A", stroke: "#fff", "stroke-width": 2 }, svg);
    var info = svgEl("text", { x: W / 2, y: 18, "text-anchor": "middle", "class": "lbl" }, svg);
    var cur = -2.7, step = 0, prev = null;
    clearInterval(gd.timer);
    function place() {
      var y = Math.min(f(cur), 9);
      ball.setAttribute("cx", X(Math.max(-3, Math.min(3, cur))));
      ball.setAttribute("cy", Y(y));
      info.textContent = "step " + step + "  ·  loss " + f(cur).toFixed(2);
    }
    place();
    gd.timer = setInterval(function () {
      prev = [X(Math.max(-3, Math.min(3, cur))), Y(Math.min(f(cur), 9))];
      cur = cur - gd.lr * df(cur);
      step++;
      if (Math.abs(cur) > 3) cur = Math.sign(cur) * 2.95;
      svgEl("line", { x1: prev[0], y1: prev[1], x2: X(cur), y2: Y(Math.min(f(cur), 9)), stroke: "#E8963A", "stroke-width": 1.6, "stroke-dasharray": "4 4", opacity: 0.8 }, trail);
      place();
      if (step >= 40) { clearInterval(gd.timer); setTimeout(gdStart, 1800); }
    }, 420);
  }
  Array.prototype.forEach.call(document.querySelectorAll(".gd-controls button"), function (btn) {
    btn.addEventListener("click", function () {
      gd.lr = parseFloat(btn.getAttribute("data-lr"));
      document.querySelectorAll(".gd-controls button").forEach(function (x) { x.classList.toggle("on", x === btn); });
      gdStart();
    });
  });

  /* ---------------- start ---------------- */
  var start = parseInt((location.hash || "").replace("#", ""), 10);
  fit();
  gdStart();
  show(isNaN(start) ? 0 : start - 1);
})();

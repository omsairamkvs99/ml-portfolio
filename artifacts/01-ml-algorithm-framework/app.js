(function () {
  "use strict";

  var byId = {};
  ALGORITHMS.forEach(function (a, i) { a.index = i + 1; byId[a.id] = a; });
  var DKEYS = ["tab", "cv", "nlp", "gen"];

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function dotsFor(a) {
    return DKEYS.filter(function (k) { return a.domains[k]; })
      .sort(function (x, y) { return a.domains[y] - a.domains[x]; })
      .map(function (k) {
      var lvl = a.domains[k] === 2 ? "" : " secondary";
      return '<span class="dot ' + k + lvl + '" title="' + DOMAINS[k].label +
        (a.domains[k] === 2 ? " (primary)" : " (secondary)") + '"></span>';
    }).join("");
  }

  /* jump to a card and highlight it */
  function focusCard(id) {
    var card = document.getElementById("algo-" + id);
    if (!card) return;
    if (card.classList.contains("hidden")) resetFilters();
    card.scrollIntoView({ behavior: "smooth", block: "start" });
    card.classList.remove("flash");
    void card.offsetWidth;
    card.classList.add("flash");
    setTimeout(function () { card.classList.remove("flash"); }, 2200);
  }

  function jumpButton(id, cls) {
    var a = byId[id];
    var b = el("button", cls, a.name);
    b.type = "button";
    b.addEventListener("click", function () { focusCard(id); });
    return b;
  }

  /* ---------- 1. concept tree ---------- */
  function renderTree() {
    var mount = document.getElementById("tree-mount");
    mount.appendChild(el("div", "tree-root",
      '<div class="root-node">Machine Learning<small>12 algorithms</small></div>'));
    mount.appendChild(el("div", "tree-stem"));
    mount.appendChild(el("div", "tree-bar"));

    var branches = el("div", "tree-branches");
    ["supervised", "unsupervised"].forEach(function (br) {
      var col = el("div", "branch");
      var count = ALGORITHMS.filter(function (a) {
        return br === "supervised" ? a.learning === "supervised" : a.learning !== "supervised";
      }).length;
      col.appendChild(el("div", "branch-head " + br,
        "<h3>" + LEARNING[br].label + " (" + count + ")</h3><p>" + LEARNING[br].note + "</p>"));

      GROUPS.filter(function (g) { return g.branch === br; }).forEach(function (g) {
        var isSelf = g.ids.every(function (id) { return byId[id].learning === "selfsupervised"; });
        var box = el("div", "group" + (isSelf ? " self" : ""));
        box.appendChild(el("div", "group-title", g.name));
        var chips = el("div", "chips");
        g.ids.forEach(function (id) {
          var a = byId[id];
          var c = el("button", "chip", a.name + '<span class="dots">' + dotsFor(a) + "</span>");
          c.type = "button";
          c.setAttribute("aria-label", a.name + ", view details");
          c.addEventListener("click", function () { focusCard(id); });
          chips.appendChild(c);
        });
        box.appendChild(chips);
        if (isSelf) {
          box.appendChild(el("p", "tree-note",
            "Dashed border: learns from unlabeled data by creating its own targets. Often fine tuned with labels afterward."));
        }
        col.appendChild(box);
      });
      branches.appendChild(col);
    });
    mount.appendChild(branches);
  }

  /* ---------- 2. domain matrix ---------- */
  function renderMatrix() {
    var t = document.getElementById("matrix-mount");
    var head = "<thead><tr><th>Algorithm</th><th>Learning style</th>" +
      DKEYS.map(function (k) {
        return '<th><span class="dot ' + k + '"></span>' + DOMAINS[k].short + "</th>";
      }).join("") + "</tr></thead>";
    t.innerHTML = head;

    var body = el("tbody");
    var totals = { tab: 0, cv: 0, nlp: 0, gen: 0 };
    GROUPS.forEach(function (g) {
      var gr = el("tr", "grouprow");
      gr.innerHTML = '<td colspan="6">' + LEARNING[g.branch].label + " &middot; " + g.name + "</td>";
      body.appendChild(gr);
      g.ids.forEach(function (id) {
        var a = byId[id];
        var tr = el("tr");
        var nameTd = el("td", "name");
        nameTd.appendChild(jumpButton(id));
        tr.appendChild(nameTd);
        tr.appendChild(el("td", "", '<span class="badge ' + a.learning + '">' +
          (a.learning === "selfsupervised" ? "Self supervised" : LEARNING[a.learning].label) + "</span>"));
        DKEYS.forEach(function (k) {
          var v = a.domains[k] || 0;
          if (v) totals[k]++;
          var cell = v === 2 ? '<span class="cell p c-' + k + '" title="Primary"></span>'
                   : v === 1 ? '<span class="cell s c-' + k + '" title="Secondary"></span>'
                   : '<span class="cell none" title="Not typical"></span>';
          tr.appendChild(el("td", "", cell));
        });
        body.appendChild(tr);
      });
    });
    t.appendChild(body);
    var foot = el("tfoot");
    foot.innerHTML = "<tr><td>Algorithms used in domain</td><td></td>" +
      DKEYS.map(function (k) { return "<td>" + totals[k] + "</td>"; }).join("") + "</tr>";
    t.appendChild(foot);
  }

  /* ---------- 3. cards + filters ---------- */
  var state = { learning: "all", domain: "all" };

  function renderFilters() {
    var f = document.getElementById("filters");
    var g1 = el("div", "filter-group", '<span class="label">Learning</span>');
    [["all", "All"], ["supervised", "Supervised"], ["unsupervised", "Unsupervised"], ["selfsupervised", "Self supervised only"]]
      .forEach(function (o) { g1.appendChild(fbtn("learning", o[0], o[1])); });
    var g2 = el("div", "filter-group", '<span class="label">Domain</span>');
    [["all", "All"]].concat(DKEYS.map(function (k) { return [k, DOMAINS[k].short]; }))
      .forEach(function (o) { g2.appendChild(fbtn("domain", o[0], o[1])); });
    f.appendChild(g1);
    f.appendChild(g2);
    f.appendChild(el("span", "count", ""));
  }

  function fbtn(group, val, label) {
    var b = el("button", "fbtn" + (state[group] === val ? " active" : ""), label);
    b.type = "button";
    b.dataset.group = group;
    b.dataset.val = val;
    b.addEventListener("click", function () {
      state[group] = val;
      applyFilters();
    });
    return b;
  }

  function resetFilters() { state.learning = "all"; state.domain = "all"; applyFilters(); }

  function applyFilters() {
    document.querySelectorAll(".fbtn").forEach(function (b) {
      b.classList.toggle("active", state[b.dataset.group] === b.dataset.val);
      b.setAttribute("aria-pressed", state[b.dataset.group] === b.dataset.val ? "true" : "false");
    });
    var shown = 0;
    ALGORITHMS.forEach(function (a) {
      var okL = state.learning === "all" ||
        (state.learning === "unsupervised" ? a.learning !== "supervised" : a.learning === state.learning);
      var okD = state.domain === "all" || !!a.domains[state.domain];
      var card = document.getElementById("algo-" + a.id);
      card.classList.toggle("hidden", !(okL && okD));
      if (okL && okD) shown++;
    });
    document.querySelector(".filters .count").textContent = "Showing " + shown + " of " + ALGORITHMS.length;
  }

  function renderCards() {
    var mount = document.getElementById("cards-mount");
    GROUPS.forEach(function (g) {
      g.ids.forEach(function (id) {
        var a = byId[id];
        var n = String(a.index).padStart(2, "0");
        var card = el("article", "card");
        card.id = "algo-" + a.id;

        var domainTags = DKEYS.filter(function (k) { return a.domains[k]; })
          .sort(function (x, y) { return a.domains[y] - a.domains[x]; })
          .map(function (k) {
            var p = a.domains[k] === 2;
            return '<span class="dtag ' + (p ? "p " : "s ") + k + '">' + DOMAINS[k].short +
              (p ? "" : " (secondary)") + "</span>";
          }).join("");

        var typeLabel = a.learning === "selfsupervised"
          ? "Unsupervised &middot; self supervised"
          : LEARNING[a.learning].label;

        var html =
          '<div class="num" aria-hidden="true">' + n + "</div>" +
          "<h3>" + a.name + "</h3>" +
          '<div class="sub"><span class="badge ' + a.learning + '">' + typeLabel + "</span>" +
          "<span>" + a.family + " &middot; " + a.task + "</span></div>" +
          '<h4>Application domains</h4><div class="domains">' + domainTags + "</div>" +
          "<h4>How it works</h4><p>" + a.how + "</p>" +
          "<h4>Real world use cases</h4><ul>" +
          a.uses.map(function (u) { return "<li>" + u + "</li>"; }).join("") + "</ul>";
        if (a.work) {
          html += '<div class="workbox"><strong>Connection to my work</strong>' + a.work + "</div>";
        }
        card.innerHTML = html;

        var rel = el("div", "related", "<span>Related:</span>");
        a.related.forEach(function (rid) { rel.appendChild(jumpButton(rid)); });
        card.appendChild(rel);
        mount.appendChild(card);
      });
    });
  }

  /* ---------- 4. relationship threads ---------- */
  var ARROW = '<svg viewBox="0 0 12 26" aria-hidden="true"><path d="M6 1v22M1 18l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function renderThreads() {
    var mount = document.getElementById("threads-mount");
    THREADS.forEach(function (t) {
      var box = el("div", "thread");
      box.appendChild(el("h3", "", t.title));
      var flow = el("div", "flow" + (t.parallel ? " parallel" : ""));
      if (t.lead) {
        flow.appendChild(el("span", "node plain", t.lead));
      }
      t.steps.forEach(function (s, i) {
        if (t.parallel) {
          if (i > 0) flow.appendChild(el("span", "sep", "vs"));
        } else if (i > 0 || t.lead) {
          flow.appendChild(el("span", "arrow", ARROW + (s.edge ? "<span>" + s.edge + "</span>" : "")));
        }
        flow.appendChild(jumpButton(s.id, "node"));
      });
      box.appendChild(flow);
      box.appendChild(el("p", "", t.note));
      mount.appendChild(box);
    });
  }

  renderTree();
  renderMatrix();
  renderFilters();
  renderCards();
  renderThreads();
  applyFilters();
})();

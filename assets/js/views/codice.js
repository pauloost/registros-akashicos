/* ============================================================
   REGISTROS AKÁSHICOS — views/codice.js
   Aba 2 · O Códice das Leis (Sistemas de Poder)
   Fase 2: enciclopédia mística — índice de verbetes, página
   de lei com gráfico de radar e blocos estruturados, editor
   com perfil ao vivo.
   ============================================================ */

window.Akasha = window.Akasha || {};
window.Akasha.views = window.Akasha.views || {};

(function (Akasha) {
  "use strict";

  var DOMAINS = ["Arcana", "Divina", "Elemental", "Espiritual", "Pactual", "Proibida"];

  // Estado interno da câmara
  var state = {
    mode: "list",      // "list" | "doc" | "editor"
    docId: null,       // verbete aberto
    editingId: null,
    query: "",
    sort: "recent",
    draftAttrs: null   // valores do radar durante a edição
  };

  var root = null;

  /* ---------- utilitários ---------- */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // Texto multilinha do usuário → HTML seguro com quebras preservadas
  function multiline(s) {
    return esc(s).replace(/\n/g, "<br>");
  }

  function fold(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function dateLabel(iso) {
    try {
      return new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
    } catch (e) { return ""; }
  }

  function laws() { return Akasha.storage.all("laws"); }

  function lawById(id) {
    var list = laws();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function filtered() {
    var q = fold(state.query);
    var list = laws().filter(function (l) {
      if (!q) return true;
      return fold(l.name + " " + (l.domain || "") + " " + (l.epigraph || "")).indexOf(q) !== -1;
    });
    if (state.sort === "name") {
      list.sort(function (a, b) { return a.name.localeCompare(b.name, "pt-BR"); });
    } else if (state.sort === "weight") {
      list.sort(function (a, b) { return Akasha.radar.weight(b.attributes) - Akasha.radar.weight(a.attributes); });
    } else {
      list.sort(function (a, b) { return a.updatedAt > b.updatedAt ? -1 : 1; });
    }
    return list;
  }

  function countLabel() {
    var n = laws().length;
    if (n === 0) return "nenhuma lei decretada";
    return n === 1 ? "1 lei decretada" : n + " leis decretadas";
  }

  /* ---------- templates: índice ---------- */

  function tplToolbar() {
    return [
      '<div class="toolbar">',
      '  <input class="input toolbar__search" type="search" id="laws-search"',
      '         placeholder="Buscar por nome, domínio ou epígrafe…"',
      '         value="' + esc(state.query) + '" aria-label="Buscar leis">',
      '  <select class="input toolbar__sort" id="laws-sort" aria-label="Ordenar leis">',
      '    <option value="recent"' + (state.sort === "recent" ? " selected" : "") + '>recentes primeiro</option>',
      '    <option value="name"' + (state.sort === "name" ? " selected" : "") + '>nome (a–z)</option>',
      '    <option value="weight"' + (state.sort === "weight" ? " selected" : "") + '>maior peso primeiro</option>',
      '  </select>',
      '  <button type="button" class="btn btn--gilt" data-action="new">✦ decretar lei</button>',
      '</div>'
    ].join("\n");
  }

  function tplCard(l) {
    return [
      '<article class="law-card corners">',
      '  <div class="law-card__body">',
      '    <h3 class="law-card__name">' + esc(l.name) + "</h3>",
      l.domain ? '    <span class="tag">lei ' + esc(l.domain).toLowerCase() + "</span>" : "",
      l.epigraph ? '    <p class="law-card__epigraph">“' + esc(l.epigraph) + "”</p>" : "",
      '    <div class="soul-card__meta law-card__meta">',
      '      <span>peso ' + Akasha.radar.weight(l.attributes).toFixed(1) + " / 10</span>",
      "    </div>",
      '    <div class="soul-card__actions">',
      '      <button type="button" class="btn btn--small" data-action="open" data-id="' + l.id + '">consultar verbete</button>',
      '      <button type="button" class="btn btn--small btn--quiet" data-action="delete" data-id="' + l.id + '">apagar</button>',
      "    </div>",
      "  </div>",
      '  <div class="law-card__radar" aria-hidden="true">',
      Akasha.radar.svg(l.attributes, { labels: false, dots: false, className: "radar--mini" }),
      "  </div>",
      "</article>"
    ].join("\n");
  }

  function tplGrid() {
    var list = filtered();
    if (list.length === 0 && laws().length === 0) {
      return [
        '<div class="altar">',
        '  <span class="altar__glyph" aria-hidden="true">',
        '    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1">',
        '      <path d="M20 3 L37 20 L20 37 L3 20 Z"/>',
        '      <path d="M20 10 L30 20 L20 30 L10 20 Z"/>',
        '      <circle cx="20" cy="20" r="2" fill="currentColor" stroke="none"/>',
        "    </svg>",
        "  </span>",
        '  <h3 class="altar__title">Nenhuma lei foi decretada</h3>',
        '  <p class="altar__text">Todo poder obedece a uma lei. Decrete a primeira e o códice começará a ordenar o impossível.</p>',
        '  <button type="button" class="btn btn--gilt altar__cta" data-action="new">✦ decretar a primeira lei ✦</button>',
        "</div>"
      ].join("\n");
    }
    if (list.length === 0) {
      return '<p class="whisper">Nenhuma lei responde a esse chamado.</p>';
    }
    return '<div class="laws">' + list.map(tplCard).join("\n") + "</div>";
  }

  /* ---------- templates: verbete (página wiki) ---------- */

  function tplLegend(attrs) {
    var rows = Akasha.radar.attributes.map(function (a) {
      var v = attrs && attrs[a.key] != null ? attrs[a.key] : 0;
      var pct = (v / Akasha.radar.max) * 100;
      return [
        '<div class="legend__row" title="' + esc(a.hint) + '">',
        '  <span class="legend__label">' + esc(a.label) + "</span>",
        '  <span class="legend__track"><span class="legend__bar" style="width:' + pct + '%"></span></span>',
        '  <span class="legend__value">' + v + "</span>",
        "</div>"
      ].join("");
    });
    return [
      '<div class="legend">',
      rows.join("\n"),
      '  <p class="legend__weight">peso da lei — <strong>' + Akasha.radar.weight(attrs).toFixed(1) + " / 10</strong></p>",
      "</div>"
    ].join("\n");
  }

  function tplBlock(numeral, title, text, emptyText) {
    return [
      '<section class="codex-block">',
      '  <h4 class="codex-block__title"><span class="chamber__numeral">' + numeral + "</span> " + title + "</h4>",
      text
        ? '  <div class="codex-block__text">' + multiline(text) + "</div>"
        : '  <p class="codex-block__empty">' + emptyText + "</p>",
      "</section>"
    ].join("\n");
  }

  function tplDoc() {
    var l = lawById(state.docId);
    if (!l) { state.mode = "list"; return tplToolbar() + '<div id="laws-grid">' + tplGrid() + "</div>"; }
    return [
      '<div class="editor-bar">',
      '  <button type="button" class="btn btn--small btn--quiet" data-action="back">← voltar ao índice</button>',
      '  <div class="doc-actions">',
      '    <button type="button" class="btn btn--small" data-action="edit" data-id="' + l.id + '">emendar lei</button>',
      '    <button type="button" class="btn btn--small btn--quiet" data-action="delete" data-id="' + l.id + '">revogar</button>',
      "  </div>",
      "</div>",
      '<article class="codex-doc">',
      '  <header class="codex-doc__header">',
      l.domain ? '    <span class="tag">lei ' + esc(l.domain).toLowerCase() + "</span>" : "",
      '    <h3 class="codex-doc__title">' + esc(l.name) + "</h3>",
      l.epigraph ? '    <blockquote class="codex-doc__epigraph">“' + esc(l.epigraph) + "”</blockquote>" : "",
      "  </header>",
      '  <div class="codex-profile corners">',
      '    <div class="codex-profile__chart">' + Akasha.radar.svg(l.attributes) + "</div>",
      tplLegend(l.attributes),
      "  </div>",
      tplBlock("I", "princípio da lei", l.principle, "O princípio desta lei ainda não foi transcrito."),
      tplBlock("II", "gatilhos de ativação", l.triggers, "Nenhum gatilho documentado — a lei dorme até ser invocada."),
      tplBlock("III", "limitações", l.limitations, "Os limites desta lei permanecem por mapear."),
      tplBlock("IV", "fraquezas da lei", l.weaknesses, "Nenhuma fraqueza registrada — desconfie: toda lei tem a sua."),
      '  <footer class="doc-meta">decretada em ' + dateLabel(l.createdAt) +
        (l.updatedAt !== l.createdAt ? " · última emenda em " + dateLabel(l.updatedAt) : "") + "</footer>",
      "</article>"
    ].join("\n");
  }

  /* ---------- templates: editor ---------- */

  function tplSliders() {
    return Akasha.radar.attributes.map(function (a) {
      var v = state.draftAttrs[a.key];
      return [
        '<div class="attr">',
        '  <div class="attr__head">',
        '    <label class="field__label attr__label" for="attr-' + a.key + '">' + esc(a.label) + "</label>",
        '    <output class="attr__value" id="attr-out-' + a.key + '">' + v + "</output>",
        "  </div>",
        '  <input type="range" class="attr__range" id="attr-' + a.key + '" min="0" max="10" step="1"',
        '         value="' + v + '" data-attr="' + a.key + '" title="' + esc(a.hint) + '">',
        "</div>"
      ].join("\n");
    }).join("\n");
  }

  function tplEditor() {
    var l = state.editingId ? lawById(state.editingId) : null;
    var options = ['<option value="">— sem domínio —</option>'];
    DOMAINS.forEach(function (d) {
      options.push('<option value="' + esc(d) + '"' +
        (l && l.domain === d ? " selected" : "") + ">" + esc(d) + "</option>");
    });
    return [
      '<div class="editor-bar">',
      '  <h3 class="editor-bar__title">' + (l ? "emendar lei" : "decretar nova lei") + "</h3>",
      '  <button type="button" class="btn btn--small btn--quiet" data-action="cancel">← voltar ao índice</button>',
      "</div>",
      '<div class="editor">',
      '  <form id="law-form" novalidate>',
      '    <div class="field" id="field-law-name">',
      '      <label class="field__label" for="law-name">nome da lei *</label>',
      '      <input class="input" id="law-name" name="name" value="' + esc(l ? l.name : "") + '" autocomplete="off" placeholder="ex.: Lei da Chama Emprestada">',
      '      <p class="field__error">Uma lei sem nome não pode ser decretada.</p>',
      "    </div>",
      '    <div class="field">',
      '      <label class="field__label" for="law-domain">domínio</label>',
      '      <select class="input" id="law-domain" name="domain">' + options.join("") + "</select>",
      "    </div>",
      '    <div class="field">',
      '      <label class="field__label" for="law-epigraph">epígrafe — o aforismo da lei</label>',
      '      <input class="input" id="law-epigraph" name="epigraph" value="' + esc(l ? l.epigraph : "") + '" placeholder="ex.: Todo fogo cobra em cinzas o que ilumina." autocomplete="off">',
      "    </div>",
      '    <div class="field">',
      '      <label class="field__label" for="law-principle">princípio da lei</label>',
      '      <textarea class="input" id="law-principle" name="principle" rows="5" placeholder="O conceito fundamental: o que esta lei governa e como opera…">' + esc(l ? l.principle : "") + "</textarea>",
      "    </div>",
      '    <div class="field">',
      '      <label class="field__label" for="law-triggers">gatilhos de ativação</label>',
      '      <textarea class="input" id="law-triggers" name="triggers" rows="4" placeholder="Condições, gestos, palavras ou estados que despertam a lei…">' + esc(l ? l.triggers : "") + "</textarea>",
      "    </div>",
      '    <div class="field">',
      '      <label class="field__label" for="law-limitations">limitações</label>',
      '      <textarea class="input" id="law-limitations" name="limitations" rows="4" placeholder="Até onde a lei alcança — e onde ela simplesmente para…">' + esc(l ? l.limitations : "") + "</textarea>",
      "    </div>",
      '    <div class="field">',
      '      <label class="field__label" for="law-weaknesses">fraquezas da lei</label>',
      '      <textarea class="input" id="law-weaknesses" name="weaknesses" rows="4" placeholder="Brechas, contramedidas e preços ocultos que a lei não confessa…">' + esc(l ? l.weaknesses : "") + "</textarea>",
      "    </div>",
      '    <div class="editor__actions">',
      '      <button type="submit" class="btn btn--gilt">' + (l ? "selar emenda" : "decretar no códice") + "</button>",
      '      <button type="button" class="btn btn--quiet" data-action="cancel">descartar</button>',
      "    </div>",
      "  </form>",
      '  <aside class="oracle corners" aria-label="Perfil da lei">',
      '    <h3 class="oracle__title">⟡ perfil da lei</h3>',
      '    <p class="oracle__hint">Ajuste os seis eixos e a teia se redesenha. Uma forma grande é uma lei forte — e cara.</p>',
      '    <div class="attr-chart" id="radar-live">' + Akasha.radar.svg(state.draftAttrs) + "</div>",
      '    <div class="attrs">' + tplSliders() + "</div>",
      '    <p class="legend__weight">peso da lei — <strong id="law-weight">' + Akasha.radar.weight(state.draftAttrs).toFixed(1) + " / 10</strong></p>",
      "  </aside>",
      "</div>"
    ].join("\n");
  }

  /* ---------- pintura ---------- */

  function paint() {
    root.querySelector("#codice-count").textContent = countLabel();
    var body = root.querySelector("#codice-body");
    if (state.mode === "editor") body.innerHTML = tplEditor();
    else if (state.mode === "doc") body.innerHTML = tplDoc();
    else body.innerHTML = tplToolbar() + '<div id="laws-grid">' + tplGrid() + "</div>";
  }

  function paintGrid() {
    root.querySelector("#codice-count").textContent = countLabel();
    var grid = root.querySelector("#laws-grid");
    if (grid) grid.innerHTML = tplGrid();
  }

  function paintRadarLive() {
    var chart = root.querySelector("#radar-live");
    if (chart) chart.innerHTML = Akasha.radar.svg(state.draftAttrs);
    var weight = root.querySelector("#law-weight");
    if (weight) weight.textContent = Akasha.radar.weight(state.draftAttrs).toFixed(1) + " / 10";
  }

  /* ---------- ações ---------- */

  function openDoc(id) {
    state.mode = "doc";
    state.docId = id;
    paint();
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openEditor(id) {
    var l = id ? lawById(id) : null;
    state.mode = "editor";
    state.editingId = id;
    state.draftAttrs = l && l.attributes
      ? Object.assign(Akasha.radar.defaults(), l.attributes)
      : Akasha.radar.defaults();
    paint();
    var name = root.querySelector("#law-name");
    if (name) name.focus();
  }

  function backToList() {
    state.mode = "list";
    state.docId = null;
    state.editingId = null;
    state.draftAttrs = null;
    paint();
  }

  function saveLaw(form) {
    var name = form.name.value.trim();
    var fieldName = root.querySelector("#field-law-name");
    if (!name) {
      fieldName.classList.add("field--error");
      form.name.focus();
      return;
    }
    fieldName.classList.remove("field--error");

    var record = {
      name: name,
      domain: form.domain.value,
      epigraph: form.epigraph.value.trim(),
      principle: form.principle.value.trim(),
      triggers: form.triggers.value.trim(),
      limitations: form.limitations.value.trim(),
      weaknesses: form.weaknesses.value.trim(),
      attributes: Object.assign({}, state.draftAttrs)
    };

    var saved;
    if (state.editingId) {
      saved = Akasha.storage.update("laws", state.editingId, record);
    } else {
      saved = Akasha.storage.add("laws", record);
    }
    // Após selar, abre o verbete recém-escrito — comportamento de wiki
    state.editingId = null;
    state.draftAttrs = null;
    openDoc(saved.id);
  }

  function armDelete(btn) {
    if (btn.dataset.armed) {
      Akasha.storage.remove("laws", btn.dataset.id);
      if (state.mode === "doc") backToList();
      else paintGrid();
      return;
    }
    disarmDeletes();
    btn.dataset.armed = "1";
    btn.classList.add("btn--armed");
    btn.textContent = "confirmar?";
  }

  function disarmDeletes() {
    Array.prototype.forEach.call(root.querySelectorAll("[data-action='delete'][data-armed]"), function (b) {
      delete b.dataset.armed;
      b.classList.remove("btn--armed");
      b.textContent = state.mode === "doc" ? "revogar" : "apagar";
    });
  }

  /* ---------- eventos delegados ---------- */

  function onClick(e) {
    var btn = e.target.closest("[data-action]");
    if (!btn) { disarmDeletes(); return; }
    var action = btn.dataset.action;

    if (action !== "delete") disarmDeletes();

    if (action === "new") openEditor(null);
    else if (action === "open") openDoc(btn.dataset.id);
    else if (action === "edit") openEditor(btn.dataset.id);
    else if (action === "delete") armDelete(btn);
    else if (action === "cancel" || action === "back") backToList();
  }

  function onInput(e) {
    if (e.target.id === "laws-search") {
      state.query = e.target.value;
      paintGrid();
    } else if (e.target.classList.contains("attr__range")) {
      var key = e.target.dataset.attr;
      state.draftAttrs[key] = Number(e.target.value);
      var out = root.querySelector("#attr-out-" + key);
      if (out) out.textContent = e.target.value;
      paintRadarLive();
    }
  }

  function onChange(e) {
    if (e.target.id === "laws-sort") {
      state.sort = e.target.value;
      paintGrid();
    }
  }

  function onSubmit(e) {
    if (e.target.id === "law-form") {
      e.preventDefault();
      saveLaw(e.target);
    }
  }

  /* ---------- registro da view ---------- */

  Akasha.views.codice = {
    route: "codice",
    title: "O Códice das Leis",

    render: function () {
      return [
        '<section class="chamber" id="codice-root" aria-labelledby="chamber-title-codice">',
        '  <header class="chamber__header">',
        '    <span class="chamber__numeral">II</span>',
        '    <h2 class="chamber__title" id="chamber-title-codice">O Códice das Leis</h2>',
        '    <span class="chamber__count" id="codice-count"></span>',
        "  </header>",
        '  <p class="chamber__lede">Todo poder obedece a uma lei. Aqui se documenta o funcionamento técnico do universo: mecânicas, gatilhos, limitações, fraquezas — e a teia que pesa cada técnica.</p>',
        '  <div id="codice-body"></div>',
        "</section>"
      ].join("\n");
    },

    mount: function (viewEl) {
      root = viewEl.querySelector("#codice-root");
      state.mode = "list";
      state.docId = null;
      state.editingId = null;
      state.query = "";
      state.draftAttrs = null;
      root.addEventListener("click", onClick);
      root.addEventListener("input", onInput);
      root.addEventListener("change", onChange);
      root.addEventListener("submit", onSubmit);
      paint();
    }
  };

})(window.Akasha);

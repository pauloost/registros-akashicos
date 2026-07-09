/* ============================================================
   REGISTROS AKÁSHICOS — views/almas.js
   Aba 1 · O Livro das Almas (Character Design)
   Fase 1: CRUD de fichas, busca, ordenação e o Oráculo
   (gerador de fragmentos de lore/profecias).
   ============================================================ */

window.Akasha = window.Akasha || {};
window.Akasha.views = window.Akasha.views || {};

(function (Akasha) {
  "use strict";

  // Estado interno da câmara (sobrevive apenas enquanto a aba está montada)
  var state = {
    mode: "list",     // "list" | "editor"
    editingId: null,
    query: "",
    sort: "recent",
    draft: null       // { prophecies: [...], last: string|null } durante a edição
  };

  var root = null; // <section> recriado a cada montagem — sem listeners duplicados

  /* ---------- utilitários ---------- */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // Busca insensível a caixa e acentos
  function fold(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function souls() { return Akasha.storage.all("souls"); }

  function soulById(id) {
    var list = souls();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function filtered() {
    var q = fold(state.query);
    var list = souls().filter(function (s) {
      if (!q) return true;
      return fold(s.name + " " + (s.epithet || "") + " " + (s.archetype || "")).indexOf(q) !== -1;
    });
    if (state.sort === "name") {
      list.sort(function (a, b) { return a.name.localeCompare(b.name, "pt-BR"); });
    } else if (state.sort === "oldest") {
      list.sort(function (a, b) { return a.createdAt < b.createdAt ? -1 : 1; });
    } else {
      list.sort(function (a, b) { return a.updatedAt > b.updatedAt ? -1 : 1; });
    }
    return list;
  }

  function countLabel() {
    var n = souls().length;
    if (n === 0) return "nenhuma alma inscrita";
    return n === 1 ? "1 alma inscrita" : n + " almas inscritas";
  }

  /* ---------- templates ---------- */

  function tplToolbar() {
    return [
      '<div class="toolbar">',
      '  <input class="input toolbar__search" type="search" id="souls-search"',
      '         placeholder="Buscar por nome, epíteto ou arquétipo…"',
      '         value="' + esc(state.query) + '" aria-label="Buscar almas">',
      '  <select class="input toolbar__sort" id="souls-sort" aria-label="Ordenar almas">',
      '    <option value="recent"' + (state.sort === "recent" ? " selected" : "") + '>recentes primeiro</option>',
      '    <option value="name"' + (state.sort === "name" ? " selected" : "") + '>nome (a–z)</option>',
      '    <option value="oldest"' + (state.sort === "oldest" ? " selected" : "") + '>antigas primeiro</option>',
      '  </select>',
      '  <button type="button" class="btn btn--gilt" data-action="new">✦ inscrever alma</button>',
      '</div>'
    ].join("\n");
  }

  function tplCard(s) {
    var lastProphecy = (s.prophecies && s.prophecies.length)
      ? s.prophecies[s.prophecies.length - 1].text : null;
    return [
      '<article class="soul-card corners">',
      '  <h3 class="soul-card__name">' + esc(s.name) + '</h3>',
      s.epithet ? '  <p class="soul-card__epithet">' + esc(s.epithet) + '</p>' : "",
      s.archetype ? '  <span class="tag">' + esc(s.archetype) + '</span>' : "",
      lastProphecy ? '  <p class="soul-card__prophecy">' + esc(lastProphecy) + '</p>' : "",
      '  <div class="soul-card__meta">',
      '    <span>' + (s.abilities ? s.abilities.length : 0) + ' habilidade(s)</span>',
      '    <span>' + (s.prophecies ? s.prophecies.length : 0) + ' profecia(s)</span>',
      '  </div>',
      '  <div class="soul-card__actions">',
      '    <button type="button" class="btn btn--small" data-action="edit" data-id="' + s.id + '">abrir registro</button>',
      '    <button type="button" class="btn btn--small btn--quiet" data-action="delete" data-id="' + s.id + '">apagar</button>',
      '  </div>',
      '</article>'
    ].join("\n");
  }

  function tplGrid() {
    var list = filtered();
    if (list.length === 0 && souls().length === 0) {
      return [
        '<div class="altar">',
        '  <span class="altar__glyph" aria-hidden="true">',
        '    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1">',
        '      <circle cx="20" cy="20" r="17"/>',
        '      <path d="M20 6 v28 M11 10.5 c6 5 12 5 18 0 M11 29.5 c6 -5 12 -5 18 0"/>',
        '      <circle cx="20" cy="20" r="3"/>',
        '    </svg>',
        '  </span>',
        '  <h3 class="altar__title">O livro aguarda a primeira alma</h3>',
        '  <p class="altar__text">Inscreva um personagem para que o registro comece — e o oráculo terá sobre quem falar.</p>',
        '  <button type="button" class="btn btn--gilt altar__cta" data-action="new">✦ inscrever a primeira alma ✦</button>',
        '</div>'
      ].join("\n");
    }
    if (list.length === 0) {
      return '<p class="whisper">Nenhuma alma responde a esse chamado.</p>';
    }
    return '<div class="souls">' + list.map(tplCard).join("\n") + "</div>";
  }

  function tplOracle(soul) {
    var d = state.draft;
    var parts = [
      '<aside class="oracle corners" id="oracle-panel" aria-label="O Oráculo">',
      '  <h3 class="oracle__title">⟡ o oráculo</h3>',
      '  <p class="oracle__hint">Consulte o véu para receber um fragmento de lore sobre esta alma. Grave os que soarem verdadeiros.</p>',
      d.last
        ? '  <p class="oracle__text">' + esc(d.last) + "</p>"
        : '  <p class="oracle__text oracle__text--empty">O véu permanece imóvel, aguardando a consulta…</p>',
      '  <div class="oracle__actions">',
      '    <button type="button" class="btn" data-action="divine">consultar o oráculo</button>',
      d.last ? '    <button type="button" class="btn btn--gilt" data-action="keep-prophecy">gravar fragmento</button>' : "",
      "  </div>"
    ];
    if (d.prophecies.length) {
      parts.push('  <h4 class="oracle__subtitle">fragmentos gravados</h4>');
      parts.push('  <ul class="prophecies">');
      d.prophecies.forEach(function (p, i) {
        parts.push(
          '    <li class="prophecy">' + esc(p.text) +
          '<button type="button" class="prophecy__remove" data-action="remove-prophecy" data-index="' + i +
          '" aria-label="Remover fragmento">✕</button></li>'
        );
      });
      parts.push("  </ul>");
    }
    parts.push("</aside>");
    return parts.join("\n");
  }

  function tplEditor() {
    var s = state.editingId ? soulById(state.editingId) : null;
    var options = ['<option value="">— sem arquétipo —</option>'];
    Akasha.oracle.archetypes.forEach(function (a) {
      options.push('<option value="' + esc(a) + '"' +
        (s && s.archetype === a ? " selected" : "") + ">" + esc(a) + "</option>");
    });
    return [
      '<div class="editor-bar">',
      '  <h3 class="editor-bar__title">' + (s ? "editar registro" : "inscrever nova alma") + "</h3>",
      '  <button type="button" class="btn btn--small btn--quiet" data-action="cancel">← voltar ao livro</button>',
      "</div>",
      '<div class="editor">',
      '  <form id="soul-form" novalidate>',
      '    <div class="field" id="field-name">',
      '      <label class="field__label" for="soul-name">nome *</label>',
      '      <input class="input" id="soul-name" name="name" value="' + esc(s ? s.name : "") + '" autocomplete="off">',
      '      <p class="field__error">Toda alma precisa de um nome para ser inscrita.</p>',
      "    </div>",
      '    <div class="field">',
      '      <label class="field__label" for="soul-epithet">epíteto / título</label>',
      '      <input class="input" id="soul-epithet" name="epithet" value="' + esc(s ? s.epithet : "") + '" placeholder="ex.: a Última Chama do Norte" autocomplete="off">',
      "    </div>",
      '    <div class="field">',
      '      <label class="field__label" for="soul-archetype">arquétipo</label>',
      '      <select class="input" id="soul-archetype" name="archetype">' + options.join("") + "</select>",
      "    </div>",
      '    <div class="field">',
      '      <label class="field__label" for="soul-story">história</label>',
      '      <textarea class="input" id="soul-story" name="story" rows="7" placeholder="Origem, feitos, quedas e renascimentos…">' + esc(s ? s.story : "") + "</textarea>",
      "    </div>",
      '    <div class="field">',
      '      <label class="field__label" for="soul-abilities">habilidades — uma por linha</label>',
      '      <textarea class="input" id="soul-abilities" name="abilities" rows="4" placeholder="ex.: Chama Interior — conjura fogo a partir de memórias">' + esc(s && s.abilities ? s.abilities.join("\n") : "") + "</textarea>",
      "    </div>",
      '    <div class="field">',
      '      <label class="field__label" for="soul-bonds">vínculos</label>',
      '      <textarea class="input" id="soul-bonds" name="bonds" rows="3" placeholder="Aliados, rivais, dívidas e juramentos…">' + esc(s ? s.bonds : "") + "</textarea>",
      "    </div>",
      '    <div class="editor__actions">',
      '      <button type="submit" class="btn btn--gilt">' + (s ? "selar alterações" : "inscrever no livro") + "</button>",
      '      <button type="button" class="btn btn--quiet" data-action="cancel">descartar</button>',
      "    </div>",
      "  </form>",
      tplOracle(s),
      "</div>"
    ].join("\n");
  }

  /* ---------- pintura ---------- */

  function paint() {
    root.querySelector("#almas-count").textContent = countLabel();
    root.querySelector("#almas-body").innerHTML =
      state.mode === "editor" ? tplEditor() : tplToolbar() + '<div id="souls-grid">' + tplGrid() + "</div>";
  }

  // Repinta apenas os resultados — preserva o foco do campo de busca
  function paintGrid() {
    root.querySelector("#almas-count").textContent = countLabel();
    var grid = root.querySelector("#souls-grid");
    if (grid) grid.innerHTML = tplGrid();
  }

  function paintOracle() {
    var panel = root.querySelector("#oracle-panel");
    if (panel) panel.outerHTML = tplOracle(state.editingId ? soulById(state.editingId) : null);
  }

  /* ---------- ações ---------- */

  function openEditor(id) {
    var s = id ? soulById(id) : null;
    state.mode = "editor";
    state.editingId = id;
    state.draft = {
      prophecies: s && s.prophecies ? s.prophecies.slice() : [],
      last: null
    };
    paint();
    var name = root.querySelector("#soul-name");
    if (name) name.focus();
  }

  function closeEditor() {
    state.mode = "list";
    state.editingId = null;
    state.draft = null;
    paint();
  }

  function saveSoul(form) {
    var name = form.name.value.trim();
    var fieldName = root.querySelector("#field-name");
    if (!name) {
      fieldName.classList.add("field--error");
      form.name.focus();
      return;
    }
    fieldName.classList.remove("field--error");

    var record = {
      name: name,
      epithet: form.epithet.value.trim(),
      archetype: form.archetype.value,
      story: form.story.value.trim(),
      abilities: form.abilities.value.split("\n")
        .map(function (l) { return l.trim(); })
        .filter(Boolean),
      bonds: form.bonds.value.trim(),
      prophecies: state.draft.prophecies
    };

    if (state.editingId) {
      Akasha.storage.update("souls", state.editingId, record);
    } else {
      Akasha.storage.add("souls", record);
    }
    closeEditor();
  }

  // Apagar em dois toques: o primeiro arma o botão, o segundo confirma
  function armDelete(btn) {
    if (btn.dataset.armed) {
      Akasha.storage.remove("souls", btn.dataset.id);
      paintGrid();
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
      b.textContent = "apagar";
    });
  }

  /* ---------- eventos delegados ---------- */

  function onClick(e) {
    var btn = e.target.closest("[data-action]");
    if (!btn) { disarmDeletes(); return; }
    var action = btn.dataset.action;

    if (action !== "delete") disarmDeletes();

    if (action === "new") openEditor(null);
    else if (action === "edit") openEditor(btn.dataset.id);
    else if (action === "delete") armDelete(btn);
    else if (action === "cancel") closeEditor();
    else if (action === "divine") {
      var form = root.querySelector("#soul-form");
      state.draft.last = Akasha.oracle.divine({
        name: form.name.value,
        archetype: form.archetype.value
      });
      paintOracle();
    }
    else if (action === "keep-prophecy") {
      state.draft.prophecies.push({ text: state.draft.last, at: new Date().toISOString() });
      state.draft.last = null;
      paintOracle();
    }
    else if (action === "remove-prophecy") {
      state.draft.prophecies.splice(Number(btn.dataset.index), 1);
      paintOracle();
    }
  }

  function onInput(e) {
    if (e.target.id === "souls-search") {
      state.query = e.target.value;
      paintGrid();
    }
  }

  function onChange(e) {
    if (e.target.id === "souls-sort") {
      state.sort = e.target.value;
      paintGrid();
    }
  }

  function onSubmit(e) {
    if (e.target.id === "soul-form") {
      e.preventDefault();
      saveSoul(e.target);
    }
  }

  /* ---------- registro da view ---------- */

  Akasha.views.almas = {
    route: "almas",
    title: "O Livro das Almas",

    render: function () {
      return [
        '<section class="chamber" id="almas-root" aria-labelledby="chamber-title-almas">',
        '  <header class="chamber__header">',
        '    <span class="chamber__numeral">I</span>',
        '    <h2 class="chamber__title" id="chamber-title-almas">O Livro das Almas</h2>',
        '    <span class="chamber__count" id="almas-count"></span>',
        "  </header>",
        '  <p class="chamber__lede">Cada personagem é uma alma inscrita no registro: nome, história, habilidades — e os fragmentos de profecia que o destino sussurra sobre ela.</p>',
        '  <div id="almas-body"></div>',
        "</section>"
      ].join("\n");
    },

    // Chamado pelo roteador após o render; o <section> é novo a cada
    // montagem, então os listeners nunca se acumulam.
    mount: function (viewEl) {
      root = viewEl.querySelector("#almas-root");
      state.mode = "list";
      state.editingId = null;
      state.query = "";
      state.draft = null;
      root.addEventListener("click", onClick);
      root.addEventListener("input", onInput);
      root.addEventListener("change", onChange);
      root.addEventListener("submit", onSubmit);
      paint();
    }
  };

})(window.Akasha);

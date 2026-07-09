/* ============================================================
   REGISTROS AKÁSHICOS — views/almas.js
   Aba 1 · O Livro das Almas (Character Design)
   Fase 0: câmara com estado vazio; CRUD chega na Fase 1.
   ============================================================ */

window.Akasha = window.Akasha || {};
window.Akasha.views = window.Akasha.views || {};

window.Akasha.views.almas = {
  route: "almas",
  title: "O Livro das Almas",

  render: function () {
    var count = window.Akasha.storage.count("souls");
    return [
      '<section class="chamber" aria-labelledby="chamber-title-almas">',
      '  <header class="chamber__header">',
      '    <span class="chamber__numeral">I</span>',
      '    <h2 class="chamber__title" id="chamber-title-almas">O Livro das Almas</h2>',
      '    <span class="chamber__count">' + count + ' alma(s) inscrita(s)</span>',
      '  </header>',
      '  <p class="chamber__lede">Cada personagem é uma alma inscrita no registro: nome, história, habilidades — e os fragmentos de profecia que o destino ainda sussurra sobre ela.</p>',
      '  <div class="altar">',
      '    <span class="altar__glyph" aria-hidden="true">',
      '      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1">',
      '        <circle cx="20" cy="20" r="17"/>',
      '        <path d="M20 6 v28 M11 10.5 c6 5 12 5 18 0 M11 29.5 c6 -5 12 -5 18 0"/>',
      '        <circle cx="20" cy="20" r="3"/>',
      '      </svg>',
      '    </span>',
      '    <h3 class="altar__title">O livro aguarda a primeira alma</h3>',
      '    <p class="altar__text">Em breve, este altar receberá fichas de personagens com nome, história, habilidades e um gerador de fragmentos de lore.</p>',
      '    <span class="altar__seal">✦ selado até a fase i ✦</span>',
      '  </div>',
      '</section>'
    ].join("\n");
  }
};

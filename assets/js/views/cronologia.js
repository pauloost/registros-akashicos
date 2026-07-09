/* ============================================================
   REGISTROS AKÁSHICOS — views/cronologia.js
   Aba 3 · A Linha do Tempo (Chronology)
   Fase 0: câmara com estado vazio; timeline chega na Fase 3.
   ============================================================ */

window.Akasha = window.Akasha || {};
window.Akasha.views = window.Akasha.views || {};

window.Akasha.views.cronologia = {
  route: "cronologia",
  title: "A Linha do Tempo",

  render: function () {
    var count = window.Akasha.storage.count("events");
    return [
      '<section class="chamber" aria-labelledby="chamber-title-cronologia">',
      '  <header class="chamber__header">',
      '    <span class="chamber__numeral">III</span>',
      '    <h2 class="chamber__title" id="chamber-title-cronologia">A Linha do Tempo</h2>',
      '    <span class="chamber__count">' + count + ' evento(s) gravado(s)</span>',
      '  </header>',
      '  <p class="chamber__lede">Eras nascem, impérios ruem, cometas anunciam. Esta linha guarda os grandes marcos da história do seu mundo, do primeiro amanhecer ao último silêncio.</p>',
      '  <div class="altar">',
      '    <span class="altar__glyph" aria-hidden="true">',
      '      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1">',
      '        <line x1="20" y1="2" x2="20" y2="38"/>',
      '        <circle cx="20" cy="8" r="2.5"/>',
      '        <circle cx="20" cy="20" r="4"/>',
      '        <circle cx="20" cy="32" r="2.5"/>',
      '      </svg>',
      '    </span>',
      '    <h3 class="altar__title">O tempo ainda não foi gravado</h3>',
      '    <p class="altar__text">Em breve, este altar receberá uma linha do tempo interativa e minimalista, com eras agrupadas e eventos vinculados a almas e leis.</p>',
      '    <span class="altar__seal">✦ selado até a fase iii ✦</span>',
      '  </div>',
      '</section>'
    ].join("\n");
  }
};

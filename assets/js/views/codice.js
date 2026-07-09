/* ============================================================
   REGISTROS AKÁSHICOS — views/codice.js
   Aba 2 · O Códice das Leis (Sistemas de Poder)
   Fase 0: câmara com estado vazio; documentos chegam na Fase 2.
   ============================================================ */

window.Akasha = window.Akasha || {};
window.Akasha.views = window.Akasha.views || {};

window.Akasha.views.codice = {
  route: "codice",
  title: "O Códice das Leis",

  render: function () {
    var count = window.Akasha.storage.count("laws");
    return [
      '<section class="chamber" aria-labelledby="chamber-title-codice">',
      '  <header class="chamber__header">',
      '    <span class="chamber__numeral">II</span>',
      '    <h2 class="chamber__title" id="chamber-title-codice">O Códice das Leis</h2>',
      '    <span class="chamber__count">' + count + ' lei(s) decretada(s)</span>',
      '  </header>',
      '  <p class="chamber__lede">Todo poder obedece a uma lei. Aqui se documenta o funcionamento técnico do universo: mecânicas, limitações, fraquezas e as escalas que ordenam o impossível.</p>',
      '  <div class="altar">',
      '    <span class="altar__glyph" aria-hidden="true">',
      '      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1">',
      '        <path d="M20 3 L37 20 L20 37 L3 20 Z"/>',
      '        <path d="M20 10 L30 20 L20 30 L10 20 Z"/>',
      '        <circle cx="20" cy="20" r="2" fill="currentColor" stroke="none"/>',
      '      </svg>',
      '    </span>',
      '    <h3 class="altar__title">Nenhuma lei foi decretada</h3>',
      '    <p class="altar__text">Em breve, este altar receberá documentos estruturados de sistemas de poder: princípio, mecânica, limitações, fraquezas e escalas configuráveis.</p>',
      '    <span class="altar__seal">✦ selado até a fase ii ✦</span>',
      '  </div>',
      '</section>'
    ].join("\n");
  }
};

/* ============================================================
   REGISTROS AKÁSHICOS — radar.js
   Gráfico de radar (teia) em SVG dinâmico, sem bibliotecas.
   Usado pelo Códice das Leis para o perfil das técnicas:
   um hexágono onde forma grande = lei forte E cara.
   ============================================================ */

window.Akasha = window.Akasha || {};

(function (Akasha) {
  "use strict";

  // Os seis eixos de análise e balanceamento de um sistema de poder
  var ATTRIBUTES = [
    { key: "potencia",      label: "potência",      hint: "Impacto bruto da técnica em seu auge." },
    { key: "alcance",       label: "alcance",       hint: "Distância e área que a lei é capaz de cobrir." },
    { key: "versatilidade", label: "versatilidade", hint: "Amplitude de aplicações e desdobramentos (hax)." },
    { key: "controle",      label: "controle",      hint: "Precisão e domínio exigidos do praticante." },
    { key: "exaustao",      label: "exaustão",      hint: "Custo vital, mental ou material de cada uso." },
    { key: "restricao",     label: "restrição",     hint: "Peso das condições e gatilhos para ativar." }
  ];

  var MAX = 10;
  var SIZE = 300;          // viewBox — a largura real é fluida via CSS
  var CX = SIZE / 2, CY = SIZE / 2;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // Ponto no eixo i (começando no topo, sentido horário) à fração t do raio
  function point(i, t, radius) {
    var angle = (Math.PI * 2 * i) / ATTRIBUTES.length - Math.PI / 2;
    return {
      x: CX + radius * t * Math.cos(angle),
      y: CY + radius * t * Math.sin(angle),
      cos: Math.cos(angle),
      sin: Math.sin(angle)
    };
  }

  function polygonPoints(t, radius) {
    var pts = [];
    for (var i = 0; i < ATTRIBUTES.length; i++) {
      var p = point(i, t, radius);
      pts.push(p.x.toFixed(1) + "," + p.y.toFixed(1));
    }
    return pts.join(" ");
  }

  function clamp(v) {
    v = Number(v);
    if (isNaN(v)) return 0;
    return Math.max(0, Math.min(MAX, v));
  }

  /**
   * Gera o SVG do radar como string.
   * @param {Object} values — { potencia: 7, alcance: 4, ... } (0–10)
   * @param {Object} [opts] — { labels: true, dots: true, className: "" }
   */
  function svg(values, opts) {
    values = values || {};
    opts = opts || {};
    var labels = opts.labels !== false;
    var dots = opts.dots !== false;
    var radius = labels ? 105 : 138; // sem rótulos, a teia ocupa a moldura toda

    // Com rótulos, o quadro se alarga para que os textos laterais
    // ("versatilidade", "restrição"…) não sejam cortados pelo viewBox
    var viewBox = labels ? "-48 -6 396 312" : "0 0 " + SIZE + " " + SIZE;

    var out = [
      '<svg class="radar ' + esc(opts.className || "") + '" viewBox="' + viewBox + '"',
      '     role="img" aria-label="Perfil da lei em seis atributos">'
    ];

    // Teia: anéis concêntricos (20%…100%) e raios
    for (var ring = 1; ring <= 5; ring++) {
      out.push('<polygon class="radar__ring" points="' + polygonPoints(ring / 5, radius) + '"/>');
    }
    for (var i = 0; i < ATTRIBUTES.length; i++) {
      var tip = point(i, 1, radius);
      out.push('<line class="radar__spoke" x1="' + CX + '" y1="' + CY +
               '" x2="' + tip.x.toFixed(1) + '" y2="' + tip.y.toFixed(1) + '"/>');
    }

    // Polígono dos valores
    var dataPts = [];
    for (i = 0; i < ATTRIBUTES.length; i++) {
      var v = clamp(values[ATTRIBUTES[i].key]);
      dataPts.push(point(i, v / MAX, radius));
    }
    out.push('<g class="radar__data">');
    out.push('<polygon class="radar__shape" points="' +
      dataPts.map(function (p) { return p.x.toFixed(1) + "," + p.y.toFixed(1); }).join(" ") + '"/>');

    // Vértices interativos: tooltip nativo com atributo e valor
    if (dots) {
      for (i = 0; i < ATTRIBUTES.length; i++) {
        var a = ATTRIBUTES[i];
        out.push('<circle class="radar__dot" cx="' + dataPts[i].x.toFixed(1) +
          '" cy="' + dataPts[i].y.toFixed(1) + '" r="3.5">' +
          "<title>" + esc(a.label) + ": " + clamp(values[a.key]) + " / " + MAX +
          " — " + esc(a.hint) + "</title></circle>");
      }
    }
    out.push("</g>");

    // Rótulos dos eixos, ancorados conforme o quadrante
    if (labels) {
      for (i = 0; i < ATTRIBUTES.length; i++) {
        var lp = point(i, 1, radius + 16);
        var anchor = lp.cos > 0.35 ? "start" : lp.cos < -0.35 ? "end" : "middle";
        var dy = lp.sin < -0.35 ? -2 : lp.sin > 0.35 ? 8 : 3;
        out.push('<text class="radar__label" x="' + lp.x.toFixed(1) +
          '" y="' + (lp.y + dy).toFixed(1) + '" text-anchor="' + anchor + '">' +
          esc(ATTRIBUTES[i].label) + "</text>");
      }
    }

    out.push("</svg>");
    return out.join("\n");
  }

  Akasha.radar = {
    attributes: ATTRIBUTES,
    max: MAX,
    svg: svg,

    /** Valores padrão (tudo em 5 — o ponto de equilíbrio). */
    defaults: function () {
      var v = {};
      ATTRIBUTES.forEach(function (a) { v[a.key] = 5; });
      return v;
    },

    /** Peso da lei: média dos seis atributos, 1 casa decimal. */
    weight: function (values) {
      values = values || {};
      var sum = 0;
      ATTRIBUTES.forEach(function (a) { sum += clamp(values[a.key]); });
      return Math.round((sum / ATTRIBUTES.length) * 10) / 10;
    }
  };

})(window.Akasha);

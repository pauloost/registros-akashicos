/* ============================================================
   REGISTROS AKÁSHICOS — constellation.js
   Firmamento de fundo: estrelas e linhas finas em canvas,
   com cintilar lento. Desativa animação sob reduced-motion.
   ============================================================ */

window.Akasha = window.Akasha || {};

(function () {
  "use strict";

  var canvas = document.getElementById("constellation");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  var stars = [];
  var LINK_DIST = 140;      // distância máxima para ligar duas estrelas
  var DENSITY = 1 / 16000;  // estrelas por pixel²
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function seed() {
    var w = canvas.width = window.innerWidth;
    var h = canvas.height = window.innerHeight;
    var total = Math.min(160, Math.floor(w * h * DENSITY));
    stars = [];
    for (var i = 0; i < total; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.4 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.6
      });
    }
  }

  function draw(t) {
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Linhas finas entre estrelas próximas
    ctx.lineWidth = 0.5;
    for (var i = 0; i < stars.length; i++) {
      for (var j = i + 1; j < stars.length; j++) {
        var dx = stars[i].x - stars[j].x;
        var dy = stars[i].y - stars[j].y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK_DIST) {
          ctx.strokeStyle = "rgba(232, 228, 218, " + (0.05 * (1 - d / LINK_DIST)).toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.stroke();
        }
      }
    }

    // Estrelas com cintilar senoidal
    for (var k = 0; k < stars.length; k++) {
      var s = stars[k];
      var glow = reduceMotion ? 0.5 : 0.35 + 0.3 * Math.sin(t * 0.001 * s.speed + s.phase);
      ctx.fillStyle = "rgba(232, 228, 218, " + glow.toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop(t) {
    draw(t);
    if (!reduceMotion) requestAnimationFrame(loop);
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      seed();
      if (reduceMotion) draw(0);
    }, 200);
  });

  seed();
  if (reduceMotion) {
    draw(0); // quadro único, estático
  } else {
    requestAnimationFrame(loop);
  }
})();

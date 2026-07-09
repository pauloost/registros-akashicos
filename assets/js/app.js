/* ============================================================
   REGISTROS AKÁSHICOS — app.js
   Roteador hash: liga os portões (abas) às views registradas
   em Akasha.views e aplica as transições de entrada/saída.
   ============================================================ */

(function (Akasha) {
  "use strict";

  var DEFAULT_ROUTE = "almas";
  var LEAVE_MS = 200; // deve acompanhar a animação .view--leaving

  var viewEl = document.getElementById("view");
  var gates = Array.prototype.slice.call(document.querySelectorAll(".gate"));
  var current = null;

  function routeFromHash() {
    var route = (location.hash || "").replace(/^#\/?/, "");
    return Akasha.views[route] ? route : DEFAULT_ROUTE;
  }

  function markGates(route) {
    gates.forEach(function (gate) {
      gate.setAttribute("aria-selected", String(gate.dataset.route === route));
    });
  }

  function mount(route) {
    var view = Akasha.views[route];
    viewEl.innerHTML = view.render();
    viewEl.classList.remove("view--leaving");
    viewEl.classList.add("view--entering");
    document.title = view.title + " · Registros Akáshicos";
    // Move o foco para o conteúdo em navegação por teclado/leitor de tela
    viewEl.focus({ preventScroll: true });
  }

  function navigate() {
    var route = routeFromHash();
    if (route === current) return;
    markGates(route);

    if (current === null) {
      // Primeira renderização: sem animação de saída
      current = route;
      mount(route);
      return;
    }

    current = route;
    viewEl.classList.remove("view--entering");
    viewEl.classList.add("view--leaving");
    setTimeout(function () { mount(route); }, LEAVE_MS);
  }

  viewEl.addEventListener("animationend", function () {
    viewEl.classList.remove("view--entering");
  });

  window.addEventListener("hashchange", navigate);

  // Garante um hash canônico e renderiza a primeira view
  if (!location.hash) {
    history.replaceState(null, "", "#/" + DEFAULT_ROUTE);
  }
  navigate();

})(window.Akasha);

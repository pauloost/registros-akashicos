/* ============================================================
   REGISTROS AKÁSHICOS — storage.js
   Wrapper do LocalStorage: ponto único de persistência,
   com schema versionado para migrações futuras.
   ============================================================ */

window.Akasha = window.Akasha || {};

(function (Akasha) {
  "use strict";

  var KEY = "akasha.registry";
  var SCHEMA_VERSION = 1;

  function blankRegistry() {
    return {
      version: SCHEMA_VERSION,
      souls: [],   // O Livro das Almas
      laws: [],    // O Códice das Leis
      events: []   // A Linha do Tempo
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return blankRegistry();
      var data = JSON.parse(raw);
      return migrate(data);
    } catch (err) {
      // Registro corrompido: preserva uma cópia antes de recomeçar
      try { localStorage.setItem(KEY + ".corrupted", localStorage.getItem(KEY)); } catch (_) {}
      return blankRegistry();
    }
  }

  function save(registry) {
    localStorage.setItem(KEY, JSON.stringify(registry));
  }

  // Migrações incrementais: cada versão futura adiciona um passo aqui
  function migrate(data) {
    if (!data || typeof data !== "object") return blankRegistry();
    if (!data.version) data.version = 1;
    data.souls = data.souls || [];
    data.laws = data.laws || [];
    data.events = data.events || [];
    return data;
  }

  function uid() {
    return "ak-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  Akasha.storage = {
    /** Lê a coleção inteira ("souls" | "laws" | "events"). */
    all: function (collection) {
      return load()[collection] || [];
    },

    /** Insere um registro; devolve o registro com id e timestamps. */
    add: function (collection, record) {
      var registry = load();
      var now = new Date().toISOString();
      var entry = Object.assign({}, record, {
        id: uid(),
        createdAt: now,
        updatedAt: now
      });
      registry[collection].push(entry);
      save(registry);
      return entry;
    },

    /** Atualiza por id; devolve o registro atualizado ou null. */
    update: function (collection, id, patch) {
      var registry = load();
      var list = registry[collection];
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) {
          list[i] = Object.assign({}, list[i], patch, {
            id: id,
            updatedAt: new Date().toISOString()
          });
          save(registry);
          return list[i];
        }
      }
      return null;
    },

    /** Remove por id; devolve true se algo foi removido. */
    remove: function (collection, id) {
      var registry = load();
      var before = registry[collection].length;
      registry[collection] = registry[collection].filter(function (r) {
        return r.id !== id;
      });
      save(registry);
      return registry[collection].length < before;
    },

    /** Quantidade de registros na coleção. */
    count: function (collection) {
      return this.all(collection).length;
    }
  };

})(window.Akasha);

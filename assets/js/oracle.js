/* ============================================================
   REGISTROS AKÁSHICOS — oracle.js
   O Oráculo: gerador de fragmentos de lore e profecias.
   Combina aberturas, presságios e destinos — os dois últimos
   temperados pelo arquétipo da alma consultada.
   ============================================================ */

window.Akasha = window.Akasha || {};

(function (Akasha) {
  "use strict";

  var ABERTURAS = [
    "Está escrito nas margens do tempo:",
    "As estrelas murmuram, e o registro escuta:",
    "Antes do primeiro amanhecer, já se sabia:",
    "Há uma página que se recusa a queimar, e nela se lê:",
    "O véu afasta-se por um instante e revela:",
    "Sete guardiões juraram esquecer, mas o registro lembra:"
  ];

  var CONDICOES = [
    "a terceira lua sangrar sobre o mar",
    "o último nome verdadeiro for pronunciado",
    "as torres esquecidas voltarem a cantar",
    "a própria sombra recusar seu dono",
    "o rio correr de volta à nascente",
    "cair a primeira neve sobre cinzas ainda quentes"
  ];

  var SELOS = [
    "— e nenhum deus ousará intervir.",
    "— assim foi inscrito, assim será cobrado.",
    "— que os atentos se lembrem, que os tolos duvidem.",
    "— e o registro, como sempre, guardará silêncio.",
    "— nada disso será por acaso."
  ];

  // Cada arquétipo colore o presságio (o que a alma carrega)
  // e o destino (o que dela se cumprirá).
  var ARQUETIPOS = {
    "O Errante": {
      pressagios: [
        "a poeira de mil estradas que não constam em mapa algum",
        "um mapa que se reescreve a cada passo dado",
        "a saudade de um lugar onde jamais esteve"
      ],
      destinos: [
        "encontrará a porta que procura exatamente onde partiu",
        "chegará aonde nenhum caminho admite levar",
        "trocará o horizonte por um único teto — e não se arrependerá"
      ]
    },
    "O Guardião": {
      pressagios: [
        "um juramento mais antigo que as muralhas que vigia",
        "as chaves de um portão que ninguém mais lembra de fechar",
        "o peso de tudo aquilo que escolheu não deixar cair"
      ],
      destinos: [
        "será a última pedra de pé quando tudo ruir",
        "abrirá, por vontade própria, aquilo que jurou selar",
        "descobrirá que o que guardava, na verdade, o guardava"
      ]
    },
    "A Sombra": {
      pressagios: [
        "um rosto que os espelhos se recusam a devolver",
        "dívidas assinadas com tinta que ainda não secou",
        "o silêncio que fica quando todos juram tê-la visto"
      ],
      destinos: [
        "será a única testemunha do que jamais poderá contar",
        "atravessará a luz sem que a luz perceba",
        "trairá o segredo — e, ao traí-lo, salvará quem o confiou"
      ]
    },
    "O Oráculo": {
      pressagios: [
        "respostas para perguntas que ainda não foram feitas",
        "a memória de futuros que decidiram não acontecer",
        "um terceiro olho que chora pelo que ainda não viu"
      ],
      destinos: [
        "calará a única profecia capaz de impedir a queda",
        "verá o próprio fim — e sorrirá ao reconhecê-lo",
        "será acreditado tarde demais, como convém aos videntes"
      ]
    },
    "O Forjador": {
      pressagios: [
        "o eco de um martelo que soa antes do golpe",
        "cicatrizes de fogo que desenham um mapa estelar",
        "a matéria bruta de algo que o mundo ainda não merece"
      ],
      destinos: [
        "criará a obra que tornará todas as anteriores esboços",
        "quebrará com as próprias mãos aquilo que o tornou lenda",
        "forjará a arma — e rezará para que nunca seja empunhada"
      ]
    },
    "A Tecelã": {
      pressagios: [
        "fios de destinos alheios presos entre os dedos",
        "um nó dado no início dos tempos que só ela alcança",
        "o padrão completo da tapeçaria que os outros veem pelo avesso"
      ],
      destinos: [
        "desfará em uma noite o que levou eras para tramar",
        "unirá duas linhas que o cosmos separou por prudência",
        "encontrará o próprio fio — e hesitará antes de puxá-lo"
      ]
    }
  };

  // Alma sem arquétipo declarado: o oráculo fala em termos gerais
  var GENERICO = {
    pressagios: [
      "um nome que ainda não lhe foi dado",
      "uma dívida contraída antes de seu nascimento",
      "o eco de uma promessa que ninguém lembra ter feito"
    ],
    destinos: [
      "reescreverá a própria página neste registro",
      "será lembrada por aquilo que recusou fazer",
      "verá o mundo dobrar-se onde todos juravam ser reto"
    ]
  };

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  var TEMPLATES = [
    function (nome, p, d, ab, cond, selo) {
      return ab + " sobre " + nome + " pesa " + p + "; quando " + cond + ", " + d + " " + selo;
    },
    function (nome, p, d, ab, cond, selo) {
      return ab + " " + nome + " carrega " + p + " — e por isso " + d + ". Somente quando " + cond + ", o preço será revelado " + selo;
    },
    function (nome, p, d, ab, cond, selo) {
      return ab + " quando " + cond + ", " + nome + " compreenderá o peso de " + p + " — e então " + d + " " + selo;
    }
  ];

  Akasha.oracle = {
    /** Nomes de arquétipos disponíveis para o formulário. */
    archetypes: Object.keys(ARQUETIPOS),

    /**
     * Gera um fragmento de profecia.
     * @param {Object} opts — { name, archetype }
     * @returns {string}
     */
    divine: function (opts) {
      opts = opts || {};
      var nome = (opts.name || "").trim() || "a alma ainda sem nome";
      var fonte = ARQUETIPOS[opts.archetype] || GENERICO;
      var tpl = pick(TEMPLATES);
      return tpl(nome, pick(fonte.pressagios), pick(fonte.destinos),
                 pick(ABERTURAS), pick(CONDICOES), pick(SELOS));
    }
  };

})(window.Akasha);

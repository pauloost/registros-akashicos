# Registros Akáshicos — Plano de Desenvolvimento

Central de Worldbuilding ("Notion Cósmico") para escritores, criadores de conteúdo e mestres de RPG catalogarem seus universos ficcionais.

## Visão do produto

Uma SPA estática, 100% client-side, que funciona aberta diretamente do disco ou servida por qualquer host estático (GitHub Pages, Netlify, etc.). Todos os dados vivem no LocalStorage do navegador — sem backend, sem build, sem dependências externas de runtime.

## Decisões de arquitetura

| Decisão | Escolha | Justificativa |
|---|---|---|
| Stack | HTML + CSS + JavaScript vanilla | Zero build, zero dependências; abre com duplo clique no `index.html` |
| Módulos JS | Scripts clássicos com namespace global `Akasha` | ES Modules falham em `file://` por CORS; namespace mantém a organização sem quebrar o uso offline |
| Roteamento | Hash routing (`#/almas`, `#/codice`, `#/cronologia`) | Preserva a aba ativa em refresh e permite deep-link sem servidor |
| Persistência | Wrapper `Akasha.storage` sobre LocalStorage | Ponto único de leitura/escrita, com versionamento de schema para migrações futuras |
| Views | Cada aba é um módulo que se auto-registra no roteador | Novas abas entram sem tocar no núcleo (`app.js`) |
| Estética | Tokens CSS (custom properties) + fundo de constelação em `<canvas>` | Identidade Blackwork centralizada e fácil de ajustar; canvas respeita `prefers-reduced-motion` |

## Estrutura de arquivos

```
registros-akashicos/
├── index.html                  # Casca da SPA: header, navegação, container das views
├── assets/
│   ├── css/
│   │   ├── main.css            # Tokens de design, reset, tipografia, layout
│   │   ├── components.css      # Navegação, cartões, sigilos, estados vazios
│   │   └── animations.css      # Transições de view, reveals, twinkle
│   └── js/
│       ├── storage.js          # Wrapper do LocalStorage + schema versionado
│       ├── constellation.js    # Fundo animado de constelações (canvas)
│       ├── views/
│       │   ├── almas.js        # Aba 1 — O Livro das Almas
│       │   ├── codice.js       # Aba 2 — O Códice das Leis
│       │   └── cronologia.js   # Aba 3 — A Linha do Tempo
│       └── app.js              # Roteador hash, registro de views, transições
└── docs/
    └── PLANO-DE-DESENVOLVIMENTO.md
```

## Modelo de dados (LocalStorage)

Chave única `akasha.registry`, JSON versionado:

```json
{
  "version": 1,
  "souls":  [],   // fichas de personagens (Livro das Almas)
  "laws":   [],   // sistemas de poder (Códice das Leis)
  "events": []    // eventos históricos (Linha do Tempo)
}
```

Cada registro carrega `id` (gerado), `createdAt` e `updatedAt`. O campo `version` permite migrar o schema em fases futuras sem perder dados do usuário.

## Identidade visual — Blackwork

- **Fundo**: preto profundo (`#060608`) com constelações sutis desenhadas em canvas (pontos + linhas finas conectadas).
- **Traço**: bordas de 1px em tinta translúcida; geometria fina (círculos, losangos, sigilos SVG inline).
- **Tipografia**: display serifada em caixa alta com letter-spacing amplo; corpo serifado; metadados em monoespaçada.
- **Cor**: quase monocromático — tinta osso (`#e8e4da`) sobre preto, com um único acento dourado pálido usado com parcimônia.
- **Movimento**: transições de opacidade/deslocamento suaves entre abas; cintilar lento das estrelas; tudo desativado sob `prefers-reduced-motion`.

## Fases de desenvolvimento

### Fase 0 — Fundação (esta entrega)
- [x] Arquitetura de arquivos e namespace `Akasha`
- [x] Casca da interface com identidade Blackwork completa
- [x] Navegação funcional entre as três abas (hash routing + transições)
- [x] Wrapper de LocalStorage com schema versionado
- [x] Fundo de constelações animado
- [x] Estados vazios temáticos em cada aba

### Fase 1 — O Livro das Almas (concluída)
- [x] CRUD completo de fichas: nome, epíteto, arquétipo, história, habilidades, vínculos
- [x] O Oráculo: gerador de fragmentos de lore/profecias temperado pelo arquétipo da alma (`oracle.js`), com fragmentos graváveis na ficha
- [x] Busca (insensível a acentos) e ordenação (recentes, nome a–z, antigas) das almas registradas
- [x] Exclusão em dois toques (armar → confirmar) e validação de nome obrigatório

### Fase 2 — O Códice das Leis (concluída)
- [x] Enciclopédia mística em três modos: índice de verbetes, página da lei e editor
- [x] Verbete estruturado: princípio da lei, gatilhos de ativação, limitações e fraquezas, com epígrafe, domínio e datas de decreto/emenda
- [x] Gráfico de radar (teia) em SVG dinâmico sem bibliotecas (`radar.js`), com 6 atributos de balanceamento: potência, alcance, versatilidade, controle, exaustão e restrição
- [x] Radar ao vivo no editor (sliders redesenham a teia), tooltips nos vértices, legenda com barras, "peso da lei" (média) e variante mini nos cartões do índice
- [x] Busca, ordenação (recentes, nome, maior peso) e revogação em dois toques

> Referências cruzadas Códice ↔ Almas ficam para a Fase 3, junto dos vínculos da Linha do Tempo.

### Fase 3 — A Linha do Tempo
- Eventos com era, data ficcional, título e descrição
- Renderização vertical minimalista com marcos e eras agrupadas
- Vínculo de eventos a almas e leis

### Fase 4 — Polimento
- Exportar/importar o registro completo em JSON (backup do usuário)
- Atalhos de teclado e refinos de acessibilidade (foco, ARIA, contraste)
- Micro-animações finais e revisão de performance

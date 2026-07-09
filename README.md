# ✦ Registros Akáshicos

Central de Worldbuilding — um "Notion Cósmico" para escritores, criadores de conteúdo e mestres de RPG catalogarem seus universos ficcionais.

SPA estática em HTML, CSS e JavaScript puros, com estética **Blackwork** (dark mode total, linhas finas, geometria e constelações). Todos os dados são gravados no **LocalStorage** do navegador — sem backend, sem build, sem dependências.

## Como usar

Abra o `index.html` no navegador, ou sirva a pasta com qualquer host estático:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## As três câmaras

| Aba | Propósito |
|---|---|
| **I · O Livro das Almas** | Fichas de personagens: nome, história, habilidades e fragmentos de lore/profecias |
| **II · O Códice das Leis** | Sistemas de poder: mecânicas, limitações, fraquezas e escalas |
| **III · A Linha do Tempo** | Cronologia interativa de eras e grandes eventos do mundo |

## Estado atual

**Fase 2 concluída**: além do Livro das Almas (fichas de personagens com o Oráculo gerador de profecias), o **Códice das Leis** está funcional como uma enciclopédia mística — verbetes com princípio, gatilhos de ativação, limitações e fraquezas, e um **gráfico de radar em SVG dinâmico** (sem bibliotecas) que perfila cada lei em seis eixos de balanceamento: potência, alcance, versatilidade, controle, exaustão e restrição. O editor redesenha a teia ao vivo conforme os sliders, e o índice mostra miniaturas do radar com o "peso da lei". A próxima fase — A Linha do Tempo — está descrita em [`docs/PLANO-DE-DESENVOLVIMENTO.md`](docs/PLANO-DE-DESENVOLVIMENTO.md).

## Estrutura

```
index.html                      # Casca da SPA
assets/css/                     # main (tokens/layout) · components · animations
assets/js/storage.js            # Wrapper do LocalStorage (schema versionado)
assets/js/oracle.js             # O Oráculo — gerador de profecias por arquétipo
assets/js/radar.js              # Gráfico de radar (teia) em SVG dinâmico
assets/js/constellation.js      # Firmamento animado em canvas
assets/js/views/                # almas · codice · cronologia
assets/js/app.js                # Roteador hash + transições
docs/PLANO-DE-DESENVOLVIMENTO.md
```

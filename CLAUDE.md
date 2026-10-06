# Treino de Bateria

PWA de treino diário de bateria: os 40 rudimentos oficiais da PAS (Percussive Arts Society, lista
de 1984). Réplica do Treino de Guitarra (`C:\guitarra`) — mesma arquitetura, mesmo Supabase, mesmo
sistema de professor/aluno — trocando tablatura de guitarra por baqueteamento (sticking) de
bateria. Estética de painel de amplificador (fundo escuro, LCD âmbar, switches), igual à guitarra
— sem personagem/ilustração (pedido do usuário, 2026-09-28: "sem personagens").

## Rodar

```
npm start      # node tools/serve.mjs → http://localhost:5174 (porta diferente da guitarra, 5173,
               # pra dar pra rodar os dois ao mesmo tempo)
npm test       # testes de merge, sync, professor/aluno, metrônomo, sticking-dsl e banco de rudimentos (Node, sem dependências)
```

Regenerar ícones: `powershell -File tools/make-icons.ps1`.
Publicação (GitHub Pages) e Supabase: `docs/setup.md`.

## Estrutura

Praticamente todo módulo genérico foi portado **sem mudança de lógica** do Treino de Guitarra —
só o necessário para não colidir com ele no mesmo Supabase (ver "Supabase compartilhado" abaixo).
O que é específico de bateria está listado depois.

### Portado da guitarra (lógica idêntica)

- `js/merge.js`: combina dados de dois aparelhos (funções puras) — 100% genérico, cópia exata.
- `js/store.js`: única porta de persistência (localStorage), chave `drumTraining_v1`. Mesma
  estrutura de `logs`/`speeds`/`plans`/`prefs` da guitarra, incluindo a foto do plano do dia
  (`log.plan`, capturada no 1º toque de cada dia) que sustenta o histórico do professor.
- `js/sync-core.js` + `js/sync.js` + `js/config.js`: motor de sincronização com o Supabase.
  `js/config.js` aponta pro **mesmo projeto Supabase da guitarra** (mesma URL/chave) — ver
  "Supabase compartilhado". `storageKey: 'drum-treino-auth'` no client do Supabase evita colisão
  de sessão com a guitarra, caso os dois apps rodem no mesmo navegador/porta em algum momento.
- `js/teacher-core.js` + `js/teacher.js`: professor acompanha e edita o plano de alunos vinculados
  a ele — mesmíssima lógica da guitarra (vínculo nasce do aluno digitando um código, controle
  otimista por `rev` em `writeStudentPlan`/`writeStudentSpeed`, histórico via foto do plano). Só
  os nomes de tabela mudam (`drum_` no lugar do que a guitarra usa) — ver abaixo.
  Todo item que o professor salva vira `locked: true` (pedido de usuário, 2026-09-29): o aluno
  pode reordenar e ajustar tempo/BPM de um exercício travado, mas não remover nem trocar — só os
  que ele mesmo adicionar depois (sem essa marca) ficam livres. `exerciseCard()` em app.js esconde
  os botões Trocar/Remover nesse caso (mostra "🎓 Definido pelo professor" no lugar) e o botão
  "Restaurar plano padrão" fica desabilitado se o dia tiver algum item travado — senão seria uma
  forma disfarçada de apagar o que o professor montou.
  O professor também pode escrever uma observação por exercício pra aquele aluno (pedido do
  usuário, 2026-10-03): campo de texto em cada item de "Planejar a semana", gravado como
  `item.note` junto com o plano do dia (`writeStudentPlan` apara e descarta a vazia, máx. 500
  caracteres). O aluno vê "📝 observação" na linha do cartão e, ao abrir o exercício, um quadro
  "OBSERVAÇÃO DO PROFESSOR" no topo. Só o professor escreve; editar tempo/ordem no aparelho do
  aluno preserva a nota. A foto do plano (`log.plan`) continua só com `ex`/`min`.
- `js/audio-context.js`: AudioContext resistente a travas (Android prende o canal de áudio numa
  troca de saída ou após tempo em segundo plano). Instrumento-agnóstico, cópia exata.
- `js/metronome.js`: metrônomo Web Audio com agendamento antecipado. Portado da guitarra, com UMA
  diferença (pedido do usuário, 2026-10-03): a subdivisão deixou de ser o liga/desliga de colcheias
  (`subdivide`) e virou `subdivision` = cliques por tempo, escolhido numa fileira "SUBDIVISÃO" na
  tela (`SUBDIVISIONS`: 1 semínimas, 2 colcheias, 3 tercinas, 4 semicolcheias, 6 sextinas, 7
  sétuplas — o 7 foi o pedido "incluir 7 tempos" de 2026-10-05, só da bateria; testado com 7
  cliques por tempo igualmente espaçados e verificado no navegador, nas duas telas). Trocar
  a subdivisão com o metrônomo tocando só vale a partir do próximo tempo (senão o tempo em curso
  misturaria duas subdivisões). Preferência `metroSubdiv`; a antiga `metroSub: true` vira 2.
  Testes em `tests/metronome.test.mjs`.
  A mesma fileira aparece no quadro de velocidade de cada exercício (`speedBox` em app.js): cada
  exercício guarda a sua (`prefs.exSubdiv[id]`, padrão 1; só deste aparelho, o professor não mexe)
  e "Tocar metrônomo" do exercício aplica BPM + subdivisão dele — como o BPM, isso também muda o
  que o metrônomo livre mostra até ele ser ajustado de novo.
  O quadro do exercício também ganhou a barra deslizante de BPM do metrônomo livre (pedido do
  usuário, 2026-10-03): enquanto arrasta só mostra o número (e muda o metrônomo, se tocando); a
  velocidade é gravada uma vez só, ao soltar (`change`), porque cada gravação zera limpos/erros.
  Compasso do metrônomo livre: 2, 3, 4, 6 e 7 (`BEATS_PER_BAR` em metronome.js; a guitarra segue
  com 2, 3, 4 e 6). Atenção ao histórico: o pedido "incluir 7 tempos" (2026-10-05) foi lido
  primeiro como compasso de 7 tempos e o 7 entrou aqui; o usuário mandou uma captura do quadro do
  exercício e confirmou que queria o 7 na SUBDIVISÃO (acima), não no compasso. O 7 do compasso
  ficou (inofensivo, testado: acento só no 1º de cada 7 tempos, com e sem subdivisão, e no LED de
  batida `ABBBBBBABBBBBBA`), a confirmar se o usuário quer manter. O metrônomo já contava qualquer
  número de tempos (`beat % beats`). A escolha fica salva (`metroBeats`).
- `js/voice-command.js`: comando de voz pra marcar Limpo/Errei sem largar as baquetas. Cópia
  exata — "limpo"/"errei" servem igual pra bateria.
- `js/practice-timer.js`: cronômetro por exercício. Chave própria (`drumPracticeTimer_v1`), lógica
  idêntica.
- `tools/serve.mjs`: servidor estático de desenvolvimento. Cópia exata (porta padrão trocada pra
  5174 só no `.claude/launch.json` e no `npm start`, não no script em si).

### Supabase compartilhado

`js/config.js` usa a MESMA `SUPABASE_URL`/`SUPABASE_KEY` da guitarra (pedido do usuário,
2026-09-28: reaproveitar o projeto em vez de criar um novo). Como as duas apps dividem o banco,
as tabelas de bateria usam prefixo **`drum_`** pra não colidir com as da guitarra:
`drum_user_data` (no lugar de `user_data`), `drum_teacher_codes`, `drum_teacher_links`. Login é a
MESMA conta (mesmo e-mail/senha) nos dois apps — só o dado guardado é que fica em tabelas
diferentes, então guitarra e bateria não se misturam. `supabase/schema.sql` deste projeto só cria
essas 3 tabelas (aditivo/idempotente); ainda **não foi rodado** no Supabase de produção — ver
Pendências.

### Específico de bateria

- `js/sticking-dsl.js`: notação curta de baqueteamento (sticking), no espírito do `tab-dsl.js` da
  guitarra — uma nota por token, tokens separados por espaço.
  `token = [graça][MÃO][~][>]` — graça = 0/1/2 letras minúsculas (`l`/`r`), tocadas ANTES da nota
  principal (1 letra = flam, 2 letras = drag/ruff); MÃO = `R`/`L` maiúsculo, a nota principal;
  `~` = nota "buzz" (usado só no Rufo de Toques Múltiplos); `>` = acento; `-` = pausa.
  Exemplo: `'lR rL'` = flam direita, flam esquerda (rudimento Flam). `parseSticking()` é pura e
  testável (`tests/sticking-dsl.test.mjs`); `repeatHits()` repete uma célula N vezes.
- `js/sticking.js`: `buildSticking()` gera o texto legível do baqueteamento a partir dos hits —
  **nunca escrever à mão** (desalinha), no espírito do `buildTab()`/`js/tab.js` da guitarra.
  `hitLabel()` formata um hit: graça em minúscula colada à nota principal (`lR`, `llR`), acento
  com `>` depois da letra (`R>`), buzz com `~`.
- `js/rudiment-player.js`: toca um rudimento pra ouvir como deve soar. Mesma cadeia de saída
  (compressor/makeup-gain/limiter/master) do `tab-player.js` da guitarra, pra manter o mesmo nível
  de volume seguro entre os dois apps. Som principal: gravação real de caixa
  (`audio/snare.mp3`, banco FluidR3_GM — ver `audio/CREDITS.md` e "Som" abaixo); se a amostra
  falhar, cai num sintetizador de ruído filtrado (mais simples que o Karplus-Strong da guitarra,
  já que uma caixa não tem afinação). `scheduleHits()` agenda notas de apoio (graça, ~35ms antes
  da nota principal), o toque principal (ganho maior se acentuado) e a aproximação de buzz (dois
  ecos extras mais fracos, `~30ms` de intervalo) — **isso não é fisicamente um buzz roll de
  verdade** (a amostra é de UM só toque de baqueta); é só uma aproximação sonora pra dar a
  sensação de mais de um toque na mesma nota (rudimento nº4, Rufo de Toques Múltiplos).
  `class RudimentPlayer` tem a mesma forma/ciclo de vida do `TabPlayer` da guitarra
  (`onChange`/`isPlaying`/`isLoading`/`play`/`stop`).
- `js/data/rudiments.js`: banco dos 40 rudimentos oficiais da PAS + um item `rest` (descanso,
  sem baqueteamento nem BPM — mesmo padrão do `rest` da guitarra). Cada `dsl` vira `hits` via
  `parseSticking()`; `alt: true` soma automaticamente o "espelho" (troca R↔L, r↔l) do próprio dsl,
  pra rudimentos "abertos" que alternam qual mão começa a cada repetição do ciclo (a maioria dos
  rolos contados e alguns diddles/drags — conferido contra a descrição de cada um). `spec` é um
  objeto estável (mesma referência sempre) pro `rudiment-player.js` comparar "é este que está
  tocando", mesmo motivo de `tab.play` ser guardado 1 vez só na guitarra. `PAS_NUMBER` numera 1–40
  na ordem oficial. Ver "Fontes dos rudimentos" abaixo — nenhum sticking foi inventado de cabeça.
- `js/data/plans.js`: plano padrão da semana — 6 dias de treino (segunda a sábado, 60 min cada,
  progressão temática rolos→diddles→flams→drags) + domingo de descanso. Mesma forma de
  `{key, label, name, weekday, title, focus, plan: [{ex, min}]}` da guitarra.
- `tools/extract-snare.mjs`: extrai a amostra de Acoustic Snare do banco FluidR3_GM — ver "Som".
- `js/app.js`: interface. Reaproveita quase tudo da guitarra (utilidades, folha/sheet,
  `metronomeView`, `accountView`, toda a pilha de tela do professor/aluno, `speedBox`, `timerBox`,
  `exerciseCard`, `bankView`, `render`) trocando `EXERCISES`→`RUDIMENTS` e
  `tabPlayer`→`rudimentPlayer`. **Sem** o explorador de escalas/acordes/intervalos da guitarra
  ("Braço") — não fazia sentido pra bateria, não foi pedido. `listenButtons`/`exerciseBody` foram
  reescritos: em vez do sistema de múltiplas abas de tablatura + acordes da guitarra, cada
  rudimento tem 1 só `hits`/`spec`, mostrado como um único bloco de `buildStickingHTML()` (pedido
  do usuário, 2026-09-28: destacar a nota acentuada — a letra R/L vem em negrito com a cor de
  maior contraste do painel, além do `>` de sempre, já que vermelho/verde já significam
  erro/ativo em outro lugar do app) com uma legenda (R/L, graça, acento, buzz).
- `sw.js`: cache offline. Achado real testando um deploy (2026-09-28): o GitHub Pages manda
  `Cache-Control: max-age=600` nos arquivos do app, então um `fetch(request)` comum dentro do
  service worker podia devolver uma cópia de até 10 min atrás mesmo pedindo "rede primeiro" —
  atualizações pareciam não chegar nos aparelhos dos usuários. Corrigido criando o request de novo
  com `{ cache: 'reload' }` (ignora o cache HTTP, vai sempre ao servidor) e registrando o worker
  com `{ updateViaCache: 'none' }` em `app.js` (senão o `sw.js` em si também podia ficar preso no
  cache por até 10 min, atrasando o navegador notar que existe versão nova). Mesmo assim, **subir
  o número de `CACHE`** a cada deploy que muda algum arquivo do `SHELL` continua necessário — é o
  que faz o service worker antigo ser substituído e o cache velho, apagado (`activate`).

## Som

`audio/snare.mp3` vem do MESMO banco FluidR3_GM da guitarra (mesma licença CC BY 3.0 — ver
`audio/CREDITS.md`), mas por um caminho diferente: os arquivos já recortados por instrumento que a
guitarra usa (`gleitz/midi-js-soundfonts`) não incluem o kit de bateria (percussão é o canal 10 do
General MIDI, sem "instrumento" pitchado como os outros 128). Por isso `tools/extract-snare.mjs`
parte do arquivo `.sf2` original (o banco completo, formato SoundFont2) e lê a tecla MIDI 38
(Acoustic Snare) do preset de percussão "Standard" (banco 128, preset 0). Usa os pacotes
`soundfont2` (parser do .sf2) e `lamejs` (codificador mp3) como devDependencies.
Achado testando: o build modular do pacote `lamejs` do npm (`src/js/`) tem um bug de empacotamento
— alguns módulos usam identificadores como `MPEGMode`/`Lame` como se fossem globais, sem dar
`require` neles (só funciona no bundle pronto pra navegador, `lame.all.js`, que roda tudo numa
única function scope). Corrigido rodando esse bundle numa sandbox de `vm.createContext` (como um
`<script>` faria) e pegando o objeto `lamejs` resultante de lá, em vez de corrigir bug por bug no
build modular. A extração foi conferida objetivamente (não por ouvido): o envelope de amplitude
decodificado via Web Audio API mostra ataque abrupto (~20ms) seguido de decaimento suave até
silêncio (~450ms) — a forma esperada de uma batida de caixa, não silêncio nem ruído contínuo.

## Fontes dos rudimentos

Cada baqueteamento foi conferido cruzando 3 fontes antes de entrar em `data/rudiments.js` — nunca
de cabeça (mesma regra da guitarra):
1. a tabela oficial da PAS (Percussive Notes, fev/1984), via OCR de uma cópia do PDF;
2. a página "Drum rudiment" da Wikipédia (descrição textual de cada rudimento);
3. drumlock.com/rudiments (tabela digitada, numeração igual à oficial) — usada como fonte
   principal por bater com as outras duas nos casos mais difíceis de conferir.

Dois erros reais foram pegos cruzando as fontes, ANTES de entrar no código:
- **Rufo de 6 Toques**: uma quarta fonte (drumming.com) mostrava `R L R R L L`, contradizendo a
  descrição textual da Wikipédia ("nota acentuada, dois diddles, nota acentuada" = simples-
  diddle-diddle-simples) e um post de fórum (drummerworld) que dava `R L L R R L` explicitamente.
  Adotado `R> L L R R L>`, confirmado depois também pela drumlock.com.
- **Ratamacue Simples**: drumming.com sugeria um padrão não totalmente alternado; resolvido com a
  resposta explícita da drumlock.com (`llR L R L>`, totalmente alternado: arraste-R, L, R,
  L-acentuado).

Os acentos (`>`) sobre os rolos contados e alguns rudimentos de flam/drag foram acrescentados a
partir da descrição textual da Wikipédia (ex.: "cinco diddles seguidos de uma nota acentuada"),
já que a fonte principal (drumlock.com) não marcava acento no texto simples da tabela.

## Regras do domínio

Mesmas da guitarra (ver `C:\guitarra\CLAUDE.md` pra mais detalhe de cada mecanismo, já que a
lógica foi só portada):
- Cada dia de treino soma 60 min.
- A velocidade (BPM) é por exercício (rudimento), não por dia, e continua de uma semana pra outra.
  3 limpos seguidos = +4 BPM (ou o `step` do rudimento); 2 erros seguidos = −4 BPM.
- Professor/aluno: vínculo nasce do aluno (digita o código do professor); professor só escreve em
  `plans`/`speeds`, nunca em `logs`.

## Pendências

- **Schema do Supabase ainda não rodado em produção**: `supabase/schema.sql` (tabelas
  `drum_user_data`, `drum_teacher_codes`, `drum_teacher_links`) precisa ser colado no SQL Editor
  do projeto Supabase (o mesmo da guitarra) antes de testar sincronização/professor de verdade.
  É aditivo/idempotente, não mexe nos dados da guitarra.
- Validar os 40 rudimentos tocando de verdade (as fontes foram cruzadas com cuidado, mas nenhuma
  foi confirmada ao vivo por um baterista, diferente de boa parte do conteúdo da guitarra que foi
  ditado/conferido pelo usuário assistindo vídeo). Ajustar BPM inicial/meta de cada um conforme a
  prática mostrar necessário.
- Ideias (mesmas da guitarra, ainda não pedidas aqui): gráfico de progresso, lembrete diário,
  rudimentos/variações criados pelo usuário.

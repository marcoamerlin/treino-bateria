// Banco dos 40 rudimentos internacionais da PAS (Percussive Arts Society, lista oficial de 1984).
// Cada baqueteamento (sticking) foi conferido cruzando 3 fontes antes de entrar aqui — nunca de
// cabeça (mesma regra do Treino de Guitarra):
//   1) a tabela oficial da PAS (Percussive Notes, fev/1984), via OCR de uma cópia do PDF;
//   2) a página "Drum rudiment" da Wikipédia (descrição textual de cada rudimento, sem OCR);
//   3) drumlock.com/rudiments (tabela digitada, numeração igual à oficial), usada como fonte
//      principal por bater com as outras duas nos casos mais difíceis de conferir (ex.: o Rufo de
//      6 Toques é R-L-L-R-R-L, não R-L-R-R-L-L como uma quarta fonte, drumming.com, mostrava —
//      esse erro foi pego cruzando as fontes antes de entrar aqui).
// Os acentos ('>') em cima dos rolos contados e de alguns rudimentos de flam/drag foram
// acrescentados a partir da descrição da Wikipédia (ex.: "cinco toques duplos seguidos de uma
// nota acentuada"), já que a fonte principal não marcava acento no texto simples.
//
// title em inglês (pedido do usuário, 2026-09-29): o nome de cada rudimento é notação
// internacionalmente reconhecida (a própria lista oficial da PAS é em inglês) — traduzir criaria
// um nome que ninguém mais usa. subtitle continua em português (só descreve o padrão, não é nome
// de notação).
//
// perBeat: 1 pra todos (cada toque = 1 clique do metrônomo) — é uma escolha de simplicidade, não
// uma convenção universal (professores contam esses rudimentos de jeitos diferentes); ajuste o
// BPM à vontade, a lógica de progressão (3 limpos = +4, 2 erros = −4) é a mesma da guitarra.

import { parseSticking } from '../sticking-dsl.js';

export const CATEGORIES = {
  rolls: 'Rufos (rolls)',
  diddles: 'Diddles',
  flams: 'Flams',
  drags: 'Drags (arrastes)',
  descanso: 'Descanso',
};

// Troca R<->L e r<->l — gera o "outro lado" de um rudimento que deve alternar a mão de partida
// a cada repetição (a maioria dos rolos contados e alguns diddles/drags).
const mirror = (dsl) => dsl.replace(/[lLrR]/g, (c) => ({ l: 'r', L: 'R', r: 'l', R: 'L' }[c]));

// dsl: string no formato de sticking-dsl.js. alt = true: soma o espelho (mirror) automaticamente
// (a maioria dos rudimentos "abertos" alterna qual mão começa a cada repetição do ciclo).
// spec: objeto estável (mesma referência sempre) pro rudiment-player.js comparar "é este que está
// tocando" — mesmo motivo de tab.play ser guardado 1 vez só na guitarra (tab-player.js).
function rud(id, title, subtitle, cat, dsl, { alt = false, bpm, min = 6 } = {}) {
  const full = alt ? `${dsl} ${mirror(dsl)}` : dsl;
  const hits = parseSticking(full);
  return { id, title, subtitle, cat, min, bpm, hits, spec: { hits, perBeat: 1, repeat: 4 } };
}

const RUDIMENTS_LIST = [
  // ---- I. Rufos (rolls) -----------------------------------------------------------------------
  rud('single_stroke_roll', 'Single Stroke Roll', 'Mãos alternadas, sem parar', 'rolls',
    'R L R L R L R L', { bpm: { start: 70, goal: 180 }, min: 8 }),
  rud('single_stroke_four', 'Single Stroke Four', 'Quatro notas alternadas', 'rolls',
    'R L R L', { alt: true, bpm: { start: 70, goal: 170 } }),
  rud('single_stroke_seven', 'Single Stroke Seven', 'Sete notas alternadas (sextina + 1)', 'rolls',
    'R L R L R L R', { alt: true, bpm: { start: 65, goal: 160 } }),
  rud('multiple_bounce_roll', 'Multiple Bounce Roll', 'O "rufo contínuo" — cada mão faz vários rebotes', 'rolls',
    'R~ L~ R~ L~', { bpm: { start: 60, goal: 140 } }),
  rud('triple_stroke_roll', 'Triple Stroke Roll', 'Três toques da mesma mão, alternando', 'rolls',
    'R R R L L L', { bpm: { start: 60, goal: 150 } }),
  rud('double_stroke_open_roll', 'Double Stroke Open Roll', 'Dois toques de cada mão, alternando', 'rolls',
    'R R L L R R L L', { bpm: { start: 60, goal: 160 }, min: 8 }),
  rud('five_stroke_roll', 'Five Stroke Roll', 'Dois diddles + 1 nota acentuada', 'rolls',
    'R R L L R>', { alt: true, bpm: { start: 60, goal: 150 } }),
  rud('six_stroke_roll', 'Six Stroke Roll', 'Nota acentuada, dois diddles, nota acentuada', 'rolls',
    'R> L L R R L>', { alt: true, bpm: { start: 60, goal: 145 } }),
  rud('seven_stroke_roll', 'Seven Stroke Roll', 'Três diddles + 1 nota acentuada', 'rolls',
    'R R L L R R L>', { alt: true, bpm: { start: 55, goal: 140 } }),
  rud('nine_stroke_roll', 'Nine Stroke Roll', 'Quatro diddles + 1 nota acentuada', 'rolls',
    'R R L L R R L L R>', { alt: true, bpm: { start: 55, goal: 135 } }),
  rud('ten_stroke_roll', 'Ten Stroke Roll', 'Quatro diddles + 2 notas acentuadas', 'rolls',
    'R R L L R R L L R> L>', { alt: true, bpm: { start: 55, goal: 130 } }),
  rud('eleven_stroke_roll', 'Eleven Stroke Roll', 'Cinco diddles + 1 nota acentuada', 'rolls',
    'R R L L R R L L R R L>', { alt: true, bpm: { start: 50, goal: 125 } }),
  rud('thirteen_stroke_roll', 'Thirteen Stroke Roll', 'Seis diddles + 1 nota acentuada', 'rolls',
    'R R L L R R L L R R L L R>', { alt: true, bpm: { start: 50, goal: 120 }, min: 8 }),
  rud('fifteen_stroke_roll', 'Fifteen Stroke Roll', 'Sete diddles + 1 nota acentuada', 'rolls',
    'R R L L R R L L R R L L R R L>', { alt: true, bpm: { start: 50, goal: 115 }, min: 8 }),
  rud('seventeen_stroke_roll', 'Seventeen Stroke Roll', 'Oito diddles + 1 nota acentuada', 'rolls',
    'R R L L R R L L R R L L R R L L R>', { alt: true, bpm: { start: 45, goal: 110 }, min: 8 }),

  // ---- II. Diddles ------------------------------------------------------------------------------
  rud('single_paradiddle', 'Single Paradiddle', 'Duas alternadas + um diddle', 'diddles',
    'R> L R R L> R L L', { bpm: { start: 70, goal: 170 }, min: 8 }),
  rud('double_paradiddle', 'Double Paradiddle', 'Quatro alternadas + um diddle', 'diddles',
    'R> L R L R R L> R L R L L', { bpm: { start: 65, goal: 155 }, min: 8 }),
  rud('triple_paradiddle', 'Triple Paradiddle', 'Seis alternadas + um diddle', 'diddles',
    'R> L R L R L R R L> R L R L R L L', { bpm: { start: 60, goal: 140 }, min: 8 }),
  rud('paradiddle_diddle', 'Paradiddle-Diddle', 'Duas alternadas + dois diddles', 'diddles',
    'R> L R R L L', { alt: true, bpm: { start: 65, goal: 160 } }),

  // ---- III. Flams ---------------------------------------------------------------------------
  rud('flam', 'Flam', 'A dupla mais básica: apoio + toque principal', 'flams',
    'lR rL', { bpm: { start: 55, goal: 130 } }),
  rud('flam_accent', 'Flam Accent', 'Grupos de 3: flam, toque, toque', 'flams',
    'lR> R L rL> L R', { bpm: { start: 50, goal: 120 }, min: 8 }),
  rud('flam_tap', 'Flam Tap', 'Diddles com flam na primeira nota', 'flams',
    'lR R rL L', { bpm: { start: 55, goal: 130 } }),
  rud('flamacue', 'Flamacue', 'Flam, acento, toque, toque, flam', 'flams',
    'lR L> R L lR', { bpm: { start: 50, goal: 115 }, min: 8 }),
  rud('flam_paradiddle', 'Flam Paradiddle', 'Paradiddle com flam na primeira nota', 'flams',
    'lR L R R rL R L L', { bpm: { start: 50, goal: 115 }, min: 8 }),
  rud('single_flammed_mill', 'Single Flammed Mill', 'Paradiddle invertido, com flam', 'flams',
    'lR R L R rL L R L', { bpm: { start: 50, goal: 110 }, min: 8 }),
  rud('flam_paradiddle_diddle', 'Flam Paradiddle-Diddle', 'Paradiddle-diddle com flam', 'flams',
    'lR L R R L L rL R L L R R', { bpm: { start: 50, goal: 110 }, min: 8 }),
  rud('pataflafla', 'Pataflafla', 'Flams na 1ª e na 4ª nota', 'flams',
    'lR L R rL', { alt: true, bpm: { start: 50, goal: 115 } }),
  rud('swiss_army_triplet', 'Swiss Army Triplet', 'Flam + dois toques, um por mão', 'flams',
    'lR R L', { alt: true, bpm: { start: 55, goal: 130 } }),
  rud('inverted_flam_tap', 'Inverted Flam Tap', 'Flam na segunda nota do diddle', 'flams',
    'lR L rL R', { bpm: { start: 50, goal: 115 } }),
  rud('flam_drag', 'Flam Drag', 'Grupos de 3: flam, drag, toque', 'flams',
    'lR llL R rL rrR L', { bpm: { start: 45, goal: 105 }, min: 8 }),

  // ---- IV. Drags (arrastes) -------------------------------------------------------------------
  rud('drag', 'Drag', 'Dois apoios da mesma mão + nota principal', 'drags',
    'llR> rrL>', { bpm: { start: 55, goal: 130 } }),
  rud('single_drag_tap', 'Single Drag Tap', 'Arraste + nota acentuada, alternando', 'drags',
    'llR L> rrL R>', { bpm: { start: 50, goal: 120 } }),
  rud('double_drag_tap', 'Double Drag Tap', 'Dois arrastes na mesma mão + acento', 'drags',
    'llR llR L> rrL rrL R>', { bpm: { start: 50, goal: 115 }, min: 8 }),
  rud('lesson_25', 'Lesson 25', 'Arraste, toque, toque acentuado', 'drags',
    'llR L R>', { bpm: { start: 50, goal: 120 } }),
  rud('single_dragadiddle', 'Single Dragadiddle', 'Paradiddle com arraste na 1ª nota', 'drags',
    'llR L R R', { alt: true, bpm: { start: 50, goal: 115 }, min: 8 }),
  rud('drag_paradiddle_1', 'Drag Paradiddle #1', 'Acento + paradiddle com arraste', 'drags',
    'R> llR L R R', { alt: true, bpm: { start: 48, goal: 110 }, min: 8 }),
  rud('drag_paradiddle_2', 'Drag Paradiddle #2', 'Dois acentos + paradiddle com arraste', 'drags',
    'R> llR> llR L R R', { alt: true, bpm: { start: 45, goal: 105 }, min: 8 }),
  rud('single_ratamacue', 'Single Ratamacue', 'Arraste + 3 notas alternadas, acento no fim', 'drags',
    'llR L R L>', { alt: true, bpm: { start: 48, goal: 110 } }),
  rud('double_ratamacue', 'Double Ratamacue', 'Ratamacue simples com mais um arraste antes', 'drags',
    'llR llR L R L>', { alt: true, bpm: { start: 45, goal: 100 }, min: 8 }),
  rud('triple_ratamacue', 'Triple Ratamacue', 'Ratamacue simples com mais dois arrastes antes', 'drags',
    'llR llR llR L R L>', { alt: true, bpm: { start: 42, goal: 95 }, min: 8 }),
];

// Descanso: sem baqueteamento nem BPM (igual ao "rest" do Treino de Guitarra) — o app (app.js)
// só mostra o player/velocidade quando o rudimento tem `hits`.
const REST = {
  id: 'rest', title: 'Descanso (opcional)', subtitle: 'Descanso também é treino', cat: 'descanso', min: 15,
  steps: [
    'Se tiver vontade de tocar, toque por prazer: sem metrônomo, sem cobrança.',
    'Descanse as mãos e os pulsos. Ganho de velocidade acontece no descanso, não só no treino.',
    'Se quiser, ouça um baterista prestando atenção numa coisa só: o groove, os fills ou a dinâmica.',
  ],
  tips: [],
};

export const RUDIMENTS = Object.fromEntries([...RUDIMENTS_LIST, REST].map((r) => [r.id, r]));

// Ordem oficial da PAS (1 a 40), pra telas que listam "todos" em ordem — RUDIMENTS_LIST já está
// nessa ordem, então isso é só nomear a posição de cada um.
export const PAS_NUMBER = Object.fromEntries(RUDIMENTS_LIST.map((r, i) => [r.id, i + 1]));

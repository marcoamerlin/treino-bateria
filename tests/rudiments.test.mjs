import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RUDIMENTS, CATEGORIES, PAS_NUMBER } from '../js/data/rudiments.js';
import { WEEK } from '../js/data/plans.js';

// Contagem de toques esperada de cada rudimento, conferida à mão contra as 3 fontes citadas em
// data/rudiments.js (nunca de cabeça). Serve de trava: se alguém editar o dsl sem querer, o teste
// aponta exatamente qual rudimento mudou de tamanho.
const EXPECTED_HITS = {
  single_stroke_roll: 8,
  single_stroke_four: 8, // 4 + espelho (alt: true)
  single_stroke_seven: 14, // 7 + espelho
  multiple_bounce_roll: 4,
  triple_stroke_roll: 6,
  double_stroke_open_roll: 8,
  five_stroke_roll: 10, // 5 + espelho
  six_stroke_roll: 12, // 6 + espelho
  seven_stroke_roll: 14,
  nine_stroke_roll: 18,
  ten_stroke_roll: 20,
  eleven_stroke_roll: 22,
  thirteen_stroke_roll: 26,
  fifteen_stroke_roll: 30,
  seventeen_stroke_roll: 34,
  single_paradiddle: 8,
  double_paradiddle: 12,
  triple_paradiddle: 16,
  paradiddle_diddle: 12, // 6 + espelho
  flam: 2,
  flam_accent: 6,
  flam_tap: 4,
  flamacue: 5,
  flam_paradiddle: 8,
  single_flammed_mill: 8,
  flam_paradiddle_diddle: 12,
  pataflafla: 8, // 4 + espelho
  swiss_army_triplet: 6, // 3 + espelho
  inverted_flam_tap: 4,
  flam_drag: 6,
  drag: 2,
  single_drag_tap: 4,
  double_drag_tap: 6,
  lesson_25: 3,
  single_dragadiddle: 8, // 4 + espelho
  drag_paradiddle_1: 10, // 5 + espelho
  drag_paradiddle_2: 12, // 6 + espelho
  single_ratamacue: 8, // 4 + espelho
  double_ratamacue: 10, // 5 + espelho
  triple_ratamacue: 12, // 6 + espelho
};

test('os 40 rudimentos oficiais da PAS estão todos presentes, numerados 1 a 40 sem repetir', () => {
  const ids = Object.keys(PAS_NUMBER);
  assert.equal(ids.length, 40);
  const numbers = Object.values(PAS_NUMBER).sort((a, b) => a - b);
  assert.deepEqual(numbers, Array.from({ length: 40 }, (_, i) => i + 1));
});

test('RUDIMENTS tem 41 entradas: os 40 rudimentos + o descanso', () => {
  assert.equal(Object.keys(RUDIMENTS).length, 41);
  assert.ok(RUDIMENTS.rest);
  assert.equal(RUDIMENTS.rest.cat, 'descanso');
});

test('contagem de toques de cada rudimento bate com o conferido contra as fontes', () => {
  Object.entries(EXPECTED_HITS).forEach(([id, count]) => {
    assert.ok(RUDIMENTS[id], `${id}: não encontrado em RUDIMENTS`);
    assert.equal(RUDIMENTS[id].hits.length, count, `${id}: esperava ${count} toques`);
  });
  // garante que a lista acima cobre os 40 (e não ficou nada de fora sem querer)
  assert.equal(Object.keys(EXPECTED_HITS).length, 40);
});

test('todo rudimento (exceto o descanso) tem categoria válida, hits não-vazios e bpm coerente', () => {
  Object.entries(RUDIMENTS).forEach(([id, r]) => {
    assert.ok(CATEGORIES[r.cat], `${id}: categoria "${r.cat}" não existe em CATEGORIES`);
    if (id === 'rest') return;
    assert.ok(Array.isArray(r.hits) && r.hits.length > 0, `${id}: sem hits`);
    assert.ok(r.bpm, `${id}: sem bpm`);
    assert.ok(r.bpm.start < r.bpm.goal, `${id}: start devia ser menor que goal`);
    assert.equal(r.spec.hits, r.hits, `${id}: spec.hits devia ser a mesma referência de hits`);
  });
});

test('todo hit usa só R ou L, e graça (quando existe) só L ou R', () => {
  Object.entries(RUDIMENTS).forEach(([id, r]) => {
    (r.hits || []).forEach((hit, i) => {
      if (!hit) return;
      assert.ok(hit.hand === 'R' || hit.hand === 'L', `${id}[${i}]: mão inválida`);
      hit.grace.forEach((g) => assert.ok(g === 'R' || g === 'L', `${id}[${i}]: graça inválida`));
    });
  });
});

test('plano da semana: dias de treino somam 60 min; domingo é só descanso', () => {
  WEEK.forEach((day) => {
    const total = day.plan.reduce((sum, item) => sum + item.min, 0);
    if (day.key === 'dom') {
      assert.deepEqual(day.plan.map((i) => i.ex), ['rest']);
    } else {
      assert.equal(total, 60, `${day.key}: soma ${total}, esperava 60`);
    }
  });
});

test('todo exercício citado no plano da semana existe no banco de rudimentos', () => {
  WEEK.forEach((day) => day.plan.forEach((item) => {
    assert.ok(RUDIMENTS[item.ex], `${day.key}: "${item.ex}" não existe em RUDIMENTS`);
  }));
});

test('os 40 rudimentos aparecem todos em algum dia da semana (nenhum fica esquecido)', () => {
  const used = new Set(WEEK.flatMap((day) => day.plan.map((item) => item.ex)));
  Object.keys(PAS_NUMBER).forEach((id) => assert.ok(used.has(id), `${id}: não aparece em nenhum dia`));
});

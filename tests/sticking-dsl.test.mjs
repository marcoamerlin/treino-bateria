import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSticking, repeatHits } from '../js/sticking-dsl.js';

test('nota simples: mão, sem graça, sem acento, sem buzz', () => {
  assert.deepEqual(parseSticking('R'), [{ hand: 'R', grace: [], buzz: false, accent: false }]);
  assert.deepEqual(parseSticking('L'), [{ hand: 'L', grace: [], buzz: false, accent: false }]);
});

test('acento e buzz são marcados independentemente', () => {
  assert.deepEqual(parseSticking('R>'), [{ hand: 'R', grace: [], buzz: false, accent: true }]);
  assert.deepEqual(parseSticking('R~'), [{ hand: 'R', grace: [], buzz: true, accent: false }]);
  assert.deepEqual(parseSticking('R~>'), [{ hand: 'R', grace: [], buzz: true, accent: true }]);
});

test('flam: 1 letra de graça (minúscula) antes da nota principal', () => {
  assert.deepEqual(parseSticking('lR'), [{ hand: 'R', grace: ['L'], buzz: false, accent: false }]);
  assert.deepEqual(parseSticking('rL'), [{ hand: 'L', grace: ['R'], buzz: false, accent: false }]);
});

test('drag: 2 letras de graça, mesma mão (rr ou ll)', () => {
  assert.deepEqual(parseSticking('llR'), [{ hand: 'R', grace: ['L', 'L'], buzz: false, accent: false }]);
  assert.deepEqual(parseSticking('rrL>'), [{ hand: 'L', grace: ['R', 'R'], buzz: false, accent: true }]);
});

test('pausa (-) vira um hit nulo, sem quebrar a contagem', () => {
  assert.deepEqual(parseSticking('R - L'), [
    { hand: 'R', grace: [], buzz: false, accent: false },
    null,
    { hand: 'L', grace: [], buzz: false, accent: false },
  ]);
});

test('vários tokens separados por espaço (inclusive múltiplo) viram uma sequência', () => {
  const hits = parseSticking('R  L   R L');
  assert.equal(hits.length, 4);
  assert.deepEqual(hits.map((h) => h.hand), ['R', 'L', 'R', 'L']);
});

test('token inválido lança erro com a mensagem apontando o token', () => {
  assert.throws(() => parseSticking('X'), /Toque de baqueta inválido: "X"/);
  assert.throws(() => parseSticking('R L Z'), /"Z"/);
  assert.throws(() => parseSticking('lllR'), /"lllR"/); // 3 graças não é válido (só 0, 1 ou 2)
});

test('repeatHits repete a célula inteira N vezes, na ordem', () => {
  const hits = parseSticking('R L');
  assert.deepEqual(repeatHits(hits, 3), [...hits, ...hits, ...hits]);
  assert.deepEqual(repeatHits(hits, 0), []);
});

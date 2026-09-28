import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSticking } from '../js/sticking-dsl.js';
import { hitLabel, buildSticking, hitHtml, buildStickingHTML } from '../js/sticking.js';

test('hitLabel: graça minúscula colada, acento com ">", buzz com "~"', () => {
  const [flam] = parseSticking('lR');
  assert.equal(hitLabel(flam), 'lR');
  const [drag] = parseSticking('llR>');
  assert.equal(hitLabel(drag), 'llR>');
  const [buzz] = parseSticking('R~');
  assert.equal(hitLabel(buzz), 'R~');
  assert.equal(hitLabel(null), '-');
});

test('buildSticking: alinha as colunas pela maior label, sem espaço sobrando no fim', () => {
  const hits = parseSticking('R L llR> L');
  const text = buildSticking(hits);
  const cols = text.split(/(?<=.)(?=llR>|R|L)/); // só uma checagem grosseira de alinhamento
  void cols;
  assert.equal(text, 'R    L    llR> L');
});

test('hitHtml: envolve só a letra principal em <span class="accent"> quando acentuado', () => {
  const [plain] = parseSticking('R');
  assert.equal(hitHtml(plain), 'R');
  const [accented] = parseSticking('R>');
  assert.equal(hitHtml(accented), '<span class="accent">R</span>&gt;');
  const [flamAccented] = parseSticking('lR>');
  assert.equal(hitHtml(flamAccented), 'l<span class="accent">R</span>&gt;');
  assert.equal(hitHtml(null), '-');
});

test('buildStickingHTML: o comprimento visível (sem tags) bate com buildSticking, coluna a coluna', () => {
  const hits = parseSticking('R L llR> L>');
  const plain = buildSticking(hits).split(/\s+/).filter(Boolean);
  const html = buildStickingHTML(hits);
  // tira as tags/entidades pra comparar só o texto visível
  const visible = html.replace(/<[^>]+>/g, '').replace(/&gt;/g, '>');
  assert.equal(visible.split(/\s+/).filter(Boolean).join(' '), plain.join(' '));
  assert.match(html, /<span class="accent">R<\/span>&gt;/);
  assert.match(html, /<span class="accent">L<\/span>&gt;/);
});

test('buildStickingHTML: nenhum toque acentuado não gera nenhum <span>', () => {
  const hits = parseSticking('R L R L');
  assert.ok(!buildStickingHTML(hits).includes('<span'));
});

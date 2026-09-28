// Texto legível de uma sequência de baqueteamento, gerado a partir dos hits (ver sticking-dsl.js)
// — nunca escrito à mão, no mesmo espírito do buildTab() da guitarra (js/tab.js).
//
// Formato: uma linha de contagem (opcional) + uma linha de toques, alinhadas por coluna.
// Graça (flam/drag) aparece em minúscula colada à nota principal (ex.: "lR", "llR");
// acento aparece com '>' depois da letra (ex.: "R>") — e, na versão HTML (buildStickingHTML),
// também com a letra em destaque (ver .accent no style.css). O símbolo '>' continua além da cor
// pra não depender só de cor pra passar a informação (alguém lendo em preto e branco, ou daltônico,
// ainda vê o acento).

export function hitLabel(hit) {
  if (!hit) return '-';
  const grace = hit.grace.map((g) => g.toLowerCase()).join('');
  return grace + hit.hand + (hit.buzz ? '~' : '') + (hit.accent ? '>' : '');
}

export function buildSticking(hits, { count } = {}) {
  const labels = hits.map(hitLabel);
  const width = Math.max(1, ...labels.map((l) => l.length));
  const hitsLine = labels.map((l) => l.padEnd(width + 1, ' ')).join('').trimEnd();
  if (!count) return hitsLine;
  const countLine = labels.map((_, i) => String(count[i % count.length] || '').padEnd(width + 1, ' ')).join('').trimEnd();
  return `${countLine}\n${hitsLine}`;
}

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Mesma coisa que hitLabel, mas em HTML: a letra principal (R/L) vem envolvida num <span> quando
// o toque é acentuado, pra dar destaque visual (ver .tab-readout .accent no style.css). O
// comprimento VISÍVEL (sem as tags) é o mesmo de hitLabel(hit), então o alinhamento por coluna de
// buildStickingHTML continua batendo com buildSticking (texto puro).
export function hitHtml(hit) {
  if (!hit) return '-';
  const grace = escapeHtml(hit.grace.map((g) => g.toLowerCase()).join(''));
  const hand = hit.accent ? `<span class="accent">${hit.hand}</span>` : hit.hand;
  const suffix = (hit.buzz ? '~' : '') + (hit.accent ? '&gt;' : '');
  return grace + hand + suffix;
}

export function buildStickingHTML(hits) {
  const labels = hits.map(hitLabel); // só pra medir a largura visível de cada coluna
  const width = Math.max(1, ...labels.map((l) => l.length));
  return hits
    .map((hit, i) => hitHtml(hit) + ' '.repeat(width + 1 - labels[i].length))
    .join('')
    .replace(/ +$/, '');
}

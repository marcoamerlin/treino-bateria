// Texto legível de uma sequência de baqueteamento, gerado a partir dos hits (ver sticking-dsl.js)
// — nunca escrito à mão, no mesmo espírito do buildTab() da guitarra (js/tab.js).
//
// Formato: uma linha de contagem (opcional) + uma linha de toques, alinhadas por coluna.
// Graça (flam/drag) aparece em minúscula colada à nota principal (ex.: "lR", "llR");
// acento aparece com '>' depois da letra (ex.: "R>").

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

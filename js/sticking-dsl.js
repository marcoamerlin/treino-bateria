// Notação curta de baqueteamento (sticking), no mesmo espírito de tab-dsl.js do Treino de
// Guitarra — uma nota por token, tokens separados por espaço.
//
//   token = [graça][MÃO][~][>]
//   graça = 0, 1 ou 2 letras minúsculas (l/r): notas de apoio (mais fracas), tocadas ANTES da
//           nota principal — 1 letra = flam (rufo simples), 2 letras = drag/ruff (rufo duplo).
//   MÃO   = R (direita) ou L (esquerda), maiúscula: a nota principal.
//   ~     = nota "buzz" (rufo de múltiplos toques) — usado só no Rufo de Toques Múltiplos (#4).
//   >     = acento (mais forte).
//   '-'   = pausa.
//
//   "lR rL"      → flam direita, flam esquerda (rudimento nº20, Flam)
//   "llR L R L"  → drag-direita, esquerda, direita, esquerda-acentuada (Single Ratamacue, nº38)
//   "R L R R"    → paradiddle simples, sem acento marcado explicitamente (usa-se '>' quando o
//                  acento é o que define o rudimento, como nos rolos contados)

const TOKEN = /^([lr]{0,2})([RL])(~)?(>)?$/;

export function parseSticking(dsl) {
  const hits = [];
  dsl.trim().split(/\s+/).forEach((token) => {
    if (token === '-') { hits.push(null); return; }
    const match = TOKEN.exec(token);
    if (!match) throw new Error(`Toque de baqueta inválido: "${token}"`);
    const [, grace, hand, buzz, accent] = match;
    hits.push({
      hand,
      grace: grace ? grace.toUpperCase().split('') : [], // ['L'] ou ['L','L'] etc.
      buzz: Boolean(buzz),
      accent: Boolean(accent),
    });
  });
  return hits;
}

// Repete a célula (array de hits) N vezes — usado para os rudimentos praticados em loop.
export function repeatHits(hits, times) {
  const out = [];
  for (let i = 0; i < times; i++) out.push(...hits);
  return out;
}

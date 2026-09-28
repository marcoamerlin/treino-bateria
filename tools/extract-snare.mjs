// Extrai a amostra de caixa (Acoustic Snare) do MESMO banco de sons usado no Treino de Guitarra
// (FluidR3_GM), pra manter os dois apps com o mesmo timbre de origem.
//
// Diferença em relação a extract-samples.mjs (guitarra): lá, o banco já vinha recortado por
// instrumento em arquivos JS prontos (gleitz/midi-js-soundfonts). Esse recorte NÃO inclui o kit
// de bateria (canal 10 do General MIDI não é um "instrumento" pitchado como os outros 128) — só
// tem instrumentos melódicos. Por isso aqui a extração parte do arquivo .sf2 original (o mesmo
// banco FluidR3_GM, formato SoundFont2 completo) e lê a tecla MIDI 38 (Acoustic Snare) do preset
// de percussão "Standard" (banco 128, preset 0) — é o snare padrão do kit acústico do FluidR3_GM.
//
// Uso: node tools/extract-snare.mjs <caminho para FluidR3_GM.sf2>
// Depende de "soundfont2" (parser do formato .sf2) e "lamejs" (codificador mp3), como devDependencies.
//
// Nota sobre o lamejs: o pacote do npm (build modular em src/js/) tem um bug de empacotamento —
// alguns módulos (Lame.js, BitStream.js) usam identificadores como MPEGMode/Lame como se fossem
// globais, sem dar require neles; isso só funciona no bundle pronto pra navegador (lame.all.js,
// que roda tudo dentro de uma única function scope). Rodamos esse bundle numa sandbox de vm.Context
// (como um <script> faria) e pegamos o objeto lamejs resultante de lá, em vez de tentar corrigir
// bug por bug no build modular.

import { readFileSync, writeFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import soundfont2Pkg from 'soundfont2';
const { SoundFont2 } = soundfont2Pkg;

const source = process.argv[2];
if (!source) { console.error('Informe o caminho do arquivo FluidR3_GM.sf2.'); process.exit(1); }

const root = join(fileURLToPath(import.meta.url), '..', '..');

const sandbox = {};
createContext(sandbox);
runInContext(readFileSync(new URL('../node_modules/lamejs/lame.all.js', import.meta.url), 'utf8'), sandbox);
const lamejs = sandbox.lamejs;

const sf2 = new SoundFont2(new Uint8Array(readFileSync(source)));

// Banco 128 = percussão (GM), preset 0 = "Standard" (o kit acústico padrão). Tecla 38 = Acoustic
// Snare, no mapeamento oficial de percussão do General MIDI.
const key = sf2.getKeyData(38, 128, 0);
if (!key) throw new Error('Não achei a tecla 38 (Acoustic Snare) no banco 128 / preset 0 (Standard).');

const { data, header } = key.sample;
console.log(`amostra: ${header.name} · ${header.sampleRate} Hz · ${data.length} pontos`);

const encoder = new lamejs.Mp3Encoder(1, header.sampleRate, 128);
const chunks = [];
const BLOCK = 1152; // tamanho de bloco esperado pelo lamejs
for (let i = 0; i < data.length; i += BLOCK) {
  const enc = encoder.encodeBuffer(data.subarray(i, i + BLOCK));
  if (enc.length) chunks.push(Buffer.from(enc));
}
const tail = encoder.flush();
if (tail.length) chunks.push(Buffer.from(tail));

const outPath = join(root, 'audio', 'snare.mp3');
writeFileSync(outPath, Buffer.concat(chunks));
console.log(`gravado ${outPath}`);

# Créditos do som de caixa (snare)

`snare.mp3` vem do banco de sons **FluidR3_GM**, de Frank Wen — o mesmo banco usado nos timbres de
guitarra do Treino de Guitarra.

- Licença: [Creative Commons Attribution 3.0](https://creativecommons.org/licenses/by/3.0/)
- Uso permitido, inclusive publicado, desde que se dê o crédito acima.
- Arquivo de origem: `FluidR3_GM.sf2` (o banco completo, formato SoundFont2) — diferente da
  guitarra, que usa os arquivos já recortados por instrumento do projeto
  [gleitz/midi-js-soundfonts](https://github.com/gleitz/midi-js-soundfonts). Esse recorte não
  inclui o kit de bateria (percussão é o canal 10 do General MIDI, sem "instrumento" pitchado
  como os outros 128), então aqui a extração parte do `.sf2` original.
- Nota extraída: **Acoustic Snare** (tecla MIDI 38), do preset de percussão "Standard" (banco 128,
  preset 0 do General MIDI) — o snare padrão do kit acústico do FluidR3_GM.
- Extração: `tools/extract-snare.mjs` (lê o `.sf2` com o pacote `soundfont2` e grava em mp3 com
  `lamejs`). Nada foi reprocessado além da conversão pra mp3 — mesmo espírito do
  `tools/extract-samples.mjs` da guitarra.

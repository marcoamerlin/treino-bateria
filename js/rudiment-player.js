// Toca um rudimento (sequência de baqueteamento) para ouvir como deve soar.
//
// Som principal: uma gravação real de caixa (audio/snare.mp3, banco FluidR3_GM, mesma família de
// samples usada no Treino de Guitarra — ver audio/CREDITS.md). Se a amostra não carregar, cai
// num sintetizador de ruído filtrado (não é fisicamente uma caixa de verdade, mas dá pra praticar
// offline ou se o arquivo falhar). Mesma filosofia de fallback do tab-player.js da guitarra.
//
// hits (ver sticking-dsl.js): [{ hand: 'R'|'L', grace: ['L'|'R', ...], buzz, accent } | null, ...]

import { ensureRunningContext } from './audio-context.js';

const SAMPLE_URL = new URL('../audio/snare.mp3', import.meta.url);
const GRACE_GAP_S = 0.035; // intervalo entre uma nota de apoio (flam/drag) e a nota principal
const BUZZ_GAP_S = 0.03; // intervalo entre os toques extras de uma nota "buzz" (aproximação)

// ---- Amostra de caixa -----------------------------------------------------------------------

const sampleCache = new WeakMap();

function loadSample(ctx) {
  let cached = sampleCache.get(ctx);
  if (cached) return cached;
  cached = fetch(SAMPLE_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`snare.mp3: ${response.status}`);
      return response.arrayBuffer();
    })
    .then((data) => ctx.decodeAudioData(data))
    .then((buffer) => {
      let peak = 0;
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
      return { buffer, norm: peak > 0 ? 0.9 / peak : 1 };
    })
    .catch(() => null); // segue com o sintetizador
  sampleCache.set(ctx, cached);
  return cached;
}

// ---- Saída com nível de música (mesma cadeia do tab-player.js da guitarra) -------------------

export function createOutput(ctx) {
  const input = ctx.createGain();

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -20;
  compressor.knee.value = 10;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.005;
  compressor.release.value = 0.2;

  const makeup = ctx.createGain();
  makeup.gain.value = 1.3;

  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -5;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.001;
  limiter.release.value = 0.05;

  const master = ctx.createGain();
  master.gain.value = 0.9;

  input.connect(compressor);
  compressor.connect(makeup);
  makeup.connect(limiter);
  limiter.connect(master);
  master.connect(ctx.destination);
  return { input, master };
}

// ---- Sintetizador de reserva: ruído filtrado, sem a amostra real -----------------------------

function playSynthHit(ctx, dest, time, gain) {
  const dur = 0.14;
  const size = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / size) ** 1.5;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1600;
  filter.Q.value = 0.6;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(dest);
  src.start(time);
}

function playHit(ctx, dest, sample, time, gain) {
  if (time < ctx.currentTime - 0.02) return; // já passou: não agenda no passado
  if (sample && sample.buffer) {
    const src = ctx.createBufferSource();
    src.buffer = sample.buffer;
    const g = ctx.createGain();
    g.gain.value = gain * sample.norm;
    src.connect(g).connect(dest);
    src.start(Math.max(time, ctx.currentTime));
  } else {
    playSynthHit(ctx, dest, Math.max(time, ctx.currentTime), gain * 0.8);
  }
}

// ---- Agendamento ------------------------------------------------------------------------------

// spec: { hits, perBeat, repeat? }. bpm em batidas por minuto; cada "hit" ocupa 1/perBeat de
// batida. Devolve a duração total agendada (segundos), para saber quando parar/encadear.
export function scheduleHits(ctx, dest, spec, bpm, t0, sample) {
  const step = 60 / bpm / (spec.perBeat || 1);
  const hits = [];
  for (let r = 0; r < (spec.repeat || 1); r++) hits.push(...spec.hits);

  let time = t0;
  hits.forEach((hit) => {
    if (!hit) { time += step; return; }
    const graceCount = hit.grace.length;
    for (let g = 0; g < graceCount; g++) {
      playHit(ctx, dest, sample, time - (graceCount - g) * GRACE_GAP_S, 0.32);
    }
    playHit(ctx, dest, sample, time, hit.accent ? 1 : 0.62);
    if (hit.buzz) {
      // Aproximação de um toque "buzz" (rufo de múltiplos toques): a amostra é de UM só toque de
      // baqueta, então isso não é fisicamente um buzz roll de verdade — só dá a sensação de mais
      // de um toque na mesma nota. Ver CLAUDE.md (Rufo de Toques Múltiplos, rudimento nº4).
      playHit(ctx, dest, sample, time + BUZZ_GAP_S, 0.4);
      playHit(ctx, dest, sample, time + BUZZ_GAP_S * 2, 0.28);
    }
    time += step;
  });
  return time - t0;
}

// ---- Player -------------------------------------------------------------------------------

class RudimentPlayer {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.timer = null;
    this.token = 0;
    this.current = null; // { spec, bpm, loading }
    this.listeners = new Set();
  }

  onChange(fn) { this.listeners.add(fn); }
  emit() { this.listeners.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } }); }
  isPlaying(spec, bpm) { return Boolean(this.current && this.current.spec === spec && this.current.bpm === bpm); }
  isLoading(spec, bpm) { return this.isPlaying(spec, bpm) && this.current.loading; }

  async play(spec, bpm) {
    this.stop();
    const token = ++this.token;
    const ctx = await ensureRunningContext(this.ctx);
    if (token !== this.token) return;
    if (!ctx) return;
    this.ctx = ctx;

    this.current = { spec, bpm, loading: true };
    this.emit();

    const sample = await loadSample(this.ctx);
    if (token !== this.token) return;

    const output = createOutput(this.ctx);
    this.master = output.master;
    const total = scheduleHits(this.ctx, output.input, spec, bpm, this.ctx.currentTime + 0.06, sample);
    this.current = { spec, bpm, loading: false };
    this.timer = setTimeout(() => this.stop(), total * 1000 + 150);
    this.emit();
  }

  stop() {
    this.token += 1;
    clearTimeout(this.timer);
    this.timer = null;
    if (this.master) {
      const master = this.master;
      master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.01);
      setTimeout(() => master.disconnect(), 120);
      this.master = null;
    }
    if (this.current) {
      this.current = null;
      this.emit();
    }
  }
}

export const rudimentPlayer = new RudimentPlayer();

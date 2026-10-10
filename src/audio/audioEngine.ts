/**
 * Fully synthesised audio engine (Web Audio API).
 *
 * Design decisions:
 *  - No audio files, no CDN, no third-party service. Everything is generated at
 *    runtime from oscillators and a procedural noise buffer, so there is no
 *    asset that can 404 on GitHub Pages and nothing extra to download.
 *  - The AudioContext is only created after an explicit user gesture (the sound
 *    toggle), which is both the browser requirement and the stated product rule:
 *    audio must never autoplay.
 *  - Every public method is failure-tolerant. If Web Audio is unavailable or
 *    throws, the visual experience continues untouched.
 */

type CueName =
  | 'ui'
  | 'open'
  | 'glide'
  | 'warp'
  | 'board'
  | 'launch'
  | 'arrive'
  | 'core'
  | 'hologram';

export type AmbientProfile = 'space' | 'cockpit' | 'quiet';

interface AmbientNodes {
  padA: OscillatorNode;
  padB: OscillatorNode;
  padC: OscillatorNode;
  padGain: GainNode;
  noise: AudioBufferSourceNode;
  noiseFilter: BiquadFilterNode;
  noiseGain: GainNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
}

function createNoiseBuffer(ctx: AudioContext, seconds = 4): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  // Cheap pink-ish noise (Voss-McCartney style running sum) — much less harsh
  // than white noise for an ambient bed.
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.099;
    b1 = 0.963 * b1 + white * 0.2965;
    b2 = 0.57 * b2 + white * 1.0526;
    data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.22;
  }
  return buffer;
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambient: AmbientNodes | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private enabled = false;
  private profile: AmbientProfile = 'space';
  private unsupported = false;

  get isEnabled(): boolean {
    return this.enabled;
  }

  /** Must be called from a user gesture handler. */
  async enable(): Promise<void> {
    if (this.unsupported) return;
    try {
      if (!this.ctx) {
        const Ctor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) {
          this.unsupported = true;
          console.info('[audio] Web Audio API unavailable — running silently.');
          return;
        }
        this.ctx = new Ctor();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0;
        this.master.connect(this.ctx.destination);
        this.noiseBuffer = createNoiseBuffer(this.ctx);
      }

      if (this.ctx.state === 'suspended') await this.ctx.resume();

      this.enabled = true;
      this.startAmbient();
      this.rampMaster(0.5, 1.6);
    } catch (error) {
      this.unsupported = true;
      console.warn('[audio] could not initialise audio — continuing muted.', error);
    }
  }

  disable(): void {
    this.enabled = false;
    try {
      this.rampMaster(0, 0.5);
      window.setTimeout(() => {
        if (!this.enabled) this.stopAmbient();
      }, 700);
    } catch {
      /* ignore */
    }
  }

  setProfile(profile: AmbientProfile): void {
    if (this.profile === profile) return;
    this.profile = profile;
    if (!this.enabled || !this.ctx || !this.ambient) return;
    const now = this.ctx.currentTime;
    const { padA, padB, padC, noiseFilter, noiseGain, padGain } = this.ambient;

    const config = {
      space: { a: 55, b: 82.5, c: 110, cutoff: 420, noise: 0.1, pad: 0.42 },
      cockpit: { a: 44, b: 66, c: 98, cutoff: 260, noise: 0.16, pad: 0.5 },
      quiet: { a: 55, b: 82.5, c: 110, cutoff: 200, noise: 0.04, pad: 0.18 },
    }[profile];

    padA.frequency.linearRampToValueAtTime(config.a, now + 2.2);
    padB.frequency.linearRampToValueAtTime(config.b, now + 2.2);
    padC.frequency.linearRampToValueAtTime(config.c, now + 2.2);
    noiseFilter.frequency.linearRampToValueAtTime(config.cutoff, now + 2.2);
    noiseGain.gain.linearRampToValueAtTime(config.noise, now + 2.2);
    padGain.gain.linearRampToValueAtTime(config.pad, now + 2.2);
  }

  cue(name: CueName): void {
    if (!this.enabled || !this.ctx || !this.master) return;
    try {
      switch (name) {
        case 'ui':
          this.blip(1180, 0.06, 0.1, 'triangle');
          break;
        case 'open':
          this.blip(680, 0.09, 0.12, 'sine');
          this.blip(1360, 0.07, 0.07, 'triangle', 0.05);
          break;
        case 'glide':
          this.sweep(220, 520, 0.9, 0.09);
          break;
        case 'warp':
          this.sweep(90, 1400, 0.75, 0.16);
          this.noiseBurst(0.7, 1800, 0.12);
          break;
        case 'board':
          this.sweep(70, 420, 1.3, 0.2);
          this.noiseBurst(1.2, 900, 0.14);
          break;
        case 'launch':
          this.sweep(60, 300, 2.2, 0.22);
          break;
        case 'arrive':
          this.blip(520, 0.3, 0.11, 'sine');
          this.blip(780, 0.4, 0.07, 'sine', 0.12);
          break;
        case 'core':
          this.sweep(120, 900, 2.4, 0.14);
          break;
        case 'hologram':
          this.blip(1040, 0.5, 0.1, 'sine');
          this.blip(1560, 0.7, 0.06, 'triangle', 0.08);
          this.noiseBurst(0.5, 4200, 0.05);
          break;
        default:
          break;
      }
    } catch (error) {
      console.warn('[audio] cue failed', name, error);
    }
  }

  /* ------------------------------------------------------------ */

  private rampMaster(value: number, seconds: number): void {
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(value, now + seconds);
  }

  private startAmbient(): void {
    if (!this.ctx || !this.master || this.ambient || !this.noiseBuffer) return;
    const ctx = this.ctx;

    const padGain = ctx.createGain();
    padGain.gain.value = 0.42;
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 900;
    padGain.connect(padFilter);
    padFilter.connect(this.master);

    const makePad = (freq: number, type: OscillatorType, gain: number) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = gain;
      osc.connect(g);
      g.connect(padGain);
      osc.start();
      return osc;
    };

    const padA = makePad(55, 'sine', 0.5);
    const padB = makePad(82.5, 'sine', 0.26);
    const padC = makePad(110, 'triangle', 0.14);

    // Slow breathing movement.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.055;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.16;
    lfo.connect(lfoGain);
    lfoGain.connect(padGain.gain);
    lfo.start();

    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    noise.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 420;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.1;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.master);
    noise.start();

    this.ambient = { padA, padB, padC, padGain, noise, noiseFilter, noiseGain, lfo, lfoGain };
  }

  private stopAmbient(): void {
    if (!this.ambient) return;
    const { padA, padB, padC, noise, lfo } = this.ambient;
    for (const node of [padA, padB, padC, lfo]) {
      try {
        node.stop();
        node.disconnect();
      } catch {
        /* already stopped */
      }
    }
    try {
      noise.stop();
      noise.disconnect();
    } catch {
      /* already stopped */
    }
    this.ambient = null;
  }

  private blip(
    freq: number,
    duration: number,
    gain: number,
    type: OscillatorType = 'sine',
    delay = 0,
  ): void {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(g);
    g.connect(this.master);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  private sweep(from: number, to: number, duration: number, gain: number): void {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const start = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(from, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), start + duration);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, start);
    filter.frequency.exponentialRampToValueAtTime(3600, start + duration);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + duration * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  private noiseBurst(duration: number, cutoff: number, gain: number): void {
    if (!this.ctx || !this.master || !this.noiseBuffer) return;
    const ctx = this.ctx;
    const start = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(cutoff * 0.3, start);
    filter.frequency.exponentialRampToValueAtTime(cutoff, start + duration);
    filter.Q.value = 1.1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + duration * 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    src.start(start);
    src.stop(start + duration + 0.05);
  }
}

export const audio = new AudioEngine();

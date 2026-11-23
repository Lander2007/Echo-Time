export class TactileAudioEngine {
  private enabled = false;
  private ctx: AudioContext | null = null;

  private ensureContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      if (!this.ctx) this.ctx = new AudioCtx();
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  private playTone(opts: {
    freq?: number;
    endFreq?: number | null;
    duration?: number;
    type?: OscillatorType;
    gain?: number;
    delay?: number;
  }) {
    const ac = this.ensureContext();
    if (!ac) return;
    const {
      freq = 440,
      endFreq = null,
      duration = 0.08,
      type = 'sine',
      gain = 0.045,
      delay = 0,
    } = opts;
    try {
      const now = ac.currentTime + delay;
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (endFreq !== null) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
      }
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(gain, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch {
      // Silently ignore Web Audio playback errors
    }
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.playTone({ freq: 520, endFreq: 740, duration: 0.08, type: 'triangle', gain: 0.04 });
    }
    return this.enabled;
  }

  public click() {
    this.playTone({ freq: 640, endFreq: 440, duration: 0.04, type: 'triangle', gain: 0.032 });
  }

  public knock() {
    this.playTone({ freq: 110, endFreq: 40, duration: 0.08, type: 'triangle', gain: 0.09 });
    this.playTone({ freq: 220, endFreq: 60, duration: 0.05, type: 'sine', gain: 0.06, delay: 0.01 });
  }

  public bolt() {
    this.playTone({ freq: 480, endFreq: 180, duration: 0.16, type: 'sawtooth', gain: 0.035 });
    this.playTone({ freq: 180, endFreq: 60, duration: 0.22, type: 'sine', gain: 0.06, delay: 0.04 });
  }

  public shutter() {
    this.playTone({ freq: 190, endFreq: 110, duration: 0.22, type: 'sine', gain: 0.04 });
    this.playTone({ freq: 360, endFreq: 250, duration: 0.14, type: 'triangle', gain: 0.024, delay: 0.05 });
  }

  public doorSlam() {
    this.playTone({ freq: 115, endFreq: 42, duration: 0.24, type: 'sine', gain: 0.075 });
    this.playTone({ freq: 240, endFreq: 85, duration: 0.14, type: 'triangle', gain: 0.04, delay: 0.02 });
  }

  public lock() {
    this.playTone({ freq: 440, endFreq: 660, duration: 0.08, type: 'triangle', gain: 0.04 });
    this.playTone({ freq: 660, endFreq: 880, duration: 0.11, type: 'sine', gain: 0.038, delay: 0.07 });
  }

  public stamp() {
    this.playTone({ freq: 155, endFreq: 70, duration: 0.15, type: 'sine', gain: 0.055 });
    this.playTone({ freq: 587, endFreq: 880, duration: 0.14, type: 'triangle', gain: 0.032, delay: 0.05 });
  }

  public flap() {
    this.playTone({ freq: 920, endFreq: 320, duration: 0.028, type: 'square', gain: 0.018 });
  }

  public patch() {
    this.playTone({ freq: 320, endFreq: 780, duration: 0.06, type: 'triangle', gain: 0.036 });
  }

  public tear() {
    const ac = this.ensureContext();
    if (!ac) return;
    try {
      const len = Math.floor(ac.sampleRate * 0.22);
      const buf = ac.createBuffer(1, len, ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      }
      const src = ac.createBufferSource();
      src.buffer = buf;
      const filter = ac.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1850;
      const gain = ac.createGain();
      gain.gain.setValueAtTime(0.08, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.22);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);
      src.start();
      this.playTone({ freq: 523, endFreq: 784, duration: 0.14, type: 'triangle', gain: 0.04, delay: 0.12 });
    } catch {
      // Silently ignore Web Audio playback errors
    }
  }

  public alarm() {
    this.playTone({ freq: 540, endFreq: 420, duration: 0.07, type: 'sawtooth', gain: 0.025 });
    this.playTone({ freq: 420, endFreq: 680, duration: 0.09, type: 'triangle', gain: 0.03, delay: 0.08 });
  }
}


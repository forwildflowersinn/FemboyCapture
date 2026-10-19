/**
 * Procedural Web Audio API sound synthesizer.
 * Operates without external audio file dependencies.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public playShoot(type: string = 'pistol') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    switch (type) {
      case 'shotgun': {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.16);
        gain.gain.setValueAtTime(0.24, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);
        osc.start(t);
        osc.stop(t + 0.16);
        break;
      }
      case 'smg': {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(580 + Math.random() * 80, t);
        osc.frequency.exponentialRampToValueAtTime(220, t + 0.06);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
        osc.start(t);
        osc.stop(t + 0.06);
        break;
      }
      case 'laser': {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(320, t + 0.18);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
        osc.start(t);
        osc.stop(t + 0.18);
        break;
      }
      case 'launcher': {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.28);
        gain.gain.setValueAtTime(0.32, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);
        osc.start(t);
        osc.stop(t + 0.28);
        break;
      }
      default: {
        // Pistol / default
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(140, t + 0.09);
        gain.gain.setValueAtTime(0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);
        osc.start(t);
        osc.stop(t + 0.09);
        break;
      }
    }
  }

  public playHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.07);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  public playDefeatEnemy() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.linearRampToValueAtTime(780, t + 0.08);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  public playPickup() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25]; // A major arpeggio
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const noteTime = t + idx * 0.05;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.15, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.12);

      osc.start(noteTime);
      osc.stop(noteTime + 0.12);
    });
  }

  public playPlayerHurt() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.2);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  public playDeflect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    // High-pitched metallic ring / clang
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(700, t + 0.12);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  public playWhistle() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [1800, 2200, 1800, 2200];
    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const noteT = t + idx * 0.06;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, noteT);
      gain.gain.setValueAtTime(0.18, noteT);
      gain.gain.exponentialRampToValueAtTime(0.01, noteT + 0.05);

      osc.start(noteT);
      osc.stop(noteT + 0.05);
    });
  }

  public playShinyAlert() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Radiant shimmering celestial chime
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const noteTime = t + idx * 0.07;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.005, noteTime + 0.35);

      osc.start(noteTime);
      osc.stop(noteTime + 0.35);
    });
  }

  public playHeartCollect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    const startFreq = 650 + Math.random() * 120;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 1.6, t + 0.1);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.1);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  public playLevelUp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const fanfareNotes = [440, 554.37, 659.25, 880];
    fanfareNotes.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const noteTime = t + idx * 0.08;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, noteTime);
      gain.gain.setValueAtTime(0.22, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.005, noteTime + 0.28);

      osc.start(noteTime);
      osc.stop(noteTime + 0.28);
    });
  }

  public playUpgradeSelect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, t);
    osc.frequency.exponentialRampToValueAtTime(1046.5, t + 0.18);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  public playAlertSiren() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.linearRampToValueAtTime(950, t + 0.12);
    osc.frequency.linearRampToValueAtTime(700, t + 0.24);
    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.26);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  public playBarricade() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Wooden hammer strike & plank nail
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.08);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  public playWoodBreak() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Splintering wood crash
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sawtooth';
      const offsetT = t + i * 0.04;
      const freq = 120 + i * 80 + Math.random() * 50;
      osc.frequency.setValueAtTime(freq, offsetT);
      osc.frequency.exponentialRampToValueAtTime(40, offsetT + 0.12);
      gain.gain.setValueAtTime(0.25, offsetT);
      gain.gain.exponentialRampToValueAtTime(0.01, offsetT + 0.12);

      osc.start(offsetT);
      osc.stop(offsetT + 0.12);
    }
  }

  public playGoldenSlam() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Deep thunderous golden boss slam
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.35);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.start(t);
    osc.stop(t + 0.35);
  }

  public playGameOver() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const chords = [392, 329.63, 261.63]; // Descending soft chord
    chords.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const startTime = t + i * 0.14;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.005, startTime + 0.6);

      osc.start(startTime);
      osc.stop(startTime + 0.6);
    });
  }
}

export const sounds = new SoundController();

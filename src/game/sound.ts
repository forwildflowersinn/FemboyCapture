/**
 * Procedural Web Audio API sound synthesizer.
 * Designed around warm plush sub-bass thumps and soft low-pass synth chimes
 * with smooth attack envelopes so every sound feels cozy, tactile, and easy on the ears.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  private masterFilter: BiquadFilterNode | null = null;
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

  /**
   * Routes audio through a warm low-pass filter (cutoff 920Hz, gentle Q)
   * so no high-frequency harshness or click transients ever reach the output.
   */
  private getWarmDestination(cutoffHz: number = 880): AudioNode | null {
    if (this.isMuted) return null;
    this.initCtx();
    if (!this.ctx) return null;

    if (!this.masterFilter || this.masterFilter.context !== this.ctx) {
      this.masterFilter = this.ctx.createBiquadFilter();
      this.masterFilter.type = 'lowpass';
      this.masterFilter.frequency.setValueAtTime(920, this.ctx.currentTime);
      this.masterFilter.Q.setValueAtTime(0.65, this.ctx.currentTime);
      this.masterFilter.connect(this.ctx.destination);
    }

    const voiceFilter = this.ctx.createBiquadFilter();
    voiceFilter.type = 'lowpass';
    voiceFilter.frequency.setValueAtTime(cutoffHz, this.ctx.currentTime);
    voiceFilter.Q.setValueAtTime(0.6, this.ctx.currentTime);
    voiceFilter.connect(this.masterFilter);
    return voiceFilter;
  }

  /** Helper for a warm, rounded plush bass thump or soft synth tone with smooth fade-in */
  private playPlushVoice(
    type: 'sine' | 'triangle',
    startFreq: number,
    endFreq: number,
    duration: number,
    peakGain: number,
    cutoffHz: number = 760,
    delaySec: number = 0
  ) {
    if (this.isMuted) return;
    const dest = this.getWarmDestination(cutoffHz);
    if (!dest || !this.ctx) return;

    const t0 = this.ctx.currentTime + delaySec;
    const attack = Math.min(0.018, duration * 0.24);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(28, startFreq), t0);
    if (Math.abs(endFreq - startFreq) > 1) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(28, endFreq), t0 + duration);
    }

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(peakGain, t0 + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t0);
    osc.stop(t0 + duration + 0.01);
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public playShoot(type: string = 'pistol') {
    if (this.isMuted) return;

    switch (type) {
      case 'shotgun': {
        // Warm velvet double-bass puff
        this.playPlushVoice('sine', 135, 48, 0.16, 0.14, 460);
        this.playPlushVoice('triangle', 210, 72, 0.13, 0.065, 520, 0.01);
        break;
      }
      case 'smg': {
        // Gentle muted bubble pop
        this.playPlushVoice('sine', 285 + Math.random() * 25, 140, 0.065, 0.055, 620);
        break;
      }
      case 'laser': {
        // Soft Rhodes-like warm harmonic chime
        this.playPlushVoice('sine', 420, 260, 0.15, 0.075, 760);
        this.playPlushVoice('triangle', 630, 390, 0.13, 0.04, 820, 0.01);
        break;
      }
      case 'launcher': {
        // Deep pillowy sub-bass bloom
        this.playPlushVoice('sine', 112, 38, 0.26, 0.15, 380);
        this.playPlushVoice('triangle', 165, 58, 0.21, 0.06, 440, 0.02);
        break;
      }
      case 'dual': {
        // Twin soft velvet pops
        this.playPlushVoice('sine', 260, 115, 0.075, 0.065, 600);
        this.playPlushVoice('triangle', 325, 145, 0.07, 0.045, 650, 0.025);
        break;
      }
      default: {
        // Standard Pea Blaster: warm muted bass tap
        this.playPlushVoice('sine', 230, 92, 0.085, 0.075, 560);
        break;
      }
    }
  }

  public playHit() {
    // Soft padded bass thump
    this.playPlushVoice('sine', 155, 64, 0.075, 0.085, 460);
  }

  public playDefeatEnemy() {
    // Warm two-note plush marimba/synth chime (F4 -> A4) + sub-bass cushion
    this.playPlushVoice('sine', 120, 58, 0.12, 0.08, 420);
    this.playPlushVoice('triangle', 349.23, 360, 0.16, 0.065, 820, 0.01);
    this.playPlushVoice('sine', 440, 460, 0.19, 0.065, 880, 0.055);
  }

  public playPickup() {
    // Cozy major-seventh synth chord arpeggio (C4 - E4 - G4 - B4)
    const notes = [261.63, 329.63, 392.0, 493.88];
    notes.forEach((freq, idx) => {
      this.playPlushVoice('sine', freq, freq * 1.01, 0.18, 0.06, 860, idx * 0.045);
    });
  }

  public playPlayerHurt() {
    // Deep, rounded heartbeat bass thud (never harsh or buzzy)
    this.playPlushVoice('sine', 118, 46, 0.22, 0.13, 360);
    this.playPlushVoice('triangle', 175, 78, 0.18, 0.05, 420, 0.02);
  }

  public playDeflect() {
    // Soft plush bounce + gentle low-pass chime (replaces sharp 1400Hz metallic ping)
    this.playPlushVoice('sine', 165, 72, 0.11, 0.095, 460);
    this.playPlushVoice('triangle', 440, 523.25, 0.13, 0.055, 760, 0.012);
  }

  public playWallHit() {
    // Soft muffled velvet tap
    this.playPlushVoice('sine', 140, 65, 0.08, 0.06, 400);
  }

  public playWhistle() {
    // Soft melodic 2-note handler command chime (replaces piercing 2200Hz whistle)
    this.playPlushVoice('sine', 392.0, 440.0, 0.12, 0.055, 760);
    this.playPlushVoice('sine', 523.25, 493.88, 0.15, 0.055, 800, 0.09);
  }

  public playWhistleChime() {
    this.playWhistle();
  }

  /** Rhythmic, cozy plush bed/heart bounce thump for the Game Over capture zone */
  public playPlapThump() {
    this.playPlushVoice('sine', 128, 52, 0.13, 0.11, 380);
    this.playPlushVoice('triangle', 280, 190, 0.09, 0.04, 540, 0.015);
  }

  public playShinyAlert() {
    // Dreamy warm celesta shimmer (D4, F#4, A4, C#5 capped gently with low-pass)
    const notes = [293.66, 369.99, 440.0, 554.37];
    notes.forEach((freq, idx) => {
      this.playPlushVoice('sine', freq, freq * 1.005, 0.26, 0.065, 900, idx * 0.075);
      this.playPlushVoice('triangle', freq * 0.5, freq * 0.5, 0.24, 0.04, 640, idx * 0.075);
    });
  }

  public playHeartCollect() {
    // Gentle warm bell droplet
    const startFreq = 360 + Math.random() * 45;
    this.playPlushVoice('sine', startFreq, startFreq * 1.25, 0.11, 0.055, 780);
  }

  public playLevelUp() {
    // Plush, dreamy synth pad arpeggio with sub-bass warmth
    this.playPlushVoice('sine', 98, 65, 0.35, 0.09, 360);
    const notes = [261.63, 329.63, 392.0, 493.88, 523.25];
    notes.forEach((freq, idx) => {
      this.playPlushVoice('sine', freq, freq, 0.28, 0.065, 880, idx * 0.065);
      this.playPlushVoice('triangle', freq * 0.5, freq * 0.5, 0.26, 0.04, 600, idx * 0.065);
    });
  }

  public playUpgradeSelect() {
    // Warm confirmation chord + bass cushion
    this.playPlushVoice('sine', 110, 68, 0.18, 0.09, 400);
    this.playPlushVoice('sine', 329.63, 440.0, 0.19, 0.065, 800, 0.015);
  }

  public playAlertSiren() {
    // Soft warm dual-tone synth pulse instead of harsh siren
    this.playPlushVoice('sine', 330, 392, 0.14, 0.06, 680);
    this.playPlushVoice('sine', 392, 330, 0.14, 0.06, 680, 0.12);
  }

  public playBarricade() {
    // Warm woody bass knock
    this.playPlushVoice('sine', 130, 62, 0.11, 0.09, 380);
  }

  public playWoodBreak() {
    // Deep woody double-thump
    this.playPlushVoice('sine', 115, 42, 0.22, 0.12, 360);
    this.playPlushVoice('triangle', 155, 58, 0.18, 0.065, 420, 0.05);
  }

  public playGoldenSlam() {
    // Deep pillowy golden sub-bass swell
    this.playPlushVoice('sine', 120, 38, 0.32, 0.14, 380);
    this.playPlushVoice('triangle', 261.63, 196.0, 0.26, 0.06, 680, 0.02);
  }

  public playOfficerAim() {
    // Soft low-pass synth lock-on hum
    this.playPlushVoice('sine', 293.66, 392.0, 0.32, 0.045, 650);
  }

  public playOfficerShoot() {
    // Soft muted synth pulse
    this.playPlushVoice('sine', 340, 170, 0.12, 0.065, 640);
    this.playPlushVoice('triangle', 220, 110, 0.11, 0.045, 520, 0.015);
  }

  public playBarricadeHit() {
    // Muffled wooden bass knock
    this.playPlushVoice('sine', 105, 48, 0.11, 0.085, 360);
  }

  public playBarricadeBreak() {
    this.playWoodBreak();
  }

  public playShinyBossAttack() {
    // Warm bass swell + soft golden chord
    this.playPlushVoice('sine', 125, 55, 0.26, 0.1, 420);
    this.playPlushVoice('sine', 330, 220, 0.24, 0.06, 740, 0.02);
  }

  public playShinyBossDefeat() {
    this.playPlushVoice('sine', 110, 52, 0.4, 0.11, 380);
    const fanfareNotes = [261.63, 329.63, 392.0, 493.88, 587.33];
    fanfareNotes.forEach((freq, idx) => {
      this.playPlushVoice('sine', freq, freq * 1.01, 0.3, 0.07, 880, idx * 0.07);
    });
  }

  public playStun() {
    // Warm wobbly tremolo bass chime instead of harsh square buzz
    this.playPlushVoice('sine', 240, 150, 0.22, 0.075, 540);
    this.playPlushVoice('triangle', 310, 195, 0.2, 0.045, 600, 0.05);
  }

  public playGameOver() {
    // Warm, velvety sunset chord progression
    this.playPlushVoice('sine', 98, 49, 0.45, 0.11, 360);
    const chords = [392.0, 349.23, 329.63, 261.63];
    chords.forEach((freq, i) => {
      this.playPlushVoice('sine', freq, freq * 0.99, 0.36, 0.065, 760, i * 0.14);
      this.playPlushVoice('triangle', freq * 0.5, freq * 0.5, 0.34, 0.04, 520, i * 0.14);
    });
  }

  public playHeal() {
    // Soothing warm triad bloom
    const notes = [293.66, 369.99, 440.0, 587.33];
    notes.forEach((freq, idx) => {
      this.playPlushVoice('sine', freq, freq * 1.02, 0.24, 0.065, 820, idx * 0.06);
    });
  }
}

export const sounds = new SoundController();


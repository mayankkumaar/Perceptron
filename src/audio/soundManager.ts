/**
 * Web Audio API Sound Synthesizer for Smart Parking Assistant
 * Provides realistic procedural engine, reverse beeper, ultrasonic sonar warning,
 * collision impact crunch, and parking success fanfare.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  // Engine sound nodes
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineRunning: boolean = false;

  // Beeper timer
  private beepTimer: number | null = null;
  private lastBeepCadence: number = 0;

  constructor() {
    // Initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.35, this.ctx.currentTime);
    }
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  /**
   * Starts procedural engine hum
   */
  public startEngine() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain || this.engineRunning) return;

      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(45, this.ctx.currentTime); // Idle 45 Hz

      // Low pass filter to make it sound like a combustion engine block
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.masterGain);

      this.engineOsc.start();
      this.engineRunning = true;
    } catch {
      // Audio autoplay policy handled silently
    }
  }

  /**
   * Modulates engine RPM based on vehicle speed
   */
  public updateEngineSpeed(speed: number) {
    if (!this.engineOsc || !this.ctx || !this.engineRunning) return;
    const absSpeed = Math.abs(speed);
    // Base frequency 45Hz, scales up to 135Hz at high speed
    const targetFreq = 45 + Math.min(absSpeed * 22, 90);
    this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.08);
  }

  public stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch {}
      this.engineOsc = null;
      this.engineRunning = false;
    }
  }

  /**
   * Plays a single short warning beep
   */
  public playBeep(freq: number = 950, duration: number = 0.08) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {}
  }

  /**
   * Updates dynamic ultrasonic warning beeps based on perceptron output Y and distance
   * Perceptron Y = 1 triggers warning. Distance determines cadence.
   */
  public updateWarningBeeps(perceptronActive: boolean, distanceCm: number) {
    if (this.isMuted || !perceptronActive) {
      if (this.beepTimer) {
        window.clearTimeout(this.beepTimer);
        this.beepTimer = null;
        this.lastBeepCadence = 0;
      }
      return;
    }

    // Determine interval based on distance
    let interval = 550; // slow default
    let freq = 850;

    if (distanceCm <= 30) {
      // Critical proximity
      interval = 140;
      freq = 1350;
    } else if (distanceCm <= 60) {
      interval = 280;
      freq = 1100;
    } else if (distanceCm <= 100) {
      interval = 480;
      freq = 900;
    }

    if (!this.beepTimer || Math.abs(this.lastBeepCadence - interval) > 50) {
      if (this.beepTimer) window.clearTimeout(this.beepTimer);
      this.lastBeepCadence = interval;

      const scheduleLoop = () => {
        this.playBeep(freq, interval <= 150 ? 0.06 : 0.09);
        this.beepTimer = window.setTimeout(scheduleLoop, interval);
      };
      scheduleLoop();
    }
  }

  /**
   * Collision crunch / impact sound
   */
  public playCollision() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      // White noise buffer for crunch
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.25);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.45, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start();

      // Low frequency thump
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(110, this.ctx.currentTime);
      subOsc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.2);

      subGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      subGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);

      subOsc.start();
      subOsc.stop(this.ctx.currentTime + 0.2);
    } catch {}
  }

  /**
   * Parking success fanfare
   */
  public playSuccess() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const noteOsc = this.ctx!.createOscillator();
        const noteGain = this.ctx!.createGain();

        noteOsc.type = 'triangle';
        noteOsc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.1);

        noteGain.gain.setValueAtTime(0, this.ctx!.currentTime + idx * 0.1);
        noteGain.gain.linearRampToValueAtTime(0.25, this.ctx!.currentTime + idx * 0.1 + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.1 + 0.35);

        noteOsc.connect(noteGain);
        noteGain.connect(this.masterGain!);

        noteOsc.start(this.ctx!.currentTime + idx * 0.1);
        noteOsc.stop(this.ctx!.currentTime + idx * 0.1 + 0.35);
      });
    } catch {}
  }
}

export const soundManager = new SoundManager();

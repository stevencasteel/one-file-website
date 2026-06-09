class AudioEngine {
  constructor() {
    this.ctx = null;
    this.source = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.ambienceGain = null;
    this.musicFilter = null;
    this.analyser = null;
    this.isInitialized = false;
    this.ambienceNode = null;
    this.ambienceFilter = null;
    this.sfxVolume = 0.8;
  }

  init(audioElement) {
    if (this.isInitialized) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    this.source = this.ctx.createMediaElementSource(audioElement);
    this.masterGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.ambienceGain = this.ctx.createGain();

    this.musicFilter = this.ctx.createBiquadFilter();
    this.musicFilter.type = "lowpass";
    this.musicFilter.frequency.value = 20000;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 128;

    this.source.connect(this.musicGain);
    this.musicGain.connect(this.musicFilter);
    this.musicFilter.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.sfxGain.connect(this.masterGain);
    this.ambienceGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    this.isInitialized = true;

    this.startAmbience();
  }

  setVolume(type, value) {
    if (!this.isInitialized || !this.ctx) return;

    if (type === "sfx") {
      this.sfxVolume = value;
    }

    const targetGain = this[`${type}Gain`];
    if (targetGain) {
      targetGain.gain.setValueAtTime(value, this.ctx.currentTime);
    }
  }

  setLowpass(active) {
    if (!this.isInitialized || !this.musicFilter || !this.ctx) return;
    const now = this.ctx.currentTime;
    const frequency = active ? 800 : 20000;
    this.musicFilter.frequency.exponentialRampToValueAtTime(frequency, now + 0.45);
  }

  startAmbience() {
    if (!this.isInitialized || !this.ctx || this.ambienceNode) return;

    const duration = 2.0;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.ambienceNode = this.ctx.createBufferSource();
    this.ambienceNode.buffer = buffer;
    this.ambienceNode.loop = true;

    this.ambienceFilter = this.ctx.createBiquadFilter();
    this.ambienceFilter.type = "lowpass";
    this.ambienceFilter.frequency.setValueAtTime(300, this.ctx.currentTime);

    this.ambienceNode.connect(this.ambienceFilter);
    this.ambienceFilter.connect(this.ambienceGain);

    this.ambienceNode.start();
  }

  stopAmbience() {
    if (this.ambienceNode) {
      try {
        this.ambienceNode.stop();
      } catch (e) {}
      this.ambienceNode.disconnect();
      this.ambienceNode = null;
    }
    if (this.ambienceFilter) {
      this.ambienceFilter.disconnect();
      this.ambienceFilter = null;
    }
  }

  playClick() {
    if (!this.isInitialized || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);

    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.08 * this.sfxVolume, this.ctx.currentTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gainNode);
    gainNode.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  playHover() {
    if (!this.isInitialized || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.03);

    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.04 * this.sfxVolume, this.ctx.currentTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.connect(gainNode);
    gainNode.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  playSuccess() {
    if (!this.isInitialized || !this.ctx) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1046.5, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.08 * this.sfxVolume, now + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(now);
    osc1.stop(now + 0.22);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1318.51, now + 0.08);
    gain2.gain.setValueAtTime(0, now + 0.08);
    gain2.gain.linearRampToValueAtTime(0.12 * this.sfxVolume, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.42);
  }

  playTick() {
    if (!this.isInitialized || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(6000, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, this.ctx.currentTime + 0.01);

    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.03 * this.sfxVolume, this.ctx.currentTime + 0.001);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.01);

    osc.connect(gainNode);
    gainNode.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.012);
  }

  playInnerTick() {
    if (!this.isInitialized || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(2000, this.ctx.currentTime);

    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.015 * this.sfxVolume, this.ctx.currentTime + 0.001);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.008);

    osc.connect(gainNode);
    gainNode.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.01);
  }

  playSection() {
    if (!this.isInitialized || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.18 * this.sfxVolume, this.ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gainNode);
    gainNode.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  playSFX(url, volume = 1.0) {
    if (!this.isInitialized || !this.ctx) {
      const audio = new Audio(url);
      audio.volume = volume * 0.35;
      audio.play().catch(() => {});
      return;
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    fetch(url)
      .then((res) => res.arrayBuffer())
      .then((buffer) => this.ctx.decodeAudioData(buffer))
      .then((decodedBuffer) => {
        const sourceNode = this.ctx.createBufferSource();
        sourceNode.buffer = decodedBuffer;

        const localGain = this.ctx.createGain();
        localGain.gain.setValueAtTime(volume * this.sfxVolume, this.ctx.currentTime);

        sourceNode.connect(localGain);
        localGain.connect(this.sfxGain);

        sourceNode.start(0);
      })
      .catch(() => {
        const audio = new Audio(url);
        audio.volume = volume * 0.35 * this.sfxVolume;
        audio.play().catch(() => {});
      });
  }
}

export const audioEngine = new AudioEngine();

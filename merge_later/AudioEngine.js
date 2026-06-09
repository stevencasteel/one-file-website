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
    this.musicFilter.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.sfxGain.connect(this.masterGain);
    this.ambienceGain.connect(this.masterGain);

    this.isInitialized = true;
  }

  setVolume(type, value) {
    if (!this.isInitialized || !this.ctx) return;
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
        localGain.gain.setValueAtTime(volume, this.ctx.currentTime);

        sourceNode.connect(localGain);
        localGain.connect(this.sfxGain);

        sourceNode.start(0);
      })
      .catch(() => {
        const audio = new Audio(url);
        audio.volume = volume * 0.35;
        audio.play().catch(() => {});
      });
  }
}

export const audioEngine = new AudioEngine();

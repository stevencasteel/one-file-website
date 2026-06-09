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

    // Ambience Modulation Nodes
    this.ambienceNode = null;
    this.ambienceSynthFilter = null;
    this.ambienceMixerFilter = null;
    this.ambienceLFO = null;
    this.ambienceLFOGain = null;
    this.ambienceFadeGain = null;

    // Canonical Calibration Scales
    this.SCALING = {
      MASTER: 0.5,
      SFX: 0.8,
      AMBIENCE: 1.0,
      MUSIC: 0.25
    };

    // Store Raw Values (1:1 with Store matrices)
    this.masterVol = 1.0;
    this.musicVol = 0.75;
    this.sfxVol = 1.0;
    this.ambienceVol = 1.0;
    this.isMuted = false;

    // Simple cache for track metadata to limit fetches
    this.metadataCache = {};
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
    this.musicFilter.frequency.setValueAtTime(20000, this.ctx.currentTime);
    this.musicFilter.Q.setValueAtTime(0.0001, this.ctx.currentTime);

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.4;

    // Connections
    this.source.connect(this.musicGain);
    this.musicGain.connect(this.musicFilter);
    this.musicFilter.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.sfxGain.connect(this.masterGain);
    this.ambienceGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    // Initial Vol Scaling
    this.musicGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.isInitialized = true;

    this.applyVolumes();
    this.startAmbience();
  }

  setVolumes(master, sfx, ambience, isMuted) {
    this.masterVol = master;
    this.sfxVol = sfx;
    this.ambienceVol = ambience;
    this.isMuted = isMuted;
    this.applyVolumes();
  }

  applyVolumes() {
    if (!this.isInitialized || !this.ctx) return;
    const now = this.ctx.currentTime;
    const master = this.isMuted ? 0 : this.masterVol * this.SCALING.MASTER;

    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(master, now + 0.2);

    this.sfxGain.gain.cancelScheduledValues(now);
    this.sfxGain.gain.linearRampToValueAtTime(this.sfxVol * this.SCALING.SFX, now + 0.2);

    this.ambienceGain.gain.cancelScheduledValues(now);
    this.ambienceGain.gain.linearRampToValueAtTime(this.ambienceVol * this.SCALING.AMBIENCE, now + 0.2);
  }

  setVolume(type, value) {
    if (!this.isInitialized || !this.ctx) return;

    if (type === "master") {
      this.masterVol = value;
      this.applyVolumes();
    } else if (type === "music") {
      this.musicVol = value;
      this.musicGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    } else if (type === "sfx") {
      this.sfxVol = value;
      this.applyVolumes();
    } else if (type === "ambience") {
      this.ambienceVol = value;
      this.applyVolumes();
    }
  }

  getMusicElementVolume(master, music, isMuted) {
    if (isMuted) return 0;
    return master * this.SCALING.MASTER * (music * this.SCALING.MUSIC);
  }

  setLowpass(active) {
    if (!this.isInitialized || !this.musicFilter || !this.ctx) return;
    const now = this.ctx.currentTime;
    const frequency = active ? 800 : 20000;
    const q = active ? 4.5 : 0.0001;

    this.musicFilter.frequency.cancelScheduledValues(now);
    this.musicFilter.frequency.exponentialRampToValueAtTime(frequency, now + 0.45);

    this.musicFilter.Q.cancelScheduledValues(now);
    this.musicFilter.Q.linearRampToValueAtTime(q, now + 0.45);
  }

  startAmbience() {
    if (!this.isInitialized || !this.ctx || this.ambienceNode) return;

    const duration = 5.0;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.ambienceNode = this.ctx.createBufferSource();
    this.ambienceNode.buffer = buffer;
    this.ambienceNode.loop = true;

    this.ambienceSynthFilter = this.ctx.createBiquadFilter();
    this.ambienceSynthFilter.type = "lowpass";
    this.ambienceSynthFilter.frequency.setValueAtTime(800, this.ctx.currentTime);

    this.ambienceMixerFilter = this.ctx.createBiquadFilter();
    this.ambienceMixerFilter.type = "lowpass";
    this.ambienceMixerFilter.frequency.setValueAtTime(300, this.ctx.currentTime);

    this.ambienceLFO = this.ctx.createOscillator();
    this.ambienceLFO.type = "sine";
    this.ambienceLFO.frequency.setValueAtTime(0.2, this.ctx.currentTime);

    this.ambienceLFOGain = this.ctx.createGain();
    this.ambienceLFOGain.gain.setValueAtTime(10, this.ctx.currentTime);

    // Patch modulation
    this.ambienceLFO.connect(this.ambienceLFOGain);
    this.ambienceLFOGain.connect(this.ambienceMixerFilter.frequency);

    this.ambienceFadeGain = this.ctx.createGain();
    this.ambienceFadeGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.ambienceFadeGain.gain.linearRampToValueAtTime(0.24, this.ctx.currentTime + 2.0);

    this.ambienceNode.connect(this.ambienceSynthFilter);
    this.ambienceSynthFilter.connect(this.ambienceMixerFilter);
    this.ambienceMixerFilter.connect(this.ambienceFadeGain);
    this.ambienceFadeGain.connect(this.ambienceGain);

    this.ambienceLFO.start();
    this.ambienceNode.start();
  }

  stopAmbience() {
    if (this.ambienceNode) {
      try { this.ambienceNode.stop(); } catch (e) {}
      this.ambienceNode.disconnect();
      this.ambienceNode = null;
    }
    if (this.ambienceLFO) {
      try { this.ambienceLFO.stop(); } catch (e) {}
      this.ambienceLFO.disconnect();
      this.ambienceLFO = null;
    }
    this.ambienceLFOGain?.disconnect();
    this.ambienceLFOGain = null;
    this.ambienceSynthFilter?.disconnect();
    this.ambienceSynthFilter = null;
    this.ambienceMixerFilter?.disconnect();
    this.ambienceMixerFilter = null;
    this.ambienceFadeGain?.disconnect();
    this.ambienceFadeGain = null;
  }

  // ── ID3 TAG DECODER (1:1 PARITY) ──
  async fetchID3Metadata(url) {
    if (this.metadataCache[url]) {
      return this.metadataCache[url];
    }

    try {
      const fetchUrl = url.includes("?") ? `${url}&meta=1` : `${url}?meta=1`;
      const INITIAL_BYTES = 524288;
      
      let response;
      try {
        response = await fetch(fetchUrl, {
          headers: { Range: `bytes=0-${INITIAL_BYTES - 1}` },
        });
      } catch (e) {
        response = await fetch(fetchUrl);
      }

      if (!response.ok && response.status !== 206) {
        response = await fetch(fetchUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const metadata = this.parseBufferID3(arrayBuffer);
      if (metadata) {
        this.metadataCache[url] = metadata;
        return metadata;
      }
    } catch (err) {
      console.warn("ID3 parse failed, falling back to parsed URL data:", err);
      try {
        const parts = url.split('/');
        const fileName = parts[parts.length - 1] || "";
        const cleanName = fileName.replace(/\.mp3$/, '').split('_').slice(2).join(' ').replace(/_/g, ' ');
        const folder = parts[parts.length - 2] || "";
        const cleanFolder = folder.replace(/_/g, ' ').toUpperCase();
        const fallback = {
          title: cleanName || "Unknown Track",
          artist: "Steven Casteel",
          coverUrl: null
        };
        this.metadataCache[url] = fallback;
        return fallback;
      } catch (innerErr) {
        // Safe return
      }
    }
    return null;
  }

  parseBufferID3(arrayBuffer) {
    const view = new DataView(arrayBuffer);
    if (arrayBuffer.byteLength < 10) return null;
    
    // Validate tag header (ID3)
    if (view.getUint8(0) !== 0x49 || view.getUint8(1) !== 0x44 || view.getUint8(2) !== 0x33) {
      return null;
    }
    
    const majorVersion = view.getUint8(3);
    const sizeBytes = [view.getUint8(6), view.getUint8(7), view.getUint8(8), view.getUint8(9)];
    const tagSize = (sizeBytes[0] << 21) | (sizeBytes[1] << 14) | (sizeBytes[2] << 7) | sizeBytes[3];
    
    let offset = 10;
    const metadata = { title: "", artist: "", coverUrl: "" };
    const maxOffset = Math.min(arrayBuffer.byteLength, tagSize + 10);
    
    while (offset < maxOffset - 10) {
      let frameId = "";
      let frameSize = 0;
      
      if (majorVersion === 2) {
        frameId = String.fromCharCode(view.getUint8(offset), view.getUint8(offset + 1), view.getUint8(offset + 2));
        frameSize = (view.getUint8(offset + 3) << 16) | (view.getUint8(offset + 4) << 8) | view.getUint8(offset + 5);
        offset += 6;
      } else if (majorVersion === 3 || majorVersion === 4) {
        frameId = String.fromCharCode(view.getUint8(offset), view.getUint8(offset + 1), view.getUint8(offset + 2), view.getUint8(offset + 3));
        
        if (majorVersion === 4) {
          frameSize = (view.getUint8(offset + 4) << 21) | (view.getUint8(offset + 5) << 14) | (view.getUint8(offset + 6) << 7) | view.getUint8(offset + 7);
        } else {
          frameSize = view.getUint32(offset + 4);
        }
        offset += 10;
      } else {
        break;
      }
      
      if (frameSize <= 0 || offset + frameSize > arrayBuffer.byteLength) {
        break;
      }
      
      if (frameId === "TIT2" || frameId === "TT2") {
        metadata.title = this.decodeTextFrame(view, offset, frameSize);
      } else if (frameId === "TPE1" || frameId === "TP1") {
        metadata.artist = this.decodeTextFrame(view, offset, frameSize);
      } else if (frameId === "APIC" || frameId === "PIC") {
        metadata.coverUrl = this.decodeApicFrame(arrayBuffer, offset, frameSize, majorVersion);
      }
      
      offset += frameSize;
    }
    
    return metadata;
  }

  decodeTextFrame(view, offset, size) {
    if (size <= 1) return "";
    const encoding = view.getUint8(offset);
    return this.decodeString(view.buffer, offset + 1, size - 1, encoding);
  }

  decodeString(buffer, offset, size, encoding) {
    const uint8 = new Uint8Array(buffer, offset, size);
    if (encoding === 0 || encoding === 3) {
      const decoder = new TextDecoder(encoding === 3 ? "utf-8" : "iso-8859-1");
      return decoder.decode(uint8).replace(/\0+$/, "").trim();
    } else if (encoding === 1 || encoding === 2) {
      const decoder = new TextDecoder(encoding === 2 ? "utf-16be" : "utf-16");
      return decoder.decode(uint8).replace(/\0+$/, "").trim();
    }
    return "";
  }

  decodeApicFrame(buffer, offset, size, majorVersion) {
    const view = new DataView(buffer);
    let idx = offset;
    const encoding = view.getUint8(idx++);
    
    let mimeType = "";
    if (majorVersion === 2) {
      const fmt = String.fromCharCode(view.getUint8(idx++), view.getUint8(idx++), view.getUint8(idx++));
      mimeType = fmt.toUpperCase() === "JPG" ? "image/jpeg" : `image/${fmt.toLowerCase()}`;
    } else {
      while (idx < offset + size) {
        const charCode = view.getUint8(idx++);
        if (charCode === 0) break;
        mimeType += String.fromCharCode(charCode);
      }
    }
    
    const picType = view.getUint8(idx++);
    
    if (encoding === 1 || encoding === 2) {
      while (idx < offset + size - 1) {
        if (view.getUint16(idx) === 0) {
          idx += 2;
          break;
        }
        idx += 2;
      }
    } else {
      while (idx < offset + size) {
        if (view.getUint8(idx++) === 0) break;
      }
    }
    
    const picDataOffset = idx;
    const picDataSize = (offset + size) - picDataOffset;
    
    if (picDataSize <= 0) return "";
    
    const picData = new Uint8Array(buffer, picDataOffset, picDataSize);
    const blob = new Blob([picData], { type: mimeType });
    return URL.createObjectURL(blob);
  }

  // ── SFX Engine Shortcuts ──
  playClick() {
    if (!this.isInitialized || !this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.08 * this.sfxVol, this.ctx.currentTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    osc.connect(gainNode);
    gainNode.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  playHover() {
    if (!this.isInitialized || !this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.03);
    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.04 * this.sfxVol, this.ctx.currentTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
    osc.connect(gainNode);
    gainNode.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  playSuccess() {
    if (!this.isInitialized || !this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1046.5, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.08 * this.sfxVol, now + 0.01);
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
    gain2.gain.linearRampToValueAtTime(0.12 * this.sfxVol, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.42);
  }

  playTick() {
    if (!this.isInitialized || !this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(6000, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, this.ctx.currentTime + 0.01);
    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.03 * this.sfxVol, this.ctx.currentTime + 0.001);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.01);
    osc.connect(gainNode);
    gainNode.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.012);
  }

  playInnerTick() {
    if (!this.isInitialized || !this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(2000, this.ctx.currentTime);
    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.015 * this.sfxVol, this.ctx.currentTime + 0.001);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.008);
    osc.connect(gainNode);
    gainNode.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.01);
  }

  playInnerTick() {
    if (!this.isInitialized || !this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(2000, this.ctx.currentTime);
    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.015 * this.sfxVol, this.ctx.currentTime + 0.001);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.008);
    osc.connect(gainNode);
    gainNode.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.01);
  }

  playSection() {
    if (!this.isInitialized || !this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15);
    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.18 * this.sfxVol, this.ctx.currentTime + 0.01);
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
        localGain.gain.setValueAtTime(volume * this.sfxVol, this.ctx.currentTime);
        sourceNode.connect(localGain);
        localGain.connect(this.sfxGain);
        sourceNode.start(0);
      })
      .catch(() => {
        const audio = new Audio(url);
        audio.volume = volume * 0.35 * this.sfxVol;
        audio.play().catch(() => {});
      });
  }
}

export const audioEngine = new AudioEngine();

import React, { useEffect, useRef, useState } from 'react';
import htm from 'htm';
import { Settings2, Pause, Play, SkipForward, SkipBack, Shuffle, X, Library, VolumeX, Volume2 } from 'lucide-react';
import { audioEngine } from './AudioEngine.js';
import { AUDIO_TRACKS } from 'media-data';

const html = htm.bind(React.createElement);

const ALBUMS = [];
const grouped = {};
AUDIO_TRACKS.forEach(t => {
  if (!grouped[t.folder]) {
    grouped[t.folder] = [];
  }
  grouped[t.folder].push(t);
});

Object.entries(grouped).forEach(([folder, tracks]) => {
  ALBUMS.push({
    id: folder,
    title: folder.replace(/_/g, ' ').toUpperCase(),
    artist: "Steven Casteel",
    tracks
  });
});

export function AudioConsoleModal({
  isOpen,
  onClose,
  activeTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isShuffle,
  handleScrubberChange,
  handlePrev,
  togglePlay,
  handleNext,
  toggleShuffleState,
  setVolume,
  formatTime,
  playTrackByIndex
}) {
  if (!isOpen) return null;

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [playlistView, setPlaylistView] = useState("albums");
  const [viewingAlbumId, setViewingAlbumId] = useState(ALBUMS[0]?.id || "");

  const [mixerMaster, setMixerMaster] = useState(1.0);
  const [mixerMusic, setMixerMusic] = useState(volume);
  const [mixerSfx, setMixerSfx] = useState(0.8);
  const [mixerAmbience, setMixerAmbience] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setMixerMusic(volume);
  }, [volume]);

  useEffect(() => {
    audioEngine.setLowpass(true);
    return () => {
      audioEngine.setLowpass(false);
    };
  }, []);

  useEffect(() => {
    if (isMuted) {
      audioEngine.setVolume("master", 0);
    } else {
      audioEngine.setVolume("master", mixerMaster);
    }
  }, [mixerMaster, isMuted]);

  useEffect(() => {
    audioEngine.setVolume("music", mixerMusic);
    setVolume(mixerMusic);
  }, [mixerMusic]);

  useEffect(() => {
    audioEngine.setVolume("sfx", mixerSfx);
  }, [mixerSfx]);

  useEffect(() => {
    audioEngine.setVolume("ambience", mixerAmbience);
  }, [mixerAmbience]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioEngine.analyser;
    const bufferLength = analyser ? analyser.frequencyBinCount : 64;
    const peaks = new Array(64).fill(0);
    const smoothedValues = new Array(64).fill(0);

    const drawVisualizer = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dataArray = new Uint8Array(bufferLength);

      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
      }

      const barCount = 64;
      const barWidth = (canvas.width / barCount) - 1.5;
      let x = 0;

      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, "rgb(34, 197, 94)");
      gradient.addColorStop(0.5, "rgb(59, 130, 246)");
      gradient.addColorStop(1, "rgb(236, 72, 153)");

      for (let i = 0; i < barCount; i++) {
        let rawValue = 0;
        if (isPlaying && analyser) {
          const dataIndex = Math.min(
            bufferLength - 1,
            Math.floor(i * i * (bufferLength / (barCount * barCount * 1.1)) + 1)
          );
          rawValue = dataArray[dataIndex] || 0;
        }

        smoothedValues[i] += (rawValue - smoothedValues[i]) * 0.15;
        const barHeight = (smoothedValues[i] / 255) * canvas.height * 0.9;

        if (barHeight > peaks[i]) {
          peaks[i] = barHeight;
        } else {
          peaks[i] = Math.max(0, peaks[i] - 1.2);
        }

        if (barHeight > 0.5) {
          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        }

        if (peaks[i] > 0.5) {
          ctx.fillStyle = "rgb(255, 255, 255)";
          ctx.fillRect(x, canvas.height - peaks[i] - 2, barWidth, 2);
        }

        x += barWidth + 1.5;
      }

      animationRef.current = requestAnimationFrame(drawVisualizer);
    };

    drawVisualizer();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  const activeAlbum = ALBUMS.find(a => a.id === viewingAlbumId) || ALBUMS[0];
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleTrackSelect = (track) => {
    audioEngine.playClick();
    const globalIdx = AUDIO_TRACKS.findIndex(t => t.name === track.name && t.folder === track.folder);
    if (globalIdx >= 0) {
      playTrackByIndex(globalIdx);
    }
  };

  const ticks = Array.from({ length: 13 }, (_, i) => i * 8.33);

  const renderSlider = (label, type, value, setter) => {
    const physicalPercent = value * 100;
    return html`
      <div class="flex flex-col gap-2 cursor-none group">
        <div class="flex justify-between text-[11px] font-mono select-none">
          <span class="uppercase tracking-widest font-bold text-muted group-hover:text-white transition duration-200">
            ${label}
          </span>
          <span class="font-bold text-primary tabular-nums">
            ${Math.round(value * 100)}%
          </span>
        </div>

        <div class="relative h-7 flex items-center w-full select-none">
          <div class="absolute left-0 right-0 h-2 bg-void rounded border border-black/40 shadow-inner" />
          
          <div class="absolute left-1 right-1 h-1 rounded overflow-hidden pointer-events-none z-10 opacity-75">
            <div class="h-full bg-primary" style=${{ width: `${physicalPercent}%` }} />
          </div>

          <div class="absolute left-0 right-0 -bottom-2.5 h-1.5 pointer-events-none flex justify-between select-none">
            ${ticks.map((pct, i) => html`
              <div 
                key=${i} 
                class=${`w-[1px] bg-white/20 ${i % 4 === 0 ? 'h-2 w-[1.5px] bg-white/40' : 'h-1'}`}
              />
            `)}
          </div>

          <div 
            class="absolute pointer-events-none z-20 flex items-center justify-center transition-all duration-100" 
            style=${{ left: `calc(${physicalPercent}% - 9px)`, width: '18px', height: '24px' }}
          >
            <img 
              src="https://www.stevencasteel.com/assets/svg/slider-thumb.svg" 
              class="absolute inset-0 w-full h-full object-contain pointer-events-none"
              draggable="false"
            />
            <div class="w-[2px] h-3.5 bg-primary shadow-[0_0_6px_rgba(34,197,94,1)] rounded-full z-10" />
          </div>

          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value=${value} 
            onChange=${(e) => {
              setter(parseFloat(e.target.value));
              if (type === "sfx") {
                audioEngine.playTick();
              }
            }}
            class="absolute inset-0 w-full h-full opacity-0 cursor-none z-30" 
          />
        </div>
      </div>
    `;
  };

  return html`
    <div class="fixed inset-0 bg-void/90 backdrop-blur-md z-[110] flex items-center justify-center p-4 cursor-none animate-lightbox-entry">
      <div class="relative w-full max-w-4xl bg-panel rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden flex flex-col cursor-none">
        
        <div class="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-ink">
          <div class="flex items-center gap-3 text-primary">
            <${Settings2} size=${22} />
            <h2 class="text-md md:text-lg font-display font-bold uppercase tracking-wider mt-0.5 text-white">
              AUDIO CONSOLE MIXER
            </h2>
          </div>
          <button 
            onClick=${() => {
              audioEngine.playClick();
              onClose();
            }}
            class="flex items-center justify-center w-8 h-8 rounded-md bg-white/5 border border-white/10 hover:border-primary/40 hover:text-primary transition-all duration-300 cursor-none"
          >
            <${X} size=${16} />
          </button>
        </div>

        <div class="p-6 flex flex-col gap-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
          
          <div class="flex flex-col md:flex-row gap-6 items-stretch bg-ink p-5 rounded-xl border border-white/5">
            <div class="w-full md:w-44 h-44 rounded-lg overflow-hidden border border-white/10 bg-void flex items-center justify-center relative shrink-0">
              <span class="text-4xl select-none">💿</span>
              <div class=${`absolute inset-2 border border-white/5 rounded-full ${isPlaying ? 'animate-spin' : ''}`} style=${{ animationDuration: '8s' }} />
            </div>

            <div class="flex-1 flex flex-col justify-between gap-4 min-w-0">
              <div>
                <span class="text-[10px] font-mono font-bold tracking-widest text-primary uppercase select-none">
                  // ACTIVE SOURCE FEED
                </span>
                <h3 class="text-2xl font-display font-black text-white uppercase truncate mt-1">
                  ${activeTrack.title.replace(/_/g, ' ')}
                </h3>
                <p class="text-xs font-mono text-muted uppercase tracking-widest truncate mt-0.5 select-none">
                  FOLDER: ${activeTrack.folder.replace(/_/g, ' ')}
                </p>
              </div>

              <div class="space-y-1">
                <div class="relative w-full h-1.5 bg-void rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-primary shadow-[0_0_8px_rgba(34,197,94,1)]"
                    style=${{ width: `${progressPercent}%` }}
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max=${duration || 0} 
                    value=${currentTime} 
                    onChange=${handleScrubberChange}
                    class="absolute inset-0 w-full h-full opacity-0 cursor-none"
                  />
                </div>
                <div class="flex justify-between text-[10px] font-mono text-muted select-none">
                  <span>${formatTime(currentTime)}</span>
                  <span>${formatTime(duration)}</span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button 
                  onClick=${toggleShuffleState}
                  class=${`flex-1 py-2 rounded-lg border text-xs font-mono font-bold uppercase cursor-none transition ${isShuffle ? 'border-primary/40 bg-primary/5 text-primary' : 'border-white/5 bg-white/5 text-fog hover:text-white'}`}
                >
                  Shuffle
                </button>
                <button 
                  onClick=${handlePrev}
                  class="p-2 px-4 rounded-lg bg-white/5 border border-white/10 hover:border-primary/30 text-fog hover:text-white cursor-none transition"
                >
                  <${SkipBack} size=${16} fill="currentColor" />
                </button>
                <button 
                  onClick=${togglePlay}
                  class="p-2 px-6 rounded-lg bg-primary text-void font-bold cursor-none hover:scale-105 transition flex items-center justify-center shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                >
                  ${isPlaying 
                    ? html`<${Pause} size=${16} fill="currentColor" />`
                    : html`<${Play} size=${16} fill="currentColor" class="ml-0.5" />`
                  }
                </button>
                <button 
                  onClick=${handleNext}
                  class="p-2 px-4 rounded-lg bg-white/5 border border-white/10 hover:border-primary/30 text-fog hover:text-white cursor-none transition"
                >
                  <${SkipForward} size=${16} fill="currentColor" />
                </button>
              </div>
            </div>
          </div>

          <div class="w-full bg-void rounded-xl border border-white/10 p-2 overflow-hidden h-32 relative shadow-inner">
            <canvas 
              ref=${canvasRef} 
              width="800" 
              height="120" 
              class="w-full h-full opacity-90"
            />
            <div class="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none select-none" style=${{ backgroundSize: '16px 16px' }} />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            <div class="bg-ink rounded-xl border border-white/5 p-4 flex flex-col h-[320px]">
              <div class="flex items-center justify-between border-b border-white/5 pb-3 mb-3 shrink-0">
                ${playlistView === "tracks" ? html`
                  <button 
                    onClick=${() => {
                      audioEngine.playClick();
                      setPlaylistView("albums");
                    }}
                    class="text-[10px] font-mono font-bold uppercase text-primary hover:underline cursor-none"
                  >
                    ← Back to Library
                  </button>
                ` : html`
                  <span class="text-[10px] font-mono font-bold text-muted uppercase tracking-widest select-none">
                    Select Directory Folder
                  </span>
                `}
                <span class="text-xs font-display font-bold text-white uppercase select-none">
                  ${playlistView === "tracks" ? activeAlbum.title : "Library List"}
                </span>
              </div>

              <div class="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                ${playlistView === "albums" ? ALBUMS.map(album => html`
                  <button 
                    key=${album.id}
                    onClick=${() => {
                      audioEngine.playClick();
                      setViewingAlbumId(album.id);
                      setPlaylistView("tracks");
                    }}
                    class="w-full flex items-center gap-3 p-2.5 rounded-lg border border-transparent hover:border-white/5 hover:bg-white/5 text-left transition cursor-none group"
                  >
                    <div class="w-8 h-8 rounded bg-void flex items-center justify-center text-muted group-hover:text-primary transition shrink-0">
                      <${Library} size=${14} />
                    </div>
                    <div class="min-w-0 flex-1 select-none">
                      <p class="text-xs font-bold text-light truncate group-hover:text-white">
                        ${album.title}
                      </p>
                      <p class="text-[9px] font-mono text-muted uppercase tracking-wider mt-0.5">
                        ${album.tracks.length} Channels
                      </p>
                    </div>
                  </button>
                `) : activeAlbum.tracks.map((t, idx) => {
                  const isActive = activeTrack.name === t.name && activeTrack.folder === t.folder;
                  return html`
                    <button 
                      key=${t.name}
                      onClick=${() => handleTrackSelect(t)}
                      class=${`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition cursor-none select-none ${isActive ? 'bg-primary/5 border-primary/20 text-primary' : 'border-transparent hover:border-white/5 text-fog hover:text-white'}`}
                    >
                      <span class="text-xs truncate font-bold uppercase font-mono">
                        ${idx + 1}. ${t.title.replace(/_/g, ' ')}
                      </span>
                      ${isActive && html`
                        <span class="text-[8px] font-mono font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded tracking-widest uppercase">
                          ACTIVE
                        </span>
                      `}
                    </button>
                  `;
                })}
              </div>
            </div>

            <div class="bg-ink rounded-xl border border-white/5 p-5 flex flex-col justify-between gap-5 h-[320px]">
              <div class="flex items-center justify-between border-b border-white/5 pb-3 shrink-0 select-none">
                <span class="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">
                  Physical Mixer Console
                </span>
                <button 
                  onClick=${() => {
                    audioEngine.playClick();
                    setIsMuted(!isMuted);
                  }}
                  class=${`flex items-center gap-1.5 p-1 px-2.5 rounded text-[9px] font-mono font-bold uppercase transition border cursor-none ${isMuted ? 'border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_8px_rgba(239,68,68,0.2)]' : 'border-white/10 hover:border-white/20 text-muted hover:text-white'}`}
                >
                  ${isMuted ? html`<${VolumeX} size=${11} />` : html`<${Volume2} size=${11} />`}
                  <span>${isMuted ? "Unmute" : "Mute All"}</span>
                </button>
              </div>

              <div class="flex-1 flex flex-col justify-center gap-4">
                ${renderSlider("Master Level", "master", mixerMaster, setMixerMaster)}
                ${renderSlider("Music Synthesizer", "music", mixerMusic, setMixerMusic)}
                ${renderSlider("Tactile SFX Engine", "sfx", mixerSfx, setMixerSfx)}
                ${renderSlider("Ambient Noise Node", "ambience", mixerAmbience, setMixerAmbience)}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  `;
}

import React, { useEffect, useRef, useState } from 'react';
import htm from 'htm';
import { Settings2, Pause, Play, SkipForward, SkipBack, Shuffle, X, Library, VolumeX, Volume2, Star, ChevronLeft, Download } from 'lucide-react';
import { audioEngine } from './AudioEngine.js';
import { AUDIO_TRACKS } from 'media-data';
import { ScrollingText } from './components.js';

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

// ── CONSOLE BUTTON COMPONENT (1:1 SHARE) ─────────────────────────────────
function ConsoleButton({
  children,
  onClick,
  active,
  label,
  className = "w-8 h-8"
}) {
  return html`
    <div class=${`relative rounded-lg surface-hardware-well p-[2.5px] shrink-0 ${className}`}>
      <button
        aria-label=${label}
        title=${label}
        onClick=${(e) => { e.stopPropagation(); onClick(); }}
        class=${`relative isolate flex items-center justify-center w-full h-full rounded-[5px] transition-[transform,color] duration-150 cursor-none overflow-hidden outline-none surface-hardware-btn ${active ? 'is-active text-primary' : 'text-fog hover:text-white'}`}
      >
        <span class="relative z-10 flex items-center justify-center w-full h-full">
          ${children}
        </span>
      </button>
    </div>
  `;
}

// ── DECOUPLED SPECTRUM VISUALIZER COMPONENT ──────────────────────────────
function SpectrumVisualizer({ isPlaying }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const peaksRef = useRef(new Array(64).fill(0));
  const smoothedValuesRef = useRef(new Array(64).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioEngine.analyser;
    const bufferLength = analyser ? analyser.frequencyBinCount : 64;
    const dataArray = new Uint8Array(bufferLength);
    const barCount = 64;

    const drawVisualizer = () => {
      animationRef.current = requestAnimationFrame(drawVisualizer);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
      }

      const barWidth = (canvas.width / barCount) - 2;
      let x = 0;

      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, "rgb(59, 130, 246)"); // Blue
      gradient.addColorStop(0.5, "rgb(168, 85, 247)"); // Purple
      gradient.addColorStop(1, "rgb(239, 68, 68)"); // Red

      const peaks = peaksRef.current;
      const smoothedValues = smoothedValuesRef.current;

      const decayRate = isPlaying ? 0.15 : 0.015;
      const peakDrop = isPlaying ? 1.2 : 0.3;

      for (let i = 0; i < barCount; i++) {
        let rawValue = 0;
        if (isPlaying && analyser) {
          const dataIndex = Math.floor(
            i * i * (bufferLength / (barCount * barCount * 1.2)) + 1
          );
          rawValue = dataArray[dataIndex] || 0;
        }

        smoothedValues[i] += (rawValue - smoothedValues[i]) * (rawValue > smoothedValues[i] ? 0.8 : decayRate);
        const barHeight = (smoothedValues[i] / 255) * canvas.height;

        if (barHeight > peaks[i]) {
          peaks[i] = barHeight;
        } else {
          peaks[i] = Math.max(0, peaks[i] - peakDrop);
        }

        if (barHeight > 0.5) {
          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        }

        if (peaks[i] > 0.5) {
          ctx.fillStyle = "rgb(255, 255, 255)";
          ctx.fillRect(x, canvas.height - peaks[i] - 2, barWidth, 2);
        }

        x += barWidth + 2;
      }
    };

    drawVisualizer();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  return html`
    <div class="w-full overflow-hidden shrink-0 animate-lightbox-entry">
      <div class="relative rounded-xl overflow-hidden border border-white/5 shadow-inner bg-void h-32 w-full">
        <canvas 
          ref=${canvasRef} 
          width="600" 
          height="128" 
          class="w-full h-full opacity-90"
        />
        <div class="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none select-none" style=${{ backgroundSize: '16px 16px' }} />
      </div>
    </div>
  `;
}

// ── MAIN AUDIO CONSOLE MODAL COMPONENT ───────────────────────────────────
export function AudioConsoleModal({
  isOpen,
  onClose,
  activeTrack,
  trackMetadata,
  isPlaying,
  currentTime,
  duration,
  isShuffle,
  handleScrubberChange,
  handlePrev,
  togglePlay,
  handleNext,
  toggleShuffleState,
  formatTime,
  playTrackByIndex,

  // Global Mixer State Bindings
  mixerMaster,
  setMixerMaster,
  volume, // musicVolume
  setVolume, // setMusicVolume
  mixerSfx,
  setMixerSfx,
  mixerAmbience,
  setMixerAmbience,
  isMuted,
  setIsMuted
}) {
  if (!isOpen) return null;

  const [showShader, setShowShader] = useState(true);
  const [playlistView, setPlaylistView] = useState("tracks");
  const [viewingAlbumId, setViewingAlbumId] = useState(ALBUMS[0]?.id || "");

  // Synced on opening/active track swap
  useEffect(() => {
    if (activeTrack) setViewingAlbumId(activeTrack.folder);
  }, [activeTrack]);

  // Hook-up Lowpass filter when active console open (focus state logic)
  useEffect(() => {
    audioEngine.setLowpass(true);
    return () => {
      audioEngine.setLowpass(false);
    };
  }, []);

  const activeAlbum = ALBUMS.find(a => a.id === viewingAlbumId) || ALBUMS[0];
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleTrackSelect = (track) => {
    audioEngine.playClick();
    const globalIdx = AUDIO_TRACKS.findIndex(t => t.name === track.name && t.folder === track.folder);
    if (globalIdx >= 0) {
      playTrackByIndex(globalIdx);
    }
  };

  const handleResetMixer = () => {
    audioEngine.playClick();
    setMixerMaster(1.0);
    setVolume(0.75);
    setMixerSfx(1.0);
    setMixerAmbience(1.0);
    if (isMuted) setIsMuted(false);
  };

  const cleanTitle = trackMetadata?.title || activeTrack.title.replace(/_/g, ' ');
  const cleanAlbum = trackMetadata?.artist ? `${trackMetadata.artist} // ${activeTrack.folder.replace(/_/g, ' ')}` : activeTrack.folder.replace(/_/g, ' ');

  // 1:1 Overdriven Spectrum Gain Ticks (13 notches)
  const ticks = Array.from({ length: 13 }, (_, i) => i * 8.33);

  // Reusable Studio Mixer Slider Component
  const renderSlider = (label, type, value, setter) => {
    const displayPercent = Math.round(value * 100);
    const physicalPercent = Math.round((value / 3.0) * 100); // Max fader is 3.0 (300%)
    
    const active = displayPercent > 0 && !isMuted;
    const baseHue = 142;
    let hue = baseHue;
    let opacity = 1.0;

    if (displayPercent <= 100) {
      opacity = 0.3 + (displayPercent / 100) * 0.7;
    } else {
      hue = Math.max(0, baseHue - (displayPercent - 100) * 1.2); // Overdrive color fader shift
    }

    const sliderColor = active ? `hsla(${hue}, 80%, 50%, ${opacity})` : 'rgb(75, 85, 99)';

    return html`
      <div class="flex flex-col gap-2.5 cursor-none group">
        <div class="flex justify-between text-[11px] font-mono select-none">
          <span class="uppercase tracking-widest font-bold text-muted group-hover:text-white transition duration-200">
            ${label}
          </span>
          <span class="font-bold tabular-nums transition-colors" style=${{ color: sliderColor }}>
            ${displayPercent}%
          </span>
        </div>

        <div class="relative h-7 flex items-center w-full select-none">
          <div class="absolute left-0 right-0 h-2 bg-void rounded shadow-neumorph-recessed-sm border border-black/40" />
          
          <div class="absolute left-1 right-1 h-1 rounded overflow-hidden pointer-events-none z-10 opacity-75">
            <div class="h-full transition-all duration-100 ease-out" style=${{ width: `${physicalPercent}%`, backgroundColor: sliderColor }} />
          </div>

          <!-- Slider notches -->
          <div class="absolute left-0 right-0 -bottom-2 h-1.5 pointer-events-none flex justify-between select-none">
            ${ticks.map((pct, i) => html`
              <div 
                key=${i} 
                class=${`w-[1px] bg-white/20 transition-all ${i % 4 === 0 ? 'h-2 w-[1.5px] bg-white/40' : 'h-1'}`}
                style=${{ left: `${pct}%` }}
              />
            `)}
          </div>

          <!-- Knob thumb -->
          <div 
            class=${`absolute pointer-events-none z-20 flex items-center justify-center transition-all duration-100 ${isMuted ? 'opacity-40' : ''}`} 
            style=${{ left: `calc(${physicalPercent}% - 9px)`, width: '18px', height: '24px' }}
          >
            <img 
              src="https://www.stevencasteel.com/assets/svg/slider-thumb.svg" 
              class="absolute inset-0 w-full h-full object-contain pointer-events-none"
              draggable="false"
            />
            <div class="w-[2px] h-3.5 shadow-[0_0_6px_currentColor] rounded-full z-10 transition-colors" style=${{ backgroundColor: active ? sliderColor : '#4b5563', color: active ? sliderColor : 'transparent' }} />
          </div>

          <input 
            type="range" 
            min="0" 
            max="3" 
            step="0.01" 
            value=${value} 
            onChange=${(e) => {
              setter(parseFloat(e.target.value));
              if (type === "sfx") {
                audioEngine.playHover();
              }
            }}
            class="absolute inset-0 w-full h-full opacity-0 cursor-none z-30" 
          />
        </div>
      </div>
    `;
  };

  return html`
    <div class="fixed inset-0 bg-void/95 backdrop-blur-md z-[110] flex items-center justify-center p-4 cursor-none animate-lightbox-entry">
      <div class="relative w-full max-w-5xl bg-panel rounded-2xl shadow-neumorph-elevated-md border border-[#3a3a40] overflow-hidden flex flex-col cursor-none">
        
        <!-- Header Bar -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-void">
          <div class="flex items-center gap-3 text-primary-400">
            <${Settings2} size=${22} />
            <h2 class="text-md md:text-lg font-display font-bold uppercase tracking-wider mt-0.5 text-white">
              AUDIO CONSOLE
            </h2>
          </div>
          <button 
            onClick=${() => {
              audioEngine.playSFX("https://www.stevencasteel.com/assets/audio/sfx/leave_modal.mp3", 0.4);
              onClose();
            }}
            class="flex items-center justify-center w-8 h-8 rounded-md bg-white/5 border border-white/10 hover:border-primary-400 hover:text-primary-400 hover:bg-primary-400/10 transition-all duration-300 cursor-none outline-none"
          >
            <${X} size=${16} />
          </button>
        </div>

        <div class="p-6 flex flex-col gap-6 overflow-y-auto max-h-[85vh] custom-scrollbar" data-lenis-prevent="true">
          
          <!-- Top Playing Row -->
          <div class="flex flex-col md:flex-row gap-6 items-center md:items-stretch bg-[#111114] p-5 rounded-xl border border-white/5 shadow-inner">
            <div class="w-full md:w-48 h-48 rounded-xl overflow-hidden border border-white/10 bg-black flex items-center justify-center relative shrink-0">
              ${trackMetadata && trackMetadata.coverUrl ? html`
                <img src=${trackMetadata.coverUrl} class="absolute inset-0 w-full h-full object-cover opacity-90" alt="" />
              ` : html`
                <span class="text-5xl select-none">💿</span>
                <div class=${`absolute inset-4 border border-white/5 rounded-full ${isPlaying ? 'animate-spin' : ''}`} style=${{ animationDuration: '8s' }} />
              `}
              <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none z-20" />
            </div>

            <div class="flex-1 w-full flex flex-col justify-between gap-4 md:gap-0 min-w-0">
              <div class="flex justify-between items-start">
                <div class="min-w-0 flex-1">
                  <span class="text-[10px] font-mono font-bold tracking-widest text-primary-400 uppercase select-none">
                    // ACTIVE SOURCE FEED
                  </span>
                  
                  <div class="h-8 overflow-hidden relative flex items-center mt-1">
                    <${ScrollingText} isUiActive=${isPlaying} className="relative leading-none text-2xl font-display font-black text-white uppercase">
                      <span>${cleanTitle}</span>
                    </${ScrollingText}>
                  </div>
                  
                  <p class="text-xs font-mono text-muted uppercase tracking-widest truncate mt-0.5 select-none">
                    ${cleanAlbum}
                  </p>
                </div>
                
                <button 
                  onClick=${() => {
                    audioEngine.playSFX(showShader ? "audio.visualizerHide" : "audio.visualizerShow");
                    setShowShader(!showShader);
                  }}
                  class="text-muted hover:text-primary-400 transition cursor-none outline-none ml-2 shrink-0"
                  title="Toggle Visualizer"
                >
                  <span class="text-sm font-mono tracking-widest uppercase">
                    ${showShader ? "[ HIDE VIS ]" : "[ SHOW VIS ]"}
                  </span>
                </button>
              </div>

              <!-- 1:1 Timeline scrubber -->
              <div class="flex items-center gap-2.5 w-full">
                <div class="relative flex items-center group/scrub flex-1 h-6">
                  <div class="absolute inset-0 rounded-md surface-hardware-track pointer-events-none" />
                  <!-- Recessed 3px inset progress bar -->
                  <div class="absolute inset-[3px] rounded-sm overflow-hidden pointer-events-none">
                    <div class="h-full bg-primary" style=${{ width: `${progressPercent}%` }} />
                  </div>
                  <div class="absolute inset-0 rounded-md shadow-[inset_0_1px_3px_rgba(0,0,0,0.3),inset_0_-1px_1px_rgba(255,255,255,0.12)] pointer-events-none" />
                  
                  <input 
                    type="range" 
                    min="0" 
                    max=${duration || 0} 
                    value=${currentTime} 
                    onChange=${handleScrubberChange}
                    class="absolute inset-0 w-full h-full opacity-0 cursor-none z-30"
                  />
                </div>
                
                <!-- Timecode Box -->
                <div class="flex items-center justify-center font-mono text-[11px] text-muted border border-transparent surface-hardware-track rounded-md shrink-0 px-3 min-w-[96px] h-6 bg-[#0c0d11]">
                  <span>${formatTime(currentTime)} / ${formatTime(duration)}</span>
                </div>
              </div>

              <!-- Controls Row utilizing standard Hardware-Shaded ConsoleButtons -->
              <div class="flex items-center gap-4 w-full">
                <${ConsoleButton}
                  label="Shuffle"
                  onClick=${toggleShuffleState}
                  active=${isShuffle}
                  className="flex-1 max-w-[80px] h-12"
                >
                  <${Shuffle} size=${16} />
                </${ConsoleButton}>
                
                <${ConsoleButton}
                  label="Previous"
                  onClick=${handlePrev}
                  className="flex-1 h-12"
                >
                  <${SkipBack} size=${18} fill="currentColor" />
                </${ConsoleButton}>

                <${ConsoleButton}
                  label=${isPlaying ? "Pause" : "Play"}
                  onClick=${togglePlay}
                  active=${isPlaying}
                  className="flex-1 max-w-[180px] h-12 shadow-lg"
                >
                  ${isPlaying 
                    ? html`<${Pause} size=${18} fill="currentColor" class="text-void" />`
                    : html`<${Play} size=${18} fill="currentColor" class="text-void ml-0.5" />`
                  }
                </${ConsoleButton}>

                <${ConsoleButton}
                  label="Next"
                  onClick=${handleNext}
                  className="flex-1 h-12"
                >
                  <${SkipForward} size=${18} fill="currentColor" />
                </${ConsoleButton}>
              </div>
            </div>
          </div>

          <!-- Wide decoupled visualizer with standard clean mount triggers -->
          ${showShader && html`<${SpectrumVisualizer} isPlaying=${isPlaying} />`}

          <!-- Double Column bottom rack -->
          <div class="flex flex-col lg:flex-row gap-6 items-stretch w-full">
            
            <!-- Left Column: Playlist Card -->
            <div class="w-full lg:flex-1 relative flex flex-col bg-ink rounded-xl border border-white/5 overflow-hidden shadow-inner h-[380px]">
              <div class="flex items-center justify-between px-3 py-3 border-b border-white/10 bg-ink shrink-0 h-[46px] select-none">
                ${playlistView === "tracks" ? html`
                  <button 
                    onClick=${() => {
                      audioEngine.playClick();
                      setPlaylistView("albums");
                    }}
                    class="p-1.5 hover:bg-white/10 rounded cursor-none text-fog hover:text-white transition flex items-center gap-1 shrink-0 outline-none"
                  >
                    <${ChevronLeft} size={16} />
                    <span class="text-[10px] font-mono font-bold uppercase tracking-widest">Albums</span>
                  </button>
                ` : html`
                  <div class="p-1.5 px-3 shrink-0">
                    <span class="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">Select Library</span>
                  </div>
                `}

                ${playlistView === "tracks" && html`
                  <span class="font-display font-bold text-sm uppercase tracking-widest text-right flex-1 px-2 truncate text-primary-400">
                    ${activeAlbum.title}
                  </span>
                `}
              </div>

              <!-- Content Area with custom scrollbar -->
              <div class="flex-1 overflow-y-auto custom-scrollbar p-2 pb-4 space-y-1">
                ${playlistView === "albums" ? ALBUMS.map(album => html`
                  <button 
                    key=${album.id}
                    onClick=${() => {
                      audioEngine.playClick();
                      setViewingAlbumId(album.id);
                      setPlaylistView("tracks");
                    }}
                    class=${`w-full text-left px-3 py-3 rounded flex items-center gap-4 transition-all cursor-none group border border-transparent hover:border-white/10 hover:bg-white/5 outline-none`}
                  >
                    <div class="w-10 h-10 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <${Library} size=${16} />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-bold truncate text-light group-hover:text-white">
                        ${album.title}
                      </div>
                      <div class="text-[10px] font-mono text-muted uppercase tracking-widest">
                        ${album.tracks.length} Channels
                      </div>
                    </div>
                  </button>
                `) : activeAlbum.tracks.map((t, idx) => {
                  const isActive = activeTrack.name === t.name && activeTrack.folder === t.folder;
                  const globalIdx = AUDIO_TRACKS.findIndex(item => item.name === t.name && item.folder === t.folder);
                  
                  return html`
                    <div key=${t.name} class=${`w-full flex items-center justify-between rounded transition-all group ${isActive ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-white/5 text-fog hover:text-white'}`}>
                      <button 
                        onClick=${() => handleTrackSelect(t)}
                        class="flex-1 flex items-center gap-3 px-3 py-2.5 text-left cursor-none truncate outline-none rounded"
                      >
                        <span class="font-mono text-[10px] opacity-50 w-5 shrink-0">${idx + 1}</span>
                        <span class="text-xs truncate uppercase font-bold">${t.title.replace(/_/g, ' ')}</span>
                        ${isActive && html`
                          <div class="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_#22c55e] bg-primary animate-pulse shrink-0 ml-2" />
                        `}
                      </button>
                      
                      <a 
                        href=${`https://www.stevencasteel.com/assets/audio/music/elf_girl/${t.folder}/${t.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        class="p-2.5 shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity cursor-none outline-none rounded hover:text-primary-400"
                        title="Download track"
                        onClick=${(e) => {
                          audioEngine.playSFX("https://www.stevencasteel.com/assets/audio/sfx/navbar_header_button_release.mp3", 0.4);
                          e.stopPropagation();
                        }}
                      >
                        <${Download} size=${14} />
                      </a>
                    </div>
                  `;
                })}
              </div>
            </div>

            <!-- Right Column: Mixer sliders scaled up to 300% -->
            <div class="w-full lg:flex-1 shrink-0 bg-panel rounded-xl border border-white/5 shadow-inner flex flex-col overflow-hidden h-[380px]">
              <div class="flex items-center justify-between px-3 py-3 border-b border-white/10 shrink-0 z-10 bg-ink select-none">
                <span class="font-display font-bold text-sm text-light tracking-widest uppercase ml-1">
                  Global Mixer
                </span>
                <div class="flex items-center gap-2">
                  <button 
                    onClick=${handleResetMixer}
                    class="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md text-[10px] font-mono text-fog transition-colors cursor-none border border-white/10 hover:border-primary-400 hover:text-primary-400 outline-none h-8"
                  >
                    RESET
                  </button>
                  <button 
                    onClick=${() => {
                      audioEngine.playClick();
                      setIsMuted(!isMuted);
                    }}
                    class=${`flex items-center p-1 px-2.5 rounded text-[9px] font-mono font-bold uppercase transition border cursor-none h-8 ${isMuted ? 'border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_8px_rgba(239,68,68,0.2)]' : 'border-white/10 hover:border-white/20 text-muted hover:text-white'}`}
                  >
                    <span>${isMuted ? "Unmute" : "Mute All"}</span>
                  </button>
                </div>
              </div>

              <!-- Mixer Faders scaled to 3.0 (300%) -->
              <div class="flex flex-col flex-1 justify-center gap-6 p-5 md:p-6 bg-void/50">
                ${renderSlider("Master Out", "master", mixerMaster, setMixerMaster)}
                ${renderSlider("Music Synthesizer", "music", volume, setVolume)}
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

import React, { useState, useEffect, useRef } from 'react';
import htm from 'htm';
import { Settings2, Volume2, VolumeX } from 'lucide-react';
import { audioEngine } from './AudioEngine.js';

const html = htm.bind(React.createElement);

export function MusicPlayerDeck({
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
  onOpenConsole
}) {
  const [showVolumePopover, setShowVolumePopover] = useState(false);
  const miniCanvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = miniCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioEngine.analyser;
    const barCount = 14;
    const smoothedValues = new Array(barCount).fill(0);

    const drawMicroVisualizer = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dataArray = new Uint8Array(analyser ? analyser.frequencyBinCount : 32);

      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
      }

      const barWidth = (canvas.width / barCount) - 1.5;
      let x = 0;

      for (let i = 0; i < barCount; i++) {
        let rawValue = 0;
        if (isPlaying && analyser) {
          const idx = Math.floor(i * (dataArray.length / barCount) * 0.7);
          rawValue = dataArray[idx] || 0;
        } else if (isPlaying) {
          rawValue = 10 + Math.sin(Date.now() * 0.005 + i * 0.6) * 12 + Math.random() * 5;
        }

        smoothedValues[i] += (rawValue - smoothedValues[i]) * 0.2;
        const mappedHeight = (smoothedValues[i] / 255) * canvas.height * 0.85;

        ctx.fillStyle = isPlaying ? '#22c55e' : 'rgba(34, 197, 94, 0.4)';
        ctx.fillRect(x, canvas.height - mappedHeight, barWidth, mappedHeight);

        x += barWidth + 1.5;
      }

      animationRef.current = requestAnimationFrame(drawMicroVisualizer);
    };

    drawMicroVisualizer();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  const handleMuteToggle = () => {
    audioEngine.playSFX("https://www.stevencasteel.com/assets/audio/sfx/navbar_header_button_click.mp3", 0.35);
    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(0.75);
    }
  };

  const handleTriggerPlay = () => {
    audioEngine.playSFX("https://www.stevencasteel.com/assets/audio/sfx/navbar_header_button_click.mp3", 0.35);
    togglePlay();
  };

  const handleTriggerPrev = () => {
    audioEngine.playSFX("https://www.stevencasteel.com/assets/audio/sfx/navbar_header_button_click.mp3", 0.3);
    handlePrev();
  };

  const handleTriggerNext = () => {
    audioEngine.playSFX("https://www.stevencasteel.com/assets/audio/sfx/navbar_header_button_click.mp3", 0.3);
    handleNext();
  };

  const handleTriggerShuffle = () => {
    audioEngine.playSFX("https://www.stevencasteel.com/assets/audio/sfx/navbar_header_button_click.mp3", 0.35);
    toggleShuffleState();
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return html`
    <div class="shrink-0 p-4 bg-gradient-to-t from-panel to-[#0c0d11] border-t border-black flex flex-col gap-3 relative z-20">
      
      <!-- Modular aspect-ratio coordinate system box (aspect-[3658/2595]) -->
      <div class="relative w-full aspect-[3658/2595] rounded-xl border border-white/5 overflow-hidden bg-[#07080a] shadow-inner select-none isolate">
        
        <!-- EXACT INLINE SVG player-chassis.svg -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="296 383 3658 2595" preserveAspectRatio="none" width="100%" height="100%" class="absolute inset-0 pointer-events-none select-none z-0">
          <defs>
            <filter id="lcd-inner-shadow">
              <feOffset dx="0" dy="25"/>
              <feGaussianBlur stdDeviation="20" result="offset-blur"/>
              <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
              <feFlood flood-color="black" flood-opacity="0.95" result="color"/>
              <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
              <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
            </filter>
            <linearGradient id="mini-player-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#1E1E24" />
              <stop offset="100%" stop-color="#0A0A0A" />
            </linearGradient>
            <clipPath id="lcd-display-clip">
              <path d="M604.605,554 L3116.675,554 c65.83,0 120,54.17 120,120 c0,222.67 184.5,405.91 408.72,405.91 c65.83,0 120,54.17 120,120 L3765.395,1348.18 c0,66.27 -53.73,120 -120,120 L604.605,1468.18 c-66.27,0 -120,-53.73 -120,-120 L484.605,674 c0,-66.27 53.73,-120 120,-120 Z" />
            </clipPath>
          </defs>
          <path 
            d="M451.625,383.598l2852.76,0a120,120 0 0,1 120,120a408.723,405.909 0 0,0 408.723,405.909a120,120 0 0,1 120,120l0,1792.06c0,85.533 -69.827,155.916 -154.684,155.916l-3346.8,0c-84.857,0 -154.684,-70.383 -154.684,-155.916l0,-2282.05c0,-85.533 69.827,-155.917 154.684,-155.917Z" 
            fill="url(#mini-player-bg)" 
          />
          <path d="M604.605,554 L3116.675,554 c65.83,0 120,54.17 120,120 c0,222.67 184.5,405.91 408.72,405.91 c65.83,0 120,54.17 120,120 L3765.395,1348.18 c0,66.27 -53.73,120 -120,120 L604.605,1468.18 c-66.27,0 -120,-53.73 -120,-120 L484.605,674 c0,-66.27 53.73,-120 120,-120 Z" fill="#0c0d11" filter="url(#lcd-inner-shadow)" />
          <path d="M604.605,554 L3116.675,554 c65.83,0 120,54.17 120,120 c0,222.67 184.5,405.91 408.72,405.91 c65.83,0 120,54.17 120,120 L3765.395,1348.18 c0,66.27 -53.73,120 -120,120 L604.605,1468.18 c-66.27,0 -120,-53.73 -120,-120 L484.605,674 c0,-66.27 53.73,-120 120,-120 Z" fill="none" stroke="rgba(0,0,0,0.8)" stroke-width="15" />
          <path 
            d="M451.625,383.598l2852.76,0a120,120 0 0,1 120,120a408.723,405.909 0 0,0 408.723,405.909a120,120 0 0,1 120,120l0,1792.06c0,85.533 -69.827,155.916 -154.684,155.916l-3346.8,0c-84.857,0 -154.684,-70.383 -154.684,-155.916l0,-2282.05c0,-85.533 69.827,-155.917 154.684,-155.917Z" 
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            stroke-width="2"
            vector-effect="non-scaling-stroke"
          />
        </svg>

        <!-- Mechanical Left Spinning Gear (Using exact player-gear.svg paths) -->
        <div 
          class=${`absolute pointer-events-none select-none z-10 ${isPlaying ? 'gear-spin-clockwise' : 'gear-paused'}`}
          style=${{
            left: '20%',
            top: '64%',
            width: '20%',
            height: '28.2%'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 1280" width="100%" height="100%">
            <defs>
              <radialGradient id="gear-bg-left" cx="50%" cy="50%" r="50%">
                <stop offset="20%" stop-color="#3a3a40" />
                <stop offset="100%" stop-color="#24242a" />
              </radialGradient>
            </defs>
            <path
              d="M 1220.0 640.0 A 580 580 0 0 0 1191.6 819.2 L 960.8 843.6 A 380 380 0 0 0 932.8 882.2 L 980.9 1109.2 A 580 580 0 0 0 819.2 1191.6 A 580 580 0 0 0 640.0 1220.0 L 545.5 1008.1 A 380 380 0 0 0 500.1 993.3 L 299.1 1109.2 A 580 580 0 0 0 170.8 980.9 A 580 580 0 0 0 88.4 819.2 L 260.7 663.9 A 380 380 0 0 0 260.7 616.1 L 88.4 460.8 A 580 580 0 0 0 170.8 299.1 A 580 580 0 0 0 299.1 170.8 L 500.1 286.7 A 380 380 0 0 0 545.5 271.9 L 640.0 60.0 A 580 580 0 0 0 819.2 88.4 A 580 580 0 0 0 980.9 170.8 L 932.8 397.8 A 380 380 0 0 0 960.8 436.4 L 1191.6 460.8 A 580 580 0 0 0 1220.0 640.0 Z"
              fill-rule="evenodd"
              fill="url(#gear-bg-left)"
              stroke="rgba(255,255,255,0.05)"
              stroke-width="2"
              vector-effect="non-scaling-stroke"
            />
          </svg>
        </div>

        <!-- Mechanical Right Interlocking Gear -->
        <div 
          class=${`absolute pointer-events-none select-none z-10 ${isPlaying ? 'gear-spin-counterclockwise' : 'gear-paused'}`}
          style=${{
            left: '60%',
            top: '67%',
            width: '16%',
            height: '22.56%'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 1280" width="100%" height="100%">
            <defs>
              <radialGradient id="gear-bg-right" cx="50%" cy="50%" r="50%">
                <stop offset="20%" stop-color="#303035" />
                <stop offset="100%" stop-color="#1d1d22" />
              </radialGradient>
            </defs>
            <path
              d="M 1220.0 640.0 A 580 580 0 0 0 1191.6 819.2 L 960.8 843.6 A 380 380 0 0 0 932.8 882.2 L 980.9 1109.2 A 580 580 0 0 0 819.2 1191.6 A 580 580 0 0 0 640.0 1220.0 L 545.5 1008.1 A 380 380 0 0 0 500.1 993.3 L 299.1 1109.2 A 580 580 0 0 0 170.8 980.9 A 580 580 0 0 0 88.4 819.2 L 260.7 663.9 A 380 380 0 0 0 260.7 616.1 L 88.4 460.8 A 580 580 0 0 0 170.8 299.1 A 580 580 0 0 0 299.1 170.8 L 500.1 286.7 A 380 380 0 0 0 545.5 271.9 L 640.0 60.0 A 580 580 0 0 0 819.2 88.4 A 580 580 0 0 0 980.9 170.8 L 932.8 397.8 A 380 380 0 0 0 960.8 436.4 L 1191.6 460.8 A 580 580 0 0 0 1220.0 640.0 Z"
              fill-rule="evenodd"
              fill="url(#gear-bg-right)"
              stroke="rgba(255,255,255,0.05)"
              stroke-width="2"
              vector-effect="non-scaling-stroke"
            />
          </svg>
        </div>

        <!-- LCD Screen elements masked within the chassis viewport coordinates -->
        <div 
          class="absolute overflow-hidden z-15 bg-[#030402]"
          style=${{
            left: '5.16%',
            top: '6.59%',
            width: '89.68%',
            height: '35.23%',
            clipPath: 'url(#lcd-display-clip)',
            WebkitClipPath: 'url(#lcd-display-clip)'
          }}
        >
          <!-- Vintage scanlines -->
          <div class="absolute inset-0 lcd-scanlines pointer-events-none z-25 select-none opacity-20" />
          
          <div class="absolute inset-0 p-3 py-4 flex flex-col justify-between font-mono text-primary leading-none select-none">
            
            <div class="flex justify-between items-start">
              <div class="min-w-0 flex-1 pr-2">
                <p class="text-[8px] opacity-40 tracking-widest truncate uppercase">
                  ${activeTrack.folder.replace(/_/g, ' ')}
                </p>
                <p class="text-[10px] font-bold tracking-wider truncate uppercase text-primary animate-phosphor drop-shadow-[0_0_2px_#22c55e]">
                  ${activeTrack.title.replace(/_/g, ' ')}
                </p>
              </div>
              <span class="text-[9px] font-bold tabular-nums shrink-0 pt-0.5">
                ${formatTime(currentTime)}
              </span>
            </div>

            <!-- Micro Canvas Visualizer -->
            <div class="flex items-end gap-2.5 h-6 w-full mt-1 overflow-hidden">
              <div class="flex-1 h-full min-w-0">
                <canvas 
                  ref=${miniCanvasRef} 
                  width="180" 
                  height="24" 
                  class="w-full h-full opacity-80"
                />
              </div>
              <span class="text-[9px] font-bold opacity-50 shrink-0 select-none">
                ${formatTime(duration)}
              </span>
            </div>

          </div>
        </div>

      </div>

      <!-- Playback Timeline progress bar -->
      <div class="space-y-1">
        <div class="relative w-full h-1 bg-void rounded-full overflow-hidden">
          <div 
            class="h-full bg-primary shadow-[0_0_6px_#22c55e]"
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
      </div>

      <!-- Sidebar Player controls rows -->
      <div class="flex items-center justify-between gap-1 mt-0.5">
        
        <button 
          onClick=${handleTriggerPrev} 
          class="p-2 rounded-lg bg-void/50 border border-white/5 hover:border-primary/30 text-fog hover:text-white transition cursor-none"
          title="Previous Track"
        >
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
        </button>

        <button 
          onClick=${handleTriggerPlay} 
          class="p-2.5 rounded-full bg-void border border-white/10 hover:border-primary/40 text-white transition hover:scale-105 cursor-none flex items-center justify-center shadow-lg"
          title=${isPlaying ? "Pause" : "Play"}
        >
          ${isPlaying 
            ? html`<svg class="w-4 h-4 fill-current text-primary drop-shadow-[0_0_4px_#22c55e]" viewBox="0 0 24 24"><path d="M6 19h4V5H6v13zm8-14v13h4V5h-4z"/></svg>`
            : html`<svg class="w-4 h-4 fill-current ml-0.5 text-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`
          }
        </button>

        <button 
          onClick=${handleTriggerNext} 
          class="p-2 rounded-lg bg-void/50 border border-white/5 hover:border-primary/30 text-fog hover:text-white transition cursor-none"
          title="Next Track"
        >
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6zm9-12v12h2V6z" /></svg>
        </button>

        <button 
          onClick=${handleTriggerShuffle} 
          class=${`p-2 rounded-lg border transition duration-200 cursor-none text-[9px] font-mono font-bold uppercase tracking-wider ${isShuffle ? 'border-primary/30 bg-primary/5 text-primary' : 'border-white/5 text-muted'}`}
          title="Shuffle Playlist"
        >
          SHUF
        </button>

        <!-- Volume dropdown popover trigger -->
        <div class="relative">
          <button 
            onClick=${() => {
              audioEngine.playSFX("https://www.stevencasteel.com/assets/audio/sfx/navbar_header_button_click.mp3", 0.35);
              setShowVolumePopover(!showVolumePopover);
            }}
            class=${`p-2 rounded-lg border transition duration-200 cursor-none ${showVolumePopover ? 'border-primary/30 bg-primary/5 text-primary' : 'border-white/5 text-fog hover:text-white'}`}
            title="Volume Control"
          >
            ${volume === 0 
              ? html`<${VolumeX} size=${14} />`
              : html`<${Volume2} size=${14} />`
            }
          </button>

          <!-- Volume sliding controller with custom tactile aluminum fader -->
          ${showVolumePopover && html`
            <div class="absolute bottom-10 right-0 z-50 bg-[#0d0e12] border border-white/10 p-3 rounded-lg shadow-2xl flex flex-col items-center gap-2 w-10 animate-lightbox-entry">
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value=${volume} 
                onChange=${(e) => setVolume(parseFloat(e.target.value))}
                class="h-24 appearance-none rounded-lg outline-none bg-void cursor-none custom-range-slider"
                style=${{
                  writingMode: 'bt-lr',
                  WebkitAppearance: 'slider-vertical'
                }}
              />
              <button 
                onClick=${handleMuteToggle}
                class="text-[9px] font-mono text-muted hover:text-white mt-1 cursor-none"
              >
                ${volume === 0 ? "UNM" : "MUTE"}
              </button>
            </div>
          `}
        </div>

        <!-- System Mixer console trigger -->
        <button 
          onClick=${onOpenConsole}
          class="p-2 rounded-lg bg-void/50 border border-white/5 hover:border-primary/30 text-fog hover:text-white transition cursor-none flex items-center justify-center"
          title="Open Audio Mixer"
        >
          <${Settings2} size=${14} />
        </button>

      </div>

    </div>
  `;
}

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import htm from 'htm';
import { Settings2, Volume2, VolumeX, Shuffle, SkipForward, SkipBack, Play, Pause } from 'lucide-react';
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
  const [popoverCoords, setPopoverCoords] = useState({ top: 0, left: 0 });
  const volBtnRef = useRef(null);
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

        ctx.fillStyle = isPlaying ? 'rgb(34, 197, 94)' : 'rgba(34, 197, 94, 0.4)';
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
    audioEngine.playClick();
    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(0.75);
    }
  };

  const handleTriggerPlay = () => {
    audioEngine.playClick();
    togglePlay();
  };

  const handleTriggerPrev = () => {
    audioEngine.playTick();
    handlePrev();
  };

  const handleTriggerNext = () => {
    audioEngine.playTick();
    handleNext();
  };

  const handleTriggerShuffle = () => {
    audioEngine.playClick();
    toggleShuffleState();
  };

  const toggleVolumePopover = () => {
    if (!showVolumePopover && volBtnRef.current) {
      const rect = volBtnRef.current.getBoundingClientRect();
      setPopoverCoords({
        top: rect.top + window.scrollY - 145,
        left: rect.left + window.scrollX + rect.width / 2
      });
    }
    audioEngine.playClick();
    setShowVolumePopover(!showVolumePopover);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return html`
    <div class="shrink-0 p-4 bg-gradient-to-t from-panel to-rgb(12, 13, 17) border-t border-black flex flex-col gap-3 relative z-20">
      
      <div class="relative w-full aspect-[3658/2595] rounded-xl border border-white/5 overflow-hidden bg-rgb(7, 8, 10) shadow-inner select-none isolate">
        
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
              <stop offset="0%" stop-color="rgb(30, 30, 36)" />
              <stop offset="100%" stop-color="rgb(10, 10, 10)" />
            </linearGradient>
            <clipPath id="lcd-display-clip">
              <path d="M604.605,554 L3116.675,554 c65.83,0 120,54.17 120,120 c0,222.67 184.5,405.91 408.72,405.91 c65.83,0 120,54.17 120,120 L3765.395,1348.18 c0,66.27 -53.73,120 -120,120 L604.605,1468.18 c-66.27,0 -120,-53.73 -120,-120 L484.605,674 c0,-66.27 53.73,-120 120,-120 Z" />
            </clipPath>
          </defs>
          <path 
            d="M451.625,383.598l2852.76,0a120,120 0 0,1 120,120a408.723,405.909 0 0,0 408.723,405.909a120,120 0 0,1 120,120l0,1792.06c0,85.533 -69.827,155.916 -154.684,155.916l-3346.8,0c-84.857,0 -154.684,-70.383 -154.684,-155.916l0,-2282.05c0,-85.533 69.827,-155.917 154.684,-155.917Z" 
            fill="url(#mini-player-bg)" 
          />
          <path d="M604.605,554 L3116.675,554 c65.83,0 120,54.17 120,120 c0,222.67 184.5,405.91 408.72,405.91 c65.83,0 120,54.17 120,120 L3765.395,1348.18 c0,66.27 -53.73,120 -120,120 L604.605,1468.18 c-66.27,0 -120,-53.73 -120,-120 L484.605,674 c0,-66.27 53.73,-120 120,-120 Z" fill="rgb(12, 13, 17)" filter="url(#lcd-inner-shadow)" />
          <path d="M604.605,554 L3116.675,554 c65.83,0 120,54.17 120,120 c0,222.67 184.5,405.91 408.72,405.91 c65.83,0 120,54.17 120,120 L3765.395,1348.18 c0,66.27 -53.73,120 -120,120 L604.605,1468.18 c-66.27,0 -120,-53.73 -120,-120 L484.605,674 c0,-66.27 53.73,-120 120,-120 Z" fill="none" stroke="rgba(0,0,0,0.8)" stroke-width="15" />
          <path 
            d="M451.625,383.598l2852.76,0a120,120 0 0,1 120,120a408.723,405.909 0 0,0 408.723,405.909a120,120 0 0,1 120,120l0,1792.06c0,85.533 -69.827,155.916 -154.684,155.916l-3346.8,0c-84.857,0 -154.684,-70.383 -154.684,-155.916l0,-2282.05c0,-85.533 69.827,-155.917 154.684,-155.917Z" 
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            stroke-width="2"
            vector-effect="non-scaling-stroke"
          />
        </svg>

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
                <stop offset="20%" stop-color="rgb(58, 58, 64)" />
                <stop offset="100%" stop-color="rgb(36, 36, 42)" />
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
                <stop offset="20%" stop-color="rgb(48, 48, 53)" />
                <stop offset="100%" stop-color="rgb(29, 29, 34)" />
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

        <div 
          class="absolute z-30"
          style=${{
            top: '-2%',
            right: '-1.5%',
            width: '23%',
            aspectRatio: '1 / 1'
          }}
        >
          <button 
            onClick=${onOpenConsole}
            onMouseEnter=${() => audioEngine.playInnerTick()}
            class="w-full h-full cursor-none outline-none rounded-full relative flex items-center justify-center group pointer-events-auto"
            title="Open Console Mixer"
          >
            <div class="w-full h-full transition-transform duration-300 group-hover:rotate-90 group-active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 1280" width="100%" height="100%">
                <defs>
                  <radialGradient id="gear-bg-settings" cx="50%" cy="50%" r="50%">
                    <stop offset="20%" stop-color="rgb(77, 77, 85)" />
                    <stop offset="100%" stop-color="rgb(42, 42, 48)" />
                  </radialGradient>
                </defs>
                <path
                  d="M 1220.0 640.0 A 580 580 0 0 0 1191.6 819.2 L 960.8 843.6 A 380 380 0 0 0 932.8 882.2 L 980.9 1109.2 A 580 580 0 0 0 819.2 1191.6 A 580 580 0 0 0 640.0 1220.0 L 545.5 1008.1 A 380 380 0 0 0 500.1 993.3 L 299.1 1109.2 A 580 580 0 0 0 170.8 980.9 A 580 580 0 0 0 88.4 819.2 L 260.7 663.9 A 380 380 0 0 0 260.7 616.1 L 88.4 460.8 A 580 580 0 0 0 170.8 299.1 A 580 580 0 0 0 299.1 170.8 L 500.1 286.7 A 380 380 0 0 0 545.5 271.9 L 640.0 60.0 A 580 580 0 0 0 819.2 88.4 A 580 580 0 0 0 980.9 170.8 L 932.8 397.8 A 380 380 0 0 0 960.8 436.4 L 1191.6 460.8 A 580 580 0 0 0 1220.0 640.0 Z"
                  fill-rule="evenodd"
                  fill="url(#gear-bg-settings)"
                  stroke="rgba(255,255,255,0.08)"
                  stroke-width="3"
                  vector-effect="non-scaling-stroke"
                />
              </svg>
            </div>
            <div class="absolute w-[35%] h-[35%] rounded-full bg-rgb(17, 17, 21) border border-black shadow-inner flex items-center justify-center">
              <div class="w-[45%] h-[45%] rounded-full bg-primary" />
            </div>
          </button>
        </div>

        <div 
          class="absolute overflow-hidden z-15 bg-rgb(3, 4, 2)"
          style=${{
            left: '5.16%',
            top: '6.59%',
            width: '89.68%',
            height: '35.23%',
            clipPath: 'url(#lcd-display-clip)',
            WebkitClipPath: 'url(#lcd-display-clip)'
          }}
        >
          <div class="absolute inset-0 lcd-scanlines pointer-events-none z-25 select-none opacity-20" />
          <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.045] to-transparent pointer-events-none z-40" />

          <div class="absolute inset-0 flex items-stretch p-[2%] gap-[4%] select-none font-mono text-primary leading-none">
            <div class="relative aspect-square h-full shrink-0 overflow-hidden rounded-md bg-black shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] border border-white/5 flex items-center justify-center">
              <span class="text-xl ${isPlaying ? 'animate-spin' : ''}" style=${{ animationDuration: '6s' }}>💿</span>
            </div>

            <div class="relative flex-1 min-w-0 flex flex-col justify-center text-left pr-2">
              <div class="min-w-0">
                <p class="text-[8px] opacity-40 tracking-widest truncate uppercase leading-normal">
                  ${activeTrack.folder.replace(/_/g, ' ')}
                </p>
                <div class="relative w-full overflow-hidden h-[14px]">
                  <p class="absolute inset-y-0 left-0 text-[10px] font-bold tracking-wider truncate uppercase text-primary animate-phosphor drop-shadow-[0_0_2px_rgba(34,197,94,1)] leading-none flex items-center">
                    ${activeTrack.title.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>

              <div class="flex items-end gap-[1.5px] h-4 w-full mt-1.5 overflow-hidden">
                <div class="flex-1 h-full min-w-0">
                  <canvas 
                    ref=${miniCanvasRef} 
                    width="120" 
                    height="16" 
                    class="w-full h-full opacity-80"
                  />
                </div>
                <div class="text-[8px] font-bold opacity-60 shrink-0 tabular-nums self-end">
                  ${formatTime(currentTime)} / ${formatTime(duration)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div 
          class="absolute flex items-center pointer-events-auto z-40"
          style=${{
            top: '49%',
            left: '5.16%',
            right: '5.16%',
            height: '14%'
          }}
        >
          <div class="relative w-full h-1.5 flex items-center">
            <div class="absolute inset-x-0 h-1 bg-void rounded-full border border-black/40 shadow-inner" />
            
            <div class="absolute left-0 h-1 bg-primary rounded-full" style=${{ width: `${progressPercent}%` }} />
            
            <div 
              class="absolute pointer-events-none w-[10px] h-[14px] flex items-center justify-center -translate-x-1/2"
              style=${{ left: `${progressPercent}%` }}
            >
              <img 
                src="https://www.stevencasteel.com/assets/svg/slider-thumb.svg" 
                class="absolute inset-0 w-full h-full object-contain pointer-events-none"
                draggable="false"
              />
              <div class="w-[1.5px] h-2 bg-primary shadow-[0_0_4px_rgba(34,197,94,1)] rounded-full z-10" />
            </div>

            <input 
              type="range" 
              min="0" 
              max=${duration || 0} 
              value=${currentTime} 
              onChange=${handleScrubberChange}
              class="absolute inset-0 w-full h-full opacity-0 cursor-none z-30"
            />
          </div>
        </div>

        <div 
          class="absolute flex items-center justify-between z-40 pointer-events-auto"
          style=${{
            top: '67%',
            left: '5.16%',
            right: '5.16%',
            bottom: '7%'
          }}
        >
          <button 
            onClick=${handleTriggerShuffle}
            class=${`relative flex items-center justify-center rounded-[5px] cursor-none border border-black/40 overflow-hidden outline-none surface-hardware-btn text-center select-none font-bold font-mono text-[9px] transition w-[15%] h-full ${isShuffle ? 'is-active text-primary' : 'text-fog hover:text-white'}`}
            title="Shuffle Mode"
          >
            SHUF
          </button>

          <button 
            onClick=${handleTriggerPrev}
            class="relative flex items-center justify-center rounded-[5px] cursor-none border border-black/40 overflow-hidden outline-none surface-hardware-btn w-[17%] h-full text-fog hover:text-white transition"
            title="Previous Track"
          >
            <${SkipBack} size=${12} fill="currentColor" />
          </button>

          <button 
            onClick=${handleTriggerPlay}
            class=${`relative flex items-center justify-center rounded-[5px] cursor-none border border-black/40 overflow-hidden outline-none surface-hardware-btn w-[21%] h-full shadow-lg ${isPlaying ? 'is-active text-primary' : 'text-white'}`}
            title=${isPlaying ? "Pause" : "Play"}
          >
            ${isPlaying 
              ? html`<${Pause} size=${14} fill="currentColor" class="text-primary drop-shadow-[0_0_4px_rgba(34,197,94,1)]" />`
              : html`<${Play} size=${14} fill="currentColor" class="ml-0.5" />`
            }
          </button>

          <button 
            onClick=${handleTriggerNext}
            class="relative flex items-center justify-center rounded-[5px] cursor-none border border-black/40 overflow-hidden outline-none surface-hardware-btn w-[17%] h-full text-fog hover:text-white transition"
            title="Next Track"
          >
            <${SkipForward} size=${12} fill="currentColor" />
          </button>

          <div class="relative w-[15%] h-full flex items-center">
            <button 
              ref=${volBtnRef}
              onClick=${toggleVolumePopover}
              class=${`relative flex items-center justify-center rounded-[5px] cursor-none border border-black/40 overflow-hidden outline-none surface-hardware-btn w-full h-full transition ${showVolumePopover ? 'is-active text-primary' : 'text-fog hover:text-white'}`}
              title="Volume Control"
            >
              ${volume === 0 
                ? html`<${VolumeX} size=${12} />`
                : html`<${Volume2} size=${12} />`
              }
            </button>
          </div>
        </div>

      </div>

      ${showVolumePopover && createPortal(html`
        <div 
          class="fixed z-[100] -translate-x-1/2 flex flex-col items-center bg-rgb(26, 26, 31) border border-white/10 p-3 rounded-lg shadow-2xl w-10 animate-lightbox-entry cursor-none"
          style=${{
            top: `${popoverCoords.top}px`,
            left: `${popoverCoords.left}px`
          }}
        >
          <div class="h-24 relative w-2 flex items-center justify-center">
            <div class="absolute inset-y-0 w-1.5 bg-void rounded-full shadow-inner" />
            <div class="absolute bottom-0 w-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(34,197,94,1)]" style=${{ height: `${volume * 100}%` }} />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value=${volume} 
              onChange=${(e) => {
                const val = parseFloat(e.target.value);
                setVolume(val);
              }}
              class="absolute inset-0 w-full h-full opacity-0 cursor-none"
              style=${{ writingMode: 'vertical-lr', direction: 'rtl' }}
            />
          </div>
          <button 
            onClick=${handleMuteToggle}
            class="text-[9px] font-mono text-muted hover:text-white mt-2 uppercase cursor-none"
          >
            ${volume === 0 ? "UNM" : "MUTE"}
          </button>
        </div>
      `, document.body)}

    </div>
  `;
}

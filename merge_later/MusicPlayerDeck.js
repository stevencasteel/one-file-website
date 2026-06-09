import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import htm from 'htm';
import { Settings2, Volume2, VolumeX, Shuffle, SkipForward, SkipBack, Play, Pause, Music } from 'lucide-react';
import { audioEngine } from './AudioEngine.js';
import { ScrollingText } from './components.js';

const html = htm.bind(React.createElement);

function ConsoleButton({
  children,
  onClick,
  active,
  label,
  className = "w-8 h-8",
  isPrismatic = false,
  popoverTarget
}) {
  return html`
    <div class=${`relative rounded-lg surface-hardware-well p-[2.5px] shrink-0 ${className}`}>
      <button
        aria-label=${label}
        title=${label}
        onClick=${(e) => { e.stopPropagation(); onClick(); }}
        popovertarget=${popoverTarget}
        class=${`relative isolate flex items-center justify-center w-full h-full rounded-[5px] transition-[transform,color] duration-150 cursor-none overflow-hidden outline-none surface-hardware-btn ${active ? 'is-active text-primary' : 'text-fog hover:text-white'}`}
      >
        <span class="relative z-10 flex items-center justify-center w-full h-full">
          ${children}
        </span>
      </button>
      ${active && isPrismatic && html`
        <div class="console-btn-prismatic-border" />
        <div class="console-btn-prismatic-blur" />
      `}
    </div>
  `;
}

export function MusicPlayerDeck({
  activeTrack,
  trackMetadata,
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
  const gearTimeoutsRef = useRef([]);

  useEffect(() => {
    const popover = document.getElementById('volume-slider-popover');
    if (!popover) return;
    const handleToggle = (e) => {
      setShowVolumePopover(e.newState === 'open');
    };
    popover.addEventListener('beforetoggle', handleToggle);
    return () => popover.removeEventListener('beforetoggle', handleToggle);
  }, []);

  const handleMuteToggle = () => {
    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(0.75);
    }
  };

  const clearGearTicks = () => {
    gearTimeoutsRef.current.forEach((id) => clearTimeout(id));
    gearTimeoutsRef.current = [];
  };

  useEffect(() => {
    return () => {
      gearTimeoutsRef.current.forEach((id) => clearTimeout(id));
    };
  }, []);

  const playGearEnterSound = () => {
    clearGearTicks();
    audioEngine.playInnerTick();
    const t1 = setTimeout(() => audioEngine.playInnerTick(), 60);
    const t2 = setTimeout(() => audioEngine.playInnerTick(), 120);
    gearTimeoutsRef.current.push(t1, t2);
  };

  const playGearLeaveSound = () => {
    clearGearTicks();
    audioEngine.playInnerTick();
    const t1 = setTimeout(() => audioEngine.playInnerTick(), 80);
    gearTimeoutsRef.current.push(t1);
  };

  const handleGearMouseEnter = () => {
    playGearEnterSound();
  };

  const handleGearMouseLeave = () => {
    playGearLeaveSound();
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const miniPlayerBgRef = 'url(' + String.fromCharCode(35) + 'mini-player-bg)';
  const innerShadowRef = 'url(' + String.fromCharCode(35) + 'lcd-inner-shadow)';

  const UNIFIED_LCD_PATH = "M604.605,554 L3116.675,554 c65.83,0 120,54.17 120,120 c0,222.67 184.5,405.91 408.72,405.91 c65.83,0 120,54.17 120,120 L3765.395,1348.18 c0,66.27 -53.73,120 -120,120 L604.605,1468.18 c-66.27,0 -120,-53.73 -120,-120 L484.605,674 c0,-66.27 53.73,-120 120,-120 Z";
  const exactLcdMask = `url("data:image/svg+xml,%3Csvg viewBox='296 383 3658 2595' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='${UNIFIED_LCD_PATH}' fill='white'/%3E%3C/svg%3E")`;

  const cleanTitle = trackMetadata?.title || activeTrack.title.replace(/_/g, ' ');
  const cleanAlbum = trackMetadata?.artist ? `${trackMetadata.artist} // ${activeTrack.folder.replace(/_/g, ' ')}` : activeTrack.folder.replace(/_/g, ' ');

  const isUiActive = isPlaying;

  return html`
    <div class="pl-3 pr-3.5 pb-3 pt-4 shrink-0 w-full bg-gradient-to-t from-panel to-rgb(12, 13, 17) border-t border-black flex flex-col gap-3 relative z-20">
      
      <div class="relative w-full aspect-[3658/2595] select-none isolate">
        
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="296 383 3658 2595" preserveAspectRatio="none" width="100%" height="100%" class="absolute inset-0 pointer-events-none select-none z-10">
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
          </defs>
          <path 
            d="M451.625,383.598l2852.76,0a120,120 0 0,1 120,120a408.723,405.909 0 0,0 408.723,405.909a120,120 0 0,1 120,120l0,1792.06c0,85.533 -69.827,155.916 -154.684,155.916l-3346.8,0c-84.857,0 -154.684,-70.383 -154.684,-155.916l0,-2282.05c0,-85.533 69.827,-155.917 154.684,-155.917Z" 
            fill=${miniPlayerBgRef} 
          />
          <path d="M604.605,554 L3116.675,554 c65.83,0 120,54.17 120,120 c0,222.67 184.5,405.91 408.72,405.91 c65.83,0 120,54.17 120,120 L3765.395,1348.18 c0,66.27 -53.73,120 -120,120 L604.605,1468.18 c-66.27,0 -120,-53.73 -120,-120 L484.605,674 c0,-66.27 53.73,-120 120,-120 Z" fill="rgb(12, 13, 17)" filter=${innerShadowRef} />
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
          class="absolute z-5 pointer-events-none"
          style=${{
            top: '-2%',
            right: '-1.5%',
            width: '23%',
            aspectRatio: '1 / 1',
            filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.8)) drop-shadow(-1px -1px 1px rgba(255,255,255,0.15))'
          }}
        >
          <button 
            onClick=${onOpenConsole}
            onMouseEnter=${handleGearMouseEnter}
            onMouseLeave=${handleGearMouseLeave}
            class="w-full h-full cursor-none outline-none rounded-full relative flex items-center justify-center group pointer-events-auto"
            title="Open Console Mixer"
          >
            <div class="absolute inset-0 rounded-full bg-white/[0.001] z-10" />
            <div class="w-full h-full transition-transform duration-300 group-hover:rotate-90 group-active:scale-95 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 1280" width="100%" height="100%">
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
          </button>
        </div>

        <div 
          class="absolute overflow-hidden z-20"
          style=${{
            left: '5.16%',
            top: '6.59%',
            width: '89.68%',
            height: '35.23%',
            WebkitMaskImage: exactLcdMask,
            WebkitMaskSize: '100% 100%',
            maskImage: exactLcdMask,
            maskSize: '100% 100%',
            backgroundColor: 'rgb(3, 4, 2)'
          }}
        >
          <div class="absolute inset-0 lcd-scanlines pointer-events-none z-20 select-none opacity-40 animate-lcd-flicker" />
          <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.045] to-transparent pointer-events-none z-45" />
          <div class="absolute inset-0 lcd-vignette pointer-events-none z-25" />

          <div class="absolute inset-0 flex items-stretch p-[2%] gap-[4%] select-none font-mono text-primary leading-none">
            
            <div class="relative aspect-square h-full shrink-0 overflow-hidden rounded-[8px] bg-black shadow-[0_2px_0_rgba(0,0,0,1),inset_0_1px_1px_rgba(255,255,255,0.2)] z-30">
              ${trackMetadata && trackMetadata.coverUrl ? html`
                <img src=${trackMetadata.coverUrl} class="absolute inset-0 w-full h-full object-cover z-10 opacity-90" alt="" />
              ` : html`
                <div class="absolute inset-0 flex items-center justify-center z-10">
                  <span class="text-xl ${isPlaying ? 'animate-spin' : ''}" style=${{ animationDuration: '6s' }}>💿</span>
                </div>
              `}
              <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none z-20" />
            </div>

            <div class="relative flex-1 min-w-0 flex flex-col h-full pointer-events-none pr-2">
              <div class="relative h-[45%] w-full flex items-center overflow-hidden">
                <${ScrollingText} isUiActive=${isUiActive} className="text-[8px] font-bold tracking-widest text-primary/60 uppercase truncate">
                  <span>${cleanAlbum}</span>
                </${ScrollingText}>
              </div>

              <div class="relative h-[55%] w-full flex items-center overflow-hidden group/titlelink">
                <${ScrollingText} isUiActive=${isUiActive} className="relative text-[11px] font-bold tracking-wider uppercase">
                  <span class="text-primary drop-shadow-[0_0_2px_rgba(34,197,94,0.6)]">
                    ${cleanTitle}
                  </span>
                  <span class="absolute left-0 top-0 pointer-events-none text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-[length:200%_auto] animate-gradient-xy" aria-hidden="true">
                    ${cleanTitle}
                  </span>
                </${ScrollingText}>
              </div>
            </div>
          </div>
        </div>

        <div 
          class="absolute flex items-center pointer-events-auto z-30"
          style=${{
            top: '49%',
            left: '5.16%',
            right: '5.16%',
            height: '14%'
          }}
        >
          <div class="flex items-center gap-2 w-full">
            <div class="relative flex items-center group/scrub flex-1 h-5">
              <div class="absolute inset-0 rounded-md surface-hardware-track pointer-events-none" />
              <div class="absolute inset-[3px] rounded-sm overflow-hidden pointer-events-none">
                <div class="h-full bg-primary" style=${{ width: `${progressPercent}%` }} />
              </div>
              <div class="absolute inset-0 rounded-md shadow-[inset_0_1px_3px_rgba(0,0,0,0.3),inset_0_-1px_1px_rgba(255,255,255,0.12)] pointer-events-none" />
              
              <div class="peer-focus-ring-prismatic" />
              <input 
                type="range" 
                min="0" 
                max=${duration || 0} 
                value=${currentTime} 
                onChange=${handleScrubberChange}
                class="peer absolute inset-0 w-full h-full opacity-0 cursor-none z-30"
              />
            </div>
            
            <div class="flex items-center justify-center font-mono text-[9.5px] text-muted border border-transparent surface-hardware-track rounded-md shrink-0 px-1.5 min-w-[72px] h-5 bg-[#0c0d11]">
              <span>${formatTime(currentTime)} / ${formatTime(duration)}</span>
            </div>
          </div>
        </div>

        <div
          class="absolute flex items-center justify-between z-30 pointer-events-auto"
          style=${{
            top: '67%',
            left: '5.16%',
            right: '5.16%',
            bottom: '7%'
          }}
        >
          <${ConsoleButton}
            label="Shuffle"
            onClick=${toggleShuffleState}
            active=${isShuffle}
            isPrismatic=${true}
            className="w-[15%] aspect-square"
          >
            <${Shuffle} size=${12} />
          </${ConsoleButton}>

          <${ConsoleButton}
            label="Previous"
            onClick=${handlePrev}
            className="w-[17%] aspect-square"
          >
            <${SkipBack} size=${12} fill="currentColor" />
          </${ConsoleButton}>

          <${ConsoleButton}
            label=${isPlaying ? "Pause" : "Play"}
            onClick=${togglePlay}
            active=${isPlaying}
            isPrismatic=${true}
            className="w-[21%] aspect-square shadow-lg"
          >
            ${isPlaying 
              ? html`<${Pause} size=${14} fill="currentColor" class="text-primary drop-shadow-[0_0_4px_rgba(34,197,94,1)]" />`
              : html`<${Play} size=${14} fill="currentColor" class="ml-0.5" />`
            }
          </${ConsoleButton}>

          <${ConsoleButton}
            label="Next"
            onClick=${handleNext}
            className="w-[17%] aspect-square"
          >
            <${SkipForward} size=${12} fill="currentColor" />
          </${ConsoleButton}>

          <div class="relative w-[15%] h-full flex items-center justify-center aspect-square" style=${{ anchorName: "--volume-btn" }}>
            <${ConsoleButton}
              label="Volume"
              onClick=${() => {}}
              popoverTarget="volume-slider-popover"
              active=${showVolumePopover}
              className="w-full h-full"
            >
              ${volume === 0 
                ? html`<${VolumeX} size=${12} />`
                : html`<${Volume2} size=${12} />`
              }
            </${ConsoleButton}>

            <div 
              popover="auto"
              id="volume-slider-popover"
              style=${{ positionAnchor: "--volume-btn" }}
              class="bg-transparent border-none overflow-visible p-0 cursor-none"
            >
              <div 
                class="flex flex-col items-center bg-[#1a1a1f] border border-white/10 p-2 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] w-12 h-40 cursor-none relative"
                onClick=${(e) => e.stopPropagation()}
              >
                <div class="absolute bottom-0 left-0 right-0 h-5 bg-transparent" />
                <div class="relative w-[110px] h-6 shrink-0 flex items-center group/vol -rotate-90 origin-center mt-[48px]">
                  <div class="absolute inset-0 rounded-md surface-hardware-track pointer-events-none" />
                  <div class="absolute inset-[3px] rounded-sm overflow-hidden pointer-events-none">
                    <div class="h-full bg-primary" style=${{ width: `${volume * 100}%` }} />
                  </div>
                  <div class="absolute inset-0 shadow-[inset_0_1px_3px_rgba(0,0,0,0.3),inset_0_-1px_1px_rgba(255,255,255,0.12)] rounded-md pointer-events-none" />
                  
                  <div class="peer-focus-ring-prismatic" />
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
                    class="peer absolute inset-0 w-full h-full opacity-0 cursor-none z-30" 
                  />
                </div>
                
                <button 
                  onClick=${handleMuteToggle}
                  class="text-[9px] font-mono text-muted hover:text-white mt-12 uppercase cursor-none shrink-0"
                >
                  ${volume === 0 ? "UNM" : "MUTE"}
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  `;
}

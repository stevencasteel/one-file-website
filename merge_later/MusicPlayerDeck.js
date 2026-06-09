
import React, { useState, useEffect, useRef } from 'react';
import htm from 'htm';
import { Volume2, VolumeX, Shuffle, SkipForward, SkipBack, Play, Pause, Music } from 'lucide-react';
import { audioEngine } from './AudioEngine.js';
import { ScrollingText } from './components.js';

const html = htm.bind(React.createElement);

function getFallbackCover(folder) {
  const mapping = {
    "elf_girl_001": "sc_001",
    "elf_girl_002": "sc_002",
    "elf_girl_003": "sc_004",
    "elf_girl_004": "sc_005",
    "elf_girl_005": "sc_008",
    "elf_girl_006": "sc_009",
    "elf_girl_007": "sc_012",
    "elf_girl_008": "sc_013"
  };
  const scName = mapping[folder] || "sc_001";
  return `https://www.stevencasteel.com/assets/portfolio/seedream3_covers/${scName}.avif`;
}

function ConsoleButton({
  children,
  onClick,
  active,
  label,
  className = "w-8 h-8",
  isPrismatic = true,
  id,
  style
}) {
  const handleMouseDown = () => {
    audioEngine.playSFX("https://www.stevencasteel.com/assets/audio/sfx/navbar_header_button_click.mp3", 0.4);
  };
  const handleMouseUp = () => {
    audioEngine.playSFX("https://www.stevencasteel.com/assets/audio/sfx/navbar_header_button_release.mp3", 0.4);
  };

  return html`
    <div 
      className=\`relative rounded-lg surface-hardware-well p-[2.5px] shrink-0 ${className}\`
      style=${style}
    >
      <button
        id=${id}
        aria-label=${label}
        title=${label}
        onMouseDown=${handleMouseDown}
        onMouseUp=${handleMouseUp}
        onClick=${(e) => { e.stopPropagation(); onClick(); }}
        className=\`relative isolate flex items-center justify-center w-full h-full rounded-[5px] transition-[transform,color] duration-150 cursor-none overflow-hidden outline-none surface-hardware-btn ${active ? 'is-active text-primary' : 'text-fog hover:text-white'}\`
      >
        <span className="relative z-10 flex items-center justify-center w-full h-full">
          ${children}
        </span>
        ${active && isPrismatic && html`
          <div className="console-btn-prismatic-border" />
          <div className="console-btn-prismatic-blur" />
        `}
      </button>
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
  onOpenConsole,
  isPrismaticEnabled = true
}) {
  const [showVolumePopover, setShowVolumePopover] = useState(false);
  const gearTimeoutsRef = useRef([]);
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!showVolumePopover) return;
    const handleOutsideClick = (e) => {
      // Ignore clicks on the popover itself and the toggle button
      if (popoverRef.current && !popoverRef.current.contains(e.target) && !e.target.closest('#volume-toggle-btn')) {
        setShowVolumePopover(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, [showVolumePopover]);

  const clearGearTicks = () => {
    gearTimeoutsRef.current.forEach((id) => clearTimeout(id));
    gearTimeoutsRef.current = [];
  };

  useEffect(() => {
    return () => clearGearTicks();
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

  const UNIFIED_LCD_PATH = "M604.605,554 L3116.675,554 c65.83,0 120,54.17 120,120 c0,222.67 184.5,405.91 408.72,405.91 c65.83,0 120,54.17 120,120 L3765.395,1348.18 c0,66.27 -53.73,120 -120,120 L604.605,1468.18 c-66.27,0 -120,-53.73 -120,-120 L484.605,674 c0,-66.27 53.73,-120 120,-120 Z";
  const CHASSIS_OUTLINE_PATH = "M451.625,383.598l2852.76,0a120,120 0 0,1 120,120a408.723,405.909 0 0,0 408.723,405.909a120,120 0 0,1 120,120l0,1792.06c0,85.533 -69.827,155.916 -154.684,155.916l-3346.8,0c-84.857,0 -154.684,-70.383 -154.684,-155.916l0,-2282.05c0,-85.533 69.827,-155.917 154.684,-155.917Z";
  const exactLcdMask = `url("data:image/svg+xml,%3Csvg viewBox='296 383 3658 2595' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='${UNIFIED_LCD_PATH}' fill='white'/%3E%3C/svg%3E")`;

  const fallbackCover = getFallbackCover(activeTrack.folder);
  const coverSrc = trackMetadata?.coverUrl || fallbackCover;

  const cleanTitle = trackMetadata?.title || activeTrack.title.replace(/_/g, ' ');
  const cleanAlbum = trackMetadata?.artist ? `${trackMetadata.artist} // ${activeTrack.folder.replace(/_/g, ' ')}` : activeTrack.folder.replace(/_/g, ' ');

  const isUiActive = isPlaying;

  return html`
    <div className="pl-3 pr-3.5 pb-3 pt-4 shrink-0 w-full bg-gradient-to-t from-panel to-[#0c0d11] border-t border-black flex flex-col gap-3 relative z-20">
      
      <div className="relative w-full aspect-[3658/2595] select-none isolate transition-colors duration-500">
        
        <!-- 1. Background Layers & Cutout Window -->
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style=${{
            WebkitMaskImage: exactLcdMask,
            WebkitMaskSize: '100% 100%',
            maskImage: exactLcdMask,
            maskSize: '100% 100%',
            backgroundColor: '#030402'
          }}
        >
          <div className="absolute inset-0 lcd-scanlines opacity-40 pointer-events-none z-20 animate-lcd-flicker" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.045] to-transparent pointer-events-none z-45" />
          <div className="absolute inset-0 lcd-vignette pointer-events-none z-25" />

          <div className="absolute flex items-stretch pointer-events-none group/track" style=${{ top: '6.59%', left: '5.16%', right: '5.16%', height: '35.23%', padding: '2%', gap: '4%' }}>
            <div className="relative aspect-square h-full shrink-0 pointer-events-auto overflow-hidden rounded-[8px] bg-black shadow-[0_2px_0_rgba(0,0,0,1),inset_0_1px_1px_rgba(255,255,255,0.2)] z-30">
              ${coverSrc ? html`
                <img src=${coverSrc} className="absolute inset-0 w-full h-full object-cover z-10 opacity-90" alt="" />
              ` : html`
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <${Music} size=${24} className="text-muted/60" />
                </div>
              `}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none z-20" />
            </div>

            <div className="relative flex-1 min-w-0 flex flex-col justify-center pointer-events-none pr-4 z-10">
              <div className="relative h-[55%] w-full flex items-end pb-[1%] pointer-events-auto">
                <a 
                  href=${`https://www.stevencasteel.com/assets/audio/music/elf_girl/${activeTrack.folder}/${activeTrack.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full cursor-none outline-none group/titlelink"
                  title="Open MP3 in new tab"
                >
                  <${ScrollingText} isUiActive=${isUiActive} className="relative leading-none text-[13px] sm:text-[14px] font-bold">
                    <span className="text-fog transition-colors duration-300 group-hover/titlelink:text-white group-hover/titlelink:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                      ${cleanTitle}
                    </span>
                    <span 
                      className=${`absolute left-0 top-0 transition-opacity duration-300 pointer-events-none ${isUiActive ? "opacity-100" : "opacity-0"} ${isPrismaticEnabled ? "text-transparent bg-clip-text bg-prismatic-gradient bg-[length:200%_100%] animate-gradient-xy group-hover/titlelink:brightness-125 group-hover/titlelink:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" : "text-primary-400 drop-shadow-[0_0_8px_hsl(var(--color-primary-400)/0.5)] group-hover/titlelink:text-white group-hover/titlelink:drop-shadow-[0_0_12px_hsl(var(--color-primary-400)/0.8)]"}`}
                      aria-hidden="true"
                    >
                      ${cleanTitle}
                    </span>
                  </${ScrollingText}>
                </a>
              </div>

              <div className="relative h-[45%] w-full overflow-hidden flex items-start pt-[1%]">
                <${ScrollingText} isUiActive=${isUiActive} className="relative text-[10px] sm:text-[11px] font-mono uppercase tracking-widest leading-none">
                  <span className="text-muted transition-colors duration-500">
                    ${cleanAlbum}
                  </span>
                  <span 
                    className=${`absolute left-0 top-0 transition-opacity duration-500 pointer-events-none ${isUiActive ? "opacity-100" : "opacity-0"} ${isPrismaticEnabled ? "text-transparent bg-clip-text bg-prismatic-gradient bg-[length:200%_100%] animate-gradient-xy" : "text-primary-400"}`}
                    aria-hidden="true"
                  >
                    ${cleanAlbum}
                  </span>
                </${ScrollingText}>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Gear Button (Behind Chassis, z-20) -->
        <div 
          className="absolute pointer-events-none"
          style=${{
            zIndex: -2, top: '-2%', right: '-1.5%', width: '23%', aspectRatio: '1 / 1',
            filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.8)) drop-shadow(-1px -1px 1px rgba(255,255,255,0.15))'
          }}
        >
          <button 
            onClick=${onOpenConsole}
            onMouseEnter=${handleGearMouseEnter}
            onMouseLeave=${handleGearMouseLeave}
            data-custom-hover="true"
            className="w-full h-full cursor-none outline-none pointer-events-auto rounded-full relative flex items-center justify-center group focus-ring-prismatic"
            title="Open Console Mixer"
          >
            <div className="absolute inset-0 rounded-full bg-white/[0.001] z-10" />
            <div className="w-full h-full transition-transform duration-300 group-hover:rotate-90 group-active:scale-95 pointer-events-none"
                 dangerouslySetInnerHTML=${{ __html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 1280" width="100%" height="100%">
  <defs>
    <radialGradient id="gear-bg" cx="50%" cy="50%" r="50%">
      <stop offset="20%" stop-color="#3a3a40" />
      <stop offset="100%" stop-color="#24242a" />
    </radialGradient>
  </defs>
  <path
    d="M 1220.0 640.0 A 580 580 0 0 0 1191.6 819.2 L 960.8 843.6 A 380 380 0 0 0 932.8 882.2 L 980.9 1109.2 A 580 580 0 0 0 819.2 1191.6 A 580 580 0 0 0 640.0 1220.0 L 545.5 1008.1 A 380 380 0 0 0 500.1 993.3 L 299.1 1109.2 A 580 580 0 0 0 170.8 980.9 A 580 580 0 0 0 88.4 819.2 L 260.7 663.9 A 380 380 0 0 0 260.7 616.1 L 88.4 460.8 A 580 580 0 0 0 170.8 299.1 A 580 580 0 0 0 299.1 170.8 L 500.1 286.7 A 380 380 0 0 0 545.5 271.9 L 640.0 60.0 A 580 580 0 0 0 819.2 88.4 A 580 580 0 0 0 980.9 170.8 L 932.8 397.8 A 380 380 0 0 0 960.8 436.4 L 1191.6 460.8 A 580 580 0 0 0 1220.0 640.0 Z"
    fill-rule="evenodd"
    fill="url(#gear-bg)"
    stroke="rgba(255,255,255,0.05)"
    stroke-width="2"
    vector-effect="non-scaling-stroke"
  />
</svg>` }} />
          </button>
        </div>

        <!-- 3. SVG Chassis Mask (In Front of Gear, Pointer-Events-Auto to mask out the gear) -->
        <div className="absolute inset-0 w-full h-full pointer-events-none" style=${{ zIndex: -1 }}>
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0 [&>svg]:w-full [&>svg]:h-full [&>svg]:object-fill [&>svg]:pointer-events-none [&>svg_path]:pointer-events-auto"
            style=${{ filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.7)) drop-shadow(-1px -1px 2px rgba(255,255,255,0.06))' }}
            dangerouslySetInnerHTML=${{ __html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="296 383 3658 2595" preserveAspectRatio="none" width="100%" height="100%">
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
</svg>` }}
          />
        </div>

        <!-- 4. Top Graphics / Prismatic Outline (z-30) -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="296 383 3658 2595" preserveAspectRatio="none" width="100%" height="100%" className="absolute inset-0 pointer-events-none select-none z-30">
          <defs>
            <linearGradient id="prismatic-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ef4444" />
              <stop offset="20%" stop-color="#eab308" />
              <stop offset="40%" stop-color="#22c55e" />
              <stop offset="60%" stop-color="#06b6d4" />
              <stop offset="80%" stop-color="#3b82f6" />
              <stop offset="100%" stop-color="#a855f7" />
            </linearGradient>
            <clipPath id="lcd-clip-main">
              <path d=${UNIFIED_LCD_PATH} />
            </clipPath>
          </defs>
          
          <g clipPath="url(#lcd-clip-main)">
            <path d=${UNIFIED_LCD_PATH} fill="none" stroke="black" stroke-width="80" filter="blur(20px)" opacity="0.9" />
            <path d=${UNIFIED_LCD_PATH} fill="none" stroke="black" stroke-width="20" opacity="0.7" />
            <path d=${UNIFIED_LCD_PATH} fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="4" />
          </g>

          <path 
            d=${CHASSIS_OUTLINE_PATH}
            fill="none"
            stroke=${isPrismaticEnabled ? "url(#prismatic-stroke)" : "hsl(var(--color-primary-400))"}
            stroke-width="10"
            className=${`transition-opacity duration-500 ${isUiActive ? "opacity-[0.15]" : "opacity-0"} ${isPrismaticEnabled ? "prismatic-anim" : ""}`}
          />
          <path 
            d=${CHASSIS_OUTLINE_PATH}
            fill="none"
            stroke=${isPrismaticEnabled ? "url(#prismatic-stroke)" : "hsl(var(--color-primary-400))"}
            stroke-width="2"
            vector-effect="non-scaling-stroke"
            className=${`transition-opacity duration-500 ${isUiActive ? "opacity-100" : "opacity-0"} ${isPrismaticEnabled ? "prismatic-anim" : ""}`}
          />
        </svg>

        <!-- 5. Interactive Hardware Controls (z-40) -->
        <div className="absolute flex items-center pointer-events-auto z-40" style=${{ top: '49%', left: '5.16%', right: '5.16%', height: '14%' }}>
          <div className="flex items-center gap-2.5 w-full">
            <div className="relative flex items-center group/scrub flex-1 h-5 md:h-6">
              <div className="absolute inset-0 rounded-md surface-hardware-track pointer-events-none" />
              <div className="absolute inset-[3px] rounded-sm overflow-hidden pointer-events-none">
                <div className=${`h-full w-0 ${isPrismaticEnabled ? "bg-prismatic-gradient bg-[length:200%_100%] prismatic-anim" : "bg-primary-400"}`} style=${{ width: `${progressPercent}%` }} />
              </div>
              <div className="absolute inset-0 rounded-md shadow-[inset_0_1px_3px_rgba(0,0,0,0.3),inset_0_-1px_1px_rgba(255,255,255,0.12)] pointer-events-none" />
              
              <div className="peer-focus-ring-prismatic" />
              <input 
                type="range" min="0" max=${duration || 0} value=${currentTime} 
                onChange=${handleScrubberChange}
                className="peer absolute inset-0 w-full h-full opacity-0 cursor-none z-30"
              />
            </div>
            <div className="flex items-center justify-center font-mono text-[9.5px] text-muted border border-transparent surface-hardware-track rounded-md shrink-0 px-1.5 min-w-[72px] h-5 md:h-6 bg-[#0c0d11]">
              <span>${formatTime(currentTime)} / ${formatTime(duration)}</span>
            </div>
          </div>
        </div>

        <div className="absolute flex items-center justify-between z-40 pointer-events-auto" style=${{ top: '67%', left: '5.16%', right: '5.16%', bottom: '7%' }}>
          <${ConsoleButton} label="Shuffle" onClick=${toggleShuffleState} active=${isShuffle} isPrismatic=${isPrismaticEnabled} className="w-[15%] aspect-square">
            <${Shuffle} className="w-[12px] h-[12px]" />
          </${ConsoleButton}>

          <${ConsoleButton} label="Previous" onClick=${handlePrev} isPrismatic=${isPrismaticEnabled} className="w-[17%] aspect-square">
            <${SkipBack} className="w-[14px] h-[14px]" fill="currentColor" />
          </${ConsoleButton}>

          <${ConsoleButton} label=${isPlaying ? "Pause" : "Play"} onClick=${togglePlay} active=${isPlaying} isPrismatic=${isPrismaticEnabled} className="w-[21%] aspect-square shadow-lg">
            ${isPlaying 
              ? html`<${Pause} className=${`w-[18px] h-[18px] transition-colors duration-300 ${isPrismaticEnabled ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "text-primary-400 drop-shadow-[0_0_8px_hsl(var(--color-primary-400)/1)]"}`} fill="currentColor" />`
              : html`<${Play} className="w-[18px] h-[18px] ml-0.5" fill="currentColor" />`
            }
          </${ConsoleButton}>

          <${ConsoleButton} label="Next" onClick=${handleNext} isPrismatic=${isPrismaticEnabled} className="w-[17%] aspect-square">
            <${SkipForward} className="w-[14px] h-[14px]" fill="currentColor" />
          </${ConsoleButton}>

          <div className="relative w-[15%] aspect-square flex items-center justify-center">
            <${ConsoleButton}
              id="volume-toggle-btn"
              label="Volume"
              onClick=${() => { setShowVolumePopover(!showVolumePopover); }}
              active=${showVolumePopover}
              isPrismatic=${isPrismaticEnabled}
              className="w-full h-full"
            >
              ${volume === 0 ? html`<${VolumeX} className="w-[12px] h-[12px]" />` : html`<${Volume2} className="w-[12px] h-[12px]" />`}
            </${ConsoleButton}>

            ${showVolumePopover && html`
              <div 
                ref=${popoverRef}
                className="absolute bottom-[115%] left-1/2 -translate-x-1/2 z-50 bg-transparent border-none overflow-visible p-0 cursor-none pb-3"
                onClick=${(e) => e.stopPropagation()}
              >
                <div className="w-12 h-[130px] bg-[#1a1a1f] border border-white/10 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] flex items-center justify-center p-2 relative z-10">
                  <div className="relative w-[114px] h-8 shrink-0 flex items-center group/vol -rotate-90 origin-center">
                    <div className="absolute inset-0 rounded-md surface-hardware-track pointer-events-none" />
                    <div className="absolute inset-[3px] rounded-sm overflow-hidden pointer-events-none">
                      <div className=${`h-full w-0 rounded-md ${isPrismaticEnabled ? "bg-prismatic-gradient bg-[length:200%_100%] prismatic-anim" : "bg-primary-400"}`} style=${{ width: `${(volume / 1) * 100}%` }} />
                    </div>
                    <div className="absolute inset-0 shadow-[inset_0_1px_3px_rgba(0,0,0,0.3),inset_0_-1px_1px_rgba(255,255,255,0.12)] rounded-md pointer-events-none" />
                    
                    <div className="peer-focus-ring-prismatic" />
                    <input 
                      type="range" min="0" max="1" step="0.01" value=${volume} 
                      onChange=${(e) => setVolume(parseFloat(e.target.value))}
                      className="peer absolute inset-0 w-full h-full opacity-0 cursor-none z-30" 
                    />
                  </div>
                </div>
              </div>
            `}
          </div>

        </div>

      </div>

    </div>
  `;
}

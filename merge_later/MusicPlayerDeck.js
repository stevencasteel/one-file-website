import React from 'react';
import htm from 'htm';
import { Music } from 'lucide-react';

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
  formatTime
}) {
  return html`
    <div class="shrink-0 bg-gradient-to-t from-panel to-[#0c0d11] flex flex-col border-t border-black p-4 gap-4 relative z-20">
      <div class="space-y-2">
        <div class="flex items-start gap-2.5 bg-void/50 p-2 rounded-lg border border-white/5">
          <div class="w-8 h-8 rounded bg-black border border-white/10 flex items-center justify-center shrink-0">
            <${Music} size=${14} class=${isPlaying ? 'animate-pulse text-[#22c55e]' : 'text-muted'} />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[9px] font-mono text-muted uppercase tracking-wider truncate">
              ${activeTrack.folder.replace(/_/g, ' ')}
            </p>
            <p class="text-xs text-white truncate font-bold font-mono">
              ${activeTrack.title.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
        
        <div class="space-y-1">
          <input 
            type="range" 
            min="0" 
            max=${duration || 0} 
            value=${currentTime} 
            onChange=${handleScrubberChange}
            class="w-full h-1 rounded-full appearance-none bg-void accent-primary cursor-none focus:outline-none"
            style=${{
              background: `linear-gradient(to right, #22c55e ${(currentTime / (duration || 1)) * 100}%, #111114 ${(currentTime / (duration || 1)) * 100}%)`
            }}
          />
          <div class="flex justify-between text-[10px] font-mono text-muted select-none">
            <span>${formatTime(currentTime)}</span>
            <span>${formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between gap-1">
        <button 
          onClick=${handlePrev} 
          class="p-2 rounded-lg bg-void/40 border border-white/5 hover:border-[#22c55e]/30 text-fog hover:text-white transition cursor-none"
          title="Previous"
        >
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
        </button>

        <button 
          onClick=${togglePlay} 
          class="p-2.5 rounded-full bg-void border border-white/10 hover:border-[#22c55e]/40 text-white transition hover:scale-105 cursor-none"
          title=${isPlaying ? "Pause" : "Play"}
        >
          ${isPlaying 
            ? html`<svg class="w-4 h-4 fill-current text-[#22c55e]" viewBox="0 0 24 24"><path d="M6 19h4V5H6v13zm8-14v13h4V5h-4z"/></svg>`
            : html`<svg class="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`
          }
        </button>

        <button 
          onClick=${handleNext} 
          class="p-2 rounded-lg bg-void/40 border border-white/5 hover:border-[#22c55e]/30 text-fog hover:text-white transition cursor-none"
          title="Next"
        >
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6zm9-12v12h2V6z" /></svg>
        </button>

        <button 
          onClick=${toggleShuffleState} 
          class=${`p-2 rounded-lg border transition duration-200 cursor-none text-[10px] font-mono ${isShuffle ? 'border-[#22c55e]/30 bg-[#22c55e]/5 text-[#22c55e]' : 'border-white/5 text-muted'}`}
          title="Shuffle"
        >
          SHUF
        </button>
      </div>

      <div class="flex items-center gap-2 bg-void/20 p-1.5 rounded-lg border border-white/5">
        <svg class="w-3 h-3 text-muted shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value=${volume} 
          onChange=${(e) => setVolume(parseFloat(e.target.value))}
          class="w-full h-1 bg-void rounded-lg appearance-none accent-primary cursor-none"
        />
      </div>
    </div>
  `;
}

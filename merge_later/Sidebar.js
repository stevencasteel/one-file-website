import React from 'react';
import htm from 'htm';
import { Menu, Music, ChevronRight } from 'lucide-react';
import { MusicPlayerDeck } from './MusicPlayerDeck.js';
import { audioEngine } from './AudioEngine.js';

const html = htm.bind(React.createElement);

const NAV_SECTIONS = [
  {
    group: "Portfolio",
    items: [
      { id: "misc-art", label: "Misc Art" }
    ]
  },
  {
    group: "Interests",
    items: [
      { id: "misc-media", label: "Misc Media" }
    ]
  }
];

export function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  activeSection,
  handleNavigation,
  playerProps,
  onOpenConsole
}) {
  const handleNavClick = (targetId) => {
    audioEngine.playSFX("https://www.stevencasteel.com/assets/audio/sfx/navbar_header_button_click.mp3", 0.35);
    handleNavigation(targetId);
  };

  return html`
    <div class="contents">
      <!-- MOBILE HEADER -->
      <header class="md:hidden fixed top-0 left-0 w-full h-14 bg-gradient-to-b from-panel to-void z-[60] border-b border-black shadow-lg pr-4 pl-4 flex justify-between items-center cursor-none">
        <button 
          onClick=${() => handleNavClick("audio")}
          class="text-fog hover:text-white text-xs font-bold tracking-widest uppercase font-mono cursor-none"
        >
          SC // 2026
        </button>
        <button 
          onClick=${() => setIsSidebarOpen(!isSidebarOpen)}
          class="text-white p-1.5 cursor-none outline-none"
        >
          <${Menu} size=${20} />
        </button>
      </header>

      <!-- NAVIGATION SIDEBAR PANEL -->
      <aside class=${`fixed top-14 md:top-0 left-0 h-[calc(100dvh-56px)] md:h-[100dvh] w-64 bg-ink border-r border-white/5 z-50 flex flex-col cursor-none transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <!-- Sunken Hardware-Style Toggle well -->
        <div class="p-4 lg:p-5 border-b border-black hidden md:block shrink-0 relative z-20">
          <div class="relative w-full rounded-lg surface-hardware-well p-[2.5px] isolate">
            <button 
              onPointerDown=${() => audioEngine.playSFX("https://www.stevencasteel.com/assets/audio/sfx/navbar_header_button_click.mp3", 0.4)}
              onPointerUp=${() => {
                audioEngine.playSFX("https://www.stevencasteel.com/assets/audio/sfx/navbar_header_button_release.mp3", 0.4);
                handleNavigation("audio");
              }}
              class="group relative flex items-center justify-center text-xs font-bold tracking-widest uppercase font-display w-full h-[38px] rounded-[5px] text-center transition-all duration-150 cursor-none overflow-hidden isolate outline-none surface-hardware-btn"
            >
              <div class="absolute inset-0 pointer-events-none transition-opacity duration-300 bg-primary/5 opacity-0 group-hover:opacity-100 z-0" />
              
              <!-- Standard Text Layer (Green Glow Hover State) -->
              <span class="relative z-10 transition-colors duration-300 text-fog group-hover:text-primary-400">
                SC // 2026
              </span>

              <!-- Animated Illuminated Prismatic Foil (Hover Sweep) -->
              <span class="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-prismatic-foil font-bold">
                SC // 2026
              </span>
            </button>
          </div>
        </div>

        <!-- Navigation Tree -->
        <nav class="flex-1 px-4 py-6 space-y-6 overflow-y-auto custom-scrollbar relative z-10 select-none">
          <!-- System Control Group -->
          <div>
            <div class="px-2 mb-2">
              <h3 class="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">/ Control Deck</h3>
            </div>
            <ul class="space-y-1">
              <li>
                <button 
                  onClick=${() => handleNavClick("audio")}
                  class=${`flex items-center gap-2.5 px-3 py-2 text-sm rounded-md w-full text-left transition duration-200 cursor-none ${activeSection === 'audio' ? 'text-primary font-bold bg-white/5' : 'text-fog hover:text-white'}`}
                >
                  <${Music} size=${16} />
                  <span>System Console</span>
                </button>
              </li>
            </ul>
          </div>

          <!-- Programmatically Rendered Group Sections -->
          ${NAV_SECTIONS.map((sec) => html`
            <div key=${sec.group}>
              <div class="px-2 mb-2 border-t border-white/5 pt-4">
                <h3 class="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">/ ${sec.group}</h3>
              </div>
              <ul class="space-y-1">
                ${sec.items.map((item) => html`
                  <li key=${item.id}>
                    <button 
                      onClick=${() => handleNavClick(item.id)}
                      class=${`flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-md w-full text-left transition duration-200 cursor-none ${activeSection === item.id ? 'text-white font-bold bg-white/5' : 'text-fog hover:text-white'}`}
                    >
                      <${ChevronRight} size=${12} class=${activeSection === item.id ? 'text-primary' : 'text-muted'} />
                      <span>${item.label}</span>
                    </button>
                  </li>
                `)}
              </ul>
            </div>
          `)}
        </nav>

        <!-- Tall Sidebar Music Player Deck -->
        <${MusicPlayerDeck} ...${playerProps} onOpenConsole=${onOpenConsole} />
      </aside>
    </div>
  `;
}

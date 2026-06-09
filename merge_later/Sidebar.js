import React from 'react';
import htm from 'htm';
import { Menu, Music, ChevronRight } from 'lucide-react';
import { MusicPlayerDeck } from './MusicPlayerDeck.js';

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
  playSFX,
  playerProps
}) {
  return html`
    <div class="contents">
      <!-- ── MOBILE HEADER ── -->
      <header class="md:hidden fixed top-0 left-0 w-full h-14 bg-gradient-to-b from-panel to-void z-[60] border-b border-black shadow-lg pr-4 pl-4 flex justify-between items-center cursor-none">
        <button 
          onPointerDown=${() => { playSFX("click"); handleNavigation("audio"); }}
          onPointerUp=${() => playSFX("release")}
          class="text-fog hover:text-white text-xs font-bold tracking-widest uppercase font-mono cursor-none"
        >
          YOUR NAME // 2026
        </button>
        <button 
          onClick=${() => setIsSidebarOpen(!isSidebarOpen)}
          class="text-white p-1.5 cursor-none outline-none"
        >
          <${Menu} size=${20} />
        </button>
      </header>

      <!-- ── NAVIGATION SIDEBAR PANEL ── -->
      <aside class=${`fixed top-14 md:top-0 left-0 h-[calc(100dvh-56px)] md:h-[100dvh] w-64 bg-ink border-r border-white/5 z-50 flex flex-col cursor-none transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <!-- Logo Button -->
        <div class="p-4 lg:p-5 bg-gradient-to-b from-panel to-[#0c0d11] border-b border-black shadow-inner hidden md:flex items-center gap-3 shrink-0 relative z-20">
          <button 
            onPointerDown=${() => { playSFX("click"); handleNavigation("audio"); }}
            onPointerUp=${() => playSFX("release")}
            class="w-full text-center text-xs font-bold tracking-widest uppercase font-mono border border-white/10 rounded-lg py-2.5 hover:border-primary/40 transition duration-300 cursor-none text-primary"
          >
            YN // 2026
          </button>
        </div>

        <!-- Navigation Tree -->
        <nav class="flex-1 px-4 py-6 space-y-6 overflow-y-auto custom-scrollbar relative z-10 select-none">
          <!-- System Console Group -->
          <div>
            <div class="px-2 mb-2">
              <h3 class="text-[10px] font-mono font-bold text-muted uppercase tracking-widest">/ Control Deck</h3>
            </div>
            <ul class="space-y-1">
              <li>
                <button 
                  onClick=${() => handleNavigation("audio")}
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
                      onClick=${() => handleNavigation(item.id)}
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
        <${MusicPlayerDeck} ...${playerProps} />
      </aside>
    </div>
  `;
}

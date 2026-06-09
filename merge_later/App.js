import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import htm from 'htm';
import Lenis from 'lenis';

// Import configurations from data module
import { AUDIO_TRACKS } from 'media-data';

// Import isolated components from merge_later
import { ProtocolWarning } from './ProtocolWarning.js';
import { GlobalScrollbar } from './GlobalScrollbar.js';
import { Sidebar } from './Sidebar.js';
import { HeroHeader } from './HeroHeader.js';
import { MainContent } from './MainContent.js';
import { audioEngine } from './AudioEngine.js';
import { AudioConsoleModal } from './AudioConsoleModal.js';

const html = htm.bind(React.createElement);

function getShuffledIndices(length) {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── MAIN APP COMPONENT ───────────────────────────────────────────────────
function App() {
  // Lightbox / Modal Context
  const [lightbox, setLightbox] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("audio");

  const [seqStep, setSeqStep] = useState("line1");
  const [lenis, setLenis] = useState(null);

  // Audio Player Context
  const audioElRef = useRef(null);
  const [playerState, setPlayerState] = useState(() => {
    const savedShuffle = localStorage.getItem('mesoelfy_player_shuffle');
    const useShuffle = savedShuffle !== null ? savedShuffle === 'true' : true;
    const queue = useShuffle
      ? getShuffledIndices(AUDIO_TRACKS.length)
      : Array.from({ length: AUDIO_TRACKS.length }, (_, i) => i);
    const savedTrackIdx = localStorage.getItem('mesoelfy_player_track_index');
    let startTrackIdx = 0;
    if (savedTrackIdx !== null) {
      const idx = parseInt(savedTrackIdx, 10);
      if (idx >= 0 && idx < AUDIO_TRACKS.length) {
        startTrackIdx = idx;
      }
    }
    const queueIdx = queue.indexOf(startTrackIdx);
    const currentIdx = queueIdx >= 0 ? queueIdx : 0;
    return { queue, currentIdx };
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('mesoelfy_player_volume');
    return savedVolume !== null ? parseFloat(savedVolume) : 0.75;
  });
  const [isShuffle, setIsShuffle] = useState(() => {
    const savedShuffle = localStorage.getItem('mesoelfy_player_shuffle');
    return savedShuffle !== null ? savedShuffle === 'true' : true;
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Initialize / Restore Audio Context dynamically on user interaction
  const ensureAudioInitialized = () => {
    if (!audioEngine.isInitialized && audioElRef.current) {
      audioEngine.init(audioElRef.current);
      audioEngine.setVolume("master", 1.0);
      audioEngine.setVolume("music", volume);
      audioEngine.setVolume("sfx", 0.8);
      audioEngine.setVolume("ambience", 0.5);
    }
    if (audioEngine.ctx && audioEngine.ctx.state === 'suspended') {
      audioEngine.ctx.resume().catch(() => {});
    }
  };

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    const lenisInst = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.15
    });

    function raf(time) {
      lenisInst.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    setLenis(lenisInst);

    return () => {
      lenisInst.destroy();
    };
  }, []);

  // Active Section Tracker (Scroll Spy Setup)
  useEffect(() => {
    const handleSpy = () => {
      const sections = [
        "misc-art", "misc-media"
      ];
      let current = "audio";
      for (const s of sections) {
        const el = document.getElementById(s);
        if (el) {
          const htmlRect = el.getBoundingClientRect();
          if (htmlRect.top <= window.innerHeight * 0.40) {
            current = s;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleSpy);
    return () => window.removeEventListener("scroll", handleSpy);
  }, []);

  useEffect(() => {
    const savedPosition = localStorage.getItem('mesoelfy_player_position');
    const savedAutoplay = localStorage.getItem('mesoelfy_player_autoplay');

    if (savedPosition !== null && audioElRef.current) {
      audioElRef.current.currentTime = parseFloat(savedPosition);
    }

    const handleUnlock = () => {
      if (savedAutoplay === 'true' && audioElRef.current) {
        ensureAudioInitialized();
        audioElRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
      document.removeEventListener('click', handleUnlock);
    };
    document.addEventListener('click', handleUnlock);

    return () => document.removeEventListener('click', handleUnlock);
  }, []);

  const activeTrackIdx = playerState.queue[playerState.currentIdx] !== undefined ? playerState.queue[playerState.currentIdx] : 0;
  const activeTrack = AUDIO_TRACKS[activeTrackIdx] || AUDIO_TRACKS[0];

  // Track updates
  useEffect(() => {
    if (!audioElRef.current) return;
    localStorage.setItem('mesoelfy_player_track_index', activeTrackIdx.toString());
    audioElRef.current.load();
    if (isPlaying) {
      audioElRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [activeTrackIdx]);

  useEffect(() => {
    if (audioElRef.current) {
      audioElRef.current.volume = volume;
      localStorage.setItem('mesoelfy_player_volume', volume.toString());
      if (audioEngine.isInitialized) {
        audioEngine.setVolume("music", volume);
      }
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioElRef.current) return;
    ensureAudioInitialized();
    if (isPlaying) {
      audioElRef.current.pause();
      setIsPlaying(false);
      localStorage.setItem('mesoelfy_player_autoplay', 'false');
    } else {
      audioElRef.current.play()
        .then(() => {
          setIsPlaying(true);
          localStorage.setItem('mesoelfy_player_autoplay', 'true');
        })
        .catch((err) => console.log("Play failed: interaction required", err));
    }
  };

  const handleNext = () => {
    if (playerState.queue.length === 0) return;
    ensureAudioInitialized();
    setPlayerState((prev) => ({
      ...prev,
      currentIdx: (prev.currentIdx + 1) % prev.queue.length
    }));
  };

  const handlePrev = () => {
    if (playerState.queue.length === 0) return;
    ensureAudioInitialized();
    setPlayerState((prev) => ({
      ...prev,
      currentIdx: (prev.currentIdx - 1 + prev.queue.length) % prev.queue.length
    }));
  };

  const handleTimeUpdate = () => {
    if (audioElRef.current) {
      setCurrentTime(audioElRef.current.currentTime);
      localStorage.setItem('mesoelfy_player_position', audioElRef.current.currentTime.toString());
    }
  };

  const handleLoadedMetadata = () => {
    if (audioElRef.current) {
      setDuration(audioElRef.current.duration);
    }
  };

  const handleScrubberChange = (e) => {
    const val = parseFloat(e.target.value);
    ensureAudioInitialized();
    if (audioElRef.current) {
      audioElRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const toggleShuffleState = () => {
    const targetState = !isShuffle;
    ensureAudioInitialized();
    setIsShuffle(targetState);
    localStorage.setItem('mesoelfy_player_shuffle', targetState.toString());
    
    let newQueue = [];
    if (targetState) {
      newQueue = getShuffledIndices(AUDIO_TRACKS.length);
      const activeIndexInNew = newQueue.indexOf(activeTrackIdx);
      if (activeIndexInNew >= 0) {
        newQueue.splice(activeIndexInNew, 1);
        newQueue.unshift(activeTrackIdx);
      }
    } else {
      newQueue = Array.from({ length: AUDIO_TRACKS.length }, (_, i) => i);
    }
    setPlayerState({
      queue: newQueue,
      currentIdx: 0
    });
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Navigation Link Scrolling Coordinator
  const handleNavigation = (targetId) => {
    setIsSidebarOpen(false);
    if (targetId === "audio") {
      if (lenis) {
        lenis.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    const target = document.getElementById(targetId);
    if (target) {
      if (lenis) {
        lenis.scrollTo(target, { offset: -32 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const playerProps = {
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
  };

  return html`
    <div class="relative w-full flex flex-col md:flex-row min-h-screen" onClick=${ensureAudioInitialized}>
      <${ProtocolWarning} />
      <audio 
        ref=${audioElRef} 
        src="https://www.stevencasteel.com/assets/audio/music/elf_girl/${activeTrack.folder}/${activeTrack.name}"
        crossOrigin="anonymous"
        onTimeUpdate=${handleTimeUpdate}
        onLoadedMetadata=${handleLoadedMetadata}
        onEnded=${handleNext}
      />

      <!-- ── NAVIGATION & HEADER SYSTEM ── -->
      <${Sidebar} 
        isSidebarOpen=${isSidebarOpen}
        setIsSidebarOpen=${setIsSidebarOpen}
        activeSection=${activeSection}
        handleNavigation=${handleNavigation}
        playerProps=${playerProps}
        onOpenConsole=${() => { ensureAudioInitialized(); setIsConsoleOpen(true); }}
      />

      <!-- ── MAIN CONTENT ZONE ── -->
      <div class="flex-1 md:pl-64 min-w-0 pb-20 pt-14 md:pt-0">
        <${HeroHeader} 
          seqStep=${seqStep}
          setSeqStep=${setSeqStep}
        />

        <${MainContent} 
          setLightbox=${setLightbox}
        />
      </div>

      <!-- ── GLOBAL CUSTOM SCROLLBAR ── -->
      <${GlobalScrollbar} lenisInstance=${lenis} />

      <!-- ── LIGHTBOX MODAL PORTAL ── -->
      ${lightbox && html`
        <div 
          onClick=${() => setLightbox(null)}
          class="fixed inset-0 bg-void/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 transition-opacity duration-300 cursor-none"
        >
          <div class="relative max-w-full max-h-full flex items-center justify-center select-none animate-lightbox-entry">
            <img 
              src=${lightbox.src} 
              alt=${lightbox.alt} 
              class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg border border-white/10 shadow-2xl"
            />
            <div class="absolute -top-12 right-0 text-white font-mono text-xs tracking-widest uppercase">
              Click anywhere to close
            </div>
          </div>
        </div>
      `}

      <!-- ── FULL SCREEN AUDIO CONSOLE MIXER MODAL ── -->
      <${AudioConsoleModal} 
        isOpen=${isConsoleOpen}
        onClose=${() => setIsConsoleOpen(false)}
        activeTrack=${activeTrack}
        isPlaying=${isPlaying}
        currentTime=${currentTime}
        duration=${duration}
        volume=${volume}
        isShuffle=${isShuffle}
        handleScrubberChange=${handleScrubberChange}
        handlePrev=${handlePrev}
        togglePlay=${togglePlay}
        handleNext=${handleNext}
        toggleShuffleState=${toggleShuffleState}
        setVolume=${setVolume}
        formatTime=${formatTime}
        playTrackByIndex=${(idx) => {
          setPlayerState(prev => ({ ...prev, currentIdx: idx }));
          setIsPlaying(true);
        }}
      />

    </div>
  `;
}

// Mount System
const rootNode = ReactDOM.createRoot(document.getElementById('root'));
rootNode.render(React.createElement(App));

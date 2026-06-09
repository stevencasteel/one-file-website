import React, { useState, useLayoutEffect, useRef } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

export function GlobalScrollbar({ lenisInstance }) {
  const [scrollY, setScrollY] = useState(0);
  const [maxScrollY, setMaxScrollY] = useState(3000);
  const [scrollOffset, setScrollOffset] = useState(380);
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const trackRef = useRef(null);
  const thumbRef = useRef(null);

  useLayoutEffect(() => {
    const handleScroll = () => {
      const hero = document.getElementById('hero-header');
      const offset = hero ? (hero.offsetTop + hero.offsetHeight) : 380;
      setScrollOffset(offset);
      setScrollY(window.scrollY);
      setMaxScrollY(document.documentElement.scrollHeight - window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    window.addEventListener('load', handleScroll);
    handleScroll();
    
    const t1 = setTimeout(handleScroll, 100);
    const t2 = setTimeout(handleScroll, 500);
    const t3 = setTimeout(handleScroll, 1200);
    const t4 = setTimeout(handleScroll, 2500);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      window.removeEventListener('load', handleScroll);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const progress = maxScrollY > 0 ? scrollY / maxScrollY : 0;
  
  const trackTopOffset = (window.innerWidth >= 768 ? 0 : 56) + 24;
  
  const trackHeight = trackRef.current ? trackRef.current.clientHeight : 1;
  const thumbHeight = thumbRef.current ? thumbRef.current.clientHeight : 0;
  const usableHeight = Math.max(1, trackHeight - thumbHeight);
  
  const heroBottomPadding = 8;
  const threshold = Math.max(0, scrollOffset + heroBottomPadding - trackTopOffset);
  const initialProgress = Math.max(0, Math.min(1, (scrollOffset + heroBottomPadding - trackTopOffset) / usableHeight));
  
  let clampedProgress = initialProgress;
  if (scrollY >= threshold) {
    const remainingScroll = maxScrollY - threshold;
    const progressInRemaining = remainingScroll > 0 ? (scrollY - threshold) / remainingScroll : 1;
    clampedProgress = initialProgress + (1 - initialProgress) * progressInRemaining;
  }
  clampedProgress = Math.max(0, Math.min(1, clampedProgress));

  const handleTrackClick = (e) => {
    if (!trackRef.current || !thumbRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const thumbRect = thumbRef.current.getBoundingClientRect();
    const thumbHeight = thumbRect.height;
    const clickY = e.clientY - rect.top;
    
    const usableHeight = rect.height - thumbHeight;
    let ratio = 0;
    if (usableHeight > 0) {
      ratio = Math.max(0, Math.min(1, (clickY - thumbHeight / 2) / usableHeight));
    }
    const targetY = ratio * maxScrollY;
    
    if (lenisInstance) {
      lenisInstance.scrollTo(targetY);
    } else {
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.body.style.userSelect = 'none';

    const startY = e.clientY;
    const startScroll = window.scrollY;
    const capturedMax = maxScrollY;

    const handlePointerMove = (moveEvent) => {
      if (!trackRef.current || !thumbRef.current) return;
      const deltaY = moveEvent.clientY - startY;
      const trackHeight = trackRef.current.clientHeight;
      const thumbHeight = thumbRef.current.clientHeight;
      const usableHeight = trackHeight - thumbHeight;
      
      let scrollDelta = 0;
      if (usableHeight > 0) {
        scrollDelta = (deltaY / usableHeight) * capturedMax;
      }
      const targetY = Math.max(0, Math.min(capturedMax, startScroll + scrollDelta));
      
      if (lenisInstance) {
        lenisInstance.scrollTo(targetY, { immediate: true });
      } else {
        window.scrollTo(0, targetY);
      }
    };

    const handlePointerUp = () => {
      document.body.style.userSelect = '';
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  const trackTop = window.innerWidth >= 768 ? 0 : 56;

  return html`
    <div class="global-scrollbar fixed inset-y-0 right-0 z-[80] w-[18px] md:w-12 pointer-events-none group transition-opacity duration-300">
      <div 
        ref=${trackRef}
        onPointerDown=${handleTrackClick}
        class="absolute left-0 right-0 pointer-events-auto touch-none"
        style=${{ top: `${trackTop + 24}px`, bottom: '8px' }}
      >
        <div 
          ref=${thumbRef}
          onPointerDown=${handlePointerDown}
          class="absolute left-[3px] right-[3px] md:left-[8px] md:right-[8px] aspect-[492/1299] pointer-events-auto touch-none select-none group transition-opacity duration-300"
          style=${{
            top: `${clampedProgress * 100}%`,
            transform: `translateY(-${clampedProgress * 100}%)`,
            willChange: 'top, transform'
          }}
        >
          <div class="relative w-full h-full">
            <img 
              src="https://www.stevencasteel.com/assets/brand/scrollbar.png" 
              alt="Scrollbar Thumb"
              onLoad=${() => setIsImgLoaded(true)}
              class="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-10"
              style=${{ opacity: isImgLoaded ? 1 : 0 }}
              draggable="false"
            />
            <div class="absolute inset-[2px] rounded-full opacity-0 group-hover:opacity-[0.15] transition-opacity duration-500 z-20 pointer-events-none blur-[4px] bg-primary-400" />
            <div 
              class="absolute opacity-90 z-30 pointer-events-none rounded-[1.5px] bg-primary-400 shadow-[0_0_8px_#22c55e]"
              style=${{
                left: "8%",
                width: "84%",
                top: "calc(50% - 1px)",
                height: "3px"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  `;
}

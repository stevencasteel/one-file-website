import React, { useState, useEffect, useRef } from 'react';
import htm from 'htm';
import anime from 'animejs';

const html = htm.bind(React.createElement);

export function ScrambleText({ text, delay = 0, onComplete, enabled = true }) {
  const [displayText, setDisplayText] = useState("");
  const DEFAULT_CHARS = "-_~=+*!@#%&<>";
  const settleDuration = 100;

  useEffect(() => {
    if (!enabled) {
      const scrambledPlaceholder = Array.from({ length: text.length }, () => 
        DEFAULT_CHARS[Math.floor(Math.random() * DEFAULT_CHARS.length)]
      ).join("");
      setDisplayText(scrambledPlaceholder);
      return;
    }

    const stepRevealTime = 90;
    const totalRevealTime = text.length * stepRevealTime;
    const totalDuration = totalRevealTime + settleDuration;
    const animObj = { time: 0 };

    let timeoutId = setTimeout(() => {
      anime({
        targets: animObj,
        time: totalDuration,
        duration: totalDuration,
        easing: 'linear',
        update: () => {
          const elapsed = animObj.time;
          let result = "";
          for (let i = 0; i < text.length; i++) {
            const revealTriggerTime = i * stepRevealTime;
            if (elapsed < revealTriggerTime) {
              result += DEFAULT_CHARS[Math.floor(Math.random() * DEFAULT_CHARS.length)];
            } else if (elapsed < revealTriggerTime + settleDuration) {
              result += DEFAULT_CHARS[Math.floor(Math.random() * DEFAULT_CHARS.length)];
            } else {
              result += text[i];
            }
          }
          setDisplayText(result);
        },
        complete: () => {
          setDisplayText(text);
          if (onComplete) onComplete();
        }
      });
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [text, delay, enabled]);

  return html`<span class="select-none inline-block">${displayText}</span>`;
}

export function TypedLog({ text, speed = 40, delay = 0, enabled = false, onComplete }) {
  const [displayed, setDisplayed] = useState("");
  const cursorRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    let timeoutId = setTimeout(() => {
      if (cursorRef.current) {
        cursorRef.current.style.opacity = "1";
      }

      let currentIndex = 0;
      let currentStr = "";
      const intervalId = setInterval(() => {
        if (currentIndex < text.length) {
          currentStr += text[currentIndex];
          setDisplayed(currentStr);
          currentIndex++;
        } else {
          clearInterval(intervalId);
          if (cursorRef.current) {
            cursorRef.current.style.visibility = "hidden";
          }
          if (onComplete) onComplete();
        }
      }, speed);

      return () => clearInterval(intervalId);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [text, speed, delay, enabled]);

  return html`
    <span style=${{ textShadow: '0 0 4px currentColor' }}>
      ${displayed}
      <span 
        ref=${cursorRef}
        class="w-2 h-[1.1em] bg-current inline-block ml-1 align-middle -translate-y-[2px] relative z-10 animate-phosphor shadow-[0_0_8px_currentColor]"
        style=${{ opacity: 0, transition: 'opacity 0.2s ease' }}
      />
    </span>
  `;
}

export function GlassContainer({ children, className = "" }) {
  const borderClass = "border-white/10";
  const bgClass = "bg-panel";

  return html`
    <div class="relative rounded-xl border shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 ${borderClass} ${bgClass} ${className}">
      <div class="relative z-10 w-full h-full">
        ${children}
      </div>
    </div>
  `;
}

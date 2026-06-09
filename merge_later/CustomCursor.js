import { audioEngine } from './AudioEngine.js';

window.addEventListener('DOMContentLoaded', () => {
  const globalCursor = document.getElementById('custom-cursor');
  const arrow = document.getElementById('cursor-arrow');
  const ibeam = document.getElementById('cursor-ibeam');
  if (!globalCursor || !arrow || !ibeam) return;

  document.addEventListener('pointermove', (e) => {
    globalCursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
  });

  document.addEventListener('pointerdown', () => {
    arrow.style.transform = 'scale(0.82)';
    ibeam.style.transform = 'scale(0.82)';
  });
  document.addEventListener('pointerup', () => {
    arrow.style.transform = 'scale(1)';
    ibeam.style.transform = 'scale(1)';
  });

  document.addEventListener('mouseover', (e) => {
    const target = e.target;
    if (!target) return;

    const isCustomHover = target.closest('[data-custom-hover="true"]');
    const isRangeInput = target.tagName.toLowerCase() === 'input' && target.type === 'range';
    const isInteractive =
      target.closest('a') ||
      target.closest('button') ||
      target.closest('[role="button"]') ||
      target.classList.contains('cursor-pointer') ||
      isRangeInput;
    const isWarningScreen = target.closest('#protocol-warning');

    // Ignore text cursors in hardware components
    const isHardwareTrack =
      target.closest('.surface-hardware-track') ||
      target.closest('.group\\/vol') ||
      target.closest('.group\\/scrub');
    const isText =
      (['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'textarea'].includes(
        target.tagName.toLowerCase()
      ) ||
        (target.tagName.toLowerCase() === 'input' && !isRangeInput)) &&
      !isHardwareTrack;

    if (isInteractive && !isWarningScreen && !isCustomHover) {
      audioEngine.playHover();
    } else if (isText && !isInteractive && !isWarningScreen) {
      audioEngine.playInnerTick();
    }

    if (isText && !isInteractive && !isWarningScreen) {
      arrow.style.display = 'none';
      ibeam.style.display = 'block';
    } else {
      arrow.style.display = 'block';
      ibeam.style.display = 'none';
    }
  });
});

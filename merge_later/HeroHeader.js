import React from 'react';
import htm from 'htm';
import { ScrambleText, TypedLog, GlassContainer } from './components.js';

const html = htm.bind(React.createElement);

export function HeroHeader({ seqStep, setSeqStep }) {
  return html`
    <header id="hero-header" class="relative w-full py-[72px] pl-1.5 pr-[18px] md:px-12 bg-grid-pattern border-b border-white/10 flex flex-col items-center justify-center text-center overflow-hidden">
      <div 
        aria-hidden="true"
        class="absolute inset-0 pointer-events-none select-none overflow-hidden"
      >
        <div 
          class="absolute inset-0 opacity-40"
          style=${{
            filter: "blur(80px)",
            WebkitFilter: "blur(80px)",
            transform: "translate3d(0, 0, 0)",
            background: "radial-gradient(circle, rgba(34,197,94,0.18) 0%, transparent 65%)"
          }}
        />
      </div>

      <div class="relative w-full mb-4 flex flex-row items-center justify-center select-none leading-none">
        <h1 
          class="text-[clamp(2.75rem,14vw,4.75rem)] md:text-[10vw] leading-[0.9] md:leading-[0.85] font-display font-bold tracking-[0.09em] md:tracking-[0.165em] uppercase text-white flex flex-row items-center justify-center gap-[0.25em] whitespace-nowrap"
        >
          <div class="inline-block">
            <${ScrambleText} 
              text="YOUR" 
              delay=${200} 
              enabled=${true} 
              onComplete=${() => setSeqStep("line2")} 
            />
          </div>
          <div class=${`inline-block transition-all duration-300 ${seqStep === "typing" ? 'text-prismatic-foil' : 'text-primary'}`}>
            <${ScrambleText} 
              text="NAME" 
              delay=${0} 
              enabled=${seqStep !== "line1"} 
              onComplete=${() => setSeqStep("typing")} 
            />
          </div>
        </h1>
      </div>

      <div class="mt-8 flex flex-col md:flex-row items-center justify-center gap-4 w-full relative z-10 select-none">
        <${GlassContainer} 
          className="inline-flex items-center px-5 py-3 min-h-[46px]"
        >
          <span class="flex items-center justify-center gap-2 font-mono text-[10px] min-[380px]:text-xs md:text-sm leading-normal tracking-wider uppercase text-light flex-wrap md:flex-nowrap">
            <${TypedLog} 
              text="📟 Digital Media Generalist | Creative Director of AI 🤖" 
              speed=${40} 
              delay=${0} 
              enabled=${seqStep === "typing"} 
            />
          </span>
        </${GlassContainer}>

        <${GlassContainer} 
          className="inline-flex items-center px-5 py-3 min-h-[46px]"
        >
          <span class="flex items-center justify-center gap-2 font-mono text-[10px] min-[380px]:text-xs md:text-sm leading-normal tracking-wider uppercase text-light flex-wrap md:flex-nowrap">
            <span class="text-emerald-400 font-bold">PAGEVIEWS:</span>
            <span>000,000</span>
          </span>
        </${GlassContainer}>
      </div>
    </header>
  `;
}

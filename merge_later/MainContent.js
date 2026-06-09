import React from 'react';
import htm from 'htm';
import { MISC_ART, MISC_MEDIA } from 'media-data';
import { GlassContainer } from './components.js';

const html = htm.bind(React.createElement);

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const SHUFFLED_ART = shuffleArray(MISC_ART);
const SHUFFLED_MEDIA = shuffleArray(MISC_MEDIA);

const getMediaTitle = (url) => {
  try {
    const parts = url.split("/");
    const file = parts[parts.length - 1];
    const name = file.substring(0, file.lastIndexOf("."));
    return name
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  } catch (e) {
    return "Digital Media Asset";
  }
};

export function MainContent({ setLightbox }) {
  const cols4 = [[], [], [], []];
  SHUFFLED_ART.forEach((url, i) => cols4[i % 4].push(url));

  const cols3 = [[], [], []];
  SHUFFLED_ART.forEach((url, i) => cols3[i % 3].push(url));

  const cols2 = [[], []];
  SHUFFLED_ART.forEach((url, i) => cols2[i % 2].push(url));

  return html`
    <main class="w-full py-12 flex flex-col gap-16 relative z-10">
      
      <!-- ── PORTFOLIO SECTION ── -->
      <section id="misc-art" class="space-y-16 scroll-mt-20 pl-1.5 pr-[18px] md:px-12">
        <div class="border-b border-white/10 pb-4">
          <h2 class="text-4xl font-display font-black uppercase text-white tracking-tight">PORTFOLIO</h2>
        </div>

        <div class="space-y-6">
          <h3 class="text-xl font-display font-bold uppercase tracking-wider text-fog">// Misc Art</h3>
          
          <!-- Responsive 4-Column Grid -->
          <div class="hidden lg:grid grid-cols-4 gap-4">
            ${cols4.map(col => html`
              <div class="flex flex-col gap-4">
                ${col.map(url => html`
                  <div 
                    key=${url} 
                    onClick=${() => setLightbox({ src: url, alt: getMediaTitle(url) })}
                    class="relative transform hover:scale-[1.03] transition-all duration-300 hover:z-20 cursor-none"
                  >
                    <${GlassContainer} className="overflow-hidden prismatic-border-hover">
                      <img 
                        src=${url} 
                        alt=${getMediaTitle(url)} 
                        class="w-full h-auto block"
                        loading="lazy"
                      />
                    </${GlassContainer}>
                  </div>
                `)}
              </div>
            `)}
          </div>

          <!-- Responsive 3-Column Grid -->
          <div class="hidden sm:grid lg:hidden grid-cols-3 gap-4">
            ${cols3.map(col => html`
              <div class="flex flex-col gap-4">
                ${col.map(url => html`
                  <div 
                    key=${url} 
                    onClick=${() => setLightbox({ src: url, alt: getMediaTitle(url) })}
                    class="relative transform hover:scale-[1.03] transition-all duration-300 hover:z-20 cursor-none"
                  >
                    <${GlassContainer} className="overflow-hidden prismatic-border-hover">
                      <img 
                        src=${url} 
                        alt=${getMediaTitle(url)} 
                        class="w-full h-auto block"
                        loading="lazy"
                      />
                    </${GlassContainer}>
                  </div>
                `)}
              </div>
            `)}
          </div>

          <!-- Responsive 2-Column Grid -->
          <div class="grid sm:hidden grid-cols-2 gap-4">
            ${cols2.map(col => html`
              <div class="flex flex-col gap-4">
                ${col.map(url => html`
                  <div 
                    key=${url} 
                    onClick=${() => setLightbox({ src: url, alt: getMediaTitle(url) })}
                    class="relative transform hover:scale-[1.03] transition-all duration-300 hover:z-20 cursor-none"
                  >
                    <${GlassContainer} className="overflow-hidden prismatic-border-hover">
                      <img 
                        src=${url} 
                        alt=${getMediaTitle(url)} 
                        class="w-full h-auto block"
                        loading="lazy"
                      />
                    </${GlassContainer}>
                  </div>
                `)}
              </div>
            `)}
          </div>

        </div>
      </section>

      <!-- ── INTERESTS SECTION ── -->
      <section id="misc-media" class="space-y-16 scroll-mt-20 pl-1.5 pr-[18px] md:px-12">
        <div class="border-b border-white/10 pb-4">
          <h2 class="text-4xl font-display font-black uppercase text-white tracking-tight">INTERESTS</h2>
        </div>

        <div class="space-y-6">
          <h3 class="text-xl font-display font-bold uppercase tracking-wider text-fog">// Misc Media</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-4">
            ${SHUFFLED_MEDIA.map((url) => html`
              <div 
                key=${url} 
                onClick=${() => setLightbox({ src: url, alt: getMediaTitle(url) })}
                class="aspect-[2/3] transform hover:scale-[1.05] hover:z-20 transition-all duration-300"
              >
                <${GlassContainer} 
                  className="w-full h-full overflow-hidden prismatic-border-hover"
                >
                  <img 
                    src=${url} 
                    alt=${getMediaTitle(url)} 
                    class="w-full h-full object-cover block"
                    loading="lazy"
                  />
                </${GlassContainer}>
              </div>
            `)}
          </div>
        </div>
      </section>

    </main>
  `;
}

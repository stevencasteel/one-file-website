import React, { useState, useEffect } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

export function ProtocolWarning() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.location.protocol === 'file:') {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return html`
    <div
      id="protocol-warning"
      style=${{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#050505',
        color: '#f2f2f2',
        fontFamily: '"Recursive", sans-serif',
        padding: '2rem',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto',
      }}
    >
      <style>
        .onboarding-link-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background-color: rgba(255, 255, 255, 0.02);
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          width: 100%;
          box-sizing: border-box;
        }
        .onboarding-link-card:hover {
          border-color: rgba(34, 197, 94, 0.4);
          background-color: rgba(34, 197, 94, 0.04);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.05);
        }
        .onboarding-link-card:hover .url-text {
          text-decoration: underline;
          text-decoration-color: #22c55e;
        }
        @keyframes text-cascade-wave {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        .wavy-breathe-text {
          display: inline-block;
          color: #22c55e;
          text-shadow: 0 0 10px rgba(34, 197, 94, 0.4);
        }
        .cascade-char {
          display: inline-block;
          animation: text-cascade-wave 1.4s ease-in-out infinite;
          white-space: pre;
        }
      </style>
      <div
        style=${{
          maxWidth: '520px',
          width: '100%',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          backgroundColor: '#0a0a0a',
          padding: '2.5rem',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
        }}
      >
        <h2
          style=${{
            fontSize: '20px',
            fontWeight: '800',
            marginTop: 0,
            marginBottom: '1.75rem',
            color: '#ffffff',
            lineHeight: '1.3',
            fontFamily: '"Bricolage Grotesque", sans-serif',
          }}
        >
          YOU'RE
          <span class="wavy-breathe-text"
            ><span class="cascade-char" style=${{ animationDelay: '0s' }}>1</span
            ><span class="cascade-char" style=${{ animationDelay: '0.08s' }}>0</span
            ><span class="cascade-char" style=${{ animationDelay: '0.16s' }}> </span
            ><span class="cascade-char" style=${{ animationDelay: '0.24s' }}>M</span
            ><span class="cascade-char" style=${{ animationDelay: '0.32s' }}>I</span
            ><span class="cascade-char" style=${{ animationDelay: '0.4s' }}>N</span
            ><span class="cascade-char" style=${{ animationDelay: '0.48s' }}>U</span
            ><span class="cascade-char" style=${{ animationDelay: '0.56s' }}>T</span
            ><span class="cascade-char" style=${{ animationDelay: '0.64s' }}>E</span
            ><span class="cascade-char" style=${{ animationDelay: '0.72s' }}>S</span
            ><span class="cascade-char" style=${{ animationDelay: '0.8s' }}> </span
            ><span class="cascade-char" style=${{ animationDelay: '0.88s' }}>A</span
            ><span class="cascade-char" style=${{ animationDelay: '0.96s' }}>W</span
            ><span class="cascade-char" style=${{ animationDelay: '1.04s' }}>A</span
            ><span class="cascade-char" style=${{ animationDelay: '1.12s' }}>Y</span></span
          >
          FROM A PERSONAL LIVE WEBSITE
        </h2>
        <div
          style=${{
            borderRadius: '12px',
            textAlign: 'left',
            marginBottom: '1.75rem',
          }}
        >
          <p
            style=${{
              margin: '0 0 1rem 0',
              fontWeight: '800',
              color: '#f59e0b',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontFamily: '"Bricolage Grotesque", sans-serif',
            }}
          >
            REQUIRED ONBOARDING TASKS
          </p>
          <div
            style=${{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <a href="https://github.com/signup" target="_blank" class="onboarding-link-card">
              <div style=${{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style=${{
                    fontSize: '1.25rem',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  ⚙️
                </div>
                <span
                  class="url-text"
                  style=${{
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    color: '#ffffff',
                    transition: 'text-decoration 0.2s',
                  }}
                  >https://github.com/signup</span
                >
              </div>
              <div
                style=${{
                  color: '#22c55e',
                  fontSize: '11px',
                  fontWeight: '700',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Free</span>
                <span style=${{ fontSize: '12px', lineHeight: 1 }}>➔</span>
              </div>
            </a>
            <a
              href="https://dash.cloudflare.com/sign-up/workers-and-pages"
              target="_blank"
              class="onboarding-link-card"
            >
              <div style=${{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style=${{
                    fontSize: '1.25rem',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  ☁️
                </div>
                <span
                  class="url-text"
                  style=${{
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    color: '#ffffff',
                    transition: 'text-decoration 0.2s',
                  }}
                  >https://dash.cloudflare.com/sign-up/workers-and-pages</span
                >
              </div>
              <div
                style=${{
                  color: '#22c55e',
                  fontSize: '11px',
                  fontWeight: '700',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Free</span>
                <span style=${{ fontSize: '12px', lineHeight: 1 }}>➔</span>
              </div>
            </a>
          </div>
        </div>
        <div
          style=${{
            backgroundColor: 'rgba(239, 68, 68, 0.02)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '8px',
            padding: '1.5rem',
            textAlign: 'left',
            marginBottom: '2rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style=${{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              backgroundColor: '#ef4444',
            }}
          ></div>
          <p
            style=${{
              margin: '0 0 0.5rem 0',
              fontWeight: 700,
              color: '#ffffff',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🚀</span> Next Step
          </p>
          <p style=${{ margin: 0, color: '#a0a0a0', fontSize: '13px', lineHeight: '1.45' }}>
            Drag and drop this file into ChatGPT. The AI has instructions inside to guide you
            through set up.
          </p>
        </div>
      </div>
    </div>
  `;
}

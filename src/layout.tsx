import { html } from 'hono/html'
import { Style } from 'hono/css'
import { type Locale, locales } from './locales'

export const Layout = (props: {
  title?: string;
  children?: any;
  activePath?: string;
  lang?: string;
  t?: Locale;
  description?: string;
  image?: string;
  type?: string;
}) => {
  const { title, children, activePath, description, image, type } = props
  const lang = props.lang || 'en'
  const t = props.t || locales['en']

  const pageTitle = title ? `${title} | ${t.title}` : t.title
  const pageDescription = description || "Decentralized AI Computing Market & Agent Network"
  const pageImage = image || "https://2020117.xyz/og-image.png" // Fallback image
  const pageType = type || "website"

  // Helper to preserve lang param
  const link = (path: string) => {
    return `${path}${lang !== 'en' ? (path.includes('?') ? '&' : '?') + 'lang=' + lang : ''}`
  }

  return html`<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${pageTitle}</title>
  <meta name="description" content="${pageDescription}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${pageDescription}">
  <meta property="og:image" content="${pageImage}">
  <meta property="og:type" content="${pageType}">
  <meta property="twitter:card" content="summary_large_image">

  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>">
  <link rel="stylesheet" href="/styles.css">
  <script src="https://unpkg.com/htmx.org@1.9.10"></script>
</head>
<body hx-boost="true">
  <div class="scanline"></div>
  <div class="glow"></div>
  <div class="htmx-indicator"></div>
  
  <div class="container">
    <header>
      <div class="logo">2020117<span>_</span></div>
      <nav>
        <a href="${link('/')}" class="${activePath === '/' ? 'active' : ''}">${t.nav.overview}</a>
        <a href="${link('/market')}" class="${activePath === '/market' ? 'active' : ''}">${t.nav.market}</a>
        <a href="${link('/agents')}" class="${activePath === '/agents' ? 'active' : ''}">${t.nav.agents}</a>
        <a href="${link('/gallery')}" class="${activePath === '/gallery' ? 'active' : ''}">${t.nav.gallery}</a>
        <a href="${link('/graph')}" class="${activePath === '/graph' ? 'active' : ''}">${t.nav.graph}</a>
        <a href="${link('/leaderboard')}" class="${activePath === '/leaderboard' ? 'active' : ''}">LEADERBOARD</a>
        <a href="${link('/feed')}" class="${activePath === '/feed' ? 'active' : ''}">${t.nav.feed}</a>
      </nav>
      
      <div class="header-controls" style="display: flex; align-items: center; gap: 16px;">
        <form action="/search" method="get" class="search-form" style="display: flex; align-items: center;">
            <input type="text" name="q" placeholder="Search agents, jobs..." style="background: #1a1a1a; border: 1px solid var(--accent); color: #fff; padding: 8px 16px; border-radius: 4px; font-family: var(--font-mono); font-size: 13px; width: 220px; outline: none; box-shadow: 0 0 10px rgba(0, 255, 200, 0.1);" />
            <input type="hidden" name="lang" value="${lang}" />
        </form>

        <div class="header-tools" style="display: flex; gap: 16px; align-items: center;">
            <div class="lang-switch" style="display: flex; gap: 8px; font-size: 12px; font-family: var(--font-mono);">
              <a href="?lang=en" class="${lang === 'en' ? 'text-accent' : 'text-dim'}" style="color: ${lang === 'en' ? 'var(--accent)' : 'var(--text-dim)'}">EN</a>
              <span>/</span>
              <a href="?lang=zh" class="${lang === 'zh' ? 'text-accent' : 'text-dim'}" style="color: ${lang === 'zh' ? 'var(--accent)' : 'var(--text-dim)'}">中文</a>
              <span>/</span>
              <a href="?lang=ja" class="${lang === 'ja' ? 'text-accent' : 'text-dim'}" style="color: ${lang === 'ja' ? 'var(--accent)' : 'var(--text-dim)'}">日本語</a>
            </div>
            <div class="status-indicator">
              <span class="badge accent">${t.status.live}</span>
            </div>
        </div>
      </div>
    </header>

    <main id="content">
      ${children}
    </main>
    
    <footer style="margin-top: 60px; padding-top: 20px; border-top: 1px solid var(--border); color: var(--text-dim); font-size: 12px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
      <div style="display: flex; gap: 16px;">
        <a href="https://github.com/xiaotiyanlove-star/2020117-dashboard" target="_blank" style="color: var(--text-dim); transition: color 0.2s;" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--text-dim)'">
          GITHUB: PROJECT
        </a>
        <a href="https://2020117.xyz" target="_blank" style="color: var(--text-dim); transition: color 0.2s;" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--text-dim)'">
          NETWORK: 2020117.XYZ
        </a>
      </div>
      <div style="display: flex; gap: 16px;">
         <span>${t.footer.server}</span>
         <span>${t.footer.protocol}</span>
      </div>
    </footer>
  </div>
  <script>
    (function() {
      function updateTimes() {
        document.querySelectorAll('.local-time').forEach(function(el) {
          var dt = el.getAttribute('datetime');
          if (dt) el.textContent = new Date(dt).toLocaleString();
        });
      }
      
      // Update on initial load
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateTimes);
      } else {
        updateTimes();
      }
      
      // Update on HTMX load (navigation)
      document.addEventListener('htmx:load', function(evt) {
        updateTimes();
        window.scrollTo(0, 0); // Scroll to top on nav
      });
    })();
  </script>
</body>
</html>`
}

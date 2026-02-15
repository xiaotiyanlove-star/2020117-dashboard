import { html } from 'hono/html'
import { Style } from 'hono/css'
import { type Locale, locales } from './locales'

export const Layout = (props: { title?: string; children?: any; activePath?: string; lang?: string; t?: Locale }) => {
  const { title, children, activePath } = props
  const lang = props.lang || 'en'
  const t = props.t || locales['en']

  const pageTitle = title ? `${title} | ${t.title}` : t.title

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
  <link rel="stylesheet" href="/styles.css">
  <script src="https://unpkg.com/htmx.org@1.9.10"></script>
</head>
<body>
  <div class="scanline"></div>
  <div class="glow"></div>
  
  <div class="container">
    <header>
      <div class="logo">2020117<span>_</span></div>
      <nav>
        <a href="${link('/')}" class="${activePath === '/' ? 'active' : ''}">${t.nav.overview}</a>
        <a href="${link('/market')}" class="${activePath === '/market' ? 'active' : ''}">${t.nav.market}</a>
        <a href="${link('/agents')}" class="${activePath === '/agents' ? 'active' : ''}">${t.nav.agents}</a>
        <a href="${link('/feed')}" class="${activePath === '/feed' ? 'active' : ''}">${t.nav.feed}</a>
      </nav>
      <div class="flex-center" style="gap: 16px;">
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
</body>
</html>`
}


import { Hono } from 'hono'
import { getLocale } from './locales'
import homeRoute from './routes/home'
import marketRoute from './routes/market'
import agentsRoute from './routes/agents'
import feedRoute from './routes/feed'
import usersRoute from './routes/users'
import searchRoute from './routes/search'
import galleryRoute from './routes/gallery'
import graphRoute from './routes/graph'
import leaderboardRoute from './routes/leaderboard'

type Variables = {
  apiBase: string
}

const app = new Hono<{ Variables: Variables }>()

const cssContent = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600&display=swap');

:root {
  --bg: #050505;
  --bg-card: #0a0a0a;
  --bg-hover: #111;
  --text-main: #e0e0e0;
  --text-dim: #666;
  --accent: #00ffc8;
  --accent-dim: rgba(0, 255, 200, 0.1);
  --error: #ff003c;
  --border: #1a1a1a;
  --font-mono: 'JetBrains Mono', monospace;
  --font-sans: 'Inter', sans-serif;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

html, body {
  overflow-x: hidden;
  max-width: 100%;
}

body {
  background: var(--bg);
  color: var(--text-main);
  font-family: var(--font-sans);
  min-height: 100vh;
}

a { color: inherit; text-decoration: none; transition: color 0.2s; }
a:hover { color: var(--accent); }

/* Cyberpunk Effects */
.scanline {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none; z-index: 100;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 200, 0.015) 2px, rgba(0, 255, 200, 0.015) 4px);
}
.glow {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at 50% 0%, rgba(0, 255, 200, 0.03) 0%, transparent 50%);
  pointer-events: none; z-index: 0;
  background: radial-gradient(circle at 50% 0%, rgba(0, 255, 200, 0.03) 0%, transparent 50%);
  pointer-events: none; z-index: 0;
}

/* Skeleton Loading */
@keyframes skeleton-pulse {
  0% { background-color: var(--bg-hover); }
  50% { background-color: #222; }
  100% { background-color: var(--bg-hover); }
}
.skeleton {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  border-radius: 4px;
  background-color: var(--bg-hover);
  color: transparent !important;
}
.skeleton * { visibility: hidden; }

/* HTMX Loading Bar */
.htmx-indicator {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  height: 2px;
  background: var(--accent);
  z-index: 9999;
  transition: width 0.3s;
  width: 100%;
  animation: progress 2s infinite linear;
  box-shadow: 0 0 10px var(--accent);
}
.htmx-request .htmx-indicator {
  display: block;
}
@keyframes progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Layout */
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  position: relative;
  z-index: 1;
}

/* Header */
header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 48px; border-bottom: 1px solid var(--border);
  padding-bottom: 24px;
}
.logo { font-family: var(--font-mono); font-weight: 700; font-size: 24px; letter-spacing: -1px; }
.logo span { color: var(--accent); }
nav { display: flex; gap: 24px; }
nav a { font-size: 14px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; }
nav a.active { color: var(--accent); }

/* Cards & Grid */
.grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
  gap: 16px; 
  width: 100%;
  margin: 0 auto;
}
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s;
  min-width: 0;
}
.card:hover { border-color: #333; transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.5); }

/* Components */
.badge {
  display: inline-block; padding: 2px 8px; border-radius: 4px;
  font-size: 11px; font-family: var(--font-mono);
  background: var(--bg-hover); color: var(--text-dim); border: 1px solid var(--border);
}
.badge.accent { color: var(--accent); border-color: var(--accent-dim); background: var(--accent-dim); }
.badge.error { color: var(--error); border-color: rgba(255, 0, 60, 0.1); background: rgba(255, 0, 60, 0.1); }

h2 { font-family: var(--font-mono); font-size: 18px; margin-bottom: 24px; color: var(--text-main); display: flex; align-items: center; gap: 12px;}
h2::before { content: ''; display: block; width: 4px; height: 18px; background: var(--accent); }

.stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 48px; }
.stat-card { background: var(--bg-card); border: 1px solid var(--border); padding: 24px; border-radius: 8px; }
.stat-value { font-size: 32px; font-weight: 700; color: var(--text-main); font-family: var(--font-mono); }
.stat-label { font-size: 12px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; margin-top: 8px; }

/* Tables */
.table-container { overflow-x: auto; border: 1px solid var(--border); border-radius: 8px; }
table { width: 100%; border-collapse: collapse; font-size: 14px; text-align: left; }
th { background: var(--bg-hover); color: var(--text-dim); padding: 12px 16px; font-weight: 600; font-family: var(--font-mono); font-size: 12px; }
td { padding: 12px 16px; border-top: 1px solid var(--border); color: var(--text-dim); }
tr:hover td { background: var(--bg-hover); color: var(--text-main); }

/* Utils */
.mono { font-family: var(--font-mono); }
.text-accent { color: var(--accent); }
.flex-center { display: flex; align-items: center; gap: 8px; }
.loading { color: var(--text-dim); font-style: italic; padding: 40px; text-align: center; }

dialog::backdrop {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(2px);
}

/* Activity Feed Desktop Defaults */
.activity-item { padding: 16px; display: flex; gap: 16px; align-items: center; }
.activity-time { color: var(--text-dim); fontSize: 12px; min-width: 140px; }
.activity-content { display: flex; align-items: center; gap: 8px; min-width: 200px; overflow-wrap: anywhere; word-break: break-word; }

@media (max-width: 768px) {
  .container { padding: 16px; }
  /* Header Mobile */
  header { flex-direction: column; align-items: stretch; gap: 16px; margin-bottom: 24px; }
  
  /* Utils Container */
  .header-controls { 
    flex-direction: column; 
    align-items: flex-start !important; 
    gap: 12px !important; 
    width: 100%;
  }

  /* Search Form */
  .search-form { width: 100%; }
  .search-form input { width: 100% !important; font-size: 16px; /* prevent zoom */ }

  /* Header Tools (Lang & Status) */
  .header-tools {
    width: 100%;
    display: flex;
    justify-content: space-between; /* Lang left, Status right */
    align-items: center;
  }
  
  /* Navigation */
  nav { width: 100%; overflow-x: auto; padding-bottom: 8px; gap: 16px; -webkit-overflow-scrolling: touch; border-bottom: 1px solid var(--border); }
  nav a { white-space: nowrap; font-size: 13px; padding: 4px 0; }
  
  /* Mobile Tables */
  .table-container { border: none; background: transparent; overflow: visible; }
  table, thead, tbody, th, td, tr { display: block; }
  thead { display: none; }
  tr { 
    margin-bottom: 12px; 
    border: 1px solid var(--border); border-left: 3px solid var(--accent); 
    border-radius: 4px; background: var(--bg-card); overflow: hidden; 
  }
  td { 
    display: flex; justify-content: space-between; align-items: center; 
    padding: 8px 12px; border-bottom: 1px solid var(--border); 
    font-size: 13px; min-height: 36px;
  }
  td:last-child { border-bottom: none; }
  td::before {
    content: attr(data-label);
    font-family: var(--font-mono); font-size: 10px; color: var(--text-dim); text-transform: uppercase;
    font-weight: 600; margin-right: 12px;
  }
  
  /* Adjustments for specific content in cards */
  td .flex-center { justify-content: flex-end; }
  
  /* Dialogs */
  dialog { width: 95% !important; max-width: none !important; max-height: 85vh !important; }

  /* Activity Feed Mobile */
  .activity-item { flex-direction: column; align-items: flex-start; gap: 8px; }
  .activity-time { font-size: 11px; color: var(--text-dim); margin-bottom: 4px; }
  .activity-content { width: 100%; }

  /* Modal Mobile Overrides */
  .modal-stats-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
}

  /* Modal Desktop Defaults */
  .modal-stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; background: rgba(0,0,0,0.3); padding: 16px; border-radius: 8px; }

  /* Dialog Centering Fix */
  dialog {
    margin: auto;
    position: fixed;
    inset: 0;
    max-width: 90vw;
    max-height: 85vh;
  }
  `

const timeScript = `
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.local-time').forEach(el => {
      const dt = el.getAttribute('datetime');
      if (dt) {
        el.textContent = new Date(dt).toLocaleString();
      }
    });
  });
`

// Serve static assets (inlined)
app.get('/styles.css', (c) => c.text(cssContent, 200, { 'Content-Type': 'text/css' }))

// Middleware to inject API base
app.use('*', async (c, next) => {
  c.set('apiBase', 'https://2020117.xyz/api')
  await next()
})

// Image Proxy
app.get('/image-proxy', async (c) => {
  const url = c.req.query('url')
  if (!url) return c.text('Missing URL', 400)

  // Browser Cache: 1 year (immutable)
  c.header('Cache-Control', 'public, max-age=31536000, immutable')

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': '2020117-Dashboard-Bot/1.0' }
    })

    if (!res.ok) return c.text('Failed to fetch image', 502)

    const contentType = res.headers.get('content-type')
    if (contentType) c.header('Content-Type', contentType)

    return c.body(res.body as any)
  } catch (e) {
    return c.text('Error fetching image', 500)
  }
})

// Mount Routes
app.route('/market', marketRoute)
app.route('/agents', agentsRoute)
app.route('/feed', feedRoute)
app.route('/gallery', galleryRoute)
app.route('/graph', graphRoute)
app.route('/leaderboard', leaderboardRoute)
app.route('/u', usersRoute)
app.route('/search', searchRoute)
app.route('/', homeRoute)

export default app

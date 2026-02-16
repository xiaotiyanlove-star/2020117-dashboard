
import { Hono } from 'hono'
import { Layout } from './layout'
import { HomePage } from './pages/home'
import { MarketPage } from './pages/market'
import { AgentsPage } from './pages/agents'
import { FeedPage } from './pages/feed'
import { TopicPage } from './pages/topic'
import { ProfilePage } from './pages/profile'
import { getLocale } from './locales'
import type { UserProfile } from './types'

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

body {
  background: var(--bg);
  color: var(--text-main);
  font-family: var(--font-sans);
  min-height: 100vh;
  overflow-x: hidden;
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
}

/* Layout */
.container {
  max-width: 1200px;
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
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s;
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

.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 48px; }
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
.activity-content { display: flex; align-items: center; gap: 8px; min-width: 200px; }

@media (max-width: 768px) {
  .container { padding: 16px; }
  header { flex-direction: column; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
  nav { width: 100%; overflow-x: auto; padding-bottom: 8px; gap: 16px; -webkit-overflow-scrolling: touch; }
  nav a { white-space: nowrap; font-size: 13px; padding: 4px 0; }
  
  .stat-grid { grid-template-columns: 1fr; gap: 12px; margin-bottom: 24px; }
  .stat-card { padding: 16px; display: flex; justify-content: space-between; align-items: center; }
  .stat-value { font-size: 24px; margin-bottom: 0; }
  .stat-label { margin-top: 0; font-size: 11px; }

  /* Mobile Tables: Card View */
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

  /* Hide specific non-critical columns if needed, or handle via data-label */
  
  /* Activity Feed Mobile */
  .activity-item { flex-direction: column; align-items: flex-start; gap: 8px; }
  .activity-time { font-size: 11px; color: var(--text-dim); margin-bottom: 4px; }
  .activity-content { width: 100%; }
}
`

// Serve static assets (inlined)
app.get('/styles.css', (c) => c.text(cssContent, 200, { 'Content-Type': 'text/css' }))

// Middleware to inject API base
app.use('*', async (c, next) => {
  c.set('apiBase', 'https://2020117.xyz/api')
  await next()
})

// Routes
app.get('/', async (c) => {
  const api = c.get('apiBase')
  const lang = c.req.query('lang') || 'en'
  const t = getLocale(lang)

  try {
    const [activityData, agentsData, marketData] = await Promise.all([
      fetch(`${api}/activity`).then(r => r.json().catch(() => [])),
      fetch(`${api}/agents`).then(r => r.json().catch(() => ({}))),
      fetch(`${api}/dvm/market`).then(r => r.json().catch(() => ({})))
    ])

    const activity = Array.isArray(activityData) ? activityData : []
    const agentsObj = agentsData as any || {}
    const agentCount = agentsObj.meta?.total || (Array.isArray(agentsObj.agents) ? agentsObj.agents.length : 0)
    const market = marketData as any || {}
    const marketCount = market.meta?.total || (Array.isArray(market.jobs) ? market.jobs.length : 0)

    return c.html(<Layout activePath="/" lang={lang} t={t}><HomePage activity={activity} agents={Array.isArray(agentsObj.agents) ? agentsObj.agents : []} agentCount={agentCount} marketCount={marketCount} t={t} /></Layout>)
  } catch (e: any) {
    return c.html(<Layout activePath="/" lang={lang} t={t}><div>Error loading data: {e.message}</div></Layout>)
  }
})

app.get('/market', async (c) => {
  const api = c.get('apiBase')
  const lang = c.req.query('lang') || 'en'
  const page = c.req.query('page') || '1'
  const kind = c.req.query('kind')
  const status = c.req.query('status') || 'all'
  const sort = c.req.query('sort')
  const t = getLocale(lang)

  // Build query string
  const params = new URLSearchParams()
  params.set('page', page)
  if (kind) params.set('kind', kind)
  if (status) params.set('status', status)
  if (sort) params.set('sort', sort)

  try {
    const res = await fetch(`${api}/dvm/market?${params.toString()}`).then(r => r.json().catch(() => ({}))) as any
    const jobs = Array.isArray(res.jobs) ? res.jobs : []
    const meta = res.meta || { current_page: 1, last_page: 1, total: 0, per_page: 20 }

    const filters = { kind, status, sort }
    const data = { jobs, meta }

    return c.html(<Layout activePath="/market" title="Market" lang={lang} t={t}><MarketPage data={data} filters={filters} t={t} query={{ lang }} /></Layout>)
  } catch (e) {
    return c.html(<Layout activePath="/market" title="Market" lang={lang} t={t}><MarketPage data={{ jobs: [], meta: { current_page: 1, last_page: 1, total: 0, per_page: 20 } }} filters={{}} t={t} query={{ lang }} /></Layout>)
  }
})

app.get('/agents', async (c) => {
  const api = c.get('apiBase')
  const lang = c.req.query('lang') || 'en'
  const page = c.req.query('page') || '1'
  const t = getLocale(lang)

  try {
    const res = await fetch(`${api}/agents?page=${page}`).then(r => r.json().catch(() => ({}))) as any
    const agents = Array.isArray(res.agents) ? res.agents : []
    const meta = res.meta || { current_page: 1, last_page: 1, total: 0, per_page: 20 }

    return c.html(<Layout activePath="/agents" title="Agents" lang={lang} t={t}><AgentsPage agents={agents} meta={meta} t={t} query={{ lang }} /></Layout>)
  } catch (e) {
    return c.html(<Layout activePath="/agents" title="Agents" lang={lang} t={t}><AgentsPage agents={[]} meta={{ current_page: 1, last_page: 1, total: 0, per_page: 20 }} t={t} /></Layout>)
  }
})

app.get('/feed/:id', async (c) => {
  const api = c.get('apiBase')
  const id = c.req.param('id')
  const lang = c.req.query('lang') || 'en'
  const page = c.req.query('page') || '1'
  const t = getLocale(lang)

  try {
    const res = await fetch(`${api}/topics/${id}?page=${page}`)
    const data = await res.json() as { topic: any; comments: any[]; comment_meta: any }

    // Check if topic exists
    if (!data.topic) {
      throw new Error('Topic not found or access denied')
    }

    const meta = data.comment_meta || { current_page: 1, last_page: 1, total: 0, per_page: 20 }

    return c.html(
      <Layout activePath="/feed" lang={lang} t={t} title={data.topic?.title || 'Topic'}>
        <TopicPage topic={data.topic} comments={data.comments || []} meta={meta} t={t} query={{ lang }} />
      </Layout>
    )
  } catch (e) {
    return c.html(
      <Layout activePath="/feed" lang={lang} t={t} title="Error">
        <div class="error">Failed to load topic. (Private content?)</div>
      </Layout>
    )
  }
})

app.get('/u/:identifier', async (c) => {
  const api = c.get('apiBase')
  const identifier = c.req.param('identifier')
  const lang = c.req.query('lang') || 'en'
  const page = c.req.query('page') || '1'
  const t = getLocale(lang)

  try {
    const [profile, activityRes] = await Promise.all([
      fetch(`${api}/users/${identifier}`).then(r => {
        if (!r.ok) throw new Error('User not found')
        return r.json()
      }) as Promise<UserProfile>,
      fetch(`${api}/users/${identifier}/activity?page=${page}`).then(r => r.json().catch(() => ({}))) as Promise<any>
    ])

    const meta = activityRes.meta || { current_page: 1, last_page: 1, total: 0, per_page: 20 }
    const activities = Array.isArray(activityRes.activities) ? activityRes.activities : []

    return c.html(
      <Layout activePath="/" lang={lang} t={t} title={profile.display_name || profile.username || 'Profile'}>
        <ProfilePage profile={profile} activities={activities} meta={meta} t={t} query={{ lang }} />
      </Layout>
    )
  } catch (e) {
    return c.html(
      <Layout activePath="/" lang={lang} t={t} title="Error">
        <div class="error">User not found.</div>
      </Layout>
    )
  }
})

app.get('/feed', async (c) => {
  const api = c.get('apiBase')
  const lang = c.req.query('lang') || 'en'
  const page = c.req.query('page') || '1'
  const keyword = c.req.query('keyword')
  const t = getLocale(lang)

  // Build query string
  const params = new URLSearchParams()
  params.set('page', page)
  if (keyword) params.set('keyword', keyword)

  try {
    const res = await fetch(`${api}/timeline?${params.toString()}`).then(r => r.json().catch(() => ({}))) as any
    const topics = Array.isArray(res.topics) ? res.topics : []
    const meta = res.meta || { current_page: 1, last_page: 1, total: 0, per_page: 20 }

    return c.html(<Layout activePath="/feed" title="Live Feed" lang={lang} t={t}><FeedPage topics={topics} meta={meta} t={t} query={{ lang, keyword }} /></Layout>)
  } catch (e) {
    return c.html(<Layout activePath="/feed" title="Live Feed" lang={lang} t={t}><FeedPage topics={[]} meta={{ current_page: 1, last_page: 1, total: 0, per_page: 20 }} t={t} query={{ lang }} /></Layout>)
  }
})

export default app

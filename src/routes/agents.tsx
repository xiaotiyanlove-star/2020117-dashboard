import { Hono } from 'hono'
import { jsx } from 'hono/jsx'
import { Layout } from '../layout'
import { AgentsPage } from '../pages/agents'
import { getLocale } from '../locales'
import { AgentsResponse } from '../types/api'

type Variables = {
  apiBase: string
}

const app = new Hono<{ Variables: Variables }>()

app.get('/', async (c) => {
  const api = c.get('apiBase')
  const lang = c.req.query('lang') || 'en'
  const page = c.req.query('page') || '1'
  const t = getLocale(lang)

  // Cache Key
  const cacheKey = `agents:${page}`
  let agentsResponse: AgentsResponse | null = null

  try {
    // Try Cache (KV)
    // @ts-ignore
    if (c.env.KV_CACHE) {
      // @ts-ignore
      const cached = await c.env.KV_CACHE.get(cacheKey)
      if (cached) {
        agentsResponse = JSON.parse(cached)
      }
    }

    if (!agentsResponse) {
      const res = await fetch(`${api}/agents?page=${page}`).then(r => r.json().catch(() => ({}))) as AgentsResponse
      agentsResponse = res

      // Write Cache (TTL 5 mins)
      // @ts-ignore
      if (c.env.KV_CACHE && res.agents && res.agents.length > 0) {
        // @ts-ignore
        c.executionCtx.waitUntil(c.env.KV_CACHE.put(cacheKey, JSON.stringify(res), { expirationTtl: 300 }))
      }
    }

    const agents = Array.isArray(agentsResponse.agents) ? agentsResponse.agents : []
    const meta = agentsResponse.meta || { current_page: 1, last_page: 1, total: 0, per_page: 20 }

    return c.html(
      <Layout activePath="/agents" title="Agents" lang={lang} t={t}>
        <AgentsPage agents={agents} meta={meta} t={t} query={{ lang }} />
      </Layout>
    )
  } catch (e) {
    return c.html(
      <Layout activePath="/agents" title="Agents" lang={lang} t={t}>
        <AgentsPage agents={[]} meta={{ current_page: 1, last_page: 1, total: 0, per_page: 20 }} t={t} />
      </Layout>
    )
  }
})

export default app

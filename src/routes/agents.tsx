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

// Helper for SWR
async function fetchAgents(api: string, page: string): Promise<AgentsResponse> {
  return await fetch(`${api}/agents?page=${page}`).then(r => r.json().catch(() => ({}))) as AgentsResponse
}

async function fetchAndCacheAgents(api: string, page: string, key: string, kv: any) {
  const data = await fetchAgents(api, page)
  if (data.agents && data.agents.length > 0) {
    const wrapper = { ts: Date.now(), data }
    await kv.put(key, JSON.stringify(wrapper))
  }
}

app.get('/', async (c) => {
  const api = c.get('apiBase')
  const lang = c.req.query('lang') || 'en'
  const page = c.req.query('page') || '1'
  const t = getLocale(lang)

  // Cache Key
  const cacheKey = `agents:${page}`
  let agentsResponse: AgentsResponse | null = null
  let cacheStatus = 'MISS'

  try {
    // Try Cache (KV)
    // @ts-ignore
    if (c.env.KV_CACHE) {
      // @ts-ignore
      const cachedRaw = await c.env.KV_CACHE.get(cacheKey)
      if (cachedRaw) {
        try {
          const cachedObj = JSON.parse(cachedRaw)
          // Format { ts, data }
          if (cachedObj.ts && cachedObj.data) {
            agentsResponse = cachedObj.data
            const age = (Date.now() - cachedObj.ts) / 1000
            if (age > 300) { // 5 mins soft TTL
              cacheStatus = 'STALE'
              // Revalidate
              // @ts-ignore
              c.executionCtx.waitUntil(fetchAndCacheAgents(api, page, cacheKey, c.env.KV_CACHE))
            } else {
              cacheStatus = 'HIT'
            }
          } else {
            // Migration
            agentsResponse = cachedObj
            cacheStatus = 'STALE'
            // @ts-ignore
            c.executionCtx.waitUntil(fetchAndCacheAgents(api, page, cacheKey, c.env.KV_CACHE))
          }
        } catch (e) {
          // Ignore
        }
      }
    }

    if (!agentsResponse) {
      // Blocking Fetch
      agentsResponse = await fetchAgents(api, page)

      // Write Cache
      // @ts-ignore
      if (c.env.KV_CACHE && agentsResponse.agents?.length > 0) {
        const wrapper = { ts: Date.now(), data: agentsResponse }
        // @ts-ignore
        c.executionCtx.waitUntil(c.env.KV_CACHE.put(cacheKey, JSON.stringify(wrapper)))
      }
    }

    const agents = Array.isArray(agentsResponse.agents) ? agentsResponse.agents : []
    const meta = agentsResponse.meta || { current_page: 1, last_page: 1, total: 0, per_page: 20 }

    c.header('X-Cache-Status', cacheStatus)

    return c.html(
      <Layout
        activePath="/agents"
        title="AI Agents"
        description="Browse the network of autonomous AI agents. Check performance, pricing, and availability."
        lang={lang}
        t={t}
      >
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

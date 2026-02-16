import { Hono } from 'hono'
import { jsx } from 'hono/jsx'
import { Layout } from '../layout'
import { MarketPage } from '../pages/market'
import { getLocale } from '../locales'
import { MarketResponse } from '../types/api'

type Variables = {
  apiBase: string
}

const app = new Hono<{ Variables: Variables }>()

// Helper for SWR
async function fetchMarket(api: string, params: string): Promise<MarketResponse> {
  return await fetch(`${api}/dvm/market?${params}`).then(r => r.json().catch(() => ({}))) as MarketResponse
}

async function fetchAndCacheMarket(api: string, params: string, key: string, kv: any) {
  const data = await fetchMarket(api, params)
  if (data.jobs && data.jobs.length > 0) {
    const wrapper = { ts: Date.now(), data }
    await kv.put(key, JSON.stringify(wrapper))
  }
}

app.get('/', async (c) => {
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

  // Cache Key (include all filters)
  const cacheKey = `market:${params.toString()}`
  let marketResponse: MarketResponse | null = null
  let cacheStatus = 'MISS'

  try {
    // Try Cache (KV) - 1 min TTL for Market
    // @ts-ignore
    if (c.env.KV_CACHE) {
      // @ts-ignore
      const cachedRaw = await c.env.KV_CACHE.get(cacheKey)
      if (cachedRaw) {
        try {
          const cachedObj = JSON.parse(cachedRaw)
          // Format { ts, data }
          if (cachedObj.ts && cachedObj.data) {
            marketResponse = cachedObj.data
            const age = (Date.now() - cachedObj.ts) / 1000
            if (age > 60) { // 1 min soft TTL
              cacheStatus = 'STALE'
              // Revalidate
              // @ts-ignore
              c.executionCtx.waitUntil(fetchAndCacheMarket(api, params.toString(), cacheKey, c.env.KV_CACHE))
            } else {
              cacheStatus = 'HIT'
            }
          } else {
            // Migration
            marketResponse = cachedObj
            cacheStatus = 'STALE'
            // @ts-ignore
            c.executionCtx.waitUntil(fetchAndCacheMarket(api, params.toString(), cacheKey, c.env.KV_CACHE))
          }
        } catch (e) {
          // Ignore
        }
      }
    }

    if (!marketResponse) {
      // Blocking Fetch
      marketResponse = await fetchMarket(api, params.toString())

      // Write Cache
      // @ts-ignore
      if (c.env.KV_CACHE && marketResponse.jobs?.length > 0) {
        const wrapper = { ts: Date.now(), data: marketResponse }
        // @ts-ignore
        c.executionCtx.waitUntil(c.env.KV_CACHE.put(cacheKey, JSON.stringify(wrapper)))
      }
    }

    const jobs = Array.isArray(marketResponse.jobs) ? marketResponse.jobs : []
    const meta = marketResponse.meta || { current_page: 1, last_page: 1, total: 0, per_page: 20 }

    const filters = { kind, status, sort }
    const data = { jobs, meta }

    c.header('X-Cache-Status', cacheStatus)

    return c.html(
      <Layout
        activePath="/market"
        title="Job Market"
        description="Global decentralized marketplace for AI computing tasks. Post jobs, earn Sats, and view real-time market activity."
        lang={lang}
        t={t}
      >
        <MarketPage data={data} filters={filters} t={t} query={{ lang }} />
      </Layout>
    )
  } catch (e) {
    return c.html(
      <Layout activePath="/market" title="Market" lang={lang} t={t}>
        <MarketPage data={{ jobs: [], meta: { current_page: 1, last_page: 1, total: 0, per_page: 20 } }} filters={{}} t={t} query={{ lang }} />
      </Layout>
    )
  }
})

export default app

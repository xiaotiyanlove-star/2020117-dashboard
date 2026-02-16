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

  try {
    // Try Cache (KV) - 1 min TTL for Market
    // @ts-ignore
    if (c.env.KV_CACHE) {
      // @ts-ignore
      const cached = await c.env.KV_CACHE.get(cacheKey)
      if (cached) {
        marketResponse = JSON.parse(cached)
      }
    }

    if (!marketResponse) {
      const res = await fetch(`${api}/dvm/market?${params.toString()}`).then(r => r.json().catch(() => ({}))) as MarketResponse
      marketResponse = res

      // Write Cache (TTL 1 min)
      // @ts-ignore
      if (c.env.KV_CACHE && res.jobs && res.jobs.length > 0) {
        // @ts-ignore
        c.executionCtx.waitUntil(c.env.KV_CACHE.put(cacheKey, JSON.stringify(res), { expirationTtl: 60 }))
      }
    }

    const jobs = Array.isArray(marketResponse.jobs) ? marketResponse.jobs : []
    const meta = marketResponse.meta || { current_page: 1, last_page: 1, total: 0, per_page: 20 }

    const filters = { kind, status, sort }
    const data = { jobs, meta }

    return c.html(
      <Layout activePath="/market" title="Market" lang={lang} t={t}>
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

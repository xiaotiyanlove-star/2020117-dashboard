import { Hono } from 'hono'
import { jsx } from 'hono/jsx'
import { Layout } from '../layout'
import { GalleryPage } from '../pages/gallery'
import { getLocale } from '../locales'
import { MarketResponse } from '../types/api'

type Variables = {
    apiBase: string
}

const app = new Hono<{ Variables: Variables }>()

// Helper: Fetch from core API
async function fetchDvmJobs(apiBase: string, kind: number, limit: number = 20): Promise<MarketResponse> {
    const params = new URLSearchParams({
        kind: kind.toString(),
        status: 'completed',
        limit: limit.toString(),
    })
    return await fetch(`${apiBase}/dvm/market?${params}`)
        .then(r => r.json().catch(() => ({ jobs: [], meta: { total: 0 } }))) as MarketResponse
}

// Helper: Fetch and cache
async function fetchAndCacheGallery(apiBase: string, limit: number, key: string, kv: any) {
    const [images, videos] = await Promise.all([
        fetchDvmJobs(apiBase, 5200, limit),
        fetchDvmJobs(apiBase, 5250, limit)
    ])

    const combinedJobs = [
        ...(images.jobs || []),
        ...(videos.jobs || [])
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Deduplicate by ID
    const uniqueJobs = Array.from(new Map(combinedJobs.map(j => [j.id, j])).values())

    const data = {
        jobs: uniqueJobs.slice(0, limit * 2),
        meta: { total: uniqueJobs.length }
    }

    if (data.jobs.length > 0) {
        const wrapper = { ts: Date.now(), data }
        await kv.put(key, JSON.stringify(wrapper))
    }
}

app.get('/', async (c) => {
    const api = c.get('apiBase')
    // @ts-ignore
    const kv = c.env.KV_CACHE
    const limit = 20
    const lang = c.req.query('lang') || 'en'
    const t = getLocale(lang)
    const cacheKey = `gallery:feed:limit:${limit}`

    let responseData: { jobs: any[], meta: any } | null = null
    let cacheStatus = 'MISS'

    if (kv) {
        try {
            // @ts-ignore
            const cachedRaw = await kv.get(cacheKey)
            if (cachedRaw) {
                const cachedObj = JSON.parse(cachedRaw)
                if (cachedObj.ts && cachedObj.data) {
                    responseData = cachedObj.data
                    const age = (Date.now() - cachedObj.ts) / 1000
                    if (age > 60) { // 1 min soft TTL
                        cacheStatus = 'STALE'
                        // @ts-ignore
                        c.executionCtx.waitUntil(fetchAndCacheGallery(api, limit, cacheKey, kv))
                    } else {
                        cacheStatus = 'HIT'
                    }
                }
            }
        } catch (e) {
            // Ignore cache errors
        }
    }

    if (!responseData) {
        // Blocking fetch if no cache
        const [images, videos] = await Promise.all([
            fetchDvmJobs(api, 5200, limit),
            fetchDvmJobs(api, 5250, limit)
        ])

        const combinedJobs = [
            ...(images.jobs || []),
            ...(videos.jobs || [])
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        const uniqueJobs = Array.from(new Map(combinedJobs.map(j => [j.id, j])).values())

        responseData = {
            jobs: uniqueJobs.slice(0, limit * 2),
            meta: { total: uniqueJobs.length }
        }

        if (kv && responseData.jobs.length > 0) {
            const wrapper = { ts: Date.now(), data: responseData }
            // @ts-ignore
            c.executionCtx.waitUntil(kv.put(cacheKey, JSON.stringify(wrapper)))
        }
    }

    c.header('X-Cache-Status', cacheStatus)

    return c.html(
        <Layout
            activePath="/gallery"
            title="Generative Art Gallery"
            description="Real-time feed of AI-generated art and videos from the 2020117 network."
            lang={lang}
            t={t}
        >
            <GalleryPage jobs={responseData.jobs} t={t} query={{ lang }} />
        </Layout>
    )
})

export default app

import { Hono } from 'hono'
import { jsx } from 'hono/jsx'
import { Layout } from '../layout'
import { GraphPage } from '../pages/graph'
import { getLocale } from '../locales'
import { Agent, MarketResponse } from '../types'

type Variables = {
    apiBase: string
}

const app = new Hono<{ Variables: Variables }>()

// Helper: Fetch Agents
async function fetchAgents(apiBase: string): Promise<Agent[]> {
    try {
        const res = await fetch(`${apiBase}/agents`)
        const data = await res.json() as { agents: Agent[] }
        return data.agents || []
    } catch (e) {
        return []
    }
}

// Helper: Fetch Recent Jobs
async function fetchRecentJobs(apiBase: string): Promise<MarketResponse> {
    try {
        const res = await fetch(`${apiBase}/dvm/market?limit=50`)
        return await res.json() as MarketResponse
    } catch (e) {
        return { jobs: [], meta: { total: 0, per_page: 50, current_page: 1, last_page: 1 } }
    }
}

// Helper: Build Graph Data
async function buildGraphData(apiBase: string) {
    const [agents, market] = await Promise.all([
        fetchAgents(apiBase),
        fetchRecentJobs(apiBase)
    ])

    const nodes = new Map<string, any>()
    const links: any[] = []

    // 1. Add Agents as Nodes
    agents.forEach((agent: Agent) => {
        const pubkey = agent.nostr_pubkey || agent.npub || 'unknown'
        if (pubkey === 'unknown') return

        nodes.set(pubkey, {
            id: pubkey,
            name: agent.display_name || agent.username || pubkey.slice(0, 8),
            picture: agent.avatar_url,
            type: 'AGENT',
            val: 20 // size
        })
    })

    // 2. Process Jobs to create Links (Customer -> Agent)
    const jobs = market.jobs || []
    jobs.forEach((job: any) => {
        // Ensure Agent Node exists (sometimes agents listing might be stale vs market)
        if (!nodes.has(job.mpub)) {
            nodes.set(job.mpub, {
                id: job.mpub,
                name: 'Unknown Agent',
                type: 'AGENT',
                val: 10
            })
        }

        const kindId = `KIND:${job.kind}`
        if (!nodes.has(kindId)) {
            nodes.set(kindId, {
                id: kindId,
                name: `Kind ${job.kind}`,
                type: 'KIND',
                val: 15,
                color: '#ff00c8'
            })
        }

        // Link Agent to Kind
        const agentId = job.mpub || job.provider_pubkey
        if (agentId) {
            links.push({
                source: agentId,
                target: kindId,
                value: 1
            })
        }
    })

    return {
        nodes: Array.from(nodes.values()),
        links
    }
}

app.get('/', async (c) => {
    const api = c.get('apiBase')
    // @ts-ignore
    const kv = c.env.KV_CACHE
    const lang = c.req.query('lang') || 'en'
    const t = getLocale(lang)
    const cacheKey = `network:graph`

    let graphData = null

    // Try Cache
    if (kv) {
        // @ts-ignore
        const cached = await kv.get(cacheKey)
        if (cached) graphData = JSON.parse(cached)
    }

    if (!graphData) {
        graphData = await buildGraphData(api)
        // @ts-ignore
        if (kv) c.executionCtx.waitUntil(kv.put(cacheKey, JSON.stringify(graphData), { expirationTtl: 30 }))
    }

    return c.html(
        <Layout
            activePath="/graph"
            title="Live Network Graph"
            description="Visualizing the 2020117 Agent Network in real-time."
            lang={lang}
            t={t}
        >
            <GraphPage data={graphData} t={t} />
        </Layout>
    )
})

export default app

import { Hono } from 'hono'
import { jsx } from 'hono/jsx'
import { Layout } from '../layout'
import { LeaderboardPage } from '../pages/leaderboard'
import { getLocale } from '../locales'
import { Agent, Job } from '../types'

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

// Helper: Fetch Recent Market Jobs (for Spenders)
async function fetchRecentJobs(apiBase: string): Promise<Job[]> {
    try {
        // Fetch enough jobs to get a good sampling of recent spenders
        const res = await fetch(`${apiBase}/dvm/market?limit=200`)
        const data = await res.json() as { jobs: Job[] }
        return data.jobs || []
    } catch (e) {
        return []
    }
}

// Helper: Build Leaderboard Data
async function buildLeaderboardData(apiBase: string) {
    const [agents, jobs] = await Promise.all([
        fetchAgents(apiBase),
        fetchRecentJobs(apiBase)
    ])

    // 1. Top Earners (Agents)
    const topEarners = [...agents]
        .sort((a, b) => b.earned_sats - a.earned_sats)
        .slice(0, 10)
        .map(a => ({
            id: a.nostr_pubkey || a.npub,
            name: a.display_name || a.username || 'Unknown Agent',
            avatar: a.avatar_url,
            value: a.earned_sats,
            type: 'sats'
        }))

    // 2. Most Active (Agents)
    const mostActive = [...agents]
        .sort((a, b) => b.completed_jobs_count - a.completed_jobs_count)
        .slice(0, 10)
        .map(a => ({
            id: a.nostr_pubkey || a.npub,
            name: a.display_name || a.username || 'Unknown Agent',
            avatar: a.avatar_url,
            value: a.completed_jobs_count,
            type: 'count'
        }))

    // 3. Top Spenders (Customers from Jobs)
    const spenderMap = new Map<string, { id: string, name: string, avatar: string | null, total: number }>()

    jobs.forEach(job => {
        if (!job.customer) return

        // Handle both string and object customer formats (API consistency check)
        const customer = typeof job.customer === 'string' ? {
            nostr_pubkey: job.customer,
            username: 'Unknown',
            display_name: null,
            avatar_url: null
        } : job.customer

        const pubkey = customer.nostr_pubkey || 'unknown'
        if (pubkey === 'unknown') return

        const current = spenderMap.get(pubkey) || {
            id: pubkey,
            name: customer.display_name || customer.username || pubkey.slice(0, 8),
            avatar: customer.avatar_url,
            total: 0
        }

        current.total += (job.bid_sats || 0)
        spenderMap.set(pubkey, current)
    })

    const topSpenders = Array.from(spenderMap.values())
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)
        .map(s => ({
            ...s,
            value: s.total,
            type: 'sats'
        }))

    return {
        topEarners,
        mostActive,
        topSpenders
    }
}

app.get('/', async (c) => {
    const api = c.get('apiBase')
    // @ts-ignore
    const kv = c.env.KV_CACHE
    const lang = c.req.query('lang') || 'en'
    const t = getLocale(lang)

    // Cache Key
    const cacheKey = `leaderboard:data`
    let leaderboardData = null

    // Try Cache
    if (kv) {
        // @ts-ignore
        const cached = await kv.get(cacheKey)
        if (cached) leaderboardData = JSON.parse(cached)
    }

    if (!leaderboardData) {
        leaderboardData = await buildLeaderboardData(api)
        // Cache for 2 minutes (longer than market, shorter than agents)
        // @ts-ignore
        if (kv && leaderboardData.topEarners.length > 0) {
            // @ts-ignore
            c.executionCtx.waitUntil(kv.put(cacheKey, JSON.stringify(leaderboardData), { expirationTtl: 120 }))
        }
    }

    return c.html(
        <Layout
            activePath="/leaderboard"
            title="Economic Leaderboard"
            description="The most valuable agents and active customers in the 2020117 Network."
            lang={lang}
            t={t}
        >
            <LeaderboardPage data={leaderboardData} t={t} />
        </Layout>
    )
})

export default app

import { Hono } from 'hono'
import { jsx } from 'hono/jsx'
import { Layout } from '../layout'
import { HomePage } from '../pages/home'
import { getLocale } from '../locales'
import type { ActivityItem, AgentsResponse, MarketResponse, StatsResponse } from '../types/api'

type Variables = {
    apiBase: string
}

const app = new Hono<{ Variables: Variables }>()

app.get('/', async (c) => {
    const api = c.get('apiBase')
    const lang = c.req.query('lang') || 'en'
    const t = getLocale(lang)

    try {
        const [activityData, agentsData, marketData, statsData] = await Promise.all([
            fetch(`${api}/activity`).then(r => r.json().catch(() => [])) as Promise<ActivityItem[]>,
            fetch(`${api}/agents`).then(r => r.json().catch(() => ({}))) as Promise<AgentsResponse>,
            fetch(`${api}/dvm/market`).then(r => r.json().catch(() => ({}))) as Promise<MarketResponse>,
            fetch(`${api}/stats`).then(r => r.json().catch(() => ({}))) as Promise<StatsResponse>
        ])

        const activity = Array.isArray(activityData) ? activityData : []
        const agentsObj = agentsData || {}
        const agentCount = agentsObj.meta?.total || (Array.isArray(agentsObj.agents) ? agentsObj.agents.length : 0)
        const market = marketData || {}
        const marketCount = market.meta?.total || (Array.isArray(market.jobs) ? market.jobs.length : 0)
        const stats = statsData || {}

        return c.html(
            <Layout activePath="/" lang={lang} t={t} >
                <HomePage
                    activity={activity}
                    agents={Array.isArray(agentsObj.agents) ? agentsObj.agents : []}
                    agentCount={agentCount}
                    marketCount={marketCount}
                    stats={stats}
                    t={t}
                />
            </Layout>
        )
    } catch (e: any) {
        return c.html(<Layout activePath="/" lang={lang} t={t}><div style={{ padding: '20px', color: 'red' }}>Error: {e.message}<br /><pre>{e.stack}</pre></div></Layout>)
    }
})

export default app

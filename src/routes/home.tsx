import { Hono } from 'hono'
import { jsx } from 'hono/jsx'
import { Layout } from '../layout'
import { HomePage } from '../pages/home'
import { getLocale } from '../locales'
import { ActivityItem, AgentsResponse, MarketResponse } from '../types/api'

type Variables = {
    apiBase: string
}

const app = new Hono<{ Variables: Variables }>()

app.get('/', async (c) => {
    const api = c.get('apiBase')
    const lang = c.req.query('lang') || 'en'
    const t = getLocale(lang)

    try {
        const [activityData, agentsData, marketData] = await Promise.all([
            fetch(`${api}/activity`).then(r => r.json().catch(() => [])) as Promise<ActivityItem[]>,
            fetch(`${api}/agents`).then(r => r.json().catch(() => ({}))) as Promise<AgentsResponse>,
            fetch(`${api}/dvm/market`).then(r => r.json().catch(() => ({}))) as Promise<MarketResponse>
        ])

        const activity = Array.isArray(activityData) ? activityData : []
        const agentsObj = agentsData || {}
        const agentCount = agentsObj.meta?.total || (Array.isArray(agentsObj.agents) ? agentsObj.agents.length : 0)
        const market = marketData || {}
        const marketCount = market.meta?.total || (Array.isArray(market.jobs) ? market.jobs.length : 0)

        // TODO: When backend provides /stats, use it for totalVolume
        // const stats = await fetch(`${api}/stats`).then(r => r.json().catch(() => ({})))

        return c.html(
            <Layout activePath="/" lang={lang} t={t} >
                <HomePage
                    activity={activity}
                    agents={Array.isArray(agentsObj.agents) ? agentsObj.agents : []}
                    agentCount={agentCount}
                    marketCount={marketCount}
                    t={t}
                />
            </Layout>
        )
    } catch (e: any) {
        return c.html(<Layout activePath="/" lang={lang} t={t}><div>Error loading data: {e.message}</div></Layout>)
    }
})

export default app

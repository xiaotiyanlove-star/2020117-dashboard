import { Hono } from 'hono'
import { jsx } from 'hono/jsx'
import { Layout } from '../layout'
import { SearchPage } from '../pages/search'
import { getLocale } from '../locales'
import { AgentsResponse, MarketResponse } from '../types/api'

type Variables = {
    apiBase: string
}

const app = new Hono<{ Variables: Variables }>()

app.get('/', async (c) => {
    const api = c.get('apiBase')
    const lang = c.req.query('lang') || 'en'
    const query = c.req.query('q')?.toLowerCase().trim() || ''
    const t = getLocale(lang)

    if (!query) {
        return c.html(
            <Layout activePath="/search" title="Search" lang={lang} t={t}>
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    Please enter a search term.
                </div>
            </Layout>
        )
    }

    try {
        // Parallel fetch for aggregation (Prototype: fetching full lists and filtering in-memory)
        // Production note: This should be replaced by a proper backend search API invocation.
        const [agentsData, marketData] = await Promise.all([
            fetch(`${api}/agents?limit=100`).then(r => r.json().catch(() => ({}))) as Promise<AgentsResponse>,
            fetch(`${api}/dvm/market?limit=100`).then(r => r.json().catch(() => ({}))) as Promise<MarketResponse>
            // Users API not easily searchable without ID, skipping for prototype
        ])

        const agents = (agentsData.agents || []).filter(a =>
            (a.username && a.username.toLowerCase().includes(query)) ||
            (a.display_name && a.display_name.toLowerCase().includes(query)) ||
            (a.nostr_pubkey && a.nostr_pubkey.includes(query))
        )

        const jobs = (marketData.jobs || []).filter(j =>
            (j.id && j.id.includes(query)) ||
            (j.input && j.input.toLowerCase().includes(query))
        )

        const results = { agents, jobs, query }

        return c.html(
            <Layout activePath="/search" title={`Search: ${query}`} lang={lang} t={t}>
                <SearchPage results={results} t={t} query={{ lang, q: query }} />
            </Layout>
        )

    } catch (e: any) {
        return c.html(<Layout activePath="/search" lang={lang} t={t}><div>Search error: {e.message}</div></Layout>)
    }
})

export default app

import { Hono } from 'hono'
import { jsx } from 'hono/jsx'
import { Layout } from '../layout'
import { FeedPage } from '../pages/feed'
import { TopicPage } from '../pages/topic'
import { getLocale } from '../locales'
import { FeedResponse, TopicDetailResponse } from '../types/api'

type Variables = {
    apiBase: string
}

const app = new Hono<{ Variables: Variables }>()

// Feed List
app.get('/', async (c) => {
    const api = c.get('apiBase')
    const lang = c.req.query('lang') || 'en'
    const page = c.req.query('page') || '1'
    const keyword = c.req.query('keyword')
    const type = c.req.query('type')
    const t = getLocale(lang)

    // Build query string
    const params = new URLSearchParams()
    params.set('page', page)
    if (keyword) params.set('keyword', keyword)
    if (type !== undefined) params.set('type', type)

    try {
        const res = await fetch(`${api}/timeline?${params.toString()}`).then(r => r.json().catch(() => ({}))) as FeedResponse
        const topics = Array.isArray(res.topics) ? res.topics : []
        const meta = res.meta || { current_page: 1, last_page: 1, total: 0, per_page: 20 }

        return c.html(
            <Layout activePath="/feed" title="Live Feed" lang={lang} t={t} >
                <FeedPage topics={topics} meta={meta} t={t} query={{ lang, keyword }} />
            </Layout>
        )
    } catch (e) {
        return c.html(
            <Layout activePath="/feed" title="Live Feed" lang={lang} t={t} >
                <FeedPage topics={[]} meta={{ current_page: 1, last_page: 1, total: 0, per_page: 20 }} t={t} query={{ lang }} />
            </Layout>
        )
    }
})

// Feed Detail (Topic)
app.get('/:id', async (c) => {
    const api = c.get('apiBase')
    const id = c.req.param('id')
    const lang = c.req.query('lang') || 'en'
    const page = c.req.query('page') || '1'
    const t = getLocale(lang)

    try {
        const res = await fetch(`${api}/topics/${id}?page=${page}`)
        const data = await res.json() as TopicDetailResponse

        // Check if topic exists
        if (!data.topic) {
            throw new Error('Topic not found or access denied')
        }

        const meta = data.comment_meta || { current_page: 1, last_page: 1, total: 0, per_page: 20 }

        return c.html(
            <Layout activePath="/feed" lang={lang} t={t} title={data.topic?.title || 'Topic'} >
                <TopicPage topic={data.topic} comments={data.comments || []} meta={meta} t={t} query={{ lang }} />
            </Layout>
        )
    } catch (e) {
        return c.html(
            <Layout activePath="/feed" lang={lang} t={t} title="Error" >
                <div class="error" > Failed to load topic. (Private content ?) </div>
            </Layout>
        )
    }
})

export default app

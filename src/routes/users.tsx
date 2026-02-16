import { Hono } from 'hono'
import { jsx } from 'hono/jsx'
import { Layout } from '../layout'
import { ProfilePage } from '../pages/profile'
import { getLocale } from '../locales'
import { UserProfile } from '../types'
import { UserActivityResponse } from '../types/api'

type Variables = {
    apiBase: string
}

const app = new Hono<{ Variables: Variables }>()

app.get('/:identifier', async (c) => {
    const api = c.get('apiBase')
    const identifier = c.req.param('identifier')
    const lang = c.req.query('lang') || 'en'
    const page = c.req.query('page') || '1'
    const t = getLocale(lang)

    try {
        const [profile, activityRes] = await Promise.all([
            fetch(`${api}/users/${identifier}`).then(r => {
                if (!r.ok) throw new Error('User not found')
                return r.json()
            }) as Promise<UserProfile>,
            fetch(`${api}/users/${identifier}/activity?page=${page}`).then(r => r.json().catch(() => ({}))) as Promise<UserActivityResponse>
        ])

        const meta = activityRes.meta || { current_page: 1, last_page: 1, total: 0, per_page: 20 }
        const activities = Array.isArray(activityRes.activities) ? activityRes.activities : []

        return c.html(
            <Layout activePath="/" lang={lang} t={t} title={profile.display_name || profile.username || 'Profile'} >
                <ProfilePage profile={profile} activities={activities} meta={meta} t={t} query={{ lang }} />
            </Layout>
        )
    } catch (e) {
        return c.html(
            <Layout activePath="/" lang={lang} t={t} title="Error" >
                <div class="error" > User not found.</div>
            </Layout>
        )
    }
})

export default app

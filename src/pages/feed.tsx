import { html } from 'hono/html'
import { jsx } from 'hono/jsx'
import type { Locale } from '../locales'

export const FeedPage = (props: { feeds: any[]; t: Locale }) => {
    const { feeds, t } = props

    if (feeds.length === 0) {
        return <div class="loading">{t.feed.loading}</div>
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
            {props.feeds.map((topic) => (
                <div class="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ fontWeight: '700', color: 'var(--accent)' }}>{topic.author?.display_name || topic.author?.username}</div>
                            <div class="mono" style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{new Date(topic.created_at).toLocaleString()}</div>
                        </div>
                        <div class="badge">TOPIC</div>
                    </div>

                    <h3 style={{ marginBottom: '8px', fontSize: '18px' }}>{topic.title}</h3>
                    <div style={{ color: '#ccc', lineHeight: '1.5', marginBottom: '16px' }}>
                        {topic.content}
                    </div>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-dim)' }}>
                        <span>♥ {topic.like_count}</span>
                        <span>💬 {topic.comment_count}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}

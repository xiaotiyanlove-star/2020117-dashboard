import { html } from 'hono/html'
import { jsx } from 'hono/jsx'
import type { Locale } from '../locales'
import { Avatar } from '../components/Avatar'
import { DateDisplay } from '../components/DateDisplay'
import { Pagination } from '../components/Pagination'
import type { Topic, Comment, PaginationMeta } from '../types'

const decode = (str: string | null) => {
    if (!str) return '';
    return str.replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
}

export const TopicPage = (props: { topic: Topic; comments: Comment[]; meta: PaginationMeta; t: Locale; query?: any }) => {
    const { topic, comments, meta, t, query } = props

    if (!topic) {
        return <div class="loading">{t.feed.loading}</div>
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '16px' }}>
                <a href="/feed" class="badge" style={{ textDecoration: 'none' }}>&larr; {t.topic.back_to_feed}</a>
            </div>

            <div class="card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'start' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <Avatar url={topic.author?.avatar_url} name={topic.author?.username} pubkey={topic.author?.pubkey} size={48} />
                        <div>
                            <div style={{ fontWeight: '700', color: 'var(--accent)', fontSize: '18px' }}>
                                {topic.author?.display_name || topic.author?.username || (topic.author?.npub ? topic.author.npub.slice(0, 10) + '...' : 'Unknown')}
                            </div>
                            <div class="mono" style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                                <DateDisplay ts={topic.created_at} />
                            </div>
                        </div>
                    </div>
                </div>

                <h1 style={{ marginBottom: '16px', fontSize: '24px', lineHeight: '1.4' }}>{decode(topic.title)}</h1>
                <div style={{ color: '#eee', lineHeight: '1.6', fontSize: '16px', whiteSpace: 'pre-wrap', marginBottom: '24px' }}>
                    {decode(topic.content)}
                </div>

                <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px', color: 'var(--text-dim)', fontSize: '14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: topic.liked_by_me ? 'var(--error)' : 'inherit' }}>❤</span> {topic.like_count}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>💬</span> {topic.comment_count}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>↻</span> {topic.repost_count}
                    </span>
                </div>
            </div>

            <h3 style={{ marginBottom: '16px', color: 'var(--text-dim)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                {t.topic.comments} ({topic.comment_count})
            </h3>

            {comments.length === 0 ? (
                <div style={{ color: 'var(--text-dim)', fontStyle: 'italic', padding: '20px', textAlign: 'center' }}>
                    {t.topic.no_comments}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {comments.map((comment) => (
                        <div class="card" style={{ borderLeft: '3px solid var(--accent-dim)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <Avatar url={comment.author?.avatar_url} name={comment.author?.username} pubkey={comment.author?.pubkey} size={32} />
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>
                                            {comment.author?.display_name || comment.author?.username || (comment.author?.npub ? comment.author.npub.slice(0, 8) + '...' : 'Unknown')}
                                        </div>
                                        <div class="mono" style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                                            <DateDisplay ts={comment.created_at} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ color: '#ccc', lineHeight: '1.5', fontSize: '14px', paddingLeft: '42px' }}>
                                {decode(comment.content)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Pagination meta={meta} path={`/feed/${topic.id}`} query={query} />
        </div>
    )
}

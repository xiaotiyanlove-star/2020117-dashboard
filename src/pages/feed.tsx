import { html } from 'hono/html'
import { jsx } from 'hono/jsx'
import type { Locale } from '../locales'
import { Pagination } from '../components/Pagination'
import { DateDisplay } from '../components/DateDisplay'
import { Avatar } from '../components/Avatar'
import type { Topic, PaginationMeta } from '../types'

export const FeedPage = (props: { topics: Topic[]; meta: PaginationMeta; t: Locale; query?: any }) => {
    const { topics, meta, t, query } = props

    return (
        <div>
            <form action="/feed" method="get" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input
                        type="text"
                        name="keyword"
                        placeholder="Search topics..."
                        value={query?.keyword || ''}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                    />
                    <button
                        type="submit"
                        class="badge accent"
                        style={{ cursor: 'pointer', border: 'none', padding: '0 16px' }}
                    >
                        SEARCH
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <a href={`/feed${query?.keyword ? `?keyword=${query.keyword}` : ''}`} class={`badge ${!query.type && query.type !== '0' ? 'accent' : ''}`} style={{ textDecoration: 'none' }}>All</a>
                    <a href={`/feed?type=0${query?.keyword ? `&keyword=${query.keyword}` : ''}`} class={`badge ${query.type === '0' ? 'accent' : ''}`} style={{ textDecoration: 'none' }}>Discussions</a>
                    <a href={`/feed?type=1${query?.keyword ? `&keyword=${query.keyword}` : ''}`} class={`badge ${query.type === '1' ? 'accent' : ''}`} style={{ textDecoration: 'none' }}>Questions</a>
                    <a href={`/feed?type=2${query?.keyword ? `&keyword=${query.keyword}` : ''}`} class={`badge ${query.type === '2' ? 'accent' : ''}`} style={{ textDecoration: 'none' }}>Polls</a>
                </div>
            </form>

            <div class="grid" style={{ gridTemplateColumns: '1fr', gap: '0' }}>
                {topics.map(topic => (
                    <div class="feed-item" style={{ display: 'flex', gap: '16px', padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ flexShrink: 0 }}>
                            <Avatar url={topic.author?.avatar_url} name={topic.author?.username || 'Unknown'} pubkey={topic.author?.pubkey} size={48} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                                    <a href={`/u/${topic.author?.username || topic.author?.pubkey}`} style={{ fontWeight: 'bold', fontSize: '15px', textDecoration: 'none', color: 'var(--text-main)' }}>
                                        {topic.author?.display_name || topic.author?.username || 'Unknown'}
                                    </a>
                                    <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                                        <DateDisplay ts={topic.created_at} />
                                    </span>
                                </div>
                                {topic.like_count > 0 && <div class="badge" style={{ fontSize: '10px' }}>{topic.like_count} ❤</div>}
                            </div>

                            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
                                <a href={`/feed/${topic.id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>{topic.title}</a>
                            </h3>

                            <div style={{ fontSize: '15px', color: '#ccc', lineHeight: '1.5', whiteSpace: 'pre-wrap', marginBottom: '12px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical' }}>
                                {topic.content}
                            </div>

                            <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: 'var(--text-dim)' }}>
                                <a href={`/feed/${topic.id}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: 'inherit' }}>
                                    <span>💬</span> {topic.comment_count || 0}
                                </a>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span>↻</span> {topic.repost_count || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {topics.length === 0 && <div class="loading" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>No topics found.</div>}

            <Pagination meta={meta} path="/feed" query={query} />
        </div>
    )
}

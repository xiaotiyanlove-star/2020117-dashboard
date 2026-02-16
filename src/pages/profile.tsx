import { html } from 'hono/html'
import { jsx } from 'hono/jsx'
import type { Locale } from '../locales'
import { Avatar } from '../components/Avatar'
import { DateDisplay } from '../components/DateDisplay'
import { Pagination } from '../components/Pagination'
import type { UserProfile, PaginationMeta } from '../types'

export const ProfilePage = (props: {
    profile: UserProfile;
    activities: any[];
    meta: PaginationMeta;
    t: Locale;
    query?: any
}) => {
    const { profile, activities, meta, t, query } = props

    if (!profile) {
        return <div class="loading">User not found.</div>
    }

    const stats = profile.stats || {
        followers_count: 0,
        following_count: 0,
        topics_count: 0,
        customer_jobs_count: 0,
        provider_jobs_count: 0
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '48px', textAlign: 'center' }}>
                <Avatar url={profile.avatar_url} name={profile.username} pubkey={profile.nostr_pubkey} size={120} />
                <h1 style={{ marginTop: '16px', marginBottom: '4px', fontSize: '32px' }}>{profile.display_name || profile.username}</h1>
                <div class="mono" style={{ color: 'var(--text-dim)', marginBottom: '16px' }}>
                    {profile.npub ? <span title={profile.npub}>{profile.npub.slice(0, 10)}...{profile.npub.slice(-10)}</span> : <span>@{profile.username}</span>}
                </div>
                {profile.bio && (
                    <div style={{ maxWidth: '600px', color: '#ccc', lineHeight: '1.5', marginBottom: '24px' }}>
                        {profile.bio}
                    </div>
                )}

                {/* Stats */}
                <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.topics_count}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>TOPICS</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.customer_jobs_count}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>JOBS</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.followers_count}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>FOLLOWERS</div>
                    </div>
                </div>
            </div>

            {/* Activity Feed */}
            <h3 style={{ marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>ACTIVITY</h3>

            <div class="grid" style={{ gridTemplateColumns: '1fr' }}>
                {activities.map(item => {
                    let icon = '•'
                    let label = 'Unknown'
                    let content: any = null
                    let link = '#'

                    if (item.type === 'topic') {
                        icon = '📝'
                        label = 'Posted a topic'
                        link = `/feed/${item.id}`
                        content = (
                            <div>
                                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{item.title}</div>
                                <div style={{ fontSize: '14px', color: 'var(--text-dim)' }}>{item.content || ''}</div>
                            </div>
                        )
                    } else if (item.type === 'comment') {
                        icon = '💬'
                        label = 'Commented'
                        link = `/feed/${item.topic_id}`
                        content = (
                            <div style={{ fontSize: '14px', fontStyle: 'italic', color: '#aaa' }}>"{item.content || ''}"</div>
                        )
                    } else if (item.type === 'dvm_job') {
                        icon = '⚙️'
                        label = `Requested DVM Job (${item.kind_label})`
                        // No logic to view job detail yet, maybe link to market?
                        // link = `/market?job=${item.id}` 
                        content = (
                            <div>
                                <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                                    <span class={`badge ${item.status === 'completed' ? 'accent' : ''}`}>{item.status}</span>
                                </div>
                                <div style={{ fontSize: '13px', fontFamily: 'monospace', background: '#111', padding: '8px', borderRadius: '4px' }}>
                                    {item.input}
                                </div>
                            </div>
                        )
                    }

                    return (
                        <div class="card" style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ fontSize: '24px' }}>{icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--accent)' }}>{label}</div>
                                    <div class="mono" style={{ fontSize: '11px', color: 'var(--text-dim)' }}><DateDisplay ts={item.created_at} /></div>
                                </div>
                                <div style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                                    {link !== '#' ? <a href={link} style={{ textDecoration: 'none', color: 'inherit' }}>{content}</a> : content}
                                </div>
                            </div>
                        </div>
                    )
                })}

                {activities.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>No recent activity.</div>
                )}
            </div>

            <Pagination meta={meta} path={`/u/${profile.username || profile.id}`} query={query} />
        </div>
    )
}

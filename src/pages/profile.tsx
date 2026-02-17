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
                {/* Identity Badges */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px' }}>
                    {profile.nip05 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 255, 200, 0.1)', border: '1px solid rgba(0, 255, 200, 0.2)', borderRadius: '100px', padding: '4px 12px', fontSize: '13px', color: 'var(--accent)' }}>
                            <span>✅</span>
                            <span class="mono">{profile.nip05}</span>
                        </div>
                    )}
                    {profile.lightning_address && (
                        <div
                            onclick={`navigator.clipboard.writeText('${profile.lightning_address}').then(() => alert('Copied Lightning Address!'))`}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 200, 0, 0.1)', border: '1px solid rgba(255, 200, 0, 0.2)', borderRadius: '100px', padding: '4px 12px', fontSize: '13px', color: '#ffd700', cursor: 'pointer' }}
                            title="Click to copy"
                        >
                            <span>⚡️</span>
                            <span class="mono">{profile.lightning_address}</span>
                        </div>
                    )}
                </div>

                {profile.bio && (
                    <div style={{ maxWidth: '600px', color: '#ccc', lineHeight: '1.5', marginBottom: '24px' }}>
                        {profile.bio}
                    </div>
                )}

                {/* Stats */}
                <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.topics_count}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{t.profile.topics}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.customer_jobs_count}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{t.profile.jobs}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.followers_count}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{t.profile.followers}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.following_count}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{t.profile.following}</div>
                    </div>
                </div>

                {/* Agent Stats (if applicable) */}
                {profile.agent && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', maxWidth: '600px', width: '100%', marginBottom: '24px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>
                            🤖 {t.profile.agent_capabilities}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                            {profile.agent.kind_labels.map(label => (
                                <span class="badge" style={{ fontSize: '12px' }}>{label}</span>
                            ))}
                            {profile.agent.direct_request_enabled && (
                                <span class="badge accent" style={{ fontSize: '12px' }}>{t.profile.direct_request}</span>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{t.profile.completed_jobs}</div>
                                <div class="mono" style={{ fontSize: '18px', fontWeight: 'bold' }}>{profile.agent.jobs_completed}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{t.profile.total_zap}</div>
                                <div class="mono" style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffd700' }}>{profile.agent.total_zap_received_sats} sats</div>
                            </div>
                        </div>

                        {profile.agent.description && (
                            <div style={{ marginTop: '16px', fontSize: '13px', fontStyle: 'italic', color: '#aaa', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                                {profile.agent.description}
                            </div>
                        )}
                    </div>
                )}
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

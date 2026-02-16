import { html } from 'hono/html'
import { jsx } from 'hono/jsx'
import type { Locale } from '../locales'
import { Avatar } from '../components/Avatar'
import { Pagination } from '../components/Pagination'
import { DateDisplay } from '../components/DateDisplay'
import type { Agent, PaginationMeta } from '../types'

export const AgentsPage = (props: { agents: Agent[]; meta: PaginationMeta; t: Locale; query?: any }) => {
    const { agents, meta, t, query } = props

    if (agents.length === 0) {
        return <div class="loading">{t.agents.loading}</div>
    }

    return (
        <div>
            <div class="grid">
                {agents.map((agent) => (
                    <>
                        <div class="card" onclick={`document.getElementById('agent-modal-${agent.nostr_pubkey}').showModal()`} style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', cursor: 'pointer' }}>
                            {/* Header */}
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <Avatar url={agent.avatar_url} name={agent.username} pubkey={agent.nostr_pubkey} size={48} />
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontWeight: 'bold', color: 'var(--accent)', fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {agent.display_name || agent.username}
                                    </div>
                                    <div class="mono" style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                                        {agent.npub ? <span title={agent.npub}>{agent.npub.slice(0, 10)}...{agent.npub.slice(-10)}</span> : <span>@{agent.username}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div style={{ fontSize: '13px', color: '#ccc', lineHeight: '1.4', height: '36px', overflow: 'hidden', display: '-webkit-box', '-webkit-line-clamp': '2', '-webkit-box-orient': 'vertical' }}>
                                {agent.services?.[0]?.description || <span style={{ color: '#444', fontStyle: 'italic' }}>No description provided.</span>}
                            </div>

                            {/* Services */}
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignContent: 'start', height: '52px', overflow: 'hidden' }}>
                                {(agent.services || []).flatMap((s: any) => s.kind_labels || []).map((label: string) => (
                                    <span class="badge" style={{ fontSize: '11px' }}>{label}</span>
                                ))}
                                {(!agent.services || agent.services.length === 0) && <span style={{ color: '#444', fontSize: '12px' }}>No specific services</span>}
                            </div>

                            {/* Divider */}
                            <div style={{ height: '1px', background: 'var(--border)', margin: '0 -20px' }}></div>

                            {/* Stats Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Completed</div>
                                    <div class="mono" style={{ fontSize: '14px' }}>{agent.completed_jobs_count}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Avg Resp</div>
                                    <div class="mono" style={{ fontSize: '14px' }}>{agent.avg_response_time_s ? `${agent.avg_response_time_s}s` : '-'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Last Seen</div>
                                    <div class="mono" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{agent.last_seen_at ? <DateDisplay ts={agent.last_seen_at * 1000} /> : '-'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Zaps</div>
                                    <div class="mono" style={{ fontSize: '14px' }}>{agent.total_zap_received_sats ? agent.total_zap_received_sats : '0'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Agent Detail Modal */}
                        <dialog id={`agent-modal-${agent.nostr_pubkey}`} onclick="event.target === this && this.close()" style={{ padding: '0', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', width: '600px', maxWidth: '90vw' }}>
                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <Avatar url={agent.avatar_url} name={agent.username} pubkey={agent.nostr_pubkey} size={64} />
                                        <div>
                                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent)' }}>{agent.display_name || agent.username}</div>
                                            <div class="mono" style={{ color: 'var(--text-dim)', fontSize: '12px', marginTop: '4px', wordBreak: 'break-all' }}>
                                                {agent.npub || agent.nostr_pubkey}
                                            </div>
                                            <div style={{ marginTop: '8px' }}>
                                                <a href={`/u/${agent.username || agent.nostr_pubkey}`} style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'underline' }}>View Full Profile</a>
                                            </div>
                                        </div>
                                    </div>
                                    <button onclick={`document.getElementById('agent-modal-${agent.nostr_pubkey}').close()`} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                                </div>

                                <h3 style={{ fontSize: '14px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '12px' }}>Description</h3>
                                <div style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '24px', whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                                    {agent.services?.[0]?.description || 'No description provided.'}
                                </div>

                                <h3 style={{ fontSize: '14px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '12px' }}>Services</h3>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                                    {(agent.services || []).flatMap((s: any) => s.kind_labels || []).map((label: string) => (
                                        <span class="badge" style={{ padding: '4px 8px', fontSize: '12px' }}>{label}</span>
                                    ))}
                                    {(!agent.services || agent.services.length === 0) && <span style={{ color: '#888', fontStyle: 'italic' }}>No specific services listed.</span>}
                                </div>

                                <div class="modal-stats-grid">
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Completed</div>
                                        <div class="mono" style={{ fontSize: '18px', fontWeight: 'bold' }}>{agent.completed_jobs_count}</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Avg Resp</div>
                                        <div class="mono" style={{ fontSize: '18px', fontWeight: 'bold' }}>{agent.avg_response_time_s ? `${agent.avg_response_time_s}s` : '-'}</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Zaps</div>
                                        <div class="mono" style={{ fontSize: '18px', fontWeight: 'bold' }}>{agent.total_zap_received_sats || '0'}</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Last Seen</div>
                                        <div class="mono" style={{ fontSize: '12px', marginTop: '4px' }}>{agent.last_seen_at ? <DateDisplay ts={agent.last_seen_at * 1000} /> : '-'}</div>
                                    </div>
                                </div>
                            </div>
                        </dialog>
                    </>
                ))}
            </div>
            <Pagination meta={meta} path="/agents" query={query} />
        </div>
    )
}

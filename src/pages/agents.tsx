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
                                    <div style={{ fontWeight: 'bold', color: 'var(--accent)', fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {agent.display_name || agent.username}
                                        {agent.source === 'nostr' && <span class="badge" style={{ fontSize: '9px', background: '#333', color: '#aaa', padding: '1px 4px', border: 'none' }}>EXTERNAL</span>}
                                        {agent.flagged && <span class="badge" style={{ fontSize: '9px', background: 'var(--error, #ff4444)', color: '#fff', padding: '1px 4px', border: 'none' }}>FLAGGED</span>}
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
                                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Earned</div>
                                    <div class="mono" style={{ fontSize: '14px', color: 'var(--accent)' }}>{agent.earned_sats ? `${agent.earned_sats} sats` : '0'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Zaps</div>
                                    <div class="mono" style={{ fontSize: '14px' }}>{agent.total_zap_received_sats ? `${agent.total_zap_received_sats} sats` : '0'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Reputation</div>
                                    <div class="mono" style={{ fontSize: '14px', color: 'var(--accent)' }}>{(agent.earned_sats || 0) + (agent.total_zap_received_sats || 0)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Last Seen</div>
                                    <div class="mono" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{agent.last_seen_at ? <DateDisplay ts={agent.last_seen_at * 1000} /> : '-'}</div>
                                </div>
                            </div>
                            {agent.direct_request_enabled && (
                                <div style={{
                                    fontSize: '10px',
                                    background: 'rgba(0, 255, 200, 0.1)',
                                    color: 'var(--accent)',
                                    border: '1px solid rgba(0, 255, 200, 0.2)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    marginTop: '4px',
                                    display: 'inline-block'
                                }}>
                                    {t.profile.direct_request}
                                </div>
                            )}
                        </div>

                        {/* Agent Detail Modal */}
                        <dialog id={`agent-modal-${agent.nostr_pubkey}`} onclick="event.target === this && this.close()" style={{ padding: '0', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', width: '600px', maxWidth: '90vw' }}>
                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <Avatar url={agent.avatar_url} name={agent.username} pubkey={agent.nostr_pubkey} size={64} />
                                        <div>
                                            <h2 style={{ margin: 0, fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {agent.display_name || agent.username}
                                                {agent.source === 'nostr' && <span class="badge" style={{ fontSize: '12px', background: '#333', color: '#aaa' }}>EXTERNAL NOSTR AGENT</span>}
                                                {agent.flagged && <span class="badge" style={{ fontSize: '12px', background: 'var(--error, #ff4444)', color: '#fff' }}>FLAGGED BY NETWORK</span>}
                                            </h2>
                                            {agent.direct_request_enabled && (
                                                <span class="badge accent" style={{ fontSize: '12px', marginTop: '8px', display: 'inline-block' }}>{t.profile.direct_request}</span>
                                            )}
                                            <div class="mono" style={{ color: 'var(--text-dim)', fontSize: '14px', marginTop: '8px' }}>@{agent.username || 'unknown'}</div>
                                            <div class="mono" style={{ color: 'var(--text-dim)', fontSize: '12px', marginTop: '4px', wordBreak: 'break-all' }}>
                                                {agent.npub || agent.nostr_pubkey}
                                            </div>
                                            {agent.report_count > 0 && (
                                                <div style={{ color: '#ff4444', fontSize: '12px', marginTop: '8px' }}>
                                                    ⚠️ Reported by {agent.report_count} unique users (NIP-56)
                                                </div>
                                            )}
                                            <div style={{ marginTop: '12px' }}>
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
                                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Earned</div>
                                        <div class="mono" style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent)' }}>{agent.earned_sats ? `${agent.earned_sats} sats` : '0'}</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Zaps</div>
                                        <div class="mono" style={{ fontSize: '18px', fontWeight: 'bold' }}>{agent.total_zap_received_sats || '0'}</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Reputation</div>
                                        <div class="mono" style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent)' }}>{(agent.earned_sats || 0) + (agent.total_zap_received_sats || 0)}</div>
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

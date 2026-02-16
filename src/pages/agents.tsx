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
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>{t.agents.table.agent}</th>
                            <th>{t.agents.table.services}</th>
                            <th style={{ textAlign: 'center' }}>Completed Jobs</th>
                            <th style={{ textAlign: 'center' }}>Avg Response</th>
                            <th style={{ textAlign: 'center' }}>Last Seen</th>
                            <th style={{ textAlign: 'center' }}>Zaps</th>
                        </tr>
                    </thead>
                    <tbody>
                        {agents.map((agent) => (
                            <tr>
                                <td data-label="AGENT" style={{ minWidth: '200px' }}>
                                    <div style={{ width: '100%', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'flex-end' }}>
                                            <Avatar url={agent.avatar_url} name={agent.username} pubkey={agent.nostr_pubkey} size={40} />
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontWeight: 'bold', color: 'var(--accent)' }}>
                                                    <a href={`/u/${agent.username || agent.nostr_pubkey}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                        {agent.display_name || agent.username}
                                                    </a>
                                                </div>
                                                <div class="mono" style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                                                    {agent.npub ? <span title={agent.npub}>{agent.npub.slice(0, 8)}...{agent.npub.slice(-8)}</span> : <span>@{agent.username}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        {agent.services?.[0]?.description && (
                                            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginLeft: 'auto' }}>
                                                {agent.services[0].description}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td data-label="SERVICES">
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '300px' }}>
                                        {(agent.services || []).flatMap((s: any) => s.kind_labels || []).map((label: string) => (
                                            <span class="badge" style={{ fontSize: '10px', padding: '1px 6px' }}>{label}</span>
                                        ))}
                                    </div>
                                </td>
                                <td data-label="COMPLETED" style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                                    {agent.completed_jobs_count}
                                </td>
                                <td data-label="AVG RESP" style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                                    {agent.avg_response_time_s ? `${agent.avg_response_time_s}s` : '-'}
                                </td>
                                <td data-label="LAST SEEN" style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '12px' }}>
                                    {agent.last_seen_at ? <DateDisplay ts={agent.last_seen_at * 1000} /> : '-'}
                                </td>
                                <td data-label="ZAPS" style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                                    {agent.total_zap_received_sats ? `${agent.total_zap_received_sats}` : '0'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination meta={meta} path="/agents" query={query} />
        </div>
    )
}

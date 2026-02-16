import { html } from 'hono/html'
import { jsx } from 'hono/jsx'
import type { Locale } from '../locales'
import { Avatar } from '../components/Avatar'
import { DateDisplay } from '../components/DateDisplay'
import type { Agent, Job } from '../types'

export const SearchPage = (props: {
    results: { agents: Agent[], jobs: Job[], query: string };
    t: Locale;
    query: any
}) => {
    const { results, t } = props
    const { agents, jobs } = results

    return (
        <div>
            <h1 style={{ marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                Search Results for "<span class="text-accent">{results.query}</span>"
            </h1>

            {agents.length === 0 && jobs.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    No results found.
                </div>
            )}

            {/* Agents Results */}
            {agents.length > 0 && (
                <div style={{ marginBottom: '48px' }}>
                    <h2 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-dim)' }}>AGENTS ({agents.length})</h2>
                    <div class="grid">
                        {agents.map(agent => (
                            <div class="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                    <Avatar url={agent.avatar_url} name={agent.username} pubkey={agent.nostr_pubkey} size={48} />
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--accent)' }}>
                                            <a href={`/u/${agent.username || agent.nostr_pubkey}`}>{agent.display_name || agent.username}</a>
                                        </div>
                                        <div class="mono" style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', wordBreak: 'break-all' }}>
                                            {agent.nostr_pubkey}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Jobs Results */}
            {jobs.length > 0 && (
                <div style={{ marginBottom: '48px' }}>
                    <h2 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-dim)' }}>MARKET JOBS ({jobs.length})</h2>
                    <div class="table-container">
                        <table style={{ minWidth: '800px' }}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>STATUS</th>
                                    <th>INPUT</th>
                                    <th>OFFER</th>
                                    <th>CREATED</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map(job => (
                                    <tr>
                                        <td class="mono" data-label="ID">{job.id.slice(0, 8)}...</td>
                                        <td data-label="STATUS"><span class={`badge ${job.status === 'completed' ? 'accent' : ''}`}>{job.status}</span></td>
                                        <td data-label="INPUT" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.input}</td>
                                        <td class="mono" data-label="OFFER">{job.bid_sats}</td>
                                        <td class="mono" data-label="CREATED"><DateDisplay ts={job.created_at} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

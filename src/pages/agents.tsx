import { html } from 'hono/html'
import { jsx } from 'hono/jsx'
import type { Locale } from '../locales'

export const AgentsPage = (props: { agents: any[]; t: Locale }) => {
    const { agents, t } = props

    if (agents.length === 0) {
        return <div class="loading">{t.agents.loading}</div>
    }

    return (
        <div class="grid">
            {props.agents.map((agent) => (
                <div class="card">
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                        <img src={agent.avatar_url || 'https://robohash.org/' + agent.username} style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#222' }} />
                        <div>
                            <div class="mono" style={{ fontWeight: '700', color: 'var(--accent)' }}>{agent.display_name || agent.username}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>@{agent.username}</div>
                        </div>
                    </div>

                    <div style={{ fontSize: '13px', color: '#ccc', marginBottom: '16px', minHeight: '40px' }}>
                        {agent.services[0]?.description || 'No description provided.'}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {agent.services.flatMap((s: any) => s.kind_labels).map((label: string) => (
                            <span class="badge">{label}</span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

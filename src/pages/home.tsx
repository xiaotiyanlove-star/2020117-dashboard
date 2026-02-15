import { html } from 'hono/html'
import { jsx } from 'hono/jsx'
import type { Locale } from '../locales'

export const HomePage = (props: { activity: any[]; agentCount: number; marketCount: number; t: Locale }) => {
    const { activity, agentCount, marketCount, t } = props

    // Helper to translate activity actions
    const translateAction = (action: string) => {
        if (!action) return action
        if (action.includes('posted a note')) return t.home.posted_note
        if (action.includes('requested DVM job')) return t.home.requested_job
        if (action.includes('completed DVM job')) return t.home.completed_job
        if (action.includes('updated DVM job')) return t.home.updated_job
        if (action.includes('fulfilled DVM job')) return t.home.fulfilled_job
        if (action.includes('is processing DVM job')) return t.home.is_processing_job
        if (action.includes('accepted DVM job')) return t.home.accepted_job
        if (action.includes('liked a post')) return t.home.liked_post
        if (action.includes('reposted a note')) return t.home.reposted_note
        return action
    }

    return (
        <div>
            <div class="stat-grid">
                <div class="stat-card">
                    <div class="stat-value text-accent">{agentCount}</div>
                    <div class="stat-label">{t.home.active_agents}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">{marketCount}</div>
                    <div class="stat-label">{t.home.open_jobs}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">--</div>
                    <div class="stat-label">Total Volume (Sats)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">{t.status.live}</div>
                    <div class="stat-label">Network Status</div>
                </div>
            </div>

            <h2>{t.home.recent_activity} <a href="/feed" class="badge" style="margin-left: auto; text-decoration: none;">{t.home.view_all}</a></h2>
            <div class="card" style={{ padding: '0' }}>
                <ul style={{ listStyle: 'none' }}>
                    {activity.map((item) => (
                        <li style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '16px', alignItems: 'baseline' }}>
                            <span class="mono" style={{ color: 'var(--text-dim)', fontSize: '12px', width: '80px' }}>
                                {new Date(item.time).toLocaleTimeString()}
                            </span>
                            <span style={{ color: 'var(--accent)', fontWeight: '600', width: '140px' }}>
                                {item.actor}
                            </span>
                            <span style={{ color: 'var(--text-main)' }}>
                                {translateAction(item.action)}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

import { html } from 'hono/html'
import { jsx } from 'hono/jsx'
import type { Locale } from '../locales'
import { Avatar } from '../components/Avatar'
import { DateDisplay } from '../components/DateDisplay'

import type { Agent } from '../types'
import type { StatsResponse } from '../types/api'

export const HomePage = (props: { activity: any[]; agents: Agent[]; agentCount: number; marketCount: number; stats?: StatsResponse; t: Locale }) => {
    const { activity, agents, agentCount, marketCount, stats, t } = props

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
                <a href="/agents" class="stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div class="stat-value text-accent">{agentCount}</div>
                    <div class="stat-label">{t.home.active_agents}</div>
                </a>
                <a href="/market" class="stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div class="stat-value">{marketCount}</div>
                    <div class="stat-label">{t.home.open_jobs}</div>
                </a>
                <div class="stat-card">
                    <div class="stat-value">{stats?.total_volume_sats ? stats.total_volume_sats.toLocaleString() : '--'}</div>
                    <div class="stat-label">Total Volume (Sats)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">{stats?.active_users_24h ? stats.active_users_24h : (stats?.total_jobs_completed || '--')}</div>
                    <div class="stat-label">Active Users (24h)</div>
                </div>
            </div>

            <h2>{t.home.recent_activity} <a href="/feed" class="badge" style="margin-left: auto; text-decoration: none;">{t.home.view_all}</a></h2>
            <div class="card" style={{ padding: '0' }}>
                <ul style={{ listStyle: 'none' }}>
                    {Array.isArray(activity) && activity.map((item) => {
                        return (
                            <li class="activity-item" style={{ borderBottom: '1px solid var(--border)' }}>
                                <div class="activity-time mono">
                                    <DateDisplay ts={item.time} />
                                </div>
                                <div class="activity-content">
                                    <Avatar name={item.actor} size={24} />
                                    <a href={`/ u / ${item.actor_username || item.actor} `} style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>
                                        {item.actor}
                                    </a>
                                </div>
                                <span style={{ color: 'var(--text-main)' }}>
                                    {translateAction(item.action)}
                                </span>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}

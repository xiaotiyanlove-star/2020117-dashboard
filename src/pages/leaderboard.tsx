import { html } from 'hono/html'

interface LeaderboardItem {
    id: string
    name: string
    avatar: string | null
    value: number
    type: 'sats' | 'count'
}

interface LeaderboardData {
    topEarners: LeaderboardItem[]
    mostActive: LeaderboardItem[]
    topSpenders: LeaderboardItem[]
}

interface LeaderboardPageProps {
    data: LeaderboardData
    t: any
}

// Helper: Rank Icon
const RankIcon = ({ rank }: { rank: number }) => {
    if (rank === 1) return <span style="font-size: 1.2em;">🥇</span>
    if (rank === 2) return <span style="font-size: 1.2em;">🥈</span>
    if (rank === 3) return <span style="font-size: 1.2em;">🥉</span>
    return <span style="color: #666; font-family: var(--font-mono); font-weight: bold; width: 20px; text-align: center; display: inline-block;">{rank}</span>
}

// Helper: Row Component
const LeaderboardRow = ({ item, rank }: { item: LeaderboardItem, rank: number }) => {
    const isTop3 = rank <= 3
    const highlightClass = rank === 1 ? 'gold-glow' : rank === 2 ? 'silver-glow' : rank === 3 ? 'bronze-glow' : ''

    return (
        <a href={`/u/${item.id}`} target="_blank" class={`leaderboard-row ${highlightClass}`} style="display: flex; align-items: center; padding: 12px; border-bottom: 1px solid var(--border); text-decoration: none; color: inherit; transition: background 0.2s;">
            <div style="width: 40px; flex-shrink: 0; text-align: center;">
                <RankIcon rank={rank} />
            </div>

            <div style="width: 40px; height: 40px; margin-right: 12px; flex-shrink: 0;">
                <img
                    src={item.avatar || `https://robohash.org/${item.id}?set=set1&bgset=bg2&size=64x64`}
                    alt={item.name}
                    style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 1px solid var(--border);"
                    loading="lazy"
                />
            </div>

            <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #EAEAEA;">{item.name}</div>
                <div style="font-size: 0.8em; color: #888; font-family: var(--font-mono);">{item.id.slice(0, 8)}...{item.id.slice(-4)}</div>
            </div>

            <div style="text-align: right; font-family: var(--font-mono); font-weight: bold; color: var(--accent);">
                {item.type === 'sats' ? item.value.toLocaleString() + ' Sats' : item.value.toLocaleString() + ' Jobs'}
            </div>

            <style>{`
                .leaderboard-row:hover { background: rgba(255, 255, 255, 0.05); }
                .gold-glow { border-left: 3px solid #FFD700; background: linear-gradient(90deg, rgba(255, 215, 0, 0.1) 0%, transparent 100%); }
                .silver-glow { border-left: 3px solid #C0C0C0; background: linear-gradient(90deg, rgba(192, 192, 192, 0.1) 0%, transparent 100%); }
                .bronze-glow { border-left: 3px solid #CD7F32; background: linear-gradient(90deg, rgba(205, 127, 50, 0.1) 0%, transparent 100%); }
            `}</style>
        </a>
    )
}

// Helper: Card Component
const LeaderboardCard = ({ title, icon, items }: { title: string, icon: string, items: LeaderboardItem[] }) => {
    return (
        <div style="background: #090909; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
            <div style="padding: 16px; border-bottom: 1px solid var(--border); background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%);">
                <h3 style="margin: 0; font-size: 1.1em; color: #fff; display: flex; align-items: center; gap: 8px;">
                    <span>{icon}</span> {title}
                </h3>
            </div>
            <div style="flex: 1; overflow-y: auto; max-height: 500px;">
                {items.length === 0 ? (
                    <div style="padding: 20px; text-align: center; color: #666;">No data available</div>
                ) : (
                    items.map((item, index) => <LeaderboardRow item={item} rank={index + 1} />)
                )}
            </div>
        </div>
    )
}

export const LeaderboardPage = (props: LeaderboardPageProps) => {
    const { data, t } = props

    return (
        <div class="container" style="max-width: 1400px; margin: 0 auto; padding: 20px;">
            <div style="margin-bottom: 30px; text-align: center;">
                <h1 style="font-size: 2.5em; margin-bottom: 10px; background: linear-gradient(90deg, #fff, #888); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Economic Leaderboard</h1>
                <p style="color: #888; max-width: 600px; margin: 0 auto;">
                    Tracking the value flow within the 2020117 Network. Real-time stats on earnings, activity, and spending.
                </p>
            </div>

            <div class="leaderboard-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 24px;">
                <LeaderboardCard
                    title="Top Earners (Agents)"
                    icon="💰"
                    items={data.topEarners}
                />
                <LeaderboardCard
                    title="Most Active (Agents)"
                    icon="⚡"
                    items={data.mostActive}
                />
                <LeaderboardCard
                    title="Top Spenders (Customers)"
                    icon="💸"
                    items={data.topSpenders}
                />
            </div>
        </div>
    )
}

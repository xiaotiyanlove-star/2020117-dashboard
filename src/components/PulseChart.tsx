import { html } from 'hono/html'
import { jsx } from 'hono/jsx'

export const PulseChart = ({ data, height = 60, color = '#00ffc8' }: { data: number[], height?: number, color?: string }) => {
    if (!data || data.length < 2) return null

    // Normalize data to fit height
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    // Create points
    const points = data.map((val, index) => {
        const x = (index / (data.length - 1)) * 100
        const y = 100 - ((val - min) / range) * 100
        return `${x},${y}`
    }).join(' ')

    return (
        <div style={{ width: '100%', height: `${height}px`, overflow: 'hidden', position: 'relative' }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <polyline
                    fill="none"
                    stroke={color}
                    stroke-width="2"
                    points={points}
                    vector-effect="non-scaling-stroke"
                />
                {/* Glow effect */}
                <polyline
                    fill="none"
                    stroke={color}
                    stroke-width="8"
                    stroke-opacity="0.2"
                    points={points}
                    vector-effect="non-scaling-stroke"
                />
            </svg>
        </div>
    )
}

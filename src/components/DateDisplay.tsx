import { html } from 'hono/html'
import { jsx } from 'hono/jsx'

export const DateDisplay = ({ ts, className = '' }: { ts: number | string | Date, className?: string }) => {
    try {
        if (!ts) return <span class={className}>-</span>
        const date = new Date(ts)
        if (isNaN(date.getTime())) return <span class={className}>-</span>

        const iso = date.toISOString()
        const readable = date.toLocaleString()

        return (
            <time class={`local-time ${className}`} datetime={iso} title={iso}>
                {readable}
            </time>
        )
    } catch (e) {
        return <span class={className}>-</span>
    }
}

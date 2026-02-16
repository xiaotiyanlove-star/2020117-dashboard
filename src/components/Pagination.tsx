import { html } from 'hono/html'
import { jsx } from 'hono/jsx'
import type { PaginationMeta } from '../types'

export const Pagination = ({ meta, path, query = {} }: { meta: PaginationMeta, path: string, query?: Record<string, string> }) => {
    const { current_page, last_page } = meta

    if (last_page <= 1) return null

    // Helper to build URL
    const url = (page: number) => {
        const params = new URLSearchParams()
        Object.entries(query).forEach(([k, v]) => {
            if (v) params.set(k, v)
        })
        params.set('page', page.toString())
        return `${path}?${params.toString()}`
    }

    const prev = current_page > 1 ? url(current_page - 1) : null
    const next = current_page < last_page ? url(current_page + 1) : null

    // Simple range building: 1 ... current-2 current-1 current current+1 current+2 ... last
    const pages: (number | string)[] = []

    if (last_page <= 7) {
        for (let i = 1; i <= last_page; i++) pages.push(i)
    } else {
        pages.push(1)
        if (current_page > 3) pages.push('...')
        for (let i = Math.max(2, current_page - 1); i <= Math.min(last_page - 1, current_page + 1); i++) {
            pages.push(i)
        }
        if (current_page < last_page - 2) pages.push('...')
        pages.push(last_page)
    }

    return (
        <div class="pagination" style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '24px', alignItems: 'center' }}>
            {prev ? (
                <a href={prev} class="badge" style={{ padding: '8px 12px' }}>&larr; Prev</a>
            ) : (
                <span class="badge" style={{ padding: '8px 12px', opacity: 0.5, cursor: 'not-allowed' }}>&larr; Prev</span>
            )}

            {pages.map(p => (
                typeof p === 'number' ? (
                    <a href={url(p)} class={`badge ${p === current_page ? 'accent' : ''}`} style={{ padding: '8px 12px' }}>{p}</a>
                ) : (
                    <span style={{ color: 'var(--text-dim)' }}>...</span>
                )
            ))}

            {next ? (
                <a href={next} class="badge" style={{ padding: '8px 12px' }}>Next &rarr;</a>
            ) : (
                <span class="badge" style={{ padding: '8px 12px', opacity: 0.5, cursor: 'not-allowed' }}>Next &rarr;</span>
            )}
        </div>
    )
}

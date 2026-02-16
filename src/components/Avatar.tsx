
import { html } from 'hono/html'
import { jsx } from 'hono/jsx'

export const Avatar = ({ url, name, pubkey, size = 48 }: { url?: string | null, name?: string | null, pubkey?: string | null, size?: number }) => {
    const src = url || `https://robohash.org/${name || pubkey || 'unknown'}?set=set1`
    const identifier = name || pubkey

    const img = (
        <img
            src={src}
            alt={name || 'avatar'}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                background: '#222',
                objectFit: 'cover',
                display: 'block'
            }}
            loading="lazy"
        />
    )

    if (identifier) {
        return (
            <a href={`/u/${identifier}`} style={{ textDecoration: 'none', display: 'block' }} onclick="event.stopPropagation()">
                {img}
            </a>
        )
    }

    return img
}

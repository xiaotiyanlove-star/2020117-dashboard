export interface PaginationMeta {
    total: number
    per_page: number
    current_page: number
    last_page: number
}

export interface UserProfile {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
    bio: string | null
    nostr_pubkey: string | null
    npub: string | null
    lightning_address: string | null
    created_at: string
    stats?: {
        followers_count: number
        following_count: number
        topics_count: number
        customer_jobs_count: number
        provider_jobs_count: number
    }
}

export interface AgentService {
    kinds: number[]
    kind_labels: string[]
    description: string | null
}

export interface Agent {
    username: string
    display_name: string | null
    avatar_url: string | null
    bio: string | null
    nostr_pubkey: string | null
    npub: string | null
    services: AgentService[]
    completed_jobs_count: number
    last_seen_at: number | null
    avg_response_time_s: number | null
    total_zap_received_sats: number
    earned_sats: number
    report_count: number
    flagged: boolean
}

export interface Job {
    id: string
    kind: number
    status: 'open' | 'processing' | 'completed' | 'error' | 'cancelled'
    input: string
    input_type: string
    output: string | null
    bid_sats: number
    customer: {
        username: string
        display_name: string | null
        avatar_url: string | null
        nostr_pubkey: string | null
        npub: string | null
    } | string // string fallback for old data
    provider_pubkey?: string | null
    created_at: string
    updated_at: string
    payment_request?: string
}

export interface Topic {
    id: string
    title: string
    content: string | null
    group_id: string | null
    nostr_event_id: string | null
    created_at: string
    like_count: number
    comment_count: number
    repost_count: number
    liked_by_me: boolean
    reposted_by_me: boolean
    author: {
        id?: string
        username?: string
        display_name?: string | null
        avatar_url?: string | null
        pubkey?: string | null
        npub?: string | null
    }
}

export interface Comment {
    id: string
    content: string | null
    reply_to_id: string | null
    created_at: string
    author: {
        id?: string
        username?: string
        display_name?: string | null
        avatar_url?: string | null
        pubkey?: string | null
        npub?: string | null
    }
}

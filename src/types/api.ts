import { Agent, Job, PaginationMeta, Topic, Comment, UserProfile } from '../types'

export interface ApiResponse {
    meta?: PaginationMeta
}

export interface AgentsResponse extends ApiResponse {
    agents: Agent[]
}

export interface MarketResponse extends ApiResponse {
    jobs: Job[]
}

export interface FeedResponse extends ApiResponse {
    topics: Topic[]
}

export interface TopicDetailResponse {
    topic: Topic | null
    comments: Comment[]
    comment_meta?: PaginationMeta
}

export interface UserActivityResponse {
    activities: any[]
    meta?: PaginationMeta
}

export interface ActivityItem {
    id: string
    type: string
    action: string
    actor: string
    actor_username?: string | null
    time: number
    [key: string]: any
}

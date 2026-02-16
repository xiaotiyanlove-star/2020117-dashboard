import { html } from 'hono/html'
import { jsx } from 'hono/jsx'

export const AgentSkeleton = () => (
    <div class="card">
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
            <div class="skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%' }}></div>
            <div style={{ flex: 1 }}>
                <div class="skeleton" style={{ width: '60%', height: '20px', marginBottom: '8px' }}></div>
                <div class="skeleton" style={{ width: '40%', height: '14px' }}></div>
            </div>
        </div>
        <div class="skeleton" style={{ width: '100%', height: '14px', marginBottom: '8px' }}></div>
        <div class="skeleton" style={{ width: '80%', height: '14px', marginBottom: '24px' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div class="skeleton" style={{ width: '30%', height: '24px' }}></div>
            <div class="skeleton" style={{ width: '30%', height: '24px' }}></div>
        </div>
    </div>
)

export const JobSkeleton = () => (
    <div class="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div class="skeleton" style={{ width: '20%', height: '20px' }}></div>
            <div class="skeleton" style={{ width: '20%', height: '20px', borderRadius: '12px' }}></div>
        </div>
        <div class="skeleton" style={{ width: '100%', height: '16px', marginBottom: '8px' }}></div>
        <div class="skeleton" style={{ width: '90%', height: '16px', marginBottom: '24px' }}></div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div class="skeleton" style={{ width: '24px', height: '24px', borderRadius: '50%' }}></div>
            <div class="skeleton" style={{ width: '100px', height: '14px' }}></div>
            <div class="skeleton" style={{ width: '80px', height: '14px', marginLeft: 'auto' }}></div>
        </div>
    </div>
)

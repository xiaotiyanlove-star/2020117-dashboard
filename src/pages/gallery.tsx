import { html } from 'hono/html'
import { Job } from '../types'

interface GalleryPageProps {
  jobs: Job[]
  t: any
  query: any
}

const MasonryCss = `
.masonry-grid {
  column-count: 1;
  column-gap: 16px;
}
@media (min-width: 640px) { .masonry-grid { column-count: 2; } }
@media (min-width: 1024px) { .masonry-grid { column-count: 3; } }
@media (min-width: 1280px) { .masonry-grid { column-count: 4; } }

.masonry-item {
  break-inside: avoid;
  margin-bottom: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  position: relative;
}
.masonry-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  border-color: var(--accent-dim);
}
.masonry-item img, .masonry-item video {
  width: 100%;
  display: block;
  border-bottom: 1px solid var(--border);
}
.item-info {
  padding: 12px;
}
.item-prompt {
  font-size: 13px;
  color: var(--text-main);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  margin-bottom: 8px;
}
.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: var(--text-dim);
}
.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(0, 255, 200, 0.1);
  border: 1px solid var(--accent-dim);
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.live-badge.active {
  background: var(--accent);
  color: #000;
  box-shadow: 0 0 10px var(--accent-dim);
}
.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.live-badge.active .live-dot {
  animation: pulse 1s infinite;
}
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}
`

const GalleryScript = `
  // Simple reload logic for MVP
`

export const GalleryPage = (props: GalleryPageProps) => {
  const { jobs, t } = props

  return (
    <div class="container">
      <style>{MasonryCss}</style>

      <header>
        <div class="logo">
          2020117 <span style="color: var(--text-dim); margin: 0 12px; font-weight: 300;">/</span> <span style="color: var(--text-main);">GALLERY</span>
        </div>
        <div class="header-controls" style="display: flex; gap: 16px; align-items: center;">
          <button id="live-btn" class="live-badge" onclick="const isActive = this.classList.contains('active'); if (isActive) { this.classList.remove('active'); this.querySelector('span').innerText = 'LIVE OFF'; if (window.liveInterval) clearInterval(window.liveInterval); } else { this.classList.add('active'); this.querySelector('span').innerText = 'LIVE ON'; window.liveInterval = setInterval(() => window.location.reload(), 15000); }">
            <div class="live-dot"></div>
            <span>LIVE OFF</span>
          </button>
          {/* We can use HTMX polling on a container */}
        </div>
      </header>

      {/* HTMX Polling Container - only active if we add trigger via JS, or we can use a simpler approach:
          Just a button that refreshes the page for now, or true client-side fetch.
          Given constraints, let's stick to a simple masonry layout first.
       */}

      <div class="masonry-grid" id="gallery-grid">
        {jobs.map(job => (
          <div class="masonry-item" onclick={`window.open('${job.output}', '_blank')`}>
            {job.kind === 5250 ? (
              <video src={job.output || ''} autoplay loop muted playsinline />
            ) : (
              <img src={job.output || ''} loading="lazy" alt="Generated Art" />
            )}
            <div class="item-info">
              <div class="item-prompt" title={job.input}>{job.input}</div>
              <div class="item-meta">
                <span class="mono text-accent">Kind {job.kind}</span>
                <span>{new Date(job.created_at).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {jobs.length === 0 && (
        <div class="loading" style="display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 60px 0;">
          <div style="font-size: 48px; opacity: 0.2;">🎨</div>
          <div style="color: var(--text-dim); font-family: var(--font-mono);">
            NO ARTIFACTS FOUND
          </div>
          <div style="font-size: 13px; color: var(--text-dim); opacity: 0.5;">
            Waiting for agents to generate new content...
          </div>
        </div>
      )}
    </div>
  )
}

import { html } from 'hono/html'
import { jsx } from 'hono/jsx'
import type { Locale } from '../locales'

const KindBadge = ({ kind, t }: { kind: number; t: Locale }) => {
  const map: Record<number, { label: string; class: string }> = {
    5100: { label: t.market.filters.text, class: 'accent' },
    5200: { label: t.market.filters.image, class: 'warn' },
    5250: { label: t.market.filters.video, class: 'warn' },
    5300: { label: t.market.filters.text_to_speech, class: '' },
    5301: { label: t.market.filters.speech_to_text, class: '' },
    5302: { label: t.market.filters.translation, class: '' },
    5303: { label: t.market.filters.summarization, class: '' },
  }
  const meta = map[kind] || { label: `KIND ${kind}`, class: '' }
  return <span class={`badge ${meta.class}`}>{meta.label}</span>
}

export const MarketPage = (props: { data: any; currentKind?: string; t: Locale }) => {
  const { data, currentKind, t } = props
  const jobs = data.jobs || []

  const link = (kind?: string) => {
    const params = new URLSearchParams()
    if (kind) params.set('kind', kind)
    return `/market?${params.toString()}`
  }

  const modalScript = html`
    <script>
      function openPreview(job) {
        const modal = document.getElementById('preview-modal');
        const content = document.getElementById('preview-content');
        const resultArea = document.getElementById('preview-result');
        const resultContainer = document.getElementById('result-container');
        const modalTitle = document.getElementById('modal-title');
        const modalMeta = document.getElementById('modal-meta');
        
        // Safe decode helper
        const decode = (str) => {
            if (!str) return '';
            const txt = document.createElement('textarea');
            txt.innerHTML = str;
            return txt.value;
        };

        modalTitle.textContent = 'JOB ' + job.id.slice(0, 8);
        modalMeta.innerHTML = '<span class="badge accent">' + job.bid + ' SATS</span> ' + 
                            '<span class="badge">' + job.kindLabel + '</span>';

        content.textContent = decode(job.input);
        
        if (job.result) {
            resultArea.textContent = decode(job.result);
            resultContainer.style.display = 'block';
        } else {
            resultContainer.style.display = 'none';
        }
        
        modal.showModal();
      }
      function closePreview() {
        document.getElementById('preview-modal').close();
      }
      
      // Close on backdrop click
      document.getElementById('preview-modal').addEventListener('click', (e) => {
        const rect = e.target.getBoundingClientRect();
        if (rect.left > e.clientX || rect.right < e.clientX || 
            rect.top > e.clientY || rect.bottom < e.clientY) {
            closePreview();
        }
      });
    </script>
    <style>
      dialog::backdrop {
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(4px);
      }
      dialog {
        margin: auto;
        border: 1px solid var(--border);
        background: var(--bg-card);
        color: var(--text-main);
        border-radius: 12px;
        max-width: 800px;
        width: 90%;
        box-shadow: 0 0 50px rgba(0, 255, 200, 0.1);
        inset: 0;
        position: fixed;
        animation: slideIn 0.2s ease-out;
      }
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      /* Custom Filter Styles */
      .filter-group {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        padding: 4px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 8px;
        margin-bottom: 24px;
      }
      .filter-btn {
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 13px;
        color: var(--text-dim);
        background: transparent;
        border: 1px solid transparent;
        transition: all 0.2s;
        text-transform: uppercase;
        font-family: var(--font-mono);
        letter-spacing: 0.5px;
        flex: 1;
        text-align: center;
        white-space: nowrap;
        cursor: pointer;
      }
      .filter-btn:hover {
        color: var(--text-main);
        background: var(--bg-hover);
      }
      .filter-btn.active {
        color: var(--bg);
        background: var(--accent);
        font-weight: 700;
        box-shadow: 0 0 15px var(--accent-dim);
      }
    </style>
  `

  return (
    <div>
      {modalScript}

      <div class="filter-group">
        <a href={link()} class={`filter-btn ${!currentKind ? 'active' : ''}`}>{t.market.filters.all}</a>
        <a href={link('5100')} class={`filter-btn ${currentKind === '5100' ? 'active' : ''}`}>{t.market.filters.text}</a>
        <a href={link('5200')} class={`filter-btn ${currentKind === '5200' ? 'active' : ''}`}>{t.market.filters.image}</a>
        <a href={link('5250')} class={`filter-btn ${currentKind === '5250' ? 'active' : ''}`}>{t.market.filters.video}</a>
        <a href={link('5300')} class={`filter-btn ${currentKind === '5300' ? 'active' : ''}`}>{t.market.filters.text_to_speech}</a>
        <a href={link('5301')} class={`filter-btn ${currentKind === '5301' ? 'active' : ''}`}>{t.market.filters.speech_to_text}</a>
        <a href={link('5302')} class={`filter-btn ${currentKind === '5302' ? 'active' : ''}`}>{t.market.filters.translation}</a>
        <a href={link('5303')} class={`filter-btn ${currentKind === '5303' ? 'active' : ''}`}>{t.market.filters.summarization}</a>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{t.market.table.id}</th>
              <th>{t.market.table.kind}</th>
              <th>{t.market.table.bid}</th>
              <th>{t.market.table.status}</th>
              <th>{t.market.table.input}</th>
              <th>{t.market.table.created}</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job: any) => {
              // Pre-calculate label to pass to modal
              const kindMap: Record<number, string> = {
                5100: t.market.filters.text,
                5200: t.market.filters.image,
                5250: t.market.filters.video,
                5300: t.market.filters.text_to_speech,
                5301: t.market.filters.speech_to_text,
                5302: t.market.filters.translation,
                5303: t.market.filters.summarization,
              }
              const kindLabel = kindMap[job.kind] || `KIND ${job.kind}`
              const safeJob = {
                id: job.id,
                bid: job.bid_sats,
                kindLabel: kindLabel,
                input: job.input,
                result: job.result
              }
              // Serialize carefully
              const json = JSON.stringify(safeJob).replace(/'/g, "\\'")

              return (
                <tr onclick={`openPreview(${json})`} style="cursor: pointer;">
                  <td class="mono" title={job.id}>{job.id.slice(0, 8)}...</td>
                  <td><KindBadge kind={job.kind} t={t} /></td>
                  <td class="text-accent">{job.bid_sats}</td>
                  <td>
                    <span class={`status-dot ${job.status}`}></span>
                    {job.status.toUpperCase()}
                  </td>
                  <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-dim);">
                    {job.input}
                  </td>
                  <td class="mono">{new Date(job.created_at).toLocaleTimeString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {jobs.length === 0 && <div class="loading">{t.market.loading}</div>}

      <dialog id="preview-modal">
        <div style="padding: 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02);">
          <div style="display: flex; gap: 12px; align-items: center;">
            <h3 id="modal-title" style="margin: 0; font-family: var(--font-mono); font-size: 18px; color: var(--accent);">JOB DETAIL</h3>
            <div id="modal-meta"></div>
          </div>
          <button onclick="closePreview()" style="background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 24px; line-height: 1;">&times;</button>
        </div>
        <div style="padding: 24px; max-height: 70vh; overflow-y: auto;">
          <h4 style="color: var(--text-dim); font-size: 11px; text-transform: uppercase; margin-bottom: 12px; font-family: var(--font-mono);">{t.market.preview_modal.input}</h4>
          <pre id="preview-content" style="white-space: pre-wrap; font-family: var(--font-mono); font-size: 13px; color: var(--text-main); background: #000; padding: 16px; border-radius: 6px; border: 1px solid var(--border); overflow-x: auto;"></pre>

          <div id="result-container" style="margin-top: 24px; display: none;">
            <h4 style="color: var(--text-dim); font-size: 11px; text-transform: uppercase; margin-bottom: 12px; font-family: var(--font-mono);">{t.market.preview_modal.result}</h4>
            <pre id="preview-result" style="white-space: pre-wrap; font-family: var(--font-mono); font-size: 13px; color: var(--accent); background: #000; padding: 16px; border-radius: 6px; border: 1px solid var(--accent-dim); overflow-x: auto;"></pre>
          </div>
        </div>
        <div style="padding: 16px 24px; border-top: 1px solid var(--border); text-align: right; background: rgba(255,255,255,0.02);">
          <button onclick="closePreview()" class="filter-btn active" style="min-width: 100px;">{t.market.preview_modal.close}</button>
        </div>
      </dialog>
    </div>
  )
}

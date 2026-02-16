import { html } from 'hono/html'
import { jsx } from 'hono/jsx'
import type { Locale } from '../locales'
import { Pagination } from '../components/Pagination'
import { DateDisplay } from '../components/DateDisplay'
import { Avatar } from '../components/Avatar'
import type { Job, PaginationMeta } from '../types'

export const MarketPage = (props: {
  data: { jobs: Job[], meta: PaginationMeta };
  filters: { kind?: string; status?: string; sort?: string };
  t: Locale;
  query?: any
}) => {
  const { data, filters, t, query } = props
  const { jobs, meta } = data

  const kinds = [
    { id: '5100', label: t.market.filters.text },
    { id: '5200', label: t.market.filters.image },
    { id: '5250', label: t.market.filters.video },
    { id: '5300', label: t.market.filters.text_to_speech },
    { id: '5301', label: t.market.filters.speech_to_text },
    { id: '5302', label: t.market.filters.translation },
    { id: '5303', label: t.market.filters.summarization },
  ]

  const statuses = ['open', 'processing', 'completed', 'error', 'cancelled']
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'bid_desc', label: 'Bid (High-Low)' },
    { value: 'bid_asc', label: 'Bid (Low-High)' },
  ]

  // Helper for filter links
  const filterLink = (key: string, val: string | undefined) => {
    const params = new URLSearchParams()
    if (query.lang) params.set('lang', query.lang)
    if (filters.kind) params.set('kind', filters.kind)
    if (filters.status) params.set('status', filters.status)
    if (filters.sort) params.set('sort', filters.sort)

    if (val) params.set(key, val)
    else params.delete(key)

    // Reset page on filter change
    params.delete('page')

    return `/market?${params.toString()}`
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <a href={filterLink('kind', undefined)} class={`badge ${!filters.kind ? 'accent' : ''}`} style={{ padding: '8px 12px', textDecoration: 'none' }}>
            ALL
          </a>
          {kinds.map(k => (
            <a href={filterLink('kind', k.id)} class={`badge ${filters.kind === k.id ? 'accent' : ''}`} style={{ padding: '8px 12px', textDecoration: 'none' }}>
              {k.label.toUpperCase()}
            </a>
          ))}
        </div>

        <form action="/market" method="get" style={{ display: 'flex', gap: '8px' }}>
          {filters.kind && <input type="hidden" name="kind" value={filters.kind} />}

          <select
            name="status"
            onchange="this.form.submit()"
            style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '6px', borderRadius: '4px' }}
          >
            <option value="all" selected={filters.status === 'all' || !filters.status}>Status: All</option>
            {statuses.map(s => <option value={s} selected={filters.status === s}>{s.toUpperCase()}</option>)}
          </select>

          <select
            name="sort"
            onchange="this.form.submit()"
            style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '6px', borderRadius: '4px' }}
          >
            {sortOptions.map(s => <option value={s.value} selected={filters.sort === s.value}>{s.label}</option>)}
          </select>
        </form>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: '80px' }}>ID</th>
              <th>CUSTOMER</th>
              <th>{t.market.table.kind}</th>
              <th style={{ width: '80px' }}>{t.market.table.status}</th>
              <th>{t.market.table.input}</th>
              <th style={{ textAlign: 'right' }}>{t.market.table.bid}</th>
              <th style={{ textAlign: 'right' }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr onclick={`document.getElementById('dialog-${job.id}').showModal()`} style={{ cursor: 'pointer' }}>
                <td class="mono" style={{ color: 'var(--accent)' }}>{job.id.slice(0, 8)}</td>
                <td>
                  {typeof job.customer === 'object' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Avatar url={job.customer.avatar_url} name={job.customer.username} pubkey={job.customer.nostr_pubkey} size={24} />
                      <a href={`/u/${job.customer.username || job.customer.nostr_pubkey}`} style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: '500' }}>
                        {job.customer.display_name || job.customer.username || 'Unknown'}
                      </a>
                    </div>
                  ) : <span class="mono">{job.customer?.slice(0, 8) || '?'}</span>}
                </td>
                <td><span class="badge">{job.kind}</span></td>
                <td>
                  <span class={`badge ${job.status === 'open' ? 'accent' : job.status === 'error' ? 'error' : ''}`}>
                    {job.status}
                  </span>
                </td>
                <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {job.input}
                </td>
                <td class="mono" style={{ textAlign: 'right', color: 'gold' }}>{job.bid_sats}</td>
                <td class="mono" style={{ textAlign: 'right', fontSize: '12px' }}>
                  <DateDisplay ts={job.created_at} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialogs for details */}
      {jobs.map(job => (
        <dialog id={`dialog-${job.id}`} style={{
          background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0',
          maxWidth: '600px', width: '90%', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', margin: '0'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div class="mono" style={{ color: 'var(--accent)' }}>JOB {job.id}</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span class={`badge ${job.status === 'open' ? 'accent' : job.status === 'completed' ? '' : 'error'}`}>{job.status}</span>
              <span class="badge">{job.kind}</span>
              <span class="mono" style={{ color: 'gold' }}>{job.bid_sats} sats</span>
            </div>
          </div>
          <div style={{ padding: '24px', overflowY: 'auto', maxHeight: '60vh' }}>
            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', fontSize: '13px', color: 'var(--text-dim)' }}>
              <div>
                <span style={{ display: 'block', fontSize: '10px', color: '#555', marginBottom: '2px' }}>CREATED</span>
                <DateDisplay ts={job.created_at} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '10px', color: '#555', marginBottom: '2px' }}>INPUT TYPE</span>
                {job.input_type || 'text'}
              </div>
            </div>

            {typeof job.customer === 'object' && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <Avatar url={job.customer.avatar_url} name={job.customer.username} pubkey={job.customer.nostr_pubkey} size={40} />
                <div>
                  <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>REQUESTER</div>
                  <a href={`/u/${job.customer.username || job.customer.nostr_pubkey}`} style={{ fontWeight: 'bold', color: 'var(--text-main)', textDecoration: 'none' }}>
                    {job.customer.display_name || job.customer.username}
                  </a>
                </div>
                {job.provider_pubkey && (
                  <>
                    <div style={{ fontSize: '20px', color: '#444' }}>→</div>
                    <div>
                      <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>PROVIDER</div>
                      <a href={`/u/${job.provider_pubkey}`} class="mono" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                        {job.provider_pubkey.slice(0, 8)}...
                      </a>
                    </div>
                  </>
                )}
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <div class="mono" style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '8px' }}>INPUT</div>
              <div style={{ background: '#000', padding: '12px', borderRadius: '4px', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                {job.input}
              </div>
            </div>
            {job.output && (
              <div>
                <div class="mono" style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '8px' }}>RESULT</div>
                <div style={{ background: '#111', padding: '12px', borderRadius: '4px', whiteSpace: 'pre-wrap', fontFamily: 'monospace', color: 'var(--accent)' }}>
                  {job.output}
                </div>
              </div>
            )}
            {job.payment_request && (
              <div style={{ marginTop: '24px' }}>
                <div class="mono" style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '8px' }}>PAYMENT REQUEST</div>
                <div style={{ background: '#111', padding: '12px', borderRadius: '4px', wordBreak: 'break-all', fontSize: '10px', color: '#ccc' }}>
                  {job.payment_request}
                </div>
              </div>
            )}
          </div>
          <div style={{ padding: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button onclick={`navigator.clipboard.writeText(\`${job.input.replace(/`/g, '\\`')}\`)`} class="badge" style={{ cursor: 'pointer', padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>Copy Input</button>
            <button
              onclick="this.closest('dialog').close()"
              style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
            >Close</button>
          </div>
        </dialog>
      ))}

      {jobs.length === 0 && <div class="loading" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>No jobs found matching your filters.</div>}

      <Pagination meta={meta} path="/market" query={{ ...query, ...filters }} />
    </div>
  )
}

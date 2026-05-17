import type { JobEntry } from '../../types'

export default function JobCard({ job, isUnsupported }: { job: JobEntry | null; isUnsupported?: boolean }) {
  if (!job) {
    return (
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '10px 12px', backgroundColor: '#f9fafb' }}>
        <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.6 }}>
          No job detected. Navigate to a job listing.
        </div>
      </div>
    )
  }

  if (isUnsupported) {
    return (
      <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 12, padding: '10px 12px' }}>
        <div style={{ fontSize: 10, color: '#92400e', fontWeight: 600, marginBottom: 4 }}>Site not fully supported</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#78350f' }}>{job.jobTitle}</div>
        <div style={{ fontSize: 11, color: '#92400e' }}>{job.source} · title only detected</div>
      </div>
    )
  }

  const chips: string[] = []
  const dateStr = job.dateLogged ? new Date(job.dateLogged).toLocaleDateString('en-GB') : ''
  if (job.source) chips.push(job.source)
  if (dateStr) chips.push(dateStr)
  if (job.salary) chips.push(job.salary)

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '10px 12px', backgroundColor: '#f9fafb' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2, lineHeight: 1.4 }}>{job.jobTitle}</div>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
        {[job.company, job.location].filter(Boolean).join(' · ')}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {chips.map((c) => (
          <span key={c} style={{ border: '1px solid #e5e7eb', borderRadius: 20, padding: '2px 8px', fontSize: 11, color: '#6b7280' }}>{c}</span>
        ))}
      </div>
    </div>
  )
}

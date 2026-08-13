export default function AdminRetention() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0a1628', marginBottom: 4 }}>Retention Configuration</h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>Data retention policy for assessment records and audit events.</p>

      <div style={{ padding: '18px 22px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
          Not Implemented in This Build
        </div>
        <div style={{ fontSize: 13.5, color: '#92400e', lineHeight: 1.65 }}>
          No retention periods are configured or enforced by the application. There are no retention fields in the database schema, no scheduled deletion process, and no endpoint that reads or writes retention settings. Synthetic demonstration records and audit events persist until removed manually.
        </div>
      </div>

      <div className="card">
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0a1628', marginBottom: 4 }}>Policy Decisions Required</div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14 }}>To be agreed and recorded in the project data-governance record before any retention mechanism is built.</div>
        {[
          'Assessment record retention period',
          'Audit event retention period',
          'Soft-delete grace period, if any',
          'Whether audit events may be deleted at all',
          'Who authorises a retention change',
        ].map(item => (
          <div key={item} style={{ display: 'flex', gap: 8, padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13.5, color: '#374151' }}>
            <span style={{ color: '#9ca3af', flexShrink: 0 }}>●</span>
            {item}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: '#9ca3af', lineHeight: 1.6 }}>
        Note: the fourth item interacts with the audit-log integrity requirement. If audit events are deletable, the log's evidential value is reduced, and that trade-off should be stated explicitly rather than settled by a default.
      </div>
    </div>
  )
}
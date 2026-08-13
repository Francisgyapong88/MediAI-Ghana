export function Logo({ size = 'full', dark = false }: { size?: 'full' | 'compact' | 'mark'; dark?: boolean }) {
  const textColor = dark ? '#0a1628' : 'white'
  const subColor = dark ? '#6b7280' : 'rgba(255,255,255,0.55)'

  const mark = (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="8" fill="#0d9488" />
      {/* Cross / medical symbol */}
      <rect x="15" y="8" width="6" height="20" rx="2" fill="white" opacity="0.9" />
      <rect x="8" y="15" width="20" height="6" rx="2" fill="white" opacity="0.9" />
      {/* Network nodes */}
      <circle cx="8" cy="8" r="2.5" fill="white" opacity="0.5" />
      <circle cx="28" cy="8" r="2.5" fill="white" opacity="0.5" />
      <circle cx="8" cy="28" r="2.5" fill="white" opacity="0.5" />
      <circle cx="28" cy="28" r="2.5" fill="white" opacity="0.5" />
      <line x1="8" y1="8" x2="14" y2="14" stroke="white" strokeWidth="1" opacity="0.3" />
      <line x1="28" y1="8" x2="22" y2="14" stroke="white" strokeWidth="1" opacity="0.3" />
      <line x1="8" y1="28" x2="14" y2="22" stroke="white" strokeWidth="1" opacity="0.3" />
      <line x1="28" y1="28" x2="22" y2="22" stroke="white" strokeWidth="1" opacity="0.3" />
    </svg>
  )

  if (size === 'mark') return mark

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size === 'compact' ? 8 : 10 }}>
      {mark}
      {size === 'full' && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: textColor, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            MediAI <span style={{ color: '#0d9488' }}>Ghana</span>
          </div>
          <div style={{ fontSize: 9, fontWeight: 600, color: subColor, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 1 }}>
            Non-Diagnostic Clinical Decision Support
          </div>
        </div>
      )}
      {size === 'compact' && (
        <div style={{ fontSize: 15, fontWeight: 800, color: textColor, letterSpacing: '-0.02em' }}>
          MediAI <span style={{ color: '#0d9488' }}>Ghana</span>
        </div>
      )}
    </div>
  )
}

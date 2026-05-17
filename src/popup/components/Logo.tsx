export default function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          width: 28,
          height: 28,
          backgroundColor: '#185FA5',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: 12,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        T
      </div>
      <span style={{ fontSize: 15, fontWeight: 600, color: '#0C447C' }}>
        Trac<span style={{ color: '#0C447C' }}>ky</span>
      </span>
    </div>
  )
}

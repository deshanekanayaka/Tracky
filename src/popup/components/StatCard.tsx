export default function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '10px 12px' }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: '#111827', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{label}</div>
    </div>
  )
}

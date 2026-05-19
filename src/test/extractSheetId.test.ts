import { describe, it, expect } from 'vitest'

// Local copy from Onboarding.tsx
function extractSheetId(urlOrId: string): string | null {
  // Extract from full Google Sheets URL
  const match = urlOrId.match(/\/d\/([a-zA-Z0-9-_]+)/)
  if (match) return match[1]
  // Accept raw sheet ID if pasted directly
  if (/^[a-zA-Z0-9-_]{20,}$/.test(urlOrId.trim())) return urlOrId.trim()
  return null
}

describe('extractSheetId', () => {
  it('EC-02a: non-sheets URL returns null', () => {
    expect(extractSheetId('https://google.com')).toBeNull()
  })

  it('EC-02b: not a url returns null', () => {
    expect(extractSheetId('not a url')).toBeNull()
  })

  it('EC-02c: empty string returns null', () => {
    expect(extractSheetId('')).toBeNull()
  })

  it('ES-03: full Google Sheets URL returns correct ID', () => {
    const input = 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit'
    const expected = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms'
    expect(extractSheetId(input)).toBe(expected)
  })

  it('ES-03b: URL with trailing slash still works', () => {
    const input = 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/'
    const expected = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms'
    expect(extractSheetId(input)).toBe(expected)
  })

  it('ES-04: raw sheet ID (44 chars) returns itself', () => {
    const id = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms'
    expect(id.length).toBe(44)
    expect(extractSheetId(id)).toBe(id)
  })

  it('ES-04b: short random string (under 20 chars) returns null', () => {
    expect(extractSheetId('short-string-123')).toBeNull()
  })
})

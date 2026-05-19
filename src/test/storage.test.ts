import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getConfig, saveConfig } from '../utils/storage'

const chromeAny = globalThis.chrome as any
let originalStorage: any

beforeEach(() => {
  // Save original chrome.storage and clear localStorage
  originalStorage = chromeAny.storage
  localStorage.clear()
})

afterEach(() => {
  // Restore chrome.storage
  chromeAny.storage = originalStorage
})

describe('storage utils in dev mode (no chrome.storage)', () => {
  it('getConfig returns {} without throwing when chrome.storage is undefined', async () => {
    chromeAny.storage = undefined
    const cfg = await getConfig()
    expect(cfg).toEqual({})
  })

  it('saveConfig stores data in localStorage and resolves without throwing', async () => {
    chromeAny.storage = undefined

    const data = { isConnected: true, sheetId: 'abc' }

    await expect(saveConfig(data)).resolves.toBeUndefined()

    const raw = localStorage.getItem('tracky-config')
    expect(raw).toBeTruthy()
    expect(JSON.parse(raw as string)).toEqual(data)
  })
})

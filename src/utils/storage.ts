import type { UserConfig } from '../types'

// Checks if Chrome storage API is available (not in dev server)
const isChromeAvailable = () =>
    typeof chrome !== 'undefined' && !!chrome.storage

// ── chrome.storage.sync ─────────────────────────────────
// Syncs across the user's devices (up to 100KB)
// Use for: config, sheet ID, user preferences

export function getConfig(): Promise<Partial<UserConfig>> {
    if (!isChromeAvailable()) {
        const stored = localStorage.getItem('tracky-config')
        return Promise.resolve(stored ? JSON.parse(stored) : {})
    }
    return new Promise((resolve) =>
        chrome.storage.sync.get(
            ['isConnected', 'sheetId', 'sheetName', 'provider'],
            (result) => resolve(result as Partial<UserConfig>)
        )
    )
}

export function saveConfig(config: Partial<UserConfig>): Promise<void> {
    if (!isChromeAvailable()) {
        localStorage.setItem('tracky-config', JSON.stringify(config))
        return Promise.resolve()
    }
    return new Promise((resolve) => chrome.storage.sync.set(config, resolve))
}

export function clearConfig(): Promise<void> {
    if (!isChromeAvailable()) {
        localStorage.removeItem('tracky-config')
        return Promise.resolve()
    }
    return new Promise((resolve) => chrome.storage.sync.clear(resolve))
}

// ── chrome.storage.local ────────────────────────────────
// Stays on this device only (up to 5MB)
// Use for: the offline queue

export function getQueue<T>(): Promise<T[]> {
    if (!isChromeAvailable()) return Promise.resolve([])
    return new Promise((resolve) =>
        chrome.storage.local.get('queue', ({ queue = [] }) => resolve(queue as T[]))
    )
}

export function saveQueue<T>(queue: T[]): Promise<void> {
    if (!isChromeAvailable()) return Promise.resolve()
    return new Promise((resolve) => chrome.storage.local.set({ queue }, resolve))
}
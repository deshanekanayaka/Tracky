// The shape of one logged job application
export interface JobEntry {
    id: string           // crypto.randomUUID() — unique per entry
    jobTitle: string
    company: string
    location: string
    salary: string       // raw string — "£90k–£120k" — empty string if not found
    url: string          // canonical URL, used for duplicate detection
    source: string       // "linkedin" | "indeed" etc — derived from hostname
    dateLogged: string   // ISO string — new Date().toISOString()
    status: 'Applied' | 'Interview' | 'Offer' | 'Rejected'
}

// Config persisted in chrome.storage.sync
export interface UserConfig {
    isConnected: boolean
    sheetId: string
    sheetName: string
    provider: 'google' | null
}

// Messages between environments — strongly typed so both sides agree
export type ExtensionMessage =
    | { type: 'LOG_JOB'; payload: JobEntry }
    | { type: 'SCRAPE_PAGE' }
    | { type: 'RETRY_QUEUE' }

export type ExtensionResponse =
    | { success: true }
    | { success: false; reason: 'duplicate' | 'not_connected' | 'queued' | 'error' }

// Which screen the popup is showing
export type Screen = 'main' | 'settings'
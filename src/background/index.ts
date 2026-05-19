import { appendRow, checkDuplicate } from '../utils/sheetsApi'
import { getConfig, getQueue, saveQueue } from '../utils/storage'
import type { JobEntry, ExtensionMessage, ExtensionResponse } from '../types'

console.log('[Tracky] background service worker started')

function formatDate(isoString: string): string {
  const date = new Date(isoString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

function buildRow(job: JobEntry): string[] {
  return [
    job.jobTitle,
    job.company,
    job.location,
    job.salary,
    job.url,
    formatDate(job.dateLogged),
    job.status,
  ]
}

interface QueueEntry {
  job: JobEntry
  attempts: number
  queuedAt: string
}

// Serialize any read-modify-write operations on the persisted queue.
let queueLock: Promise<void> = Promise.resolve()
async function withQueueLock<T>(fn: () => Promise<T> | T): Promise<T> {
  const prev = queueLock
  let release!: () => void
  queueLock = new Promise<void>((resolve) => (release = resolve))
  await prev
  try {
    return await fn()
  } finally {
    release()
  }
}

async function addToQueue(job: JobEntry): Promise<void> {
  await withQueueLock(async () => {
    const queue = await getQueue<QueueEntry>()
    queue.push({ job, attempts: 0, queuedAt: new Date().toISOString() })
    await saveQueue(queue)
  })
}

async function flushQueue(): Promise<void> {
  // Step 1: Atomically take ownership of the current queue by swapping it out with an empty list.
  const snapshot = await withQueueLock(async () => {
    const current = await getQueue<QueueEntry>()
    if (current.length === 0) return [] as QueueEntry[]
    await saveQueue<QueueEntry>([])
    return current
  })
  if (snapshot.length === 0) return

  console.log(`[Tracky] flushing ${snapshot.length} queued jobs`)
  const failed: QueueEntry[] = []
  for (const entry of snapshot) {
    try {
      const result = await logJobToSheet(entry.job)
      if (!result.success && result.reason !== 'duplicate') {
        failed.push({ ...entry, attempts: entry.attempts + 1 })
      }
    } catch {
      failed.push({ ...entry, attempts: entry.attempts + 1 })
    }
  }

  // Step 2: Merge any newly queued entries (that may have been added while we were processing)
  // with the failed ones and persist atomically.
  await withQueueLock(async () => {
    const pending = await getQueue<QueueEntry>()
    const merged = [...failed, ...pending]
    await saveQueue(merged)
    console.log(`[Tracky] flush done — ${merged.length} remaining`)
  })
}

async function logJobToSheet(job: JobEntry): Promise<ExtensionResponse> {
  const config = await getConfig()
  if (!config.isConnected || !config.sheetId) {
    return { success: false, reason: 'not_connected' }
  }
  const isDuplicate = await checkDuplicate(config.sheetId, job.url)
  if (isDuplicate) {
    return { success: false, reason: 'duplicate' }
  }
  await appendRow(config.sheetId, buildRow(job))
  return { success: true }
}

chrome.runtime.onMessage.addListener((
  message: ExtensionMessage,
  _sender,
  sendResponse: (response: ExtensionResponse) => void
) => {
  switch (message.type) {
    case 'LOG_JOB': {
      const job = message.payload
      logJobToSheet(job)
        .then(sendResponse)
        .catch(async (err) => {
          console.error('[Tracky] logJob error — queuing', err)
          await addToQueue(job)
          sendResponse({ success: false, reason: 'queued' })
        })
      return true
    }
    case 'RETRY_QUEUE': {
      flushQueue()
        .then(() => sendResponse({ success: true }))
        .catch(() => sendResponse({ success: false, reason: 'error' }))
      return true
    }
    default:
      return false
  }
})

chrome.runtime.onStartup.addListener(() => {
  console.log('[Tracky] startup — flushing queue')
  flushQueue()
})

self.addEventListener('online', () => {
  console.log('[Tracky] back online — flushing queue')
  flushQueue()
})

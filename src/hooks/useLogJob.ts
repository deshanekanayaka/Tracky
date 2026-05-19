import { useCallback, useState } from 'react'
import type { JobEntry, ExtensionResponse } from '../types'

type LogState = 'idle' | 'loading' | 'done' | 'duplicate' | 'queued' | 'partial'

// Gets the active tab's title and URL for partial logging
async function buildFallbackJob(): Promise<JobEntry> {
    return new Promise((resolve) => {
        if (typeof chrome === 'undefined' || !chrome.tabs) {
            resolve({
                id: crypto.randomUUID(),
                jobTitle: 'Unknown role',
                company: '',
                location: '',
                salary: '',
                url: 'https://unknown',
                source: 'unknown',
                dateLogged: new Date().toISOString(),
                status: 'Applied',
            })
            return
        }

        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            resolve({
                id: crypto.randomUUID(),
                jobTitle: tab?.title ?? 'Unknown role',
                company: '',
                location: '',
                salary: '',
                url: tab?.url ?? 'https://unknown',
                source: tab?.url
                    ? new URL(tab.url).hostname.replace('www.', '').split('.')[0]
                    : 'unknown',
                dateLogged: new Date().toISOString(),
                status: 'Applied',
            })
        })
    })
}

export default function useLogJob(job: JobEntry | null) {
    const [logState, setLogState] = useState<LogState>('idle')

    const handleLog = useCallback(async () => {
        if (logState !== 'idle') return
        setLogState('loading')

        const isPartial = !job
        const jobToLog = job ?? await buildFallbackJob()

        if (typeof chrome === 'undefined') {
            setTimeout(() => setLogState(isPartial ? 'partial' : 'done'), 600)
            return
        }

        chrome.runtime.sendMessage(
            { type: 'LOG_JOB', payload: jobToLog },
            (res: ExtensionResponse | undefined) => {
                if (!res) { setLogState('done'); return }
                if (res.success) {
                    setLogState(isPartial ? 'partial' : 'done')
                } else if (res.reason === 'duplicate') {
                    setLogState('duplicate')
                } else if (res.reason === 'queued') {
                    setLogState('queued')
                } else {
                    setLogState('done')
                }
            }
        )
    }, [job, logState])

    return { logState, handleLog }
}
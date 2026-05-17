import { useEffect, useState } from 'react'
import type { JobEntry } from '../types'

export default function useCurrentJob() {
  const [job, setJob] = useState<JobEntry | null>(null)

  useEffect(() => {
    // Fallback for non-extension environment (dev, storybook, etc.)
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      const stub: JobEntry = {
        id: 'dev',
        jobTitle: 'Product Designer',
        company: 'Monzo',
        location: 'London',
        salary: '',
        url: 'https://linkedin.com',
        source: 'linkedin',
        dateLogged: new Date().toISOString(),
        status: 'Applied',
      }
      setJob(stub)
      return
    }

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab || typeof tab.id !== 'number') return
      chrome.tabs.sendMessage(tab.id, { type: 'SCRAPE_PAGE' }, (response?: JobEntry | null) => {
        // Check for runtime errors (e.g., no content script)
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (chrome.runtime && chrome.runtime.lastError) return
        if (response) setJob(response)
      })
    })
  }, [])

  return { job }
}

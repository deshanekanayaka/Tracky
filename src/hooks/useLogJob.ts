import { useCallback, useState } from 'react'
import type { JobEntry, ExtensionResponse } from '../types'

type LogState = 'idle' | 'loading' | 'done' | 'duplicate'

export default function useLogJob(job: JobEntry | null) {
  const [logState, setLogState] = useState<LogState>('idle')

  const handleLog = useCallback(() => {
    if (!job || logState !== 'idle') return
    setLogState('loading')

    if (typeof chrome === 'undefined') {
      setTimeout(() => {
        setLogState('done')
      }, 600)
      return
    }

    chrome.runtime.sendMessage(
      { type: 'LOG_JOB', payload: job },
      (res: ExtensionResponse | undefined) => {
        if (!res) {
          setLogState('done')
          return
        }
        if (res.success) {
          setLogState('done')
        } else if (res.reason === 'duplicate') {
          setLogState('duplicate')
        } else {
          setLogState('done')
        }
      }
    )
  }, [job, logState])

  return { logState, handleLog }
}

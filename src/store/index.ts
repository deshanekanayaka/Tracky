import { create } from 'zustand'
import type { JobEntry, UserConfig, Screen } from '../types'

interface TrackyStore extends UserConfig {
    // Popup-local state
    screen: Screen
    currentJob: JobEntry | null
    totalLogged: number
    loggedThisWeek: number
    queueCount: number

    // Actions — kept minimal and explicit
    hydrate: (config: Partial<UserConfig>) => void
    setScreen: (screen: Screen) => void
    setCurrentJob: (job: JobEntry | null) => void
    setQueueCount: (n: number) => void
    incrementStats: () => void
    disconnect: () => void
}

export const useStore = create<TrackyStore>((set) => ({
    // Default state — overwritten by hydrate() on mount
    isConnected: false,
    sheetId: '',
    sheetName: '',
    provider: null,
    screen: 'main',
    currentJob: null,
    totalLogged: 0,
    loggedThisWeek: 0,
    queueCount: 0,

    hydrate: (config) => set(config),
    setScreen: (screen) => set({ screen }),
    setCurrentJob: (job) => set({ currentJob: job }),
    setQueueCount: (n) => set({ queueCount: n }),
    incrementStats: () =>
        set((s) => ({
            totalLogged: s.totalLogged + 1,
            loggedThisWeek: s.loggedThisWeek + 1,
        })),
    disconnect: () =>
        set({
            isConnected: false,
            sheetId: '',
            sheetName: '',
            provider: null,
            currentJob: null,
        }),
}))
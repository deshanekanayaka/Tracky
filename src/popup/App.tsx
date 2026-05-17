import { useEffect } from 'react'
import { useStore } from '../store'
import { getConfig } from '../utils/storage'
import Onboarding from './screens/Onboarding'
import MainPopup from './screens/MainPopup'
import Settings from './screens/Settings'

export default function App() {
    const { isConnected, screen, hydrate } = useStore()

    useEffect(() => {
        if (typeof chrome === 'undefined' || !chrome.storage) return

        getConfig().then((config) => {
            if (config.isConnected) hydrate(config)
        })
    }, [])

    if (!isConnected) return <Onboarding />
    if (screen === 'settings') return <Settings />
    return <MainPopup />
}
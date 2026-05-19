import { useState } from 'react'
import { useStore } from '../../store'
import { saveConfig } from '../../utils/storage'

export default function Onboarding() {
    const hydrate = useStore((s) => s.hydrate)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [sheetUrl, setSheetUrl] = useState('')
    const [showUrlInput, setShowUrlInput] = useState(false)

    async function handleConnect() {
        setLoading(true)
        setError('')
        try {
            const { signIn, createSheet } = await import('../../utils/sheetsApi')
            await signIn()

            // Always create a new sheet on fresh connect
            const result = await createSheet('Tracky — Job Applications')
            const config = {
                isConnected: true as const,
                provider: 'google' as const,
                sheetId: result.spreadsheetId,
                sheetName: 'Tracky — Job Applications',
            }
            await saveConfig(config)
            hydrate(config)
        } catch (err) {
            console.error('[Tracky] connect error', err)
            setError('Connection failed. Try again.')
        } finally {
            setLoading(false)
        }
    }

    async function handleExistingSheet() {
        if (!sheetUrl.trim()) {
            setError('Please paste your sheet URL first.')
            return
        }
        setLoading(true)
        setError('')
        try {
            const { signIn, verifySheetAccess } = await import('../../utils/sheetsApi')
            const { ensureHeaders } = await import('../../utils/sheetsApi')
            await signIn()

            const sheetId = extractSheetId(sheetUrl)
            if (!sheetId) {
                setError('Could not read that URL. Copy the full URL from your browser address bar.')
                setLoading(false)
                return
            }

            const access = await verifySheetAccess(sheetId)
            if (!access.canWrite) {
                setError('Tracky needs edit access to this sheet. Make sure you own it or have edit permission.')
                setLoading(false)
                return
            }

            await ensureHeaders(sheetId)

            const config = {
                isConnected: true as const,
                provider: 'google' as const,
                sheetId,
                sheetName: access.title ?? 'My Job Applications',
            }
            await saveConfig(config)
            hydrate(config)
        } catch (err) {
            console.error('[Tracky] existing sheet error', err)
            setError('Connection failed. Try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ width: 340, backgroundColor: '#ffffff', fontFamily: 'system-ui, sans-serif' }}>

            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 16px', borderBottom: '1px solid #f3f4f6',
            }}>
                <Logo />
            </div>

            {/* Body */}
            <div style={{ padding: '24px 16px' }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
                    Where to save your applications?
                </h2>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24, lineHeight: 1.6 }}>
                    Connect once — your data stays in your Google account.
                </p>

                {/* Primary — create new sheet */}
                <button
                    onClick={handleConnect}
                    disabled={loading}
                    onMouseEnter={e => {
                        if (!loading) e.currentTarget.style.backgroundColor = '#0C447C'
                    }}
                    onMouseLeave={e => {
                        if (!loading) e.currentTarget.style.backgroundColor = '#185FA5'
                    }}
                    style={{
                        width: '100%', height: 44,
                        backgroundColor: '#185FA5',
                        color: '#fff', border: 'none', borderRadius: 12,
                        fontSize: 13, fontWeight: 600,
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 8,
                        cursor: loading ? 'default' : 'pointer',
                        opacity: loading && !showUrlInput ? 0.7 : 1,
                        transition: 'background 0.15s',
                        marginBottom: 12,
                    }}
                >
                    <i className="ti ti-brand-google" style={{ fontSize: 16 }} aria-hidden="true" />
                    {loading && !showUrlInput ? 'Connecting…' : 'Connect with Google'}
                </button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ flex: 1, height: 1, backgroundColor: '#f3f4f6' }} />
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>or use an existing sheet</span>
                    <div style={{ flex: 1, height: 1, backgroundColor: '#f3f4f6' }} />
                </div>

                {/* Existing sheet — toggle */}
                {!showUrlInput ? (
                    <button
                        onClick={() => { setShowUrlInput(true); setError('') }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#EEF5FC')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                        style={{
                            width: '100%', height: 40,
                            backgroundColor: 'transparent',
                            color: '#185FA5', border: '1px solid #B5D4F4',
                            borderRadius: 12, fontSize: 13, fontWeight: 500,
                            cursor: 'pointer', transition: 'background 0.15s',
                        }}
                    >
                        Paste existing sheet URL
                    </button>
                ) : (
                    <div>
                        <input
                            type="url"
                            placeholder="https://docs.google.com/spreadsheets/d/..."
                            value={sheetUrl}
                            onChange={(e) => setSheetUrl(e.target.value)}
                            autoComplete="off"
                            onFocus={e => (e.currentTarget.style.borderColor = '#185FA5')}
                            onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                            style={{
                                width: '100%', padding: '9px 12px',
                                fontSize: 12, border: '1px solid #e5e7eb',
                                borderRadius: 10, marginBottom: 8,
                                outline: 'none', color: '#111827',
                                transition: 'border-color 0.15s',
                                fontFamily: 'system-ui, sans-serif',
                            }}
                        />
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button
                                onClick={() => {
                                    setShowUrlInput(false)
                                    setSheetUrl('')
                                    setError('')
                                }}
                                style={{
                                    flex: 1, height: 38,
                                    backgroundColor: 'transparent',
                                    color: '#6b7280', border: '1px solid #e5e7eb',
                                    borderRadius: 10, fontSize: 12, fontWeight: 500,
                                    cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleExistingSheet}
                                disabled={loading || !sheetUrl.trim()}
                                style={{
                                    flex: 2, height: 38,
                                    backgroundColor: '#185FA5', color: '#fff',
                                    border: 'none', borderRadius: 10,
                                    fontSize: 12, fontWeight: 600,
                                    cursor: loading || !sheetUrl.trim() ? 'default' : 'pointer',
                                    opacity: !sheetUrl.trim() ? 0.5 : 1,
                                    transition: 'opacity 0.15s',
                                }}
                            >
                                {loading && showUrlInput ? 'Verifying…' : 'Use this sheet'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={{
                        marginTop: 10, padding: '8px 12px',
                        backgroundColor: '#fef2f2', border: '1px solid #fecaca',
                        borderRadius: 8,
                    }}>
                        <p style={{ fontSize: 12, color: '#dc2626', lineHeight: 1.5, margin: 0 }}>
                            {error}
                        </p>
                    </div>
                )}

                {/* Fine print */}
                <p style={{
                    fontSize: 11, color: '#9ca3af',
                    textAlign: 'center', marginTop: 16, lineHeight: 1.6,
                }}>
                    We'll create a sheet automatically.<br />
                    No data stored on any server.
                </p>
            </div>
        </div>
    )
}

function Logo() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
                width: 28, height: 28, backgroundColor: '#185FA5',
                borderRadius: 8, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700,
            }}>
                T
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>
        Trac<span style={{ color: '#185FA5' }}>ky</span>
      </span>
        </div>
    )
}

function extractSheetId(urlOrId: string): string | null {
    // Extract from full Google Sheets URL
    const match = urlOrId.match(/\/d\/([a-zA-Z0-9-_]+)/)
    if (match) return match[1]
    // Accept raw sheet ID if pasted directly
    if (/^[a-zA-Z0-9-_]{20,}$/.test(urlOrId.trim())) return urlOrId.trim()
    return null
}
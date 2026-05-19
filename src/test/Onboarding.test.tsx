import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Onboarding from '../popup/screens/Onboarding'

// Helper to get the primary connect button
const getConnectButton = () => screen.getByRole('button', { name: /connect with google|connecting…/i })

describe('Onboarding component', () => {
  beforeEach(() => {
    // Reset chrome mocks between tests
    const chromeAny = globalThis.chrome as any
    chromeAny.runtime.lastError = null
    if (chromeAny.identity.getAuthToken.mockReset) chromeAny.identity.getAuthToken.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('EC-01: "Use this sheet" button is disabled when input is empty', async () => {
    render(<Onboarding />)

    await userEvent.click(screen.getByRole('button', { name: /paste existing sheet url/i }))

    const useButton = screen.getByRole('button', { name: /use this sheet/i })
    expect(useButton).toBeDisabled()
  })

  it('EC-06: Cancel button resets the input and hides it', async () => {
    render(<Onboarding />)

    await userEvent.click(screen.getByRole('button', { name: /paste existing sheet url/i }))

    const input = screen.getByPlaceholderText('https://docs.google.com/spreadsheets/d/...') as HTMLInputElement
    await userEvent.type(input, 'https://docs.google.com/spreadsheets/d/abc123')
    expect(input.value).toContain('abc123')

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.queryByPlaceholderText('https://docs.google.com/spreadsheets/d/...')).not.toBeInTheDocument()
    expect(screen.queryByText(/abc123/)).not.toBeInTheDocument()
  })

  it('ER-01: Error clears when Connect is clicked again', async () => {
    const chromeAny = globalThis.chrome as any

    // First attempt: force failure (callback with lastError)
    chromeAny.identity.getAuthToken.mockImplementation((_opts: any, cb: any) => {
      chromeAny.runtime.lastError = { message: 'Auth error' }
      cb(null)
    })

    render(<Onboarding />)

    await userEvent.click(getConnectButton())

    // Wait for error to appear
    const errorMsg = await screen.findByText(/connection failed\. try again\./i)
    expect(errorMsg).toBeInTheDocument()

    // Second attempt: make it hang so we can assert error cleared immediately
    chromeAny.runtime.lastError = null
    chromeAny.identity.getAuthToken.mockImplementation((_opts: any, _cb: any) => {
      // Do not call the callback (hang)
    })

    await userEvent.click(screen.getByRole('button', { name: /connect with google/i }))

    // Error should clear right away before the promise resolves
    await waitFor(() => {
      expect(screen.queryByText(/connection failed\. try again\./i)).not.toBeInTheDocument()
    })
  })

  it('ER-02: Connect button shows "Connecting…" and is disabled while loading', async () => {
    const chromeAny = globalThis.chrome as any
    // Make sign-in hang (no callback)
    chromeAny.identity.getAuthToken.mockImplementation((_opts: any, _cb: any) => {})

    render(<Onboarding />)

    const btn = getConnectButton()
    expect(btn).toBeEnabled()

    await userEvent.click(btn)

    expect(screen.getByRole('button', { name: /connecting…/i })).toBeDisabled()
  })
})

import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Minimal global chrome API mock for tests
const chromeMock = {
  storage: {
    sync: {
      get: vi.fn((_keys: any, cb: any) => cb({})),
      set: vi.fn((_data: any, cb?: any) => cb && cb()),
      clear: vi.fn((cb?: any) => cb && cb()),
    },
    local: {
      get: vi.fn((_key: any, cb: any) => cb({})),
      set: vi.fn((_data: any, cb?: any) => cb && cb()),
    },
  },
  identity: {
    getAuthToken: vi.fn(),
    removeCachedAuthToken: vi.fn((_obj: any, cb: any) => cb()),
  },
  runtime: {
    lastError: null as null | { message?: string },
    sendMessage: vi.fn(),
    onMessage: { addListener: vi.fn() },
    onStartup: { addListener: vi.fn() },
    getManifest: vi.fn(() => ({ version: '1.0.0' })),
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
    create: vi.fn(),
  },
} as any

// @ts-ignore
globalThis.chrome = chromeMock

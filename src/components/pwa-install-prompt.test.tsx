import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PwaInstallPrompt } from './pwa-install-prompt'

function setNavigatorProperty(name: string, value: unknown) {
  Object.defineProperty(navigator, name, { configurable: true, value })
}

type DeferredInstallEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

describe('PwaInstallPrompt', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setNavigatorProperty('userAgent', 'Mozilla/5.0 (Linux; Android 14) Chrome/120')
    setNavigatorProperty('standalone', undefined)
    setNavigatorProperty('platform', 'Linux x86_64')
    setNavigatorProperty('maxTouchPoints', 0)
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: vi.fn().mockReturnValue({ matches: false }) })
  })

  afterEach(cleanup)

  it('offers the browser installation flow when it becomes available', async () => {
    const prompt = vi.fn().mockResolvedValue(undefined)
    const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
      prompt,
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    }) as DeferredInstallEvent
    const user = userEvent.setup()
    render(<PwaInstallPrompt />)

    window.dispatchEvent(event)

    await user.click(await screen.findByRole('button', { name: 'Установить' }))
    expect(event.defaultPrevented).toBe(true)
    expect(prompt).toHaveBeenCalledOnce()
  })

  it('does not invoke the browser install prompt more than once', async () => {
    const prompt = vi.fn(() => new Promise<void>(() => undefined))
    const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
      prompt,
      userChoice: new Promise<{ outcome: 'accepted' | 'dismissed' }>(() => undefined),
    }) as DeferredInstallEvent
    render(<PwaInstallPrompt />)
    window.dispatchEvent(event)

    const installButton = await screen.findByRole('button', { name: 'Установить' })
    fireEvent.click(installButton)
    fireEvent.click(installButton)

    expect(prompt).toHaveBeenCalledOnce()
  })

  it('hides the browser install action after the app is installed from browser UI', async () => {
    const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'dismissed' as const }),
    }) as DeferredInstallEvent
    render(<PwaInstallPrompt />)
    window.dispatchEvent(event)
    await screen.findByRole('button', { name: 'Установить' })

    window.dispatchEvent(new Event('appinstalled'))

    await waitFor(() => expect(screen.queryByRole('button', { name: 'Установить' })).not.toBeInTheDocument())
  })

  it('explains installation on iPhone when the app is not standalone', async () => {
    setNavigatorProperty('userAgent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15')
    render(<PwaInstallPrompt />)
    window.dispatchEvent(Object.assign(new Event('beforeinstallprompt'), {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'dismissed' as const }),
    }) as DeferredInstallEvent)

    expect(await screen.findByRole('status', { name: 'Установка приложения' })).toHaveTextContent('Поделиться')
    expect(screen.getByText(/На экран.*Домой/)).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Установить' })).not.toBeInTheDocument()
  })

  it('explains installation on iPadOS with a desktop-style Safari user agent', () => {
    setNavigatorProperty('userAgent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15')
    setNavigatorProperty('platform', 'MacIntel')
    setNavigatorProperty('maxTouchPoints', 5)
    render(<PwaInstallPrompt />)

    expect(screen.getByRole('status', { name: 'Установка приложения' })).toHaveTextContent('Поделиться')
  })

  it('does not show again after the visitor chooses later', async () => {
    setNavigatorProperty('userAgent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15')
    const user = userEvent.setup()
    const first = render(<PwaInstallPrompt />)

    await user.click(screen.getByRole('button', { name: 'Понятно' }))
    first.unmount()
    render(<PwaInstallPrompt />)

    expect(screen.queryByRole('status', { name: 'Установка приложения' })).not.toBeInTheDocument()
  })
})

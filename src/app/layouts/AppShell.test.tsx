import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'

import { AppShell } from './AppShell'

it('renders a labelled mobile bottom navigation with every app route', () => {
  render(
    <AppShell activeRoute="ideas" onNavigate={vi.fn()}>
      <p>Содержимое</p>
    </AppShell>,
  )

  const navigation = screen.getByRole('navigation', { name: 'Мобильная навигация' })

  expect(navigation).toHaveTextContent('Главная')
  expect(navigation).toHaveTextContent('Идеи')
  expect(navigation).toHaveTextContent('Галерея')
  expect(screen.getAllByRole('link', { name: 'Идеи' }).some((link) => link.getAttribute('aria-current') === 'page')).toBe(true)
})

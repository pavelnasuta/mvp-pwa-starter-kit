import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import { GalleryPage } from './GalleryPage'

it('exposes a labelled component gallery and destructive confirmation', () => {
  render(<GalleryPage />)

  expect(
    screen.getByRole('heading', { name: 'Галерея компонентов' }),
  ).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Удалить пример' })).toBeInTheDocument()
})

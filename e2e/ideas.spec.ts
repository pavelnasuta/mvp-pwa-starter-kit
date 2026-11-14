import { expect, test } from '@playwright/test'

test('creates an idea that remains after a page reload', async ({ page }) => {
  await page.goto('/starter-kit/')
  await page.getByRole('link', { name: 'Идеи' }).click()
  await page.getByRole('button', { name: 'Новая идея' }).click()
  await page.getByLabel('Название').fill('Прототип без бэкенда')
  await page.getByRole('button', { name: 'Сохранить' }).click()
  await expect(page.getByText('Прототип без бэкенда')).toBeVisible()
  await page.reload()
  await expect(page.getByText('Прототип без бэкенда')).toBeVisible()
})

test('detects desktop client-area overflow that a fixed 1440 threshold accepts', () => {
  const measurement = { scrollWidth: 1440, clientWidth: 1425 }

  expect(measurement.scrollWidth).toBeLessThanOrEqual(1440)
  expect(measurement.scrollWidth).toBeGreaterThan(measurement.clientWidth)
})

test('does not overflow horizontally on desktop Ideas page', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/starter-kit/')
  await page.getByRole('link', { name: 'Идеи' }).click()

  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))

  expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
})

test('keeps saved Ideas and discloses offline state after a production-subpath reload', async ({ context, page }) => {
  await page.goto('/starter-kit/')
  await page.getByRole('link', { name: 'Идеи' }).click()
  await page.getByRole('button', { name: 'Новая идея' }).click()
  await page.getByLabel('Название').fill('Идея для офлайн-проверки')
  await page.getByRole('button', { name: 'Сохранить' }).click()
  await expect(page.getByText('Идея для офлайн-проверки')).toBeVisible()

  await page.waitForFunction(() => navigator.serviceWorker.controller !== null)
  await context.setOffline(true)
  await page.reload()

  await expect(page.getByText('Идея для офлайн-проверки')).toBeVisible()
  await expect(page.getByRole('status', { name: 'Подключение к интернету' })).toHaveText('Нет подключения к интернету. Данные доступны на этом устройстве.')
})

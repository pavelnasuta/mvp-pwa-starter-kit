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

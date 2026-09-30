import { Locator, expect, test } from '@playwright/test'

test.describe('Exercice 4 - Flexbox', () => {
    let header: Locator
    let logo: Locator
    let nav: Locator
    let links: Locator

    test.beforeEach(async ({ page }) => {
        await page.goto('/exercices/04-flexbox')

        header = page.locator('header')
        logo = header.locator('a').first()
        nav = page.locator('nav')
        links = nav.locator('a')

        await expect(header).toBeVisible()
    })

    test('le header utilise flex et aligne les éléments sur une ligne', async () => {
        await expect(header).toHaveClass(/flex/)
        await expect(header).toHaveClass(/items-center/)
        await expect(header).toHaveClass(/gap-6/)
    })

    test('le header repartit logo et navigation aux extrémités', async () => {
        await expect(header).toHaveClass(/justify-between/)
        await expect(header).toHaveClass(/border-b/)
        await expect(header).toHaveClass(/px-6/)
        await expect(header).toHaveClass(/py-4/)
    })

    test('la navigation est en flex avec un espace entre les liens', async () => {
        await expect(nav).toHaveClass(/flex/)
        await expect(nav).toHaveClass(/items-center/)
        await expect(nav).toHaveClass(/gap-5/)
        await expect(nav).toHaveClass(/text-sm/)
        await expect(nav).toHaveClass(/font-medium/)
    })

    test('le logo est un lien stylé', async () => {
        await expect(logo).toBeVisible()
        await expect(logo).toHaveText('LOGO')
        await expect(logo).toHaveClass(/text-xl/)
        await expect(logo).toHaveClass(/font-bold/)
        await expect(logo).toHaveClass(/text-slate-900/)
    })

    test('la navigation contient les liens attendus', async () => {
        await expect(links).toHaveCount(3)
        await expect(links.nth(0)).toHaveText('Services')
        await expect(links.nth(1)).toHaveText('Projets')
        await expect(links.nth(2)).toHaveText('Contact')
    })
})


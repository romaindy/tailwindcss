import {Locator, test, expect} from '@playwright/test'

test.describe('Exercice 1 - Le bouton bleu', () => {

    let button: Locator;

    test.beforeEach(async ({page}) => {
        await page.goto('/exercices/01-button')

        button = page.locator('button').filter({hasText: 'En savoir plus'})

        await expect(button).toBeVisible()
    })

    test('le bouton a un fond bleu', async () => {
        await expect(button).toHaveClass(/bg-blue/)
    })

    test('le bouton a un text blanc', async () => {
        await expect(button).toHaveClass(/text-white/)
    })

    test('le bouton est en gras', async () => {
        await expect(button).toHaveClass(/font-(medium|semibold|bold|extrabold)/)
    })

    test('le bouton a un padding', async () => {
        await expect(button).toHaveClass(/p([xy])?-[0-9]/)
    })

    test('le bouton est arrondi', async () => {
        await expect(button).toHaveClass(/rounded/)
    })
})
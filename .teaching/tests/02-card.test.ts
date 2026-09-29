import {Locator, test, expect} from '@playwright/test'

test.describe('Exercice 2 - La card', () => {

    let card: Locator, title: Locator, paragraph: Locator, button: Locator;

    test.beforeEach(async ({page}) => {
        await page.goto('/exercices/02-card')

        card = page.locator('article')
        title = page.locator('h5')
        paragraph = page.locator('p')
        button = page.locator('a').filter({hasText: 'En savoir plus'})

        await expect(card).toBeVisible()
    })

    test('a un padding', async () => {
        await expect(card).toHaveClass(/p-/)
    })

    test('a une bordure arrondie', async () => {
        await expect(card).toHaveClass(/border/)
        await expect(card).toHaveClass(/rounded/)
    })

    test('a un titre plus grand et en semi-gras', async () => {
        await expect(title).toHaveClass(/text-(lg|xl|2xl|3xl)/);
        await expect(title).toHaveClass(/font-semibold/)
    })

    test('a un paragraphe gris', async () => {
        await expect(paragraph).toHaveClass(/text-gray(-\d)?/);
    })


    test('a un bouton avec une bordure arrondie', async () => {
        await expect(button).toHaveClass(/border/)
        await expect(button).toHaveClass(/rounded/)
    })

    test('a un bouton avec un texte en medium', async () => {
        await expect(button).toHaveClass(/font-medium/)
    })

})
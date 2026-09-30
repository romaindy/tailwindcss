import {Locator, expect, test} from '@playwright/test'

test.describe('Exercice 5 - Grid responsive', () => {
    let grid: Locator
    let cards: Locator

    test.beforeEach(async ({page}) => {
        await page.goto('/exercices/05-grid')

        grid = page.locator('section').first()
        cards = grid.locator('article')

        await expect(grid).toBeVisible()
    })

    test('la grille utilise display grid avec un espacement gap-6', async () => {
        await expect(grid).toHaveClass(/grid/)
        await expect(grid).toHaveClass(/gap-6/)
    })

    test('la grille a 1 colonne par défaut', async () => {
        await expect(grid).toHaveClass(/grid-cols-1/)
    })

    test('la grille passe a 2 colonnes sur tablette', async () => {
        await expect(grid).toHaveClass(/md:grid-cols-2/)
    })

    test('la grille passe a 3 colonnes sur grand écran', async () => {
        await expect(grid).toHaveClass(/lg:grid-cols-3/)
    })

    test('la grille contient plusieurs cartes', async () => {
        const count = await cards.count();
        expect(count).toBeGreaterThanOrEqual(6)
    })
})


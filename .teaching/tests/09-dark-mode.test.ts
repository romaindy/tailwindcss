import { expect, test } from '@playwright/test'

test.describe('Exercice 9 - Dark mode', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/exercices/09-dark-mode')
    })

    test('contient au moins 3 éléments avec une classe commençant par dark:', async ({ page }) => {
        const darkClassElementsCount = await page.locator('[class]').evaluateAll((elements) => {
            return elements.filter((element) =>
                Array.from(element.classList).some((className) => className.startsWith('dark:')),
            ).length
        })

        expect(darkClassElementsCount).toBeGreaterThanOrEqual(3)
    })
})

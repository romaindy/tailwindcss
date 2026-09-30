import {Locator, expect, test} from '@playwright/test'

test.describe('Exercice 10 - Container queries', () => {
    let cards: Locator

    test.beforeEach(async ({page}) => {
        await page.goto('/exercices/10-container-queries')
        cards = page.locator('article')

        await expect(cards.first()).toBeVisible()
    })

    test('utilise des containers sur les cartes', async () => {
        const containerCards = await cards.evaluateAll((elements) => {
            return elements.filter((element) => element.classList.contains('@container')).length
        })

        expect(containerCards).toBeGreaterThanOrEqual(2)
    })

    test('utilise des variantes de container query @md: sur plusieurs éléments', async ({page}) => {
        const containerQueryElements = await page.locator('[class]').evaluateAll((elements) => {
            return elements.filter((element) =>
                Array.from(element.classList).some((className) => className.startsWith('@md:')),
            ).length
        })

        expect(containerQueryElements).toBeGreaterThanOrEqual(4)
    })
})


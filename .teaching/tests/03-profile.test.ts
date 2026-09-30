import { Locator, expect, test } from '@playwright/test'

test.describe('Exercice 3 - Le profil', () => {
    let pageMain: Locator
    let card: Locator
    let header: Locator
    let avatar: Locator
    let statsContainer: Locator
    let statusBadge: Locator
    let skillBadges: Locator
    let actionButton: Locator

    test.beforeEach(async ({ page }) => {
        await page.goto('/exercices/03-profile')

        pageMain = page.locator('main')
        card = page.locator('main > div > div')
        header = card.locator('div').first()
        avatar = header.locator('img[alt="Sophie Martin"]')
        statsContainer = page.locator('h2', { hasText: 'Statistiques' }).locator('..')
        statusBadge = page.locator('span', { hasText: 'Disponible' })
        skillBadges = page.locator('span').filter({ hasText: /UI Design|UX Design|Figma|Design System/ })
        actionButton = page.locator('button').filter({ hasText: 'Modifier le profil' })

        await expect(card).toBeVisible()
    })

    test('a une carte avec bordure arrondie et ombre', async () => {
        await expect(card).toHaveClass(/rounded-2xl/)
        await expect(card).toHaveClass(/border/)
        await expect(card).toHaveClass(/shadow/) 
    })

    test('a un header sombre centré avec avatar rond', async () => {
        await expect(header).toHaveClass(/bg-slate-900/)
        await expect(header).toHaveClass(/text-center/)
        await expect(avatar).toHaveClass(/rounded-full/)
        await expect(avatar).toHaveClass(/border-4/)
    })

    test('a un bloc statistiques sur fond clair', async () => {
        await expect(statsContainer).toHaveClass(/bg-slate-50/)
        await expect(statsContainer).toHaveClass(/rounded-xl/)
        await expect(statsContainer).toHaveClass(/p-/)
    })

    test('a un badge de disponibilité vert', async () => {
        await expect(statusBadge).toHaveClass(/rounded-full/)
        await expect(statusBadge).toHaveClass(/bg-green-100/)
        await expect(statusBadge).toHaveClass(/text-green-700/)
    })

    test('a des badges compétences bleus', async () => {
        await expect(skillBadges).toHaveCount(4)

        const firstSkillBadge = skillBadges.first()
        await expect(firstSkillBadge).toHaveClass(/rounded-full/)
        await expect(firstSkillBadge).toHaveClass(/bg-blue-100/)
        await expect(firstSkillBadge).toHaveClass(/text-blue-800/)
    })

    test('a un bouton principal pleine largeur', async () => {
        await expect(actionButton).toHaveClass(/w-full/)
        await expect(actionButton).toHaveClass(/bg-slate-800/)
        await expect(actionButton).toHaveClass(/text-white/)
        await expect(actionButton).toHaveClass(/font-bold/)
    })

    test('a un layout principal centre en hauteur', async () => {
        await expect(pageMain).toHaveClass(/min-h-screen/)
        await expect(pageMain).toHaveClass(/px-/)
        await expect(pageMain).toHaveClass(/py-/)
    })
})


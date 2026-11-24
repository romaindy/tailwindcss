# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 03-profile.test.ts >> Exercice 3 - Le profil >> a un bloc statistiques sur fond clair
- Location: .teaching\tests\03-profile.test.ts:41:9

# Error details

```
Error: expect(locator).toHaveClass(expected) failed

Locator: locator('h2').filter({ hasText: 'Statistiques' }).locator('..')
Expected pattern: /bg-slate-50/
Received string:  "p-6"
Timeout: 5000ms

Call log:
  - Expect "toHaveClass" locator('h2').filter({ hasText: 'Statistiques' }).locator('..') with timeout 5000ms
  - waiting for locator('h2').filter({ hasText: 'Statistiques' }).locator('..')
    14 × locator resolved to <div class="p-6">…</div>
       - unexpected value "p-6"

```

```yaml
- heading "Statistiques" [level=2]
- paragraph: "128"
- paragraph: Projets réalisés
- paragraph: 4.9 / 5
- paragraph: Note moyenne
- paragraph: "32"
- paragraph: Avis clients
```

# Test source

```ts
  1  | import { Locator, expect, test } from '@playwright/test'
  2  | 
  3  | test.describe('Exercice 3 - Le profil', () => {
  4  |     let pageMain: Locator
  5  |     let card: Locator
  6  |     let header: Locator
  7  |     let avatar: Locator
  8  |     let statsContainer: Locator
  9  |     let statusBadge: Locator
  10 |     let skillBadges: Locator
  11 |     let actionButton: Locator
  12 | 
  13 |     test.beforeEach(async ({ page }) => {
  14 |         await page.goto('/exercices/03-profile')
  15 | 
  16 |         pageMain = page.locator('main')
  17 |         card = page.locator('main > div > div')
  18 |         header = card.locator('div').first()
  19 |         avatar = header.locator('img[alt="Sophie Martin"]')
  20 |         statsContainer = page.locator('h2', { hasText: 'Statistiques' }).locator('..')
  21 |         statusBadge = page.locator('span', { hasText: 'Disponible' })
  22 |         skillBadges = page.locator('span').filter({ hasText: /UI Design|UX Design|Figma|Design System/ })
  23 |         actionButton = page.locator('button').filter({ hasText: 'Modifier le profil' })
  24 | 
  25 |         await expect(card).toBeVisible()
  26 |     })
  27 | 
  28 |     test('a une carte avec bordure arrondie et ombre', async () => {
  29 |         await expect(card).toHaveClass(/rounded-2xl/)
  30 |         await expect(card).toHaveClass(/border/)
  31 |         await expect(card).toHaveClass(/shadow/) 
  32 |     })
  33 | 
  34 |     test('a un header sombre centré avec avatar rond', async () => {
  35 |         await expect(header).toHaveClass(/bg-slate-900/)
  36 |         await expect(header).toHaveClass(/text-center/)
  37 |         await expect(avatar).toHaveClass(/rounded-full/)
  38 |         await expect(avatar).toHaveClass(/border-4/)
  39 |     })
  40 | 
  41 |     test('a un bloc statistiques sur fond clair', async () => {
> 42 |         await expect(statsContainer).toHaveClass(/bg-slate-50/)
     |                                      ^ Error: expect(locator).toHaveClass(expected) failed
  43 |         await expect(statsContainer).toHaveClass(/rounded-xl/)
  44 |         await expect(statsContainer).toHaveClass(/p-/)
  45 |     })
  46 | 
  47 |     test('a un badge de disponibilité vert', async () => {
  48 |         await expect(statusBadge).toHaveClass(/rounded-full/)
  49 |         await expect(statusBadge).toHaveClass(/bg-green-100/)
  50 |         await expect(statusBadge).toHaveClass(/text-green-700/)
  51 |     })
  52 | 
  53 |     test('a des badges compétences bleus', async () => {
  54 |         await expect(skillBadges).toHaveCount(4)
  55 | 
  56 |         const firstSkillBadge = skillBadges.first()
  57 |         await expect(firstSkillBadge).toHaveClass(/rounded-full/)
  58 |         await expect(firstSkillBadge).toHaveClass(/bg-blue-100/)
  59 |         await expect(firstSkillBadge).toHaveClass(/text-blue-800/)
  60 |     })
  61 | 
  62 |     test('a un bouton principal pleine largeur', async () => {
  63 |         await expect(actionButton).toHaveClass(/w-full/)
  64 |         await expect(actionButton).toHaveClass(/bg-slate-800/)
  65 |         await expect(actionButton).toHaveClass(/text-white/)
  66 |         await expect(actionButton).toHaveClass(/font-bold/)
  67 |     })
  68 | 
  69 |     test('a un layout principal centre en hauteur', async () => {
  70 |         await expect(pageMain).toHaveClass(/min-h-screen/)
  71 |         await expect(pageMain).toHaveClass(/px-/)
  72 |         await expect(pageMain).toHaveClass(/py-/)
  73 |     })
  74 | })
  75 | 
  76 | 
```
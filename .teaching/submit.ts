import {spawnSync} from 'node:child_process'
import {existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {basename, join} from 'node:path'
import {createInterface} from 'node:readline/promises'

const API_URL = 'https://esgi.tail8b378d.ts.net/api'
const STUDENT_PATH = '.teaching/student.json'
const dryRun = process.argv.includes('--dry-run')
const PLAYWRIGHT_BIN = process.platform === 'win32' ? 'npx.cmd' : 'npx'

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
})

function getPlaywrightStats(report: any) {
    let passed = 0
    let total = 0

    const walkSuites = (suites: any[]) => {
        for (const suite of suites) {
            if (suite.specs) {
                for (const spec of suite.specs) {
                    if (spec.tests) {
                        for (const test of spec.tests) {
                            const status = test.results?.[0]?.status ?? 'skipped'

                            if (status !== 'skipped') {
                                total += 1
                            }

                            if (status === 'passed') {
                                passed += 1
                            }
                        }
                    }
                }
            }

            if (suite.suites) {
                walkSuites(suite.suites)
            }
        }
    }

    walkSuites(report?.suites ?? [])

    return {passed, total}
}

function extractJsonReport(output: string) {
    const trimmed = output.trim()

    if (!trimmed) {
        return null
    }

    const start = trimmed.indexOf('{')
    const end = trimmed.lastIndexOf('}')

    if (start === -1 || end === -1 || end < start) {
        return null
    }

    const candidate = trimmed.slice(start, end + 1)

    try {
        return JSON.parse(candidate)
    } catch {
        return null
    }
}

function isPlaywrightSetupError(output: string) {
    const normalized = output.toLowerCase()

    return (
        normalized.includes('please run npx playwright install') ||
        normalized.includes('npx playwright install') ||
        normalized.includes('executable doesn\'t exist') ||
        (normalized.includes('browserType.launch') && normalized.includes('executable')) ||
        (normalized.includes('browser type') && normalized.includes('not found')) ||
        normalized.includes('cannot find module \'@playwright/test\'') ||
        normalized.includes('playwright is not installed') ||
        (normalized.includes('spawn npx') && normalized.includes('enoent'))
    )
}

function ensurePlaywrightCanRun(run: { success: boolean, output: string, needsInstall: boolean }) {
    if (run.needsInstall) {
        console.error('\n⚠️ Playwright n\'est pas prêt dans ce projet.')
        console.error('👉 Commande à lancer :')
        console.error('   npx playwright install')
        console.error('   npx playwright install --with-deps')
        console.error('puis relancez la soumission.')
        throw new Error('Playwright non installé / browsers absents')
    }

    const report = extractJsonReport(run.output)

    if (!run.success && !report) {
        console.error('\n⚠️ Les tests n\'ont pas démarré correctement.')
        console.error('Le rapport JSON Playwright n\'a pas été généré.')
        console.error('Vérifiez que Playwright est bien installé :')
        console.error('   npx playwright install')
        throw new Error('Aucun rapport Playwright valide reçu')
    }

    if (!report) {
        throw new Error('Aucun rapport JSON Playwright valide reçu')
    }

    return report
}

async function ask(question: string) {
    return (await rl.question(question)).trim()
}

function safeReadJson(filePath: string) {
    if (!existsSync(filePath)) {
        return null
    }

    try {
        return JSON.parse(readFileSync(filePath, 'utf8'))
    } catch {
        return null
    }
}

function getMimeType(filePath: string) {
    if (filePath.endsWith('.html')) return 'text/html'
    if (filePath.endsWith('.css')) return 'text/css'
    return 'application/octet-stream'
}

function getSubmissionFiles(exerciceFile: string) {
    const wantedFiles = [exerciceFile]
    const files = wantedFiles.filter((filePath) => existsSync(filePath))
    const missingFiles = wantedFiles.filter((filePath) => !existsSync(filePath))

    return {files, missingFiles}
}

function normalizeExerciceNumber(input: string) {
    const trimmed = input.trim()

    if (!/^\d+$/.test(trimmed)) {
        throw new Error(`Numéro d'exercice invalide : ${input}`)
    }

    return String(Number.parseInt(trimmed, 10)).padStart(2, '0')
}

function findFileByPrefix(folderPath: string, prefix: string, suffix: string) {
    const fileName = readdirSync(folderPath).find((file) => file.startsWith(prefix) && file.endsWith(suffix))

    if (!fileName) {
        throw new Error(`Aucun fichier trouvé pour ${prefix} dans ${folderPath}`)
    }

    return join(folderPath, fileName)
}

function resolveExercicePaths(inputNumber: string) {
    const exerciceNumber = normalizeExerciceNumber(inputNumber)
    const exerciceFile = findFileByPrefix('./exercices', `${exerciceNumber}-`, '.html')
    const testFile = findFileByPrefix('./.teaching/tests', `${exerciceNumber}-`, '.test.ts')

    return {exerciceNumber, exerciceFile, testFile}
}

function runPlaywright(testFile: string) {
    const outputDir = mkdtempSync(join(tmpdir(), 'submit-playwright-'))

    try {
        const result = spawnSync(
            PLAYWRIGHT_BIN,
            ['playwright', 'test', testFile, '--config=.teaching/playwright.config.ts', '--reporter=json', '--output=' + outputDir],
            {
                encoding: 'utf8',
                shell: process.platform === 'win32',
                stdio: ['inherit', 'pipe', 'pipe'],
            },
        )

        const output = `${result.stdout ?? ''}${result.stderr ?? ''}`

        return {
            success: result.status === 0,
            output,
            needsInstall: isPlaywrightSetupError(output),
        }
    } catch (error: any) {
        const output = error.stdout?.toString() ?? error.stderr?.toString() ?? ''
        return {success: false, output, needsInstall: isPlaywrightSetupError(output)}
    } finally {
        rmSync(outputDir, {recursive: true, force: true})
    }
}

async function main() {
    let student: { name: string }

    const savedStudent = safeReadJson(STUDENT_PATH)

    if (savedStudent?.name) {
        student = {name: savedStudent.name}
    } else {
        const name = await ask('Votre nom et prénom : ')
        student = {name}

        writeFileSync(STUDENT_PATH, JSON.stringify(student, null, 2))
        console.log(`\nBonjour ${name} !`)
    }

    const exercice = await ask("\nNuméro de l'exercice : ")
    const {exerciceNumber, exerciceFile, testFile} = resolveExercicePaths(exercice)

    const {files: filesToSend, missingFiles} = getSubmissionFiles(exerciceFile)

    if (missingFiles.length > 0) {
        console.warn(`\nFichiers non trouvés (ignorés) : ${missingFiles.join(', ')}`)
    }

    console.log('\nLancement des tests...\n')

    let testResult: { success: boolean, passed: number, total: number }

    const run = runPlaywright(testFile)
    const report = ensurePlaywrightCanRun(run)
    const stats = getPlaywrightStats(report)

    testResult = {
        success: run.success,
        passed: stats.passed,
        total: stats.total,
    }


    console.log('\n------------------------')
    console.log(`Score : ${testResult.passed}/${testResult.total}`)

    if (dryRun) {
        console.log("Mode TEST : le résultat n'est pas envoyé.")
        console.log(`Fichiers qui seraient envoyés : ${filesToSend.join(', ')}`)
        console.log('------------------------\n')
        rl.close()
        return
    }

    const formData = new FormData()
    formData.append('student', student.name)
    formData.append('project', `Exercice n°${exerciceNumber}`)
    formData.append('score', String(testResult.passed))
    formData.append('maxScore', String(testResult.total))

    for (const filePath of filesToSend) {
        formData.append(
            'files',
            new Blob([readFileSync(filePath)], {type: getMimeType(filePath)}),
            basename(filePath),
        )
    }

    const response = await fetch(`${API_URL}/submissions`, {
        method: 'POST',
        body: formData,
    })

    const responseBody = await response.text()

    if (!response.ok) {
        throw new Error(`Erreur API : ${response.status} - ${responseBody}`)
    }

    console.log('✅ Soumission enregistrée.')
    console.log('------------------------\n')

    rl.close()
}

main().catch((error) => {
    console.error('\n⚠️ Erreur :', error.message)
    console.log('------------------------\n')
    rl.close()
    process.exit(1)
})
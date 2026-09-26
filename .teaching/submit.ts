import {execSync} from 'node:child_process'
import {existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {basename, join} from 'node:path'
import {createInterface} from 'node:readline/promises'

const API_URL = 'https://esgi.tail8b378d.ts.net/api'
const STUDENT_PATH = '.teaching/student.json'
const dryRun = process.argv.includes('--dry-run')

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
        const output = execSync(
            `playwright test "${testFile}" --config=.teaching/playwright.config.ts --reporter=json --output="${outputDir}"`,
            {encoding: 'utf8'},
        )

        return {success: true, output}
    } catch (error: any) {
        const output = error.stdout?.toString() ?? error.stderr?.toString() ?? ''
        return {success: false, output}
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
    const report = extractJsonReport(run.output)
    const stats = report ? getPlaywrightStats(report) : {passed: 0, total: 0}

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
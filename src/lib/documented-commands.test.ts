/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const requiredCommands = ['lint', 'typecheck', 'test', 'test:e2e', 'build']

const extractPublicationChecklistCommands = (readme: string): string[] => {
  const checklist = readme
    .split(/^## Проверка перед публикацией\s*$/m)[1]
    ?.split(/^##\s/m)[0]
  const commandBlock = checklist?.match(/```(?:\w+)?\s*\n([\s\S]*?)```/)?.[1]

  return Array.from(commandBlock?.matchAll(/^npm run (\S+)\s*$/gm) ?? []).map(
    (match) => match[1]!,
  )
}

describe('publication checklist documentation', () => {
  it('documents exactly the required package scripts in the publication checklist', () => {
    const readme = readFileSync('README.md', 'utf8')
    const packageJson = JSON.parse(
      readFileSync('package.json', 'utf8'),
    ) as { scripts: Record<string, string> }

    expect(readme, 'README must include the publication checklist').toMatch(
      /^## Проверка перед публикацией\s*$/m,
    )

    const documentedCommands = extractPublicationChecklistCommands(readme)

    expect(documentedCommands).toEqual(requiredCommands)

    for (const command of documentedCommands) {
      expect(
        Object.hasOwn(packageJson.scripts, command),
        `README documents a missing package script: ${command}`,
      ).toBe(true)
    }
  })

  it('extracts every command from the publication checklist code block', () => {
    const checklistWithInvalidCommand = `## Проверка перед публикацией

\`\`\`bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run does-not-exist
npm run docs.verify
\`\`\`

## Вне чеклиста

npm run ignored`

    expect(
      extractPublicationChecklistCommands(checklistWithInvalidCommand),
    ).toEqual([
      ...requiredCommands,
      'does-not-exist',
      'docs.verify',
    ])
  })
})

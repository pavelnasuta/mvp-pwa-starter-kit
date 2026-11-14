/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const requiredCommands = ['lint', 'typecheck', 'test', 'test:e2e', 'build']

describe('publication checklist documentation', () => {
  it('documents only package scripts in the publication checklist', () => {
    const readme = readFileSync('README.md', 'utf8')
    const packageJson = JSON.parse(
      readFileSync('package.json', 'utf8'),
    ) as { scripts: Record<string, string> }
    const section = readme.match(
      /^## Проверка перед публикацией\s*\n([\s\S]*)/m,
    )

    expect(section, 'README must include the publication checklist').not.toBeNull()

    const documentedCommands = requiredCommands.filter((command) =>
      section?.[1].includes(`npm run ${command}`),
    )

    expect(documentedCommands).toEqual(requiredCommands)
    expect(Object.keys(packageJson.scripts)).toEqual(
      expect.arrayContaining(requiredCommands),
    )
  })
})

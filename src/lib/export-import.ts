import { z } from 'zod'

import { IDEA_STATUSES, type Idea, type ImportPayload } from '../types/idea'

const isoTimestampSchema = z.string().trim().min(1).datetime({ offset: true })

const ideaSchema = z.object({
  id: z.string(),
  title: z.string().trim().min(1),
  description: z.string(),
  status: z.enum(IDEA_STATUSES),
  tags: z.array(z.string()),
  createdAt: isoTimestampSchema,
  updatedAt: isoTimestampSchema,
})

const importPayloadSchema = z.object({
  version: z.literal(1),
  exportedAt: isoTimestampSchema,
  ideas: z.array(ideaSchema),
})

export function parseImportPayload(input: string): ImportPayload {
  try {
    return importPayloadSchema.parse(JSON.parse(input))
  } catch {
    throw new Error('Неверный файл экспорта')
  }
}

export function serializeExportPayload(ideas: Idea[]): string {
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      ideas,
    },
    null,
    2,
  )
}

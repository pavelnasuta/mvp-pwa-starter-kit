export const IDEA_STATUSES = ['draft', 'active', 'done'] as const

export type IdeaStatus = (typeof IDEA_STATUSES)[number]

export type Idea = {
  id: string
  title: string
  description: string
  status: IdeaStatus
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type IdeaDraft = Pick<Idea, 'title' | 'description' | 'status' | 'tags'>

export type IdeasExportV1 = {
  version: 1
  exportedAt: string
  ideas: Idea[]
}

export type ImportPayload = IdeasExportV1

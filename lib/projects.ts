import { content } from './content.generated'

// Projects live in content/site.md, under "## projects".
export type { Project } from './content-types'

export const projects = content.projects.items

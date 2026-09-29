import { content } from './content.generated'

// What Kaan is working on now lives in content/site.md, under "## currently".
export type { CurrentItem } from './content-types'

export const currently = content.currently.items

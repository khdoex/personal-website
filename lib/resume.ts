import { content } from './content.generated'

// The resume lives in content/site.md (the resume-* sections). These names
// stay as they were so the page, llms-full.txt and the JSON-LD read it
// without knowing where it comes from.
export type { ResumeEntry, SkillGroup } from './content-types'

export const about = content.resume.summary
export const experience = content.resume.experience
export const education = content.resume.education
export const resumeProjects = content.resume.projects
export const skills = content.resume.skills
export const certifications = content.resume.certifications
export const languages = content.resume.languages

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// content/site.md holds every word a visitor reads. This reads it at build
// time, the same way build-posts.mjs bundles the posts (the Workers runtime
// has no filesystem), checks it against the shape the pages need, and emits
// lib/content.generated.ts, typed against lib/content-types.ts.
//
// The format is deliberately small. "## name" opens a section, "### title"
// an entry inside one, "key: value" is a field, "- text" a list line, and
// anything else is paragraph text. A key only counts as a field where the
// schema below lists it, so a sentence that happens to start "note: ..."
// stays a sentence instead of vanishing.
//
// Every mistake is reported with its line number and stops the build. A
// silent fallback would ship a page with a hole in it.

const SRC_REL = 'content/site.md'
const SRC = join(process.cwd(), SRC_REL)
const OUT = join(process.cwd(), 'lib', 'content.generated.ts')

// keys: fields on the section. itemKeys: fields on each ### entry (and
// items: true). body/bullets: whether paragraphs and list lines are shown.
const SCHEMA = {
  intro: { keys: ['skip', 'replay'], body: false, bullets: true },
  hero: { keys: ['greeting', 'location', 'time', 'scroll'], body: true },
  currently: { keys: ['label'], itemKeys: ['since', 'link'], body: false },
  'about-teaser': { keys: ['label', 'link'], body: true, bullets: true },
  'resume-teaser': { keys: ['label', 'link', 'pdf'], body: true },
  'writing-teaser': { keys: ['label', 'link'], body: true },
  contact: { keys: ['label', 'email'], body: true },
  about: { keys: ['handles'], body: true },
  projects: { keys: [], itemKeys: ['status', 'source', 'demo', 'tags'], body: true },
  writing: { keys: [], body: true },
  resume: { keys: ['pdf'], body: true },
  'resume-story': { keys: ['label'], itemKeys: ['period', 'scene'], body: false },
  'resume-experience': { keys: [], itemKeys: ['period', 'org', 'org-link', 'link'], body: false },
  'resume-education': { keys: [], itemKeys: ['period', 'org', 'org-link', 'link'], body: false },
  'resume-projects': { keys: [], itemKeys: ['period', 'org', 'org-link', 'link'], body: false },
  'resume-skills': { keys: [], body: false, bullets: true },
  'resume-certifications': { keys: [], body: false, bullets: true },
  'resume-languages': { keys: [], body: true },
  'not-found': { keys: ['title'], body: true },
  world: {
    keys: ['saturn', 'black-hole', 'transformer', 'refusal', 'harmful', 'harmless', 'prompt', 'answer'],
    body: false,
  },
  navigation: { keys: ['home', 'blog', 'projects', 'about', 'resume'], body: false },
  footer: { keys: ['line'], body: false },
}

// What the 3D world can show beside a chapter of the resume's story. The same
// names as SceneName in lib/content-types.ts and SCENES in
// components/world/engine/shots.ts.
const SCENES = ['bogazici', 'physics', 'padova', 'interpretability', 'levent']

class ContentError extends Error {}
const fail = (line, message) => {
  throw new ContentError(line ? `${SRC_REL}:${line}: ${message}` : `${SRC_REL}: ${message}`)
}
const where = (block) => (block.title ? `"### ${block.title}"` : `"## ${block.id}"`)

function parse(text) {
  const sections = new Map()
  let section = null
  let item = null
  let para = null // index into the current block's body while a paragraph is open
  let bullet = null // index into the current block's bullets while a list line is open
  let inComment = false

  const block = () => item ?? section

  text.split(/\r?\n/).forEach((raw, i) => {
    const n = i + 1

    // Notes in <!-- --> vanish. A line that held nothing but a note does not
    // break the paragraph around it; a truly empty line does.
    let line = ''
    let rest = raw
    while (rest) {
      if (inComment) {
        const end = rest.indexOf('-->')
        if (end === -1) { rest = ''; break }
        inComment = false
        rest = rest.slice(end + 3)
      } else {
        const start = rest.indexOf('<!--')
        if (start === -1) { line += rest; break }
        line += rest.slice(0, start)
        inComment = true
        rest = rest.slice(start + 4)
      }
    }
    const t = line.trim()
    if (!t) {
      if (!raw.trim()) {
        para = null
        bullet = null
      }
      return
    }

    let m
    if ((m = t.match(/^#\s/))) {
      para = bullet = null
      return // the document title
    }
    if ((m = t.match(/^##\s+(.+?)\s*$/)) && !t.startsWith('###')) {
      const id = m[1].toLowerCase()
      if (!SCHEMA[id]) {
        fail(n, `there is no section called "## ${m[1]}". The sections are: ${Object.keys(SCHEMA).join(', ')}.`)
      }
      if (sections.has(id)) fail(n, `"## ${id}" appears twice, the first one is on line ${sections.get(id).line}.`)
      section = { id, line: n, fields: {}, body: [], bullets: [], items: [] }
      sections.set(id, section)
      item = null
      para = bullet = null
      return
    }
    if ((m = t.match(/^###\s+(.+?)\s*$/))) {
      if (!section) fail(n, `"### ${m[1]}" comes before any "## section".`)
      if (!SCHEMA[section.id].itemKeys) {
        fail(n, `"## ${section.id}" has no ### entries. Remove the ### to make this a paragraph.`)
      }
      item = { id: section.id, title: m[1], line: n, fields: {}, body: [], bullets: [] }
      section.items.push(item)
      para = bullet = null
      return
    }
    if (!section) fail(n, 'text before the first "## section". Move it under one, or into a <!-- note -->.')

    if ((m = raw.match(/^\s*[-*]\s+(.*)$/))) {
      const target = block()
      target.bullets.push({ text: m[1].trim(), line: n })
      bullet = target.bullets.length - 1
      para = null
      return
    }
    if (bullet !== null && /^\s+/.test(raw)) {
      const b = block().bullets[bullet]
      b.text = `${b.text} ${t}`
      return
    }

    if ((m = t.match(/^([a-z][a-z0-9-]*):\s*(.*)$/))) {
      const [, key, value] = m
      const schema = SCHEMA[section.id]
      const target = item && schema.itemKeys?.includes(key) ? item : schema.keys.includes(key) ? section : null
      if (target) {
        if (key in target.fields) fail(n, `${where(target)} has "${key}:" twice.`)
        target.fields[key] = { value: value.trim(), line: n }
        para = bullet = null
        return
      }
    }

    const target = block()
    if (para === null) {
      target.body.push({ text: t, line: n })
      para = target.body.length - 1
    } else {
      target.body[para].text = `${target.body[para].text} ${t}`
    }
    bullet = null
  })

  if (inComment) fail(null, 'a <!-- note is never closed with -->.')
  return sections
}

function build(sections) {
  for (const id of Object.keys(SCHEMA)) {
    if (!sections.has(id)) fail(null, `the "## ${id}" section is missing.`)
  }

  // What each block is allowed to hold, checked before anything is read, so
  // text the page would not show is an error rather than a quiet loss.
  for (const s of sections.values()) {
    const schema = SCHEMA[s.id]
    const blocks = [s, ...s.items]
    for (const b of blocks) {
      const isItem = b !== s
      if (b.body.length && !(isItem ? schema.itemKeys : schema.body)) {
        fail(b.body[0].line, `${where(b)} does not show paragraphs here. Is this meant to be a "key: value" line? The keys here are: ${(isItem ? schema.itemKeys : schema.keys).join(', ') || 'none'}.`)
      }
      // An entry's list lines are only shown as a resume row's "+ detail".
      if (b.bullets.length && (isItem ? !s.id.startsWith('resume-') : !schema.bullets)) {
        fail(b.bullets[0].line, `${where(b)} does not show list lines. Drop the leading "- " to make it a paragraph.`)
      }
    }
  }

  const get = (id) => sections.get(id)
  const need = (b, key) => {
    const v = b.fields[key]?.value
    if (!v) fail(b.line, `${where(b)} needs a "${key}: ..." line.`)
    return v
  }
  const opt = (b, key) => b.fields[key]?.value || undefined
  const paras = (b, { min = 1 } = {}) => {
    if (b.body.length < min) fail(b.line, `${where(b)} needs at least ${min === 1 ? 'one paragraph' : `${min} paragraphs`} of text.`)
    return b.body.map((p) => p.text)
  }
  const one = (b) => paras(b).join(' ')
  const items = (b) => {
    if (!b.items.length) fail(b.line, `${where(b)} needs at least one "### entry".`)
    return b.items
  }
  const bullets = (b, { min = 1 } = {}) => {
    if (b.bullets.length < min) fail(b.line, `${where(b)} needs at least ${min} "- " list line${min === 1 ? '' : 's'}.`)
    return b.bullets
  }
  // "label: value" list lines. last: split at the last colon instead of the
  // first, for a title that may itself contain one.
  const pairs = (b, { last = false } = {}) =>
    bullets(b).map(({ text, line }) => {
      const at = last ? text.lastIndexOf(': ') : text.indexOf(': ')
      if (at < 1) fail(line, `"${text}" should be written as label: value.`)
      return { label: text.slice(0, at).trim(), value: text.slice(at + 2).trim() }
    })
  const url = (b, key) => {
    const v = opt(b, key)
    if (v && !/^(https?:\/\/|\/|mailto:)/.test(v)) fail(b.fields[key].line, `"${key}: ${v}" is not a link. Links start with https://, / or mailto:.`)
    return v
  }
  const words = (b, key) => {
    const list = need(b, key).split(/\s+/).filter(Boolean)
    if (list.length < 3 || list.length > 8) {
      fail(b.fields[key].line, `"${key}" has ${list.length} words; the transformer has room for three to eight.`)
    }
    return list
  }
  const scene = (b) => {
    const v = need(b, 'scene')
    if (!SCENES.includes(v)) fail(b.fields.scene.line, `scene is "${v}"; it has to be one of ${SCENES.join(', ')}.`)
    return v
  }
  const resumeEntry = (b) => ({
    period: opt(b, 'period') ?? '',
    title: b.title,
    ...(opt(b, 'org') && { org: opt(b, 'org') }),
    ...(url(b, 'link') && { href: url(b, 'link') }),
    ...(url(b, 'org-link') && { orgHref: url(b, 'org-link') }),
    summary: one(b),
    ...(b.bullets.length && { detail: b.bullets.map((d) => d.text) }),
  })

  const intro = get('intro')
  const hero = get('hero')
  const currently = get('currently')
  const aboutTeaser = get('about-teaser')
  const resumeTeaser = get('resume-teaser')
  const writingTeaser = get('writing-teaser')
  const contact = get('contact')
  const about = get('about')
  const projects = get('projects')
  const resume = get('resume')
  const notFound = get('not-found')
  const nav = get('navigation')

  return {
    intro: {
      lines: bullets(intro).map((b) => b.text),
      skip: need(intro, 'skip'),
      replay: need(intro, 'replay'),
    },
    hero: {
      greeting: need(hero, 'greeting'),
      location: need(hero, 'location'),
      time: need(hero, 'time'),
      scroll: need(hero, 'scroll'),
      body: paras(hero),
    },
    currently: {
      label: need(currently, 'label'),
      items: items(currently).map((b) => ({
        since: need(b, 'since'),
        title: b.title,
        desc: one(b),
        ...(url(b, 'link') && { href: url(b, 'link') }),
      })),
    },
    aboutTeaser: {
      label: need(aboutTeaser, 'label'),
      link: need(aboutTeaser, 'link'),
      body: paras(aboutTeaser),
      facts: pairs(aboutTeaser),
    },
    resumeTeaser: {
      label: need(resumeTeaser, 'label'),
      link: need(resumeTeaser, 'link'),
      pdf: need(resumeTeaser, 'pdf'),
      body: paras(resumeTeaser),
    },
    writingTeaser: {
      label: need(writingTeaser, 'label'),
      link: need(writingTeaser, 'link'),
      body: paras(writingTeaser),
    },
    contact: {
      label: need(contact, 'label'),
      email: need(contact, 'email'),
      body: paras(contact),
    },
    about: {
      story: paras(about),
      handles: need(about, 'handles'),
    },
    projects: {
      intro: paras(projects),
      items: items(projects).map((b) => {
        const status = need(b, 'status')
        if (status !== 'current' && status !== 'earlier') {
          fail(b.fields.status.line, `status is "${status}"; it has to be current or earlier.`)
        }
        return {
          title: b.title,
          description: one(b),
          status,
          ...(url(b, 'source') && { githubUrl: url(b, 'source') }),
          tags: (opt(b, 'tags') ?? '').split(',').map((t) => t.trim()).filter(Boolean),
          ...(url(b, 'demo') && { demoUrl: url(b, 'demo') }),
        }
      }),
    },
    writing: { intro: paras(get('writing')) },
    resume: {
      pdf: need(resume, 'pdf'),
      summary: one(resume),
      story: {
        label: need(get('resume-story'), 'label'),
        chapters: items(get('resume-story')).map((b) => ({
          title: b.title,
          ...(opt(b, 'period') && { period: opt(b, 'period') }),
          scene: scene(b),
          body: paras(b),
        })),
      },
      experience: items(get('resume-experience')).map(resumeEntry),
      education: items(get('resume-education')).map(resumeEntry),
      projects: items(get('resume-projects')).map(resumeEntry),
      skills: pairs(get('resume-skills')).map(({ label, value }) => ({ label, items: value })),
      certifications: pairs(get('resume-certifications'), { last: true }).map(({ label, value }) => ({
        period: '',
        title: label,
        org: value,
        summary: '',
      })),
      languages: one(get('resume-languages')),
    },
    notFound: { title: need(notFound, 'title'), body: paras(notFound) },
    world: {
      captions: {
        saturn: need(get('world'), 'saturn'),
        blackHole: need(get('world'), 'black-hole'),
        transformer: need(get('world'), 'transformer'),
        refusal: need(get('world'), 'refusal'),
        harmful: need(get('world'), 'harmful'),
        harmless: need(get('world'), 'harmless'),
      },
      prompt: words(get('world'), 'prompt'),
      answer: need(get('world'), 'answer'),
    },
    navigation: {
      home: need(nav, 'home'),
      blog: need(nav, 'blog'),
      projects: need(nav, 'projects'),
      about: need(nav, 'about'),
      resume: need(nav, 'resume'),
    },
    footer: { line: need(get('footer'), 'line') },
  }
}

try {
  const content = build(parse(readFileSync(SRC, 'utf8')))
  writeFileSync(
    OUT,
    `// Generated by scripts/build-content.mjs from content/site.md. Do not edit.
// Edit content/site.md, then \`npm run content\` (dev and build run it too).

import type { SiteContent } from './content-types'

export const content: SiteContent = ${JSON.stringify(content, null, 2)}
`
  )
  console.log(`content: read ${SRC_REL} -> lib/content.generated.ts`)
} catch (error) {
  if (!(error instanceof ContentError)) throw error
  console.error(`\ncontent: ${error.message}\n`)
  process.exit(1)
}

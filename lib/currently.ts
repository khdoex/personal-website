export interface CurrentItem {
  since: string
  title: string
  desc: string
  href?: string
}

export const currently: CurrentItem[] = [
  {
    since: '2025',
    title: 'refusal geometry in llms',
    desc: 'msc thesis at sabanci, on how refusal behavior and safety representations are encoded inside large language models',
  },
  {
    since: '2024',
    title: 'SCL, synthetic consumer lab',
    desc: 'ai engineer building synthetic consumer systems for behavior simulation and market research workflows',
    href: 'https://synthetic-consumers.com/',
  },
  {
    since: '2024',
    title: 'soundboost',
    desc: 'ai engineer on an audio mastering platform, a virtual mastering engineer for musicians',
    href: 'https://soundboost.ai/about',
  },
]

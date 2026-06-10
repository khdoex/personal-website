export interface ResumeEntry {
  period: string
  title: string
  org?: string
  href?: string
  summary: string
  detail?: string[]
}

export interface SkillGroup {
  label: string
  items: string
}

export const about =
  'Creative AI Engineer with a strong foundation in physics and machine learning. Passionate about designing deep learning solutions and playing with advanced algorithms to solve problems.'

export const experience: ResumeEntry[] = [
  // TODO(kaan): add your current SCL entry here — start date, title, and how
  // much of the synthetic-consumer work you want to describe publicly.
  {
    period: '2024 –',
    title: 'AI Engineer',
    org: 'Diktatorial Suite',
    summary:
      'Architecting and deploying audio-based machine learning models for source separation, classification, and event detection.',
    detail: [
      'End-to-end AI solutions with a Django backend and real-time inference integration via JavaScript',
      'Developing AI agents to further advance audio processing',
    ],
  },
  {
    period: '2023',
    title: 'AI Engineer Intern',
    org: 'Live The World',
    summary:
      'Engineered a content generation pipeline leveraging state-of-the-art NLP tools.',
    detail: [
      'Enhanced web scraping capabilities and refined Python solutions to support AI-driven applications',
    ],
  },
  {
    period: '2022 – 2023',
    title: 'Data Analytics & Process Mining Intern',
    org: 'Allianz TR',
    summary:
      'Automated Excel reporting with Python and SQL, integrated databases, and built dynamic dashboards for operational visibility.',
    detail: [
      'Optimized business processes with Celonis process mining',
      'Streamlined workflows and boosted business intelligence',
    ],
  },
  {
    period: '2021 – 2022',
    title: 'Teaching Assistant',
    org: 'Bogazici University',
    summary:
      'Led interactive QA sessions for Numerical Methods, emphasizing practical applications of NumPy, SciPy, and Matplotlib.',
  },
  {
    period: '2020 – 2022',
    title: 'Research Assistant',
    org: 'Bogazici University',
    href: 'https://arxiv.org/abs/2407.18402',
    summary:
      'Developed machine learning algorithms for seismic data analysis, employing transformer-based architectures and feature engineering to enhance earthquake detection.',
    detail: [
      'Contributed to high-impact research (arXiv:2407.18402)',
      'Mentored a team of five junior researchers',
    ],
  },
]

export const education: ResumeEntry[] = [
  {
    period: '2025 –',
    title: 'M.Sc. in Data Science',
    org: 'Sabancı University',
    summary:
      'Specializing in deep learning and statistical analysis; thesis on refusal direction analysis in large language models.',
  },
  {
    period: '2023 – 2024',
    title: 'M.Sc. in Computer Science',
    org: 'University of Padua',
    summary:
      'Advanced coursework in artificial intelligence and deep learning before pursuing opportunities for practical application.',
  },
  {
    period: '2018 – 2023',
    title: 'B.Sc. in Physics',
    org: 'Bogazici University',
    summary:
      'Coursework in quantum physics, general relativity, and machine learning, while leading the Science Club.',
  },
]

export const resumeProjects: ResumeEntry[] = [
  {
    period: '',
    title: 'Earth-ML',
    summary: 'Enhanced time series classification using advanced modeling techniques.',
  },
  {
    period: '',
    title: 'TÜBİTAK 2209-A',
    summary: 'Developed a high-precision earthquake detection model through innovative feature engineering.',
  },
  {
    period: '',
    title: '"Burası" Art Exhibition',
    summary: 'Merged seismic data with artistic representation, a fusion of art and science.',
  },
  {
    period: '',
    title: 'Türkiye İş Bankası ML Challenge 5',
    href: 'https://github.com/khdoex/Past_ML_codes/blob/main/isb5-gradient-ensemble.ipynb',
    summary: '8th place on Kaggle through effective feature engineering strategies.',
  },
  {
    period: '',
    title: 'Datathon AI',
    summary: 'Third place in a computer vision focused datathon.',
  },
  {
    period: '',
    title: 'NLP News Summarization',
    href: 'https://github.com/khdoex/nlp_news_sum',
    summary: 'Comparative evaluation of summarization architectures like BART and T5.',
  },
]

export const skills: SkillGroup[] = [
  { label: 'programming', items: 'Python, SQL, JavaScript, TypeScript' },
  { label: 'deep learning', items: 'PyTorch, TensorFlow' },
  { label: 'machine learning', items: 'XGBoost, CatBoost, LightGBM' },
  { label: 'ai techniques', items: 'OpenAI API, LangChain, LangGraph, Transformers' },
  { label: 'web', items: 'Django, FastAPI, Celery' },
  { label: 'libraries', items: 'NumPy, SciPy, Matplotlib' },
]

export const certifications: ResumeEntry[] = [
  { period: '', title: 'Quantum Computing (Bronze)', org: 'QTurkey', summary: '' },
  { period: '', title: 'Excellence in Audio Course', org: 'Hugging Face', summary: '' },
  { period: '', title: 'Process Mining', org: 'Celonis Academy', summary: '' },
  { period: '', title: 'Building RAG Agents', org: 'NVIDIA Deep Learning Institute', summary: '' },
]

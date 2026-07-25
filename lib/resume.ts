export interface ResumeEntry {
  period: string
  title: string
  org?: string
  href?: string
  orgHref?: string
  summary: string
  detail?: string[]
}

export interface SkillGroup {
  label: string
  items: string
}

export const about =
  'AI engineer and grad student working on refusal mechanics and safety in llm through interpretability and SCL a new way of doing market research.'

export const experience: ResumeEntry[] = [
  {
    period: '2025 –',
    title: 'AI Engineer',
    org: 'Synthetic Consumer Lab',
    orgHref: 'https://synthetic-consumers.com/',
    summary:
      'Engineering lead responsible for the full product stack: backend, frontend, AI systems, and statistical methodology.',
    detail: [
      'Architected the platform on a Laravel, Python/FastAPI, and Redis stack',
      'Built agentic systems and solutions for market research, synthetic consumer persona systems grounded in real demographic and behavioral data',
      'agnus, the agent of the market research',
    ],
  },
  {
    period: '2025 –',
    title: 'Teaching Assistant',
    org: 'Sabancı University',
    orgHref: 'https://sabanciuniv.edu/',
    summary:
      'Teaching assistant for the Quantum Programming course, guiding students through quantum computing concepts, circuit design, and practical implementations using quantum programming frameworks.',
  },
  {
    period: '2024 – 2025',
    title: 'AI Engineer / Data Scientist',
    org: 'SoundBoost',
    orgHref: 'https://soundboost.ai/about',
    summary:
      'Designed and deployed deep learning models for audio source separation, classification, and acoustic event detection.',
    detail: [
      'End-to-end AI pipelines with Django backends for model serving and JavaScript for real-time inference',
      'Led development of AI agents for complex audio processing workflows',
      'Created free tools on SoundBoost like Loudness Penalty, LUFS meter, etc.',
    ],
  },
  {
    period: '2023',
    title: 'AI Engineer Intern',
    org: 'Live The World',
    orgHref: 'https://livetheworld.com/',
    summary:
      'Engineered content generation pipelines using llms and web scraping.',
    detail: [
      'Enhanced web scraping capabilities and developed Python solutions for AI-driven applications',
    ],
  },
  {
    period: '2022 – 2023',
    title: 'Data Analytics & Process Mining Intern',
    org: 'Allianz TR',
    orgHref: 'https://www.allianz.com.tr/',
    summary:
      'Automated Excel reporting workflows using Python and SQL. Built dynamic dashboards for operational visibility and optimized business processes using Celonis process mining.',
  },
  {
    period: '2020 – 2022',
    title: 'Research Assistant',
    org: 'Boğaziçi University',
    orgHref: 'https://boun.edu.tr/',
    href: 'https://arxiv.org/abs/2407.18402',
    summary:
      'Worked on feature engineering and transformer-based architectures for seismic data analysis and earthquake detection.',
    detail: [
      'Contributed to published research (arXiv:2407.18402)',
    ],
  },
  {
    period: '2021 – 2022',
    title: 'Teaching Assistant',
    org: 'Boğaziçi University',
    orgHref: 'https://boun.edu.tr/',
    summary:
      'Led QA sessions for Numerical Methods, teaching practical applications of NumPy, SciPy, and Matplotlib through hands-on problem solving.',
  },
]

export const education: ResumeEntry[] = [
  {
    period: '2025 –',
    title: 'M.Sc. in Data Science',
    org: 'Sabancı University',
    orgHref: 'https://sabanciuniv.edu/',
    summary:
      'Thesis research on mechanistic interpretability of large language models, studying how refusal and related concepts are represented geometrically in a model’s internal activations. Coursework in advanced deep learning and statistical analysis.',
  },
  {
    period: '2023 – 2024',
    title: 'Graduate Studies in Computer Science',
    org: 'University of Padua',
    orgHref: 'https://www.unipd.it/en/',
    summary:
      'Completed the first year of the M.Sc. program. Advanced coursework in artificial intelligence and deep learning, building strong theoretical foundations in deep learning architectures and algorithmic problem-solving.',
  },
  {
    period: '2018 – 2023',
    title: 'B.Sc. in Physics',
    org: 'Boğaziçi University',
    orgHref: 'https://boun.edu.tr/',
    summary:
      'was part of the EarthML research group, Science Club',
  },
]

export const resumeProjects: ResumeEntry[] = [
  {
    period: '',
    title: 'TÜBİTAK 2209-A',
    summary: 'Developed a high-precision earthquake detection model through interesting feature engineering methods.',
  },
  {
    period: '',
    title: 'Earth-ML',
    summary: 'Enhanced time series classification using advanced modeling techniques for geophysical data.',
  },
  {
    period: '',
    title: 'Kaggle ML Challenge',
    href: 'https://github.com/khdoex/Past_ML_codes/blob/main/isb5-gradient-ensemble.ipynb',
    summary: '8th place in Türkiye İş Bankası ML Challenge 5 through effective feature engineering.',
  },
  {
    period: '',
    title: 'Datathon AI',
    summary: '3rd place in computer vision competition.',
  },
  {
    period: '',
    title: 'NLP News Summarization',
    href: 'https://github.com/khdoex/nlp_news_sum',
    summary: 'Comparative evaluation of BART and T5 architectures for summarization tasks.',
  },
  {
    period: '',
    title: '"Burası" Art Exhibition',
    summary: 'Merged seismic data with artistic representation, fusing science and art.',
  },
]

export const skills: SkillGroup[] = [
  { label: 'programming', items: 'Python, SQL, JavaScript, TypeScript' },
  { label: 'ml / dl', items: 'PyTorch, XGBoost, CatBoost' },
  { label: 'ai / llm', items: 'LLM APIs (OpenAI, OpenRouter), LangChain, LangGraph, Transformers' },
  { label: 'interpretability', items: 'TransformerLens, nnsight, activation/ablation analysis' },
  { label: 'backend', items: 'FastAPI, Laravel, Django, Celery, Redis' },
  { label: 'scientific', items: 'NumPy, SciPy, Matplotlib, Pandas' },
  { label: 'hpc', items: 'Slurm, multi-GPU / distributed training' },
  { label: 'tools', items: 'Git, Docker, Linux' },
]

export const certifications: ResumeEntry[] = [
  { period: '', title: 'Quantum Computing (Bronze)', org: 'QTurkey', summary: '' },
  { period: '', title: 'Excellence in Audio', org: 'Hugging Face', summary: '' },
  { period: '', title: 'Process Mining', org: 'Celonis Academy', summary: '' },
  { period: '', title: 'Building RAG Agents', org: 'NVIDIA DLI', summary: '' },
]

export const languages = 'Turkish (native) · English (fluent)'

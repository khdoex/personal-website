# site copy

<!--
  Every word a visitor reads on kaanhho.com lives in this file. Edit the
  words, keep the shape:

    ## name        a section. Keep the names, the site looks them up by name.
    ### name       one entry inside a section (a job, a project, a thing you
                   are working on). The name after ### is its title.
    key: value     a short field on one line. Each section's note lists the
                   keys it understands; any other line is treated as text.
    - text         a list line.
    plain text     a paragraph. Leave an empty line between paragraphs.

  Inside any text you can write [a link](https://example.com), *italic* and
  **bold**. A link that starts with / stays on the site, like [blog](/blog).

  Lines inside these arrows are notes for you. The site never shows them.

  After editing, run `npm run content`, which checks the file and tells you
  the line of anything it cannot read. `npm run dev` and `npm run build` run
  it for you, and the dev server reloads the page when you save this file.

  Not in here, on purpose: the titles and descriptions search engines show
  (lib/seo.ts and the metadata at the top of each app/**/page.tsx), your
  name, email and profile links (lib/site.ts), and the blog posts (posts/).
-->


## hero

<!--
  The top of the home page, under your name.
  keys: role (the small line under the name), pdf (the text of the resume
  download link). The paragraph is the line under them.
-->

role: AI engineer · interpretability · Istanbul
pdf: download pdf

I am CTO of Synthetic Consumer Lab (SCL) and an MSc student in data science at Sabancı University, where my thesis studies how refusal is represented inside large language models.


## currently

<!--
  What you are working on now. Shows on the home page and on the about
  page. One ### per thing, the title is its name.
  section keys: label
  keys per thing: since, link (optional). The paragraph is the description.
-->

label: currently working on

### SCL (Synthetic Consumer Lab)
since: 2025
link: https://synthetic-consumers.com/

Building synthetic consumer systems for behavior simulation and market research.

### Refusal geometry in LLMs
since: 2025

MSc thesis at Sabancı University on how refusal behavior and safety-related representations are encoded inside large language models.


## writing-teaser

<!--
  The writing part of the home page. The latest posts show up under it on
  their own.
  keys: label, link (the text of the link to /blog)
-->

label: writing
link: all writing

Notes on interpretability and machine learning, with occasional personal essays. Posts are in English or Turkish.


## contact

<!--
  The last part of the home page. Your email and profiles come from
  lib/site.ts.
  keys: label
-->

label: contact

I am glad to hear from people working on interpretability, LLM safety, or synthetic consumer research.


## about

<!--
  The /about page. The paragraphs are the story next to the portrait. The
  currently list under it comes from the currently section above.
  keys: handles (the note at the very bottom)
-->

I studied physics at Boğaziçi University. Its research culture shaped how I work, and I am grateful to Haluk Beker, Alpar Sevgen, Arkadaş Özakın and many others there.

As an undergraduate I joined the EarthML research group, where Arkadaş Özakın taught us machine learning and deep learning and I worked on earthquake detection models and seismic data analysis. I then moved toward data science, with internships at Allianz and, as an AI engineer, at the startup Live The World.

I began a master's in computer science at the University of Padua and left after the first year of coursework, as the program was not a good fit for the research I wanted to do. I returned to Istanbul for a master's in data science at Sabancı University, where I work with Dilara Keküllüoğlu on refusal dynamics and poisoning attacks on LLMs.

My thesis continues this work with interpretability methods: I study what happens inside a model while it refuses a harmful request, and how that behavior is represented in its activations.

After returning to Istanbul I also worked with Berkan Cesur, who taught me much of what I know about product development. Over one year I gained experience in web development, app development and full product cycles.

I then joined SCL as an AI engineer and later became its CTO. I work with Ömer Ülgen, our CEO, and with Sinan Ülgen on customer relationships and B2B work.

handles: Online I am khdoex on GitHub and kaanhho on most other platforms (X, Hugging Face, LinkedIn).


## projects

<!--
  The /projects page. The first paragraph is the intro at the top. One ###
  per project, the title is its name, the paragraph its description.
  keys per project: status (current or earlier), source (a link to the
  code), demo (a link to try it), tags (comma separated)
-->

My current work is SCL and my thesis.

### SCL (Synthetic Consumer Lab)
status: current
tags: LLMs, Synthetic Consumers, Behavior Simulation, Market Research

Synthetic consumer systems for behavior simulation and market research. I joined as an AI engineer and later became CTO.

### Refusal geometry in LLMs
status: current
tags: Mechanistic Interpretability, Refusal Directions, LLM Safety

MSc thesis at Sabancı University on how refusal and harmfulness are represented in the internal geometry of LLMs. When a model refuses a harmful request, that refusal can be described as a direction in activation space, and jailbreaks work by moving the model away from it. I study what these attacks change in the model's representations. The code is not yet public.

### Neural Text Summarization: Comparative Analysis of Transformer Architectures
status: earlier
source: https://github.com/khdoex/nlp_news_sum
tags: Transformers, BART, T5, NLTK, Sentiment Analysis, ROUGE Evaluation

Comparative study of BART and T5 for automated news summarization, with sentiment-aware evaluation and ROUGE-based benchmarking.

### Multi-Label Classification System for Financial Recommendations
status: earlier
source: https://github.com/khdoex/Past_ML_codes/blob/main/isb5-gradient-ensemble.ipynb
tags: XGBoost, Multi-Label Classification, Feature Engineering, Financial Analytics, Kaggle

Multi-label recommendation system for İş Bankası, built with one-vs-all XGBoost, feature engineering, and ensembling.

### Machine Learning Algorithm Implementations
status: earlier
source: https://github.com/khdoex/Past_ML_codes
tags: XGBoost, Ensemble Methods, Feature Engineering, Data Science, Algorithm Implementation

A collection of practical machine learning implementations: boosting, ensemble techniques, and feature engineering workflows on real-world datasets.


## writing

<!-- The /blog page. The paragraph is the intro at the top. -->

Notes on interpretability and machine learning, with occasional personal essays.


## resume

<!--
  The top of the /resume page. The paragraph is the summary under the
  title. The sections after this one are the resume itself.
  keys: pdf (the download link text)
-->

pdf: download pdf

AI engineer and graduate student. My research is on refusal and safety in LLMs through interpretability, and at SCL I build AI systems for market research.


## resume-story

<!--
  The story at the top of the /resume page, before the full list: one ###
  per chapter, oldest first.
  keys: label (the small title over the story)
  keys per chapter: period (optional). The paragraphs are the chapter.
-->

label: background

### Boğaziçi University
period: 2018 – 2023

I studied physics. In the EarthML research group Arkadaş Özakın taught us machine learning and deep learning, and I worked on earthquake detection models and seismic data analysis. I also taught Numerical Methods, and turned seismic data into artwork for an exhibition. I then moved toward data science through internships at Allianz and Live The World.

### Approach

Physics left me with one habit: when a system works, I want to understand what is happening inside it. The question has stayed the same from physics to earthquakes to language models.

### University of Padua
period: 2023 – 2024

A master's in computer science. The program was not a good fit, and I left after completing the first year of coursework. A longer account is on the blog, in Turkish.

### Sabancı University
period: 2025 –

An MSc in data science in Istanbul. With Dilara Keküllüoğlu I started research on refusal dynamics and poisoning attacks on LLMs. My thesis extends this with interpretability methods: I study what happens inside a model while it refuses a harmful request. I am also a teaching assistant for Quantum Programming.

In Istanbul I also worked with Berkan Cesur, who taught me much of what I know about product development. Over one year I gained experience in web development, app development and full product cycles.

### Synthetic Consumer Lab
period: 2025 –

I joined SCL as an AI engineer and later became its CTO. I work with Ömer Ülgen, our CEO, and with Sinan Ülgen on customer relationships and B2B work. My thesis research continues alongside.


## resume-experience

<!--
  One ### per job, the title is the role, the paragraph the summary, the
  list lines the details behind "+ detail".
  keys per job: period, org, org-link, link (a link on the role itself)
-->

### CTO
period: 2025 –
org: Synthetic Consumer Lab
org-link: https://synthetic-consumers.com/

Responsible for the full product stack: backend, frontend, AI systems, and statistical methodology.

- Architected the platform on Laravel, Python/FastAPI, and Redis
- Built agentic systems for market research, and synthetic consumer personas grounded in real demographic and behavioral data
- Built agnus, an AI agent for market research

### Teaching Assistant
period: 2025 – 2026
org: Sabancı University
org-link: https://sabanciuniv.edu/

Teaching assistant for Quantum Programming, guiding students through quantum computing concepts, circuit design, and hands-on implementation with quantum programming frameworks.

### AI Engineer / Data Scientist
period: 2024 – 2025
org: SoundBoost
org-link: https://soundboost.ai/about

Designed and deployed deep learning models for audio source separation, classification, and acoustic event detection.

- Built end-to-end AI pipelines, with Django backends for model serving and JavaScript for real-time inference
- Led development of AI agents for complex audio processing workflows
- Built SoundBoost's free tools, including Loudness Penalty and a LUFS meter

### AI Engineer Intern
period: 2023
org: Live The World
org-link: https://livetheworld.com/

Built content generation pipelines using LLMs and web scraping.

- Improved the web scraping stack and developed Python tools for AI-driven applications

### Data Analytics & Process Mining Intern
period: 2022 – 2023
org: Allianz TR
org-link: https://www.allianz.com.tr/

Automated Excel reporting workflows with Python and SQL, built dashboards for operational visibility, and optimized business processes with Celonis process mining.

### Research Assistant
period: 2020 – 2022
org: Boğaziçi University
org-link: https://boun.edu.tr/
link: https://arxiv.org/abs/2407.18402

Worked on feature engineering and transformer-based architectures for seismic data analysis and earthquake detection.

- Contributed to the paper arXiv:2407.18402

### Teaching Assistant
period: 2021 – 2022
org: Boğaziçi University
org-link: https://boun.edu.tr/

Led problem sessions for Numerical Methods, teaching NumPy, SciPy, and Matplotlib through hands-on problem solving.


## resume-education

<!-- One ### per degree. keys: period, org, org-link -->

### M.Sc. in Data Science
period: 2025 –
org: Sabancı University
org-link: https://sabanciuniv.edu/

Thesis on the mechanistic interpretability of large language models: how refusal and related concepts are represented geometrically in a model's internal activations. Coursework in advanced deep learning and statistical analysis.

### Graduate Studies in Computer Science
period: 2023 – 2024
org: University of Padua
org-link: https://www.unipd.it/en/

Completed the first year of the M.Sc. program, with coursework in artificial intelligence, deep learning architectures, and algorithmic problem solving.

### B.Sc. in Physics
period: 2018 – 2023
org: Boğaziçi University
org-link: https://boun.edu.tr/

Member of the EarthML research group and the Science Club.


## resume-projects

<!-- One ### per project or award. keys: link -->

### TÜBİTAK 2209-A

Developed an earthquake detection model, with most of the work in feature engineering.

### Earth-ML

Time series classification for geophysical data.

### Kaggle ML Challenge
link: https://github.com/khdoex/Past_ML_codes/blob/main/isb5-gradient-ensemble.ipynb

8th place in the Türkiye İş Bankası ML Challenge 5, mainly through feature engineering.

### Datathon AI

3rd place in a computer vision competition.

### NLP News Summarization
link: https://github.com/khdoex/nlp_news_sum

Comparative evaluation of BART and T5 for summarization.

### "Burası" Art Exhibition

Turned seismic data into artwork for an exhibition.


## resume-skills

<!-- One list line per group, written as label: items -->

- programming: Python, SQL, JavaScript, TypeScript
- ml / dl: PyTorch, XGBoost, CatBoost
- ai / llm: LLM APIs (OpenAI, OpenRouter), LangChain, LangGraph, Transformers
- interpretability: TransformerLens, nnsight, activation/ablation analysis
- backend: FastAPI, Laravel, Django, Celery, Redis
- scientific: NumPy, SciPy, Matplotlib, Pandas
- hpc: Slurm, multi-GPU / distributed training
- tools: Git, Docker, Linux


## resume-certifications

<!-- One list line per certificate, written as title: issuer -->

- Quantum Computing (Bronze): QTurkey
- Excellence in Audio: Hugging Face
- Process Mining: Celonis Academy
- Building RAG Agents: NVIDIA DLI


## resume-languages

Turkish (native) · English (fluent)


## not-found

<!-- The page for a link that goes nowhere. keys: title -->

title: Page not found

This page does not exist or has moved.


## navigation

<!-- The bar at the top. keys: home (the name on the left), blog, projects, about, resume -->

home: Kaan Hacıhaliloğlu
blog: blog
projects: projects
about: about
resume: resume


## footer

<!-- The line at the bottom of every page, after the year. keys: line -->

line: Kaan Hacıhaliloğlu · Istanbul

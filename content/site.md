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


## intro

<!--
  The ride in. The first time someone opens the home page, the camera starts
  in deep space, flies through a tube to earth (the tube is the loading
  bar), then falls through the clouds into istanbul. These lines show under
  the progress counter, first to last, spread evenly over the ride. Keep
  them short, four or five is plenty.
  keys: skip (the skip button), replay (the button that plays it again)
-->

skip: skip the ride
replay: replay the ride

- leaving deep space
- through the tube (shorter than it looks)
- that blue one is earth
- down through the clouds, into istanbul


## hero

<!--
  The first screen after landing: istanbul at dusk, seen from the water.
  keys: greeting (the big line), name (the word in the greeting that gets
  the gold), location, time (label for the live istanbul clock), scroll
  (the hint at the bottom). The paragraph is the line under the greeting.
-->

greeting: hi, i am kaan.
name: kaan
location: istanbul
time: local time
scroll: scroll, we are still landing

physics grad turned ai engineer, working on refusal mechanics and safety in llms through interpretability. building SCL, a new way of doing market research.


## currently

<!--
  What you are working on now. Shows on the home page, next to the
  bosphorus bridge (pointing at one lights the bridge in its colour, in
  order: green, gold, blue) and on the about page. One ### per thing, the
  title is its name.
  section keys: label
  keys per thing: since, link (optional). The paragraph is the description.
-->

label: currently working on

### refusal geometry in llms
since: 2025

msc thesis at sabanci, on how refusal behavior and safety representations are encoded inside large language models

### SCL, synthetic consumer lab
since: 2024
link: https://synthetic-consumers.com/

ai engineer building synthetic consumer systems for behavior simulation and market research workflows

### soundboost
since: 2024
link: https://soundboost.ai/about

ai engineer on an audio mastering platform, a virtual mastering engineer for musicians


## about-teaser

<!--
  The "more about me" part of the home page.
  keys: label, link (the text of the link to /about). The paragraph is the
  short version; the list lines are the small facts table, written as
  label: value.
-->

label: more about me
link: the longer story

physics first, at boğaziçi. then a detour through padova that did not work out, then sabancı and a startup. days are product, nights are model internals, the two feed each other more than i expected.

- studied: physics, boğaziçi university
- now: msc data science, sabancı university
- based in: istanbul
- online: kaanhho, and khdoex on github


## resume-teaser

<!--
  The resume part of the home page. The three most recent jobs show up
  under it on their own, taken from resume-experience below.
  keys: label, link (the text of the link to /resume), pdf (the download)
-->

label: resume
link: the full resume
pdf: download pdf

where i have been so far, most recent first. the pdf is the same thing, in a shape recruiters like.


## writing-teaser

<!--
  The writing part of the home page. The latest posts show up under it on
  their own.
  keys: label, link (the text of the link to /blog)
-->

label: writing
link: all writing

notes on interpretability, machine learning, and the occasional detour through life. some in english, some in turkish.


## contact

<!--
  The last part of the home page, where the sun comes up over the asian side.
  Your email and profiles come from lib/site.ts.
  keys: label, email (the text on the email button)
-->

label: say hi
email: write me

if you work on interpretability, or on synthetic consumers, or you just liked the view, write me. i read everything, i answer most of it.


## about

<!--
  The /about page. The paragraphs are the story next to the portrait. The
  currently list under it comes from the currently section above.
  keys: handles (the note at the very bottom)
-->

i studied physics, and it left me one habit i cannot turn off: asking what is actually happening underneath. most of ai today runs on models nobody can fully open up and read. that is either scary or interesting, i picked interesting.

after physics i tried a computer science master's in padova. it did not work out, and i wrote about why on the blog, in turkish. the short version: i could not feel myself getting better, so i stopped. it was the right call, i still think about it though.

now my thesis at sabanci is on the refusal direction in llms. when a model says "i can't help with that", something specific happens inside, and it can be shown as a direction in activation space. i am mapping how jailbreaks move the model off that direction, and what that means for defense (or attack).

at SCL i build an ai based market research engine: synthetic consumers that behave like real ones, which is a strange sentence to write. days are product, nights are model internals. the two feed each other more than i expected, we will see where it goes.

handles: online i am khdoex on github, and kaanhho most other places (x, huggingface, linkedin). same person, i just could not keep one handle straight. the name is kaan hacıhaliloğlu in turkish, hacihaliloglu when the keyboard does not cooperate.


## projects

<!--
  The /projects page. The first paragraph is the intro at the top. One ###
  per project, the title is its name, the paragraph its description.
  keys per project: status (current or earlier), source (a link to the
  code), demo (a link to try it), tags (comma separated)
-->

mostly the thesis these days: where refusal lives inside llms. the older ml projects moved down to earlier work, they had their time.

### refusal geometry in llms
status: current
tags: Mechanistic Interpretability, Refusal Directions, LLM Safety

msc thesis at sabanci: how refusal and harmfulness live in the internal geometry of llms. ask a model something harmful and it refuses, that refusal can be shown as a direction in activation space, and jailbreaks work by pushing the model off it. i am mapping what those attacks actually do to the representations, no public repo yet, we will see where it goes.

### Neural Text Summarization: Comparative Analysis of Transformer Architectures
status: earlier
source: https://github.com/khdoex/nlp_news_sum
tags: Transformers, BART, T5, NLTK, Sentiment Analysis, ROUGE Evaluation

Comparative study of BART and T5 architectures for automated news summarization, including sentiment-aware evaluation and ROUGE-based benchmarking.

### Multi-Label Classification System for Financial Recommendations
status: earlier
source: https://github.com/khdoex/Past_ML_codes/blob/main/isb5-gradient-ensemble.ipynb
tags: XGBoost, Multi-Label Classification, Feature Engineering, Financial Analytics, Kaggle

Built a multi-label recommendation system for Isbank using one-vs-all XGBoost with feature engineering and ensemble strategies for improved predictive performance.

### Machine Learning Algorithm Implementations
status: earlier
source: https://github.com/khdoex/Past_ML_codes
tags: XGBoost, Ensemble Methods, Feature Engineering, Data Science, Algorithm Implementation

Collection of practical machine learning implementations, including boosting, ensemble techniques, and feature engineering workflows applied to real-world datasets.


## writing

<!-- The /blog page. The paragraph is the intro at the top. -->

notes on interpretability, machine learning, and the occasional detour through life.


## resume

<!--
  The top of the /resume page. The paragraph is the summary under the
  title. The sections after this one are the resume itself.
  keys: pdf (the download link text)
-->

pdf: download pdf

AI engineer and grad student working on refusal mechanics and safety in llm through interpretability and SCL a new way of doing market research.


## resume-experience

<!--
  One ### per job, the title is the role, the paragraph the summary, the
  list lines the details behind "+ detail".
  keys per job: period, org, org-link, link (a link on the role itself),
  scene (what the 3D world shows while this entry is being read: istanbul,
  padova, physics or interpretability; istanbul if you leave it out)
-->

### AI Engineer
period: 2025 –
org: Synthetic Consumer Lab
org-link: https://synthetic-consumers.com/
scene: istanbul

Engineering lead responsible for the full product stack: backend, frontend, AI systems, and statistical methodology.

- Architected the platform on a Laravel, Python/FastAPI, and Redis stack
- Built agentic systems and solutions for market research, synthetic consumer persona systems grounded in real demographic and behavioral data
- agnus, the agent of the market research

### Teaching Assistant
period: 2025 –
org: Sabancı University
org-link: https://sabanciuniv.edu/
scene: interpretability

Teaching assistant for the Quantum Programming course, guiding students through quantum computing concepts, circuit design, and practical implementations using quantum programming frameworks.

### AI Engineer / Data Scientist
period: 2024 – 2025
org: SoundBoost
org-link: https://soundboost.ai/about
scene: istanbul

Designed and deployed deep learning models for audio source separation, classification, and acoustic event detection.

- End-to-end AI pipelines with Django backends for model serving and JavaScript for real-time inference
- Led development of AI agents for complex audio processing workflows
- Created free tools on SoundBoost like Loudness Penalty, LUFS meter, etc.

### AI Engineer Intern
period: 2023
org: Live The World
org-link: https://livetheworld.com/
scene: istanbul

Engineered content generation pipelines using llms and web scraping.

- Enhanced web scraping capabilities and developed Python solutions for AI-driven applications

### Data Analytics & Process Mining Intern
period: 2022 – 2023
org: Allianz TR
org-link: https://www.allianz.com.tr/
scene: istanbul

Automated Excel reporting workflows using Python and SQL. Built dynamic dashboards for operational visibility and optimized business processes using Celonis process mining.

### Research Assistant
period: 2020 – 2022
org: Boğaziçi University
org-link: https://boun.edu.tr/
link: https://arxiv.org/abs/2407.18402
scene: physics

Worked on feature engineering and transformer-based architectures for seismic data analysis and earthquake detection.

- Contributed to published research (arXiv:2407.18402)

### Teaching Assistant
period: 2021 – 2022
org: Boğaziçi University
org-link: https://boun.edu.tr/
scene: physics

Led QA sessions for Numerical Methods, teaching practical applications of NumPy, SciPy, and Matplotlib through hands-on problem solving.


## resume-education

<!-- One ### per degree. keys: period, org, org-link, scene -->

### M.Sc. in Data Science
period: 2025 –
org: Sabancı University
org-link: https://sabanciuniv.edu/
scene: interpretability

Thesis research on mechanistic interpretability of large language models, studying how refusal and related concepts are represented geometrically in a model’s internal activations. Coursework in advanced deep learning and statistical analysis.

### Graduate Studies in Computer Science
period: 2023 – 2024
org: University of Padua
org-link: https://www.unipd.it/en/
scene: padova

Completed the first year of the M.Sc. program. Advanced coursework in artificial intelligence and deep learning, building strong theoretical foundations in deep learning architectures and algorithmic problem-solving.

### B.Sc. in Physics
period: 2018 – 2023
org: Boğaziçi University
org-link: https://boun.edu.tr/
scene: physics

was part of the EarthML research group, Science Club


## resume-projects

<!-- One ### per project or award. keys: link, scene -->

### TÜBİTAK 2209-A
scene: physics

Developed a high-precision earthquake detection model through interesting feature engineering methods.

### Earth-ML
scene: physics

Enhanced time series classification using advanced modeling techniques for geophysical data.

### Kaggle ML Challenge
link: https://github.com/khdoex/Past_ML_codes/blob/main/isb5-gradient-ensemble.ipynb
scene: istanbul

8th place in Türkiye İş Bankası ML Challenge 5 through effective feature engineering.

### Datathon AI
scene: istanbul

3rd place in computer vision competition.

### NLP News Summarization
link: https://github.com/khdoex/nlp_news_sum
scene: interpretability

Comparative evaluation of BART and T5 architectures for summarization tasks.

### "Burası" Art Exhibition
scene: physics

Merged seismic data with artistic representation, fusing science and art.


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


## tr

<!--
  The turkish landing page, /tr. The paragraphs are the story, the list
  lines are the "kısaca" table (label: value).
  keys: name (the big title), tagline, facts (the label over the table),
  blog, projects, resume, email, english (the link texts at the bottom)
-->

name: kaan hacıhaliloğlu
tagline: yapay zeka mühendisi · yorumlanabilirlik · istanbul
facts: kısaca
blog: yazılar
projects: projeler
resume: cv
email: e-posta
english: english

fizik okudum, bana kapatamadığım bir alışkanlık bıraktı: altta gerçekte ne oluyor diye sormak. bugün yapay zekanın çoğu, kimsenin tam olarak açıp okuyamadığı modellerin üstünde çalışıyor. bu ya korkutucu ya da ilginç, ben ilginç olanı seçtim.

şu an sabancı üniversitesi'nde veri bilimi yüksek lisansı yapıyorum, tezim büyük dil modellerinde (llm) reddetme yönü üzerine. bir model "bu konuda yardımcı olamam" dediğinde içeride belirli bir şey oluyor ve bu, aktivasyon uzayında bir yön olarak gösterilebiliyor. jailbreak'lerin modeli bu yönden nasıl uzaklaştırdığını ve bunun savunma (ya da saldırı) için ne anlama geldiğini haritalıyorum.

SCL'de (synthetic consumer lab) yapay zeka mühendisiyim: yapay zeka tabanlı bir pazar araştırması motoru kuruyorum, gerçek tüketiciler gibi davranan sentetik tüketiciler. yazması bile garip bir cümle. backend, frontend, ajanlar, istatistik, hepsi bende. SoundBoost'ta da derin öğrenmeyle çalışan bir ses mastering platformunun yapay zeka tarafındayım.

lisansı boğaziçi'nde fizikte bitirdim, EarthML grubunda transformer modelleriyle deprem tespiti üzerine çalıştık. arada padova'da bilgisayar bilimleri yüksek lisansına başladım, olmadı. neden olmadığını [blogda yazdım](/blog/master).

- şu an: yapay zeka mühendisi, SCL (synthetic consumer lab) ve SoundBoost
- araştırma: mekanistik yorumlanabilirlik, llm güvenliği, reddetme yönü
- eğitim: sabancı üniversitesi (veri bilimi yl), boğaziçi üniversitesi (fizik lisans)
- araçlar: python, pytorch, transformerlens, nnsight, fastapi, laravel, typescript
- diller: türkçe (ana dil), ingilizce
- kullanıcı adı: kaanhho (x, hugging face, linkedin), khdoex (github)


## not-found

<!-- The page for a link that goes nowhere. keys: title -->

title: nothing here

this page does not exist, or it did once and does not any more.


## world

<!--
  The small labels the 3D world pins beside things: the captions in the
  scenes the resume flies up into, above the city. prompt is what the
  transformer in the interpretability scene reads, one word per token
  (three to eight words), and answer is what it says back.
  keys: saturn, black-hole, transformer, refusal, harmful, harmless,
  prompt, answer
-->

saturn: saturn, where the physics started
black-hole: a black hole, bending the light behind it
transformer: a transformer, read one layer at a time
refusal: the refusal direction
harmful: harmful prompts
harmless: harmless prompts
prompt: how do i pick a lock
answer: i can't help with that


## navigation

<!-- The bar at the top. keys: home (the name on the left), blog, projects, about, resume -->

home: kaan h.
blog: blog
projects: projects
about: about
resume: resume


## footer

<!-- The line at the bottom of every page, after the year. keys: line -->

line: kaan hacihaliloglu · istanbul

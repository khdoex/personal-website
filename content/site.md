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
- we need to get closer
- down through the clouds, to see where i am


## hero

<!--
  The first screen after landing: istanbul at dusk, seen from the water.
  keys: greeting (the big line), name (the word in the greeting set in
  italic), location, time (label for the live istanbul clock), scroll
  (the hint at the bottom). The paragraph is the line under the greeting.
-->

greeting: welcome to my personal website, i am kaan.
name: kaan
location: istanbul
time: local time
scroll: keep scrolling

currently i am tech lead at SCL, writing my thesis, and doing research on the interpretability and safety of large language models.


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

msc thesis at sabancı university, on how refusal behavior and safety representations are encoded inside large language models.

### SCL, synthetic consumer lab
since: 2024
link: https://synthetic-consumers.com/

building synthetic consumer systems for behavior simulation and market research workflows, with a great team.

### soundboost
since: 2024
link: https://soundboost.ai/about

ai engineer on an audio mastering platform, a virtual mastering engineer for musicians. worked on the free tools and the stem splitter, with cool people.


## about-teaser

<!--
  The "more about me" part of the home page.
  keys: label, link (the text of the link to /about). The paragraph is the
  short version; the list lines are the small facts table, written as
  label: value.
-->

label: more about me
link: the longer story

studied physics at boğaziçi, met machine learning and deep learning in the EarthML research group, and decided to go further into data science and computer science. started a cs master's in padova but that program was not for me, then came data science at sabancı, together with startups. weekdays go to product, nights to the internals of llms.

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

notes on interpretability, machine learning, and the occasional detour through life. some in english, some in turkish. hopefully i will write more soon.


## contact

<!--
  The last part of the home page, where the sun comes up over the asian side.
  Your email and profiles come from lib/site.ts. The same email is what the
  little plane tows across the sky every two minutes someone spends on the
  site.
  keys: label, email (the text on the email button)
-->

label: say hi
email: tell me anything

if you work on interpretability, or synthetic consumers, or just vibes, write me. i am online most of the time.


## about

<!--
  The /about page. The paragraphs are the story next to the portrait. The
  currently list under it comes from the currently section above.
  keys: handles (the note at the very bottom)
-->

studied physics in undergrad, loved the research and the inspiration from my profs at boğaziçi. one of the best decisions i made in my life was studying physics at boun. thanks to Haluk Beker, Alpar Sevgen, Arkadaş Özakın and many more.

while i was studying, Arkadaş hoca taught us machine learning and deep learning in the EarthML research group, where i worked on earthquake detection models and extensive data analysis. i decided to continue down the data science path and did internships at Allianz, and at Live The World, a startup, as an ai engineer.

i started a master's in cs at Padova but didn't quite like the program, or let's say i didn't fit in. after my first year of coursework i didn't want to do any research there, maybe i couldn't meet the right people at that time. i came back to istanbul, to Sabancı for a data science master's, and started working with Dilara Keküllüoğlu. thanks to her i had my research spark again, with refusal dynamics and poisoning attacks on LLMs.

now i am working in a research group on refusal dynamics, and my thesis is on the same topic with more interpretability candies on top. what this means: i look at what's happening while a model refuses a harmful request and try to make sense of the math inside the model. it kind of feels like physics inside an llm architecture, but this is not a definition at all, just me reassuring myself.

i met Berkan Cesur when i came back to istanbul and he taught me a lot about product development. can't lie, amazing person and insane inspiration. in one year with him i got experience in web development, app development, product cycles and a lot more.

then i started at SCL as an ai engineer. with time i took on more responsibility, so i could say i am a bit more than that now. Ömer Ülgen, our ceo, is one of the sharpest people i have worked with, and from Sinan Ülgen i am learning a lot about customer relationships and working B2B.

handles: online i am khdoex on github, and kaanhho most other places (x, hugging face, linkedin).


## projects

<!--
  The /projects page. The first paragraph is the intro at the top. One ###
  per project, the title is its name, the paragraph its description.
  keys per project: status (current or earlier), source (a link to the
  code), demo (a link to try it), tags (comma separated)
-->

mostly the thesis these days:

### refusal geometry in llms
status: current
tags: Mechanistic Interpretability, Refusal Directions, LLM Safety

msc thesis at sabancı: how refusal and harmfulness live in the internal geometry of llms. ask a model something harmful and it refuses. that refusal can be shown as a direction in activation space, and jailbreaks work by pushing the model off it. i am mapping what those attacks actually do to the representations. no public repo yet, we will see where it goes.

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

notes on interpretability, machine learning, and the occasional detour through life.


## resume

<!--
  The top of the /resume page. The paragraph is the summary under the
  title. The sections after this one are the resume itself.
  keys: pdf (the download link text)
-->

pdf: download pdf

ai engineer and grad student. i work on refusal and safety in llms through interpretability, and at SCL on a new way of doing market research.


## resume-story

<!--
  The story at the top of the /resume page, before the full list: one ###
  per chapter, oldest first. The 3D world travels with it, one place per
  chapter, and stays on the last one while the list is read.
  keys: label (the small title over the story)
  keys per chapter: period (optional), scene (what the world shows while the
  chapter is read: bogazici, physics, padova, interpretability or levent).
  The paragraphs are the chapter.
-->

label: the story so far

### boğaziçi
period: 2018 – 2023
scene: bogazici

physics, on a hill over the bosphorus. loved the research and the inspiration from my profs, one of the best decisions i made in my life. in the EarthML research group Arkadaş hoca taught us machine learning and deep learning, and i worked on earthquake detection models and extensive data analysis. i also taught numerical methods, and once we even turned seismic data into an art exhibition. then i continued down the data science path, with internships at Allianz and Live The World.

### the habit
scene: physics

physics left me one habit: when something works, i want to know what is actually happening inside it. first it was physics, then earthquakes, now language models. same question.

### padova
period: 2023 – 2024
scene: padova

a computer science master's in padova. i didn't quite like the program, or let's say i didn't fit in. after the first year of coursework i didn't want to do any research there, maybe i couldn't meet the right people at that time. the long version is on the blog, in turkish.

### sabancı
period: 2025 –
scene: interpretability

back in istanbul, a data science msc at sabancı. working with Dilara Keküllüoğlu, i had my research spark again, with refusal dynamics and poisoning attacks on llms. my thesis is on the same topic with more interpretability candies on top: i look at what's happening while a model refuses a harmful request and try to make sense of the math inside it. i am also a ta for quantum programming on the side.

back in istanbul i also met Berkan Cesur, who taught me a lot about product development. can't lie, amazing person and insane inspiration. in one year with him i got experience in web development, app development, product cycles and a lot more.

### now
period: 2025 –
scene: levent

days are SCL. i started as an ai engineer, and with time i took on more responsibility, so i could say i am a bit more than that now. Ömer Ülgen, our ceo, is one of the sharpest people i have worked with, and from Sinan Ülgen i am learning a lot about customer relationships and working B2B. nights are still the thesis.


## resume-experience

<!--
  One ### per job, the title is the role, the paragraph the summary, the
  list lines the details behind "+ detail".
  keys per job: period, org, org-link, link (a link on the role itself)
-->

### AI Engineer
period: 2025 –
org: Synthetic Consumer Lab
org-link: https://synthetic-consumers.com/

Engineering lead responsible for the full product stack: backend, frontend, AI systems, and statistical methodology.

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

title: nothing here

this page does not exist, or it did once and does not anymore.


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

line: kaan hacıhaliloğlu · istanbul

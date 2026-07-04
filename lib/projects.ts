export interface Project {
  title: string;
  description: string;
  status: 'current' | 'earlier';
  githubUrl?: string;
  tags: string[];
  demoUrl?: string;
}

export const projects: Project[] = [
  {
    title: "refusal geometry in llms",
    description: "msc thesis at sabanci: how refusal and harmfulness live in the internal geometry of llms. ask a model something harmful and it refuses, that refusal can be shown as a direction in activation space, and jailbreaks work by pushing the model off it. i am mapping what those attacks actually do to the representations, no public repo yet, we will see where it goes.",
    status: "current",
    tags: ["Mechanistic Interpretability", "Refusal Directions", "LLM Safety"],
  },
  {
    title: "Neural Text Summarization: Comparative Analysis of Transformer Architectures",
    description: "Comparative study of BART and T5 architectures for automated news summarization, including sentiment-aware evaluation and ROUGE-based benchmarking.",
    status: "earlier",
    githubUrl: "https://github.com/khdoex/nlp_news_sum",
    tags: ["Transformers", "BART", "T5", "NLTK", "Sentiment Analysis", "ROUGE Evaluation"],
  },
  {
    title: "Multi-Label Classification System for Financial Recommendations",
    description: "Built a multi-label recommendation system for Isbank using one-vs-all XGBoost with feature engineering and ensemble strategies for improved predictive performance.",
    status: "earlier",
    githubUrl: "https://github.com/khdoex/Past_ML_codes/blob/main/isb5-gradient-ensemble.ipynb",
    tags: ["XGBoost", "Multi-Label Classification", "Feature Engineering", "Financial Analytics", "Kaggle"],
  },
  {
    title: "Machine Learning Algorithm Implementations",
    description: "Collection of practical machine learning implementations, including boosting, ensemble techniques, and feature engineering workflows applied to real-world datasets.",
    status: "earlier",
    githubUrl: "https://github.com/khdoex/Past_ML_codes",
    tags: ["XGBoost", "Ensemble Methods", "Feature Engineering", "Data Science", "Algorithm Implementation"],
  },
]; 
export interface Project {
  title: string;
  description: string;
  githubUrl: string;
  tags: string[];
  demoUrl?: string;
}

export const projects: Project[] = [
  {
    title: "Neural Text Summarization: Comparative Analysis of Transformer Architectures",
    description: "Comparative study of BART and T5 architectures for automated news summarization, including sentiment-aware evaluation and ROUGE-based benchmarking.",
    githubUrl: "https://github.com/khdoex/nlp_news_sum",
    tags: ["Transformers", "BART", "T5", "NLTK", "Sentiment Analysis", "ROUGE Evaluation"],
  },
  {
    title: "Multi-Label Classification System for Financial Recommendations",
    description: "Built a multi-label recommendation system for Isbank using one-vs-all XGBoost with feature engineering and ensemble strategies for improved predictive performance.",
    githubUrl: "https://github.com/khdoex/Past_ML_codes/blob/main/isb5-gradient-ensemble.ipynb",
    tags: ["XGBoost", "Multi-Label Classification", "Feature Engineering", "Financial Analytics", "Kaggle"],
  },
  {
    title: "Machine Learning Algorithm Implementations",
    description: "Collection of practical machine learning implementations, including boosting, ensemble techniques, and feature engineering workflows applied to real-world datasets.",
    githubUrl: "https://github.com/khdoex/Past_ML_codes",
    tags: ["XGBoost", "Ensemble Methods", "Feature Engineering", "Data Science", "Algorithm Implementation"],
  },
]; 
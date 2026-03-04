export interface Project {
  title: string;
  description: string;
  githubUrl: string;
  tags: string[];
  image?: string; // Optional screenshot/preview
  demoUrl?: string; // Optional live demo link
}

export const projects: Project[] = [
  {
    title: "Neural Text Summarization: Comparative Analysis of Transformer Architectures",
    description: "A comprehensive research project analyzing the effectiveness of BART and T5 transformer models for automated news summarization. Implemented sentiment analysis pipelines to evaluate summary quality across different emotional contexts and content types. Achieved significant improvements in ROUGE scores through model ensemble techniques.",
    githubUrl: "https://github.com/khdoex/nlp_news_sum",
    tags: ["Transformers", "BART", "T5", "NLTK", "Sentiment Analysis", "ROUGE Evaluation"],
  },
  {
    title: "Multi-Label Classification System for Financial Recommendations",
    description: "Developed a sophisticated recommendation engine for Isbank using one-vs-all XGBoost methodology for multi-label classification. Implemented advanced feature engineering techniques and ensemble methods to optimize prediction accuracy. Successfully deployed solution achieving top performance in competitive data science challenge.",
    githubUrl: "https://github.com/khdoex/Past_ML_codes/blob/main/isb5-gradient-ensemble.ipynb",
    tags: ["XGBoost", "Multi-Label Classification", "Feature Engineering", "Financial Analytics", "Kaggle"],
  },
  {
    title: "Machine Learning Algorithm Implementations",
    description: "Comprehensive collection of machine learning implementations including gradient boosting techniques, ensemble methods, and advanced feature engineering approaches. Repository showcases practical applications of various ML algorithms on real-world datasets with detailed performance analysis and optimization strategies.",
    githubUrl: "https://github.com/khdoex/Past_ML_codes",
    tags: ["XGBoost", "Ensemble Methods", "Feature Engineering", "Data Science", "Algorithm Implementation"],
  },
]; 
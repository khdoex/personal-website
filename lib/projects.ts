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
  {
    title: "Personal Portfolio & Research Platform",
    description: "Modern, responsive personal website built with Next.js and TypeScript, featuring a dynamic blog system, project showcase, and interactive media gallery. Implements advanced UI/UX principles with theme switching, animated components, and optimized performance. Serves as a platform for sharing research insights and professional work.",
    githubUrl: "https://github.com/khdoex/personal-website",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "React", "UI/UX Design", "Performance Optimization"],
  },
  {
    title: "SoundBoost.ai: AI-Powered Audio Enhancement Platform",
    description: "Advanced audio processing platform leveraging machine learning for intelligent sound enhancement and music visualization. Integrates multiple AI models for real-time audio analysis, quality improvement, and generative visual content creation. Currently in development with focus on professional audio applications.",
    githubUrl: "https://github.com/khdoex/soundboost-ai",
    tags: ["Audio AI", "Machine Learning", "Signal Processing", "Generative AI", "Real-time Processing"],
  }
]; 
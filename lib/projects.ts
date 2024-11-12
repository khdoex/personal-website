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
    title: "NLP- Summarization of News with Different Architectures",
    description: "A study on the effectiveness of different NLP architectures in summarizing news articles and their differences in terms of the sentiment analysis",
    githubUrl: "https://github.com/khdoex/nlp_news_sum",
    tags: ["Transformers", "BART", "T5", "NLTK"],
    },
    {
        title: "Isbankasi recommendation system solution- multilabel classification with one-vs-all xgboost",
        description: "A solution for the recommendation system problem at Isbank using one-vs-all xgboost for multilabel classification",
        githubUrl: "https://github.com/khdoex/Past_ML_codes/blob/main/isb5-gradient-ensemble.ipynb",
        tags: ["Xgboost", "Kaggle", "Gradient Boosting"],
    },
    {
        title: "other ML codes",
        description: "other ML codes that I have written in the past",
        githubUrl: "https://github.com/khdoex/Past_ML_codes",
        tags: ["Xgboost", "Kaggle", "Gradient Boosting"],
    },
    {
    title: "Personal Website",
    description: "My personal website built with Next.js, TypeScript, and Tailwind CSS. Features a blog, project showcase, and dynamic theming.",
    githubUrl: "https://github.com/khdoex/personal-website",
    tags: ["Next.js", "TypeScript", "Tailwind"],
  },
  
]; 
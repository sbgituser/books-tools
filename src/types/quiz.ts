export interface QuizOption {
  id: string;
  label: string;
  icon: string;
  description?: string;
  scores: Record<string, number>;
}

export interface QuizQuestion {
  id: string;
  question: string;
  description?: string;
  options: QuizOption[];
}

export interface QuizResultType {
  id: string;
  title: string;
  description: string;
  icon: string;
  accentColor: string;
  primaryTags: string[];
  recommendedMoods: string[];
  recommendedScenes: string[];
  recommendedWorks: Array<{
    title: string;
    author: string;
    reason: string;
    workId?: string;
    amazonKeyword?: string;
  }>;
  shareText: string;
}

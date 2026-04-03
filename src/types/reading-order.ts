export type ReadingOrderType = "publication" | "chronological" | "recommended";

export interface SeriesBook {
  order: number;
  title: string;
  author: string;
  publishedYear?: number;
  chronologicalOrder?: number;
  isEssential: boolean;
  note?: string;
  workId?: string;
  amazonKeyword?: string;
}

export interface ReadingOrderSeries {
  id: string;
  seriesName: string;
  author: string;
  authorReading?: string;
  description: string;
  genre: "novel" | "manga" | "lightnovel";
  totalBooks: number;
  status: "completed" | "ongoing";
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedReadingHours?: number;
  tags: string[];
  books: SeriesBook[];
  recommendedStartBook?: string;
  relatedSeriesIds?: string[];
  lastUpdated: string;
}

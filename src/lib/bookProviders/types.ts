export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  tags: string[];
  isKindle: boolean;
  kindlePrice: number | null;
  paperbackPrice: number | null;
  amazonUrl: string;
  description: string;
  publishedYear: number;
  rating?: number;
  reviewCount?: number;
}

export interface SimilarityResult {
  book: Book;
  score: number;
  reasons: string[];
}

export interface BookProvider {
  search(query: string): Promise<SimilarityResult[]>;
  getById(id: string): Promise<Book | null>;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn13?: string;
  googleBooksId?: string;
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
  thumbnailUrl?: string;
  pageCount?: number;
  estimatedReadingHours?: number;
  l2Category?: string;
  l3Category?: string;
  l4Category?: string;
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

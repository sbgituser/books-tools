import type { Book, BookProvider, SimilarityResult } from "./types";
import { findSimilarBooks } from "../similarity";
import booksData from "@/data/books.json";

const books = booksData as Book[];

export const mockProvider: BookProvider = {
  async search(query: string): Promise<SimilarityResult[]> {
    return findSimilarBooks(query, books);
  },

  async getById(id: string): Promise<Book | null> {
    return books.find((b) => b.id === id) ?? null;
  },
};

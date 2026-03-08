/**
 * Amazon Product Advertising API v5 provider (stub)
 *
 * To activate:
 * 1. Apply for Amazon Associates and PA-API access
 * 2. Set env vars: AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_PARTNER_TAG
 * 3. Implement searchItems() and getItems() using the PA-API SDK
 * 4. Swap mockProvider -> amazonProvider in similar-books/page.tsx
 *
 * Docs: https://webservices.amazon.co.jp/paapi5/documentation/
 */

import type { Book, BookProvider, SimilarityResult } from "./types";

export const amazonProvider: BookProvider = {
  async search(_query: string): Promise<SimilarityResult[]> {
    throw new Error(
      "Amazon PA-API provider is not yet implemented. Use mockProvider."
    );
  },

  async getById(_id: string): Promise<Book | null> {
    throw new Error(
      "Amazon PA-API provider is not yet implemented. Use mockProvider."
    );
  },
};

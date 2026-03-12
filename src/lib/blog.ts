import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type BlogMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  tags: string[];
  draft: boolean;
  coverImage?: string;
  readingMinutes: number;
  readingText: string;
};

export type BlogPost = BlogMeta & {
  content: string;
  toc: TocItem[];
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const BLOG_EXTENSIONS = [".md", ".mdx"];

function ensureBlogDir() {
  if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });
}

function isMarkdownFile(fileName: string): boolean {
  return BLOG_EXTENSIONS.some((ext) => fileName.endsWith(ext));
}

function toSlug(fileName: string): string {
  return fileName.replace(/\.mdx?$/, "");
}

function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractToc(content: string): TocItem[] {
  const lines = content.split("\n");
  const toc: TocItem[] = [];

  for (const line of lines) {
    const m = line.match(/^(#{2,3})\s+(.+)$/);
    if (!m) continue;

    const level = m[1].length as 2 | 3;
    const raw = m[2]
      .replace(/\s+#+\s*$/, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .trim();

    if (!raw) continue;
    toc.push({
      id: slugifyHeading(raw),
      text: raw,
      level,
    });
  }

  return toc;
}

function parseMeta(fileName: string, raw: string): BlogMeta {
  const { data } = matter(raw);
  const slug = String(data.slug ?? toSlug(fileName));
  const content = matter(raw).content;
  const rt = readingTime(content);

  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: String(data.date ?? "1970-01-01"),
    updated: data.updated ? String(data.updated) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    draft: Boolean(data.draft ?? false),
    coverImage: data.coverImage ? String(data.coverImage) : undefined,
    readingMinutes: Math.max(1, Math.round(rt.minutes)),
    readingText: `${Math.max(1, Math.round(rt.minutes))}分`,
  };
}

function getSorted(items: BlogMeta[]): BlogMeta[] {
  return items.sort((a, b) => {
    const ad = new Date(a.updated ?? a.date).getTime();
    const bd = new Date(b.updated ?? b.date).getTime();
    return bd - ad;
  });
}

export function getAllBlogMeta(options?: { includeDraft?: boolean }): BlogMeta[] {
  const includeDraft = options?.includeDraft ?? false;
  ensureBlogDir();
  const files = fs.readdirSync(BLOG_DIR).filter(isMarkdownFile);

  const items = files.map((fileName) => {
    const fullPath = path.join(BLOG_DIR, fileName);
    const raw = fs.readFileSync(fullPath, "utf-8");
    return parseMeta(fileName, raw);
  });

  const visible = includeDraft ? items : items.filter((item) => !item.draft);
  return getSorted(visible);
}

export function getAllBlogSlugs(options?: { includeDraft?: boolean }): string[] {
  return getAllBlogMeta(options).map((p) => p.slug);
}

export async function getBlogPostBySlug(slug: string, options?: { includeDraft?: boolean }): Promise<BlogPost | null> {
  const includeDraft = options?.includeDraft ?? false;
  ensureBlogDir();
  const files = fs.readdirSync(BLOG_DIR).filter(isMarkdownFile);
  let fileName: string | null = null;
  let raw: string | null = null;

  for (const candidateFileName of files) {
    const fullPath = path.join(BLOG_DIR, candidateFileName);
    const candidateRaw = fs.readFileSync(fullPath, "utf-8");
    const candidateMeta = parseMeta(candidateFileName, candidateRaw);

    if (candidateMeta.slug === slug || toSlug(candidateFileName) === slug) {
      fileName = candidateFileName;
      raw = candidateRaw;
      break;
    }
  }

  if (!fileName || !raw) return null;

  const parsed = matter(raw);
  const meta = parseMeta(fileName, raw);
  if (!includeDraft && meta.draft) return null;

  const toc = extractToc(parsed.content);

  return { ...meta, content: parsed.content, toc };
}

export function getAdjacentPosts(slug: string): {
  prev: BlogMeta | null;
  next: BlogMeta | null;
} {
  const posts = getAllBlogMeta();
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx < 0) {
    return { prev: null, next: null };
  }

  return {
    prev: idx > 0 ? posts[idx - 1] : null,
    next: idx < posts.length - 1 ? posts[idx + 1] : null,
  };
}

export function getRelatedPosts(slug: string, limit = 3): BlogMeta[] {
  const posts = getAllBlogMeta();
  const current = posts.find((p) => p.slug === slug);
  if (!current) return [];

  const scored = posts
    .filter((p) => p.slug !== slug)
    .map((post) => {
      const commonTags = post.tags.filter((tag) => current.tags.includes(tag)).length;
      return {
        post,
        score: commonTags * 10 + (post.date.slice(0, 4) === current.date.slice(0, 4) ? 1 : 0),
      };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((x) => x.post);
}

export function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getBlogCanonical(slug?: string): string {
  const base = "https://books.kuras-plus.com";
  if (!slug) return `${base}/blog`;
  return `${base}/blog/${slug}`;
}

export function getAllBlogForFeed(): BlogPost[] {
  ensureBlogDir();
  const files = fs.readdirSync(BLOG_DIR).filter(isMarkdownFile);

  const posts = files
    .map((fileName) => {
      const fullPath = path.join(BLOG_DIR, fileName);
      const raw = fs.readFileSync(fullPath, "utf-8");
      const meta = parseMeta(fileName, raw);
      if (meta.draft) return null;

      const parsed = matter(raw);
      return {
        ...meta,
        content: parsed.content,
        toc: extractToc(parsed.content),
      } as BlogPost;
    })
    .filter((v): v is BlogPost => Boolean(v));

  return posts.sort((a, b) => {
    const ad = new Date(a.updated ?? a.date).getTime();
    const bd = new Date(b.updated ?? b.date).getTime();
    return bd - ad;
  });
}


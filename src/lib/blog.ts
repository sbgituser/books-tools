import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type BlogMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
};

export type BlogPost = BlogMeta & {
  content: string;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function ensureBlogDir() {
  if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });
}

function isMarkdownFile(fileName: string): boolean {
  return fileName.endsWith(".md") || fileName.endsWith(".mdx");
}

function toSlug(fileName: string): string {
  return fileName.replace(/\.mdx?$/, "");
}

function parseMeta(fileName: string, raw: string): BlogMeta {
  const { data } = matter(raw);
  const slug = String(data.slug ?? toSlug(fileName));
  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: String(data.date ?? "1970-01-01"),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
  };
}

export function getAllBlogMeta(): BlogMeta[] {
  ensureBlogDir();
  const files = fs.readdirSync(BLOG_DIR).filter(isMarkdownFile);
  const items = files.map((fileName) => {
    const fullPath = path.join(BLOG_DIR, fileName);
    const raw = fs.readFileSync(fullPath, "utf-8");
    return parseMeta(fileName, raw);
  });

  return items.sort((a, b) => b.date.localeCompare(a.date));
}

export function getAllBlogSlugs(): string[] {
  return getAllBlogMeta().map((p) => p.slug);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  ensureBlogDir();
  const candidates = [
    path.join(BLOG_DIR, `${slug}.md`),
    path.join(BLOG_DIR, `${slug}.mdx`),
  ];

  const fullPath = candidates.find((p) => fs.existsSync(p));
  if (!fullPath) return null;

  const fileName = path.basename(fullPath);
  const raw = fs.readFileSync(fullPath, "utf-8");
  const parsed = matter(raw);
  const meta = parseMeta(fileName, raw);

  return { ...meta, content: parsed.content };
}


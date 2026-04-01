import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const BLOG_DIR = new URL('../content/blog/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

function improveDesc(title, desc, content) {
  if (desc.length >= 80) return null; // No change needed

  // Pattern: Author recommendation rankings
  // e.g. "〇〇おすすめ作品ランキング【初心者から読める名作】"
  if (/おすすめ作品ランキング/.test(title)) {
    const m = title.match(/^(.+?)おすすめ作品ランキング/);
    const author = m ? m[1] : '';
    return `${author}のおすすめ作品をランキング形式で詳しく紹介。初心者でも読みやすい名作から代表作まで、各作品の魅力・読む順番・選び方を丁寧に解説します。`;
  }

  // Pattern: Manga genre 20-selections "【2026年版】〇〇漫画おすすめ20選"
  if (/【2026年版】/.test(title) && /漫画おすすめ20選/.test(title)) {
    return desc + `各作品のあらすじ・見どころ・向いている人を詳しく解説。マンガアプリの無料試し読み情報もあわせて紹介します。`;
  }

  // Pattern: Manga/novel like another work
  if (/が好きな人.*おすすめ/.test(title) || /に似た作家/.test(title)) {
    return desc + `作風・読み心地の類似点を詳しく比較。あなたの次の1冊を見つけるための選び方ガイドつきです。`;
  }

  // Pattern: Magazine manga rankings
  if (/おすすめ漫画ランキング【名作から新連載まで】/.test(title)) {
    const mag = title.replace('のおすすめ漫画ランキング【名作から新連載まで】', '');
    return `${mag}連載のおすすめ漫画を厳選紹介。歴代名作から今読むべき注目の新連載まで、各作品のジャンル・読みやすさ・あらすじを詳しく解説します。`;
  }

  // Pattern: Short 〇〇漫画おすすめ10選 (without 2026)
  if (/漫画おすすめ10選/.test(title)) {
    return desc + `各作品の特徴・見どころ・対象読者を詳しく解説。電子書籍の無料試し読み情報もあわせて紹介します。`;
  }

  // Pattern: 〇〇小説おすすめ10選
  if (/小説おすすめ10選|小説おすすめ15選/.test(title)) {
    return desc + `あらすじ・文章の特徴・読後感を詳しく解説。Kindle Unlimitedで読める作品情報もあわせて紹介します。`;
  }

  // Pattern: Completed manga / anime adaptations
  if (/完結済み漫画|アニメ化された漫画/.test(title)) {
    return desc + `ジャンル別・読みやすさ別に解説。一気読みにおすすめの作品から電子書籍で読める作品まで詳しく紹介します。`;
  }

  // Pattern: Beginner guides
  if (/初心者|入門/.test(title) && /本|小説|漫画/.test(title)) {
    return desc + `最初の1冊の選び方から読む順番まで、初めての人が迷わず選べるよう詳しく解説します。`;
  }

  // Pattern: Themed book lists (books for 〇〇)
  if (/おすすめ.*10選|おすすめ.*15選|おすすめ.*20選/.test(title)) {
    return desc + `各作品のあらすじ・選んだ理由・読後感を詳しく解説。あなたの目的に合った1冊が必ず見つかります。`;
  }

  // General fallback
  return desc + `ジャンル・難易度別に解説。選び方のポイントと各作品の読みどころも詳しく紹介します。`;
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  return { block: match[0], content: match[1] };
}

function extractField(block, fieldName) {
  // Matches: fieldName: "value" or fieldName: 'value'
  const re = new RegExp(`^${fieldName}:\\s*["']([\\s\\S]*?)["']\\s*$`, 'm');
  const m = block.match(re);
  return m ? m[1] : null;
}

function replaceDescriptionInFrontmatter(raw, newDesc) {
  // Replace the description line inside the frontmatter block only
  // Handles both single and double quotes
  return raw.replace(
    /^(---\n[\s\S]*?)(description:\s*["'])([^"']*)(["'])([\s\S]*?---)/m,
    (full, pre, open, _oldDesc, close, post) => {
      return `${pre}${open}${newDesc}${close}${post}`;
    }
  );
}

const files = readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'));

let updatedCount = 0;
let skippedCount = 0;
const updatedFiles = [];

for (const file of files) {
  const filePath = join(BLOG_DIR, file);
  const raw = readFileSync(filePath, 'utf8');

  const fm = parseFrontmatter(raw);
  if (!fm) {
    console.log(`[SKIP] No frontmatter: ${file}`);
    skippedCount++;
    continue;
  }

  const title = extractField(fm.content, 'title');
  const desc = extractField(fm.content, 'description');

  if (title === null || desc === null) {
    console.log(`[SKIP] Missing title or description: ${file}`);
    skippedCount++;
    continue;
  }

  const bodyContent = raw.slice(fm.block.length);
  const improved = improveDesc(title, desc, bodyContent);

  if (improved === null) {
    skippedCount++;
    continue;
  }

  const newRaw = replaceDescriptionInFrontmatter(raw, improved);

  if (newRaw === raw) {
    console.log(`[WARN] No change applied to: ${file} (regex may not have matched)`);
    skippedCount++;
    continue;
  }

  writeFileSync(filePath, newRaw, 'utf8');
  updatedFiles.push({ file, oldLen: desc.length, newLen: improved.length });
  updatedCount++;
}

console.log('\n=== fix-meta.mjs Summary ===');
console.log(`Total MDX files scanned: ${files.length}`);
console.log(`Files updated:           ${updatedCount}`);
console.log(`Files skipped:           ${skippedCount}`);
if (updatedFiles.length > 0) {
  console.log('\nUpdated files:');
  for (const { file, oldLen, newLen } of updatedFiles) {
    console.log(`  ${file}  (${oldLen} → ${newLen} chars)`);
  }
}

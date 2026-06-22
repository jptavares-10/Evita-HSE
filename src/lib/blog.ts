// Loads blog posts from src/content/blog/*.md at build time.
// Each post is a Markdown file with YAML frontmatter.

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  cover?: string;
  category?: string;
  tags: string[];
  date: string; // ISO YYYY-MM-DD
  author?: string;
  readingMinutes?: number;
  content: string; // markdown body
}

// Eagerly import all markdown files as raw strings
const modules = import.meta.glob("../content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };
  const yaml = match[1];
  const content = match[2];
  const data: Record<string, unknown> = {};
  const lines = yaml.split("\n");
  for (const line of lines) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let value: string = m[2].trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      // Inline array: ["a", "b"]
      const inner = value.slice(1, -1).trim();
      const arr = inner
        .split(",")
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
      data[key] = arr;
      continue;
    }
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    // Number?
    if (/^\d+$/.test(value)) {
      data[key] = Number(value);
    } else {
      data[key] = value;
    }
  }
  return { data, content };
}

function slugFromPath(path: string): string {
  const file = path.split("/").pop() ?? "";
  return file.replace(/\.md$/, "");
}

const posts: BlogPost[] = Object.entries(modules)
  .map(([path, raw]) => {
    const { data, content } = parseFrontmatter(raw);
    const slug = slugFromPath(path);
    return {
      slug,
      title: String(data.title ?? slug),
      description: String(data.description ?? ""),
      cover: data.cover ? String(data.cover) : undefined,
      category: data.category ? String(data.category) : undefined,
      tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
      date: String(data.date ?? ""),
      author: data.author ? String(data.author) : "Equipe Evita HSE",
      readingMinutes: typeof data.readingMinutes === "number" ? data.readingMinutes : undefined,
      content,
    } satisfies BlogPost;
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export function getAllPosts(): BlogPost[] {
  return posts;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function formatPostDate(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}
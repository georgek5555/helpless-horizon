const WP_API = import.meta.env.WP_API_URL ?? 'https://solocial.net/wp-json/wp/v2';

async function wpFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${WP_API}${path}`);
  if (!res.ok) throw new Error(`WP REST API error: ${res.status} ${path}`);
  return res.json() as Promise<T>;
}

// ─── Types ───────────────────────────────────────────────

export interface WpPost {
  id: number;
  slug: string;
  link: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  featured_media: number;
  categories: number[];
  _embedded?: {
    'wp:featuredmedia'?: { source_url: string }[];
    'wp:term'?: { id: number; name: string; slug: string }[][];
  };
}

// ─── Helpers ─────────────────────────────────────────────

export function getTitle(post: WpPost): string {
  return post.title.rendered;
}

export function getExcerpt(post: WpPost): string {
  // HTMLタグを除去してプレーンテキスト化
  return post.excerpt.rendered.replace(/<[^>]+>/g, '').trim();
}

export function getContent(post: WpPost): string {
  return post.content.rendered;
}

export function getFeaturedImage(post: WpPost): string | null {
  return post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null;
}

export function getCategory(post: WpPost): string {
  return post._embedded?.['wp:term']?.[0]?.[0]?.name ?? 'SNS';
}

// WordPress の permalink 構造を保持したパスを返す (例: "20151102306")
export function getPostPath(post: WpPost): string {
  try {
    const url = new URL(post.link);
    return url.pathname.replace(/^\/|\/$/g, '');
  } catch {
    return post.slug;
  }
}

export interface WpCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

// ─── API calls ───────────────────────────────────────────

export async function getPosts(perPage = 50): Promise<WpPost[]> {
  return wpFetch<WpPost[]>(
    `/posts?per_page=${perPage}&orderby=date&order=desc&status=publish&_embed=true`
  );
}

export async function getPost(slug: string): Promise<WpPost | null> {
  const posts = await wpFetch<WpPost[]>(
    `/posts?slug=${encodeURIComponent(slug)}&_embed=true`
  );
  return posts[0] ?? null;
}

export async function getAllSlugs(): Promise<string[]> {
  const posts = await wpFetch<WpPost[]>('/posts?per_page=200&fields=slug');
  return posts.map(p => p.slug);
}

export async function getCategories(): Promise<WpCategory[]> {
  return wpFetch<WpCategory[]>('/categories?per_page=50&orderby=count&order=desc&hide_empty=true');
}

export async function getPostsByCategory(categoryId: number, perPage = 20): Promise<WpPost[]> {
  return wpFetch<WpPost[]>(
    `/posts?categories=${categoryId}&per_page=${perPage}&orderby=date&order=desc&status=publish&_embed=true`
  );
}

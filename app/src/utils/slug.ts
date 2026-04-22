/**
 * URL slug utilities.
 * Format: "123-phase-1-prep-up" (ID prefix + slugified title)
 */

export function toSlug(id: number, title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
  return `${id}-${slug}`;
}

export function fromSlug(slug: string): number {
  const match = slug.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/** Shorthand URL builders */
export const bundleUrl = (id: number, title?: string) => `/bundle/${title ? toSlug(id, title) : id}`;
export const lessonUrl = (id: number, title?: string) => `/lesson/${title ? toSlug(id, title) : id}`;
export const playUrl = (bundleId: number, chapterIdx: number, title?: string) => `/play/${title ? toSlug(bundleId, title) : bundleId}/${chapterIdx}`;
export const creatorUrl = (id: number, name?: string) => `/creator/${name ? toSlug(id, name) : id}`;

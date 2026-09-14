/* Blog helpers with no server dependencies — safe to import from client components. */

export function slugify(input: string, max = 160) {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
}

export const mediaUrl = (id: number) => `/media/${id}`;

export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

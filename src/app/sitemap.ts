import type { MetadataRoute } from "next";
import { listPublishedSlugs } from "@/lib/blog";
import { loanProducts, site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly" = "monthly") => ({
    url: `${site.url}${path}`,
    lastModified,
    changeFrequency,
    priority,
  });

  let posts: Awaited<ReturnType<typeof listPublishedSlugs>> = [];
  try {
    posts = await listPublishedSlugs();
  } catch (error) {
    console.error("[sitemap] blog posts unavailable:", error instanceof Error ? error.message : error);
  }

  return [
    page("", 1, "weekly"),
    page("/loans", 0.9, "weekly"),
    ...loanProducts.flatMap((p) => [page(`/loans/${p.slug}`, 0.85), page(`/apply/${p.slug}`, 0.9)]),
    page("/services", 0.8),
    page("/about", 0.7),
    page("/bill-payments", 0.7),
    page("/mobile-apps", 0.6),
    page("/fun-food-factory", 0.7, "weekly"),
    page("/blog", 0.8, "weekly"),
    ...posts.map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at.replace(" ", "T")),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    page("/contact", 0.8),
    page("/privacy-policy", 0.3, "yearly"),
  ];
}

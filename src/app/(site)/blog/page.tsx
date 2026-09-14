import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PostCover } from "@/components/blog/post-cover";
import { PostMeta, PostRow } from "@/components/blog/post-row";
import { NewsletterForm } from "@/components/forms/fun-food-forms";
import { PageHero } from "@/components/shared/page-hero";
import { ArrowRight } from "@/components/ui/icons";
import { Container, Section } from "@/components/ui/section";
import { listPublishedCategories, listPublishedPosts, type BlogPost } from "@/lib/blog";
import { cn } from "@/lib/cn";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guides, news and community updates from Gap Castle — school fees, travel, business finance and the Fun Food Factory.",
  alternates: { canonical: "/blog" },
};

const text = (value: string | string[] | undefined) => (typeof value === "string" ? value : undefined);

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const sp = await searchParams;
  const categorySlug = text(sp.category);
  const requestedPage = Number(text(sp.page) ?? 1);
  const perPage = Number((await getSettings()).blog_posts_per_page) || 9;

  let listing: Awaited<ReturnType<typeof listPublishedPosts>> | null = null;
  let categories: Awaited<ReturnType<typeof listPublishedCategories>> = [];
  try {
    [listing, categories] = await Promise.all([
      listPublishedPosts({ categorySlug, page: requestedPage, perPage }),
      listPublishedCategories(),
    ]);
  } catch (error) {
    console.error("[blog] could not load posts:", error);
  }

  const activeCategory = categories.find((c) => c.slug === categorySlug);
  const posts = listing?.posts ?? [];
  const page = listing?.page ?? 1;
  const lead = !categorySlug && page === 1 ? (posts.find((p) => p.isFeatured) ?? posts[0]) : undefined;
  const rest = lead ? posts.filter((p) => p.id !== lead.id) : posts;
  const totalPages = listing ? Math.max(1, Math.ceil(listing.total / listing.perPage)) : 1;

  const pageHref = (p: number) => {
    const query = new URLSearchParams();
    if (categorySlug) query.set("category", categorySlug);
    if (p > 1) query.set("page", String(p));
    const qs = query.toString();
    return qs ? `/blog?${qs}` : "/blog";
  };

  return (
    <>
      <PageHero
        breadcrumbs={[{ label: "Blog" }]}
        eyebrow="The Gap Castle blog"
        title={
          <>
            Notes on <span className="text-castle-600">bridging the gap.</span>
          </>
        }
        lede="Practical guides to school fees, travel and business finance — plus news from the Fun Food Factory and the communities we serve."
      />

      <Section tone="white" className="pt-10 lg:pt-14">
        <Container>
          <nav aria-label="Blog categories" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
            <CategoryChip href="/blog" active={!categorySlug}>
              All posts
            </CategoryChip>
            {categories.map((c) => (
              <CategoryChip key={c.id} href={`/blog?category=${encodeURIComponent(c.slug)}`} active={categorySlug === c.slug}>
                {c.name}
                <span className="text-xs opacity-60">{c.n}</span>
              </CategoryChip>
            ))}
          </nav>

          {listing === null ? (
            <EmptyNote>We could not load posts just now. Please try again shortly.</EmptyNote>
          ) : posts.length === 0 ? (
            <EmptyNote>{categorySlug ? `There are no ${activeCategory?.name ?? "posts in this category"} yet.` : "No posts yet — check back soon."}</EmptyNote>
          ) : (
            <>
              {lead && <LeadPost post={lead} />}

              {rest.length > 0 && (
                <ul className={cn("border-t border-castle-200", lead ? "mt-16 lg:mt-20" : "mt-10")}>
                  {rest.map((post) => (
                    <PostRow key={post.id} post={post} />
                  ))}
                </ul>
              )}

              {totalPages > 1 && (
                <nav aria-label="Pagination" className="mt-12 flex items-center justify-between gap-4">
                  {page > 1 ? (
                    <Link href={pageHref(page - 1)} className="rounded-full border border-castle-200 px-5 py-2.5 font-semibold text-castle-700 hover:bg-castle-50">
                      ← Newer posts
                    </Link>
                  ) : (
                    <span />
                  )}
                  <span className="text-sm text-ink/60">
                    Page {page} of {totalPages}
                  </span>
                  {page < totalPages ? (
                    <Link href={pageHref(page + 1)} className="rounded-full border border-castle-200 px-5 py-2.5 font-semibold text-castle-700 hover:bg-castle-50">
                      Older posts →
                    </Link>
                  ) : (
                    <span />
                  )}
                </nav>
              )}
            </>
          )}
        </Container>
      </Section>

      <Section tone="paper" size="tight">
        <Container className="flex flex-wrap items-center justify-between gap-8">
          <div className="max-w-md">
            <p className="font-display text-3xl leading-tight font-semibold">New posts, straight to your inbox.</p>
            <p className="mt-2 text-ink/60">An occasional email when we publish something useful. Nothing else.</p>
          </div>
          <NewsletterForm source="blog" />
        </Container>
      </Section>
    </>
  );
}

function LeadPost({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group mt-10 grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="relative overflow-hidden rounded-[30px] lg:col-span-7">
        <PostCover
          post={post}
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="h-72 w-full transition-transform duration-700 group-hover:scale-[1.03] sm:h-96 lg:h-[440px]"
        />
        {post.isFeatured && (
          <span className="absolute top-5 left-5 rounded-full bg-gold-500 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.18em] text-castle-900 uppercase">
            Featured
          </span>
        )}
      </div>
      <div className="lg:col-span-5">
        <PostMeta post={post} />
        <h2 className="mt-4 font-display text-[clamp(1.9rem,1.4rem+2vw,2.8rem)] leading-[1.1] font-semibold transition-colors group-hover:text-castle-600">
          {post.title}
        </h2>
        {post.excerpt && <p className="mt-4 text-lg leading-relaxed text-ink/65">{post.excerpt}</p>}
        <span className="link-span mt-7 inline-flex items-center gap-2 font-semibold text-castle-600">
          Read the article
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function CategoryChip({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors",
        active ? "border-castle-600 bg-castle-600 text-white" : "border-castle-200 bg-white text-ink/70 hover:border-castle-400 hover:text-castle-700",
      )}
    >
      {children}
    </Link>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="mt-10 rounded-3xl border border-dashed border-castle-200 px-6 py-16 text-center text-ink/60">{children}</p>;
}

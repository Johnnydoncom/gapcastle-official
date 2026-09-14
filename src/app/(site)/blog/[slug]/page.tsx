import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { PostCover } from "@/components/blog/post-cover";
import { PostRow } from "@/components/blog/post-row";
import { CopyButton } from "@/components/shared/copy-button";
import { CtaBand } from "@/components/shared/cta-band";
import { Breadcrumbs } from "@/components/shared/page-hero";
import { Facebook, WhatsApp } from "@/components/ui/icons";
import { Container, Eyebrow, Section, SectionTitle } from "@/components/ui/section";
import { getPublishedPostBySlug, getRelatedPosts } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { sanitizePostHtml } from "@/lib/html";
import { site } from "@/lib/site";

/* Rendered on first request, cached, refreshed every 5 minutes — and immediately when a post is saved in /admin. */
export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

const loadPost = cache((slug: string) => getPublishedPostBySlug(slug));

const absolute = (path: string) => (path.startsWith("http") ? path : `${site.url}${path}`);

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await loadPost((await params).slug).catch(() => null);
  if (!post) return { title: "Article not found" };

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime: post.publishedAt?.replace(" ", "T"),
      modifiedTime: post.updatedAt.replace(" ", "T"),
      images: post.coverUrl ? [{ url: absolute(post.coverUrl), alt: post.coverAlt }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = await loadPost((await params).slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post).catch(() => []);
  // stored HTML is sanitised on save; sanitising again on render keeps older or hand-edited rows safe too
  const html = sanitizePostHtml(post.content);
  const url = `${site.url}/blog/${post.slug}`;
  const categoryHref = `/blog?category=${encodeURIComponent(post.category.slug)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt || undefined,
    datePublished: post.publishedAt?.replace(" ", "T"),
    dateModified: post.updatedAt.replace(" ", "T"),
    image: post.coverUrl ? absolute(post.coverUrl) : undefined,
    articleSection: post.category.name,
    mainEntityOfPage: url,
    author: { "@type": post.authorName === site.name ? "Organization" : "Person", name: post.authorName },
    publisher: {
      "@type": "Organization",
      name: site.legalName,
      logo: { "@type": "ImageObject", url: `${site.url}/logo-lockup.png` },
    },
  };

  return (
    <>
      <article>
        <header className="border-b border-castle-100 bg-paper">
          <div className="container-editorial pt-8 pb-12 lg:pt-12 lg:pb-16">
            <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: post.category.name, href: categoryHref }, { label: post.title }]} />

            <div className="mx-auto mt-10 max-w-3xl text-center">
              <Link
                href={categoryHref}
                className="rise inline-flex items-center gap-2.5 text-[11px] font-bold tracking-[0.22em] text-castle-600 uppercase"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
                {post.category.name}
              </Link>
              <h1 className="rise mt-5 font-display text-[clamp(2.2rem,1.4rem+3.2vw,3.6rem)] leading-[1.08] font-semibold">
                {post.title}
              </h1>
              {post.excerpt && <p className="rise mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-ink/65">{post.excerpt}</p>}
              <p className="rise mt-7 text-sm text-ink/60">
                By <span className="font-semibold text-ink">{post.authorName}</span>
                {post.publishedAt && (
                  <>
                    {" · "}
                    <time dateTime={post.publishedAt.replace(" ", "T")}>{formatDate(post.publishedAt)}</time>
                  </>
                )}
                {" · "}
                {post.readingMinutes} min read
              </p>
            </div>

            {post.coverUrl && (
              <figure className="rise mx-auto mt-12 max-w-5xl overflow-hidden rounded-[32px] shadow-lift-lg">
                <PostCover post={post} priority sizes="(min-width: 1024px) 1024px, 100vw" className="h-64 w-full sm:h-[420px] lg:h-[520px]" />
              </figure>
            )}
          </div>
        </header>

        <Section tone="white" className="pt-14 lg:pt-20">
          <Container>
            <div className="prose-gc mx-auto max-w-[44rem]" dangerouslySetInnerHTML={{ __html: html }} />

            <div className="mx-auto mt-14 flex max-w-[44rem] flex-wrap items-center justify-between gap-4 border-t border-castle-100 pt-8">
              <p className="font-display text-lg font-semibold">Share this article</p>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${post.title} — ${url}`)}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Share on WhatsApp"
                  className="grid h-10 w-10 place-items-center rounded-full border border-castle-200 text-castle-700 transition-colors hover:border-castle-600 hover:bg-castle-600 hover:text-white"
                >
                  <WhatsApp className="h-4 w-4" />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Share on Facebook"
                  className="grid h-10 w-10 place-items-center rounded-full border border-castle-200 text-castle-700 transition-colors hover:border-castle-600 hover:bg-castle-600 hover:text-white"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <CopyButton value={url} label="Copy link" />
              </div>
            </div>
          </Container>
        </Section>
      </article>

      {related.length > 0 && (
        <Section tone="paper">
          <Container>
            <Eyebrow>Keep reading</Eyebrow>
            <SectionTitle>More from the blog</SectionTitle>
            <ul className="mt-10 border-t border-castle-200">
              {related.map((item) => (
                <PostRow key={item.id} post={item} />
              ))}
            </ul>
          </Container>
        </Section>
      )}

      <CtaBand />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}

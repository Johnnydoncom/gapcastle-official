import Link from "next/link";
import { PostCover } from "@/components/blog/post-cover";
import { ArrowRight } from "@/components/ui/icons";
import type { BlogPost } from "@/lib/blog";
import { formatDate } from "@/lib/format";

export function PostMeta({ post, className }: { post: BlogPost; className?: string }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-ink/60 ${className ?? ""}`}>
      <span className="text-[11px] font-bold tracking-[0.16em] text-castle-600 uppercase">{post.category.name}</span>
      <span aria-hidden>·</span>
      {post.publishedAt && <time dateTime={post.publishedAt.replace(" ", "T")}>{formatDate(post.publishedAt)}</time>}
      <span aria-hidden>·</span>
      <span>{post.readingMinutes} min read</span>
    </p>
  );
}

/** One post as an editorial row: thumbnail, meta and headline, arrow — not a boxed card. */
export function PostRow({ post }: { post: BlogPost }) {
  return (
    <li className="border-b border-castle-200">
      <Link href={`/blog/${post.slug}`} className="group grid items-center gap-5 py-8 sm:grid-cols-12 sm:gap-8">
        <div className="overflow-hidden rounded-2xl sm:col-span-4 lg:col-span-3">
          <PostCover
            post={post}
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 32vw, 100vw"
            className="h-52 w-full transition-transform duration-700 group-hover:scale-105 sm:h-40"
          />
        </div>
        <div className="sm:col-span-8 lg:col-span-7">
          <PostMeta post={post} />
          <h2 className="mt-2.5 font-display text-2xl leading-snug font-semibold transition-colors group-hover:text-castle-600 lg:text-[1.75rem]">
            {post.title}
          </h2>
          {post.excerpt && <p className="mt-2 line-clamp-2 leading-relaxed text-ink/65">{post.excerpt}</p>}
        </div>
        <span className="hidden h-12 w-12 place-items-center justify-self-end rounded-full border border-castle-200 text-castle-600 transition-all duration-300 group-hover:border-castle-600 group-hover:bg-castle-600 group-hover:text-white lg:col-span-2 lg:grid">
          <ArrowRight className="h-4 w-4" />
        </span>
      </Link>
    </li>
  );
}

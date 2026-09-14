import Image from "next/image";
import type { BlogPost } from "@/lib/blog";
import { cn } from "@/lib/cn";

/** A post's cover, or a branded placeholder when it has none. */
export function PostCover({
  post,
  sizes,
  className,
  priority = false,
}: {
  post: Pick<BlogPost, "coverUrl" | "coverAlt" | "category" | "title">;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  if (!post.coverUrl) {
    return (
      <div aria-hidden className={cn("grid place-items-center bg-castle-600 p-6 text-center", className)}>
        <span className="font-display text-lg font-semibold text-white/85 italic">{post.category.name}</span>
      </div>
    );
  }

  return (
    <Image
      src={post.coverUrl}
      alt={post.coverAlt}
      width={1600}
      height={1000}
      sizes={sizes}
      priority={priority}
      className={cn("photo-tone object-cover", className)}
    />
  );
}

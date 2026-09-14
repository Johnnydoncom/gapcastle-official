import sanitizeHtml from "sanitize-html";

/*
 * Blog posts are stored as HTML from the rich text editor. Everything is passed
 * through this allow-list when it is saved and again when it is rendered, so a
 * crafted request cannot put scripts, styles, event handlers or unsafe URLs on
 * the public site.
 */

const isSafeHref = (href: string) => /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(href.trim());
/** Images may only come from this site's uploads and photo library, or https. */
const isSafeImageSrc = (src: string) => /^(\/media\/\d+|\/images\/[\w.-]+|https:\/\/)/i.test(src.trim());

const options: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "h2",
    "h3",
    "h4",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "a",
    "ul",
    "ol",
    "li",
    "blockquote",
    "hr",
    "img",
    "code",
    "pre",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "loading"],
    ol: ["start"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["https"] },
  allowProtocolRelative: false,
  transformTags: {
    b: "strong",
    i: "em",
    a: (tagName, attribs) => {
      const href = attribs.href?.trim() ?? "";
      if (!isSafeHref(href)) return { tagName: "span", attribs: {} };
      const external = /^https?:\/\//i.test(href);
      return {
        tagName,
        attribs: {
          href,
          ...(attribs.title ? { title: attribs.title } : {}),
          ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
        },
      };
    },
    img: (tagName, attribs) => ({
      tagName,
      attribs: {
        src: attribs.src ?? "",
        alt: attribs.alt ?? "",
        ...(attribs.title ? { title: attribs.title } : {}),
        loading: "lazy",
      },
    }),
  },
  exclusiveFilter: (frame) => frame.tag === "img" && !isSafeImageSrc(frame.attribs.src ?? ""),
};

export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html, options).trim();
}

/** Visible text only, whitespace collapsed. */
export function htmlToText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(html: string): number {
  const text = htmlToText(html);
  return text ? text.split(" ").length : 0;
}

/** Ids of uploaded images (`/media/:id`) referenced inside post HTML. */
export function mediaIdsIn(html: string): number[] {
  return [...new Set([...html.matchAll(/\/media\/(\d+)/g)].map((m) => Number(m[1])))];
}

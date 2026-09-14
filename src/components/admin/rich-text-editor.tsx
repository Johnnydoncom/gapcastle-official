"use client";

import ImageExtension from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MediaDialog, imageFiles, uploadImage, type LibraryImage } from "@/components/admin/media-dialog";
import { Spinner } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

type Props = {
  initialContent: string;
  onChange: (html: string) => void;
  library: LibraryImage[];
  onLibraryAdd: (image: LibraryImage) => void;
  invalid?: boolean;
  describedBy?: string;
};

/** Accepts full URLs, site paths, mailto: and tel:. Bare domains get https://. */
function normaliseHref(raw: string) {
  const value = raw.trim();
  if (!value) return null;
  if (/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(value)) return value;
  if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(value)) return `https://${value}`;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `mailto:${value}`;
  return null;
}

export function RichTextEditor({ initialContent, onChange, library, onLibraryAdd, invalid, describedBy }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [uploads, setUploads] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // editorProps are created once; they call the latest upload handler through this ref.
  const dropUpload = useRef<(files: File[], pos?: number) => void>(() => {});

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      ImageExtension.configure({ allowBase64: false }),
      Placeholder.configure({ placeholder: "Start writing… You can paste or drop images straight in." }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "prose-gc",
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "Post content",
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
      },
      handlePaste: (_view, event) => {
        const files = imageFiles(event.clipboardData?.files);
        if (!files.length) return false;
        event.preventDefault();
        dropUpload.current(files);
        return true;
      },
      handleDrop: (view, event, _slice, moved) => {
        setDragging(false);
        const files = imageFiles(event.dataTransfer?.files);
        if (moved || !files.length) return false;
        event.preventDefault();
        dropUpload.current(files, view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos);
        return true;
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  useEffect(() => {
    dropUpload.current = async (files, pos) => {
      if (!editor) return;
      setNotice(null);
      let at = pos;
      for (const file of files) {
        setUploads((n) => n + 1);
        try {
          const result = await uploadImage(file);
          if (!result.ok) {
            setNotice(result.error);
            continue;
          }
          onLibraryAdd(result.image);
          const node = { type: "image", attrs: { src: result.image.url, alt: "" } };
          if (at !== undefined) editor.chain().focus().insertContentAt(at, node).run();
          else editor.chain().focus().insertContent(node).run();
          at = undefined; // later files follow the first one
        } finally {
          setUploads((n) => n - 1);
        }
      }
    };
  }, [editor, onLibraryAdd]);

  const selected = useEditorState({
    editor,
    selector: ({ editor: e }) => (e ? toolbarState(e) : null),
  });

  if (!editor) {
    return (
      <div className="grid min-h-[30rem] place-items-center rounded-2xl border border-castle-200 bg-white text-ink/50 sm:rounded-3xl">
        <Spinner className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // useEditorState keeps its first (editor-less) snapshot until the first transaction, so read the editor directly until then.
  const state = selected ?? toolbarState(editor);
  const blockValue = state.h2 ? "h2" : state.h3 ? "h3" : "p";

  const openLink = () => {
    setLinkValue(String(editor.getAttributes("link").href ?? ""));
    setLinkError(null);
    setLinkOpen(true);
  };

  const applyLink = () => {
    const href = normaliseHref(linkValue);
    if (!href) {
      setLinkError("Enter a web address such as https://example.com, a site path such as /loans, or an email address.");
      return;
    }
    const chain = editor.chain().focus().extendMarkRange("link");
    if (editor.state.selection.empty && !editor.isActive("link")) {
      chain.insertContent({ type: "text", text: linkValue.trim(), marks: [{ type: "link", attrs: { href } }] }).run();
    } else {
      chain.setLink({ href }).run();
    }
    setLinkOpen(false);
  };

  return (
    <div
      className={cn(
        "rich-editor rounded-2xl border bg-white sm:rounded-3xl",
        invalid ? "border-red-400" : "border-castle-200",
        dragging && "is-dragging",
      )}
      onDragEnter={(e) => e.dataTransfer.types.includes("Files") && setDragging(true)}
      onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setDragging(false)}
    >
      {/* ---------- toolbar: sticks below the mobile top bar, and to the top on desktop ---------- */}
      <div className="sticky top-16 z-10 rounded-t-2xl border-b border-castle-100 bg-white/95 backdrop-blur sm:rounded-t-3xl lg:top-0">
        <div role="toolbar" aria-label="Formatting" className="flex items-center gap-1 overflow-x-auto px-2 py-2 sm:flex-wrap sm:px-3">
          <label className="sr-only" htmlFor="block-type">
            Text style
          </label>
          <select
            id="block-type"
            value={blockValue}
            onChange={(e) => {
              const chain = editor.chain().focus();
              if (e.target.value === "h2") chain.setHeading({ level: 2 }).run();
              else if (e.target.value === "h3") chain.setHeading({ level: 3 }).run();
              else chain.setParagraph().run();
            }}
            className="h-9 shrink-0 cursor-pointer rounded-lg border border-castle-200 bg-white px-2 text-sm font-medium outline-none focus:border-castle-500"
          >
            <option value="p">Paragraph</option>
            <option value="h2">Heading</option>
            <option value="h3">Subheading</option>
          </select>

          <Divider />
          <Tool label="Bold (Ctrl+B)" active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
            <span className="font-bold">B</span>
          </Tool>
          <Tool label="Italic (Ctrl+I)" active={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <span className="font-serif italic">I</span>
          </Tool>
          <Tool label="Underline (Ctrl+U)" active={state.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <span className="underline underline-offset-2">U</span>
          </Tool>
          <Tool label="Strikethrough" active={state.strike} onClick={() => editor.chain().focus().toggleStrike().run()}>
            <span className="line-through">S</span>
          </Tool>
          <Tool label="Link" active={state.link || linkOpen} onClick={openLink}>
            <Svg d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
          </Tool>

          <Divider />
          <Tool label="Bulleted list" active={state.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <Svg d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
          </Tool>
          <Tool label="Numbered list" active={state.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <Svg d="M10 6h10M10 12h10M10 18h10M4 5l1.5-1v5M4 13.5a1.5 1.5 0 1 1 2.6 1L4 17.5h3" />
          </Tool>
          <Tool label="Quote" active={state.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <Svg d="M7 8H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h2v2a2 2 0 0 1-2 2M17 8h-2a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h2v2a2 2 0 0 1-2 2" />
          </Tool>
          <Tool label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <Svg d="M4 12h16" />
          </Tool>

          <Divider />
          <Tool label="Insert image" onClick={() => setDialogOpen(true)}>
            <Svg d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5ZM20 15l-4.5-4.5L6 20M9.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
            <span className="hidden text-sm font-semibold 2xl:inline">Image</span>
          </Tool>

          <Divider />
          <Tool label="Undo (Ctrl+Z)" disabled={!state.canUndo} onClick={() => editor.chain().focus().undo().run()}>
            <Svg d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
          </Tool>
          <Tool label="Redo (Ctrl+Shift+Z)" disabled={!state.canRedo} onClick={() => editor.chain().focus().redo().run()}>
            <Svg d="m15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />
          </Tool>
        </div>

        {linkOpen && (
          <div className="border-t border-castle-100 px-3 py-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label htmlFor="link-href" className="sr-only">
                Link address
              </label>
              <input
                id="link-href"
                autoFocus
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyLink();
                  }
                  if (e.key === "Escape") setLinkOpen(false);
                }}
                placeholder="https://… or /loans"
                className="h-10 min-w-0 flex-1 rounded-lg border border-castle-200 px-3 text-[15px] outline-none focus:border-castle-500"
              />
              <div className="flex gap-2">
                <button type="button" onClick={applyLink} className="h-10 rounded-lg bg-castle-600 px-4 text-sm font-semibold text-white hover:bg-castle-700">
                  Apply
                </button>
                {state.link && (
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().extendMarkRange("link").unsetLink().run();
                      setLinkOpen(false);
                    }}
                    className="h-10 rounded-lg border border-castle-200 px-4 text-sm font-semibold hover:bg-castle-50"
                  >
                    Remove
                  </button>
                )}
                <button type="button" onClick={() => setLinkOpen(false)} className="h-10 px-2 text-sm font-semibold text-ink/60 hover:text-ink">
                  Cancel
                </button>
              </div>
            </div>
            {linkError && <p className="mt-2 text-[13px] font-medium text-red-700">{linkError}</p>}
          </div>
        )}

        {state.image && (
          <div className="flex flex-col gap-2 border-t border-castle-100 bg-gold-300/20 px-3 py-3 sm:flex-row sm:items-center">
            <label htmlFor="image-alt" className="shrink-0 text-sm font-semibold">
              Image description
            </label>
            <input
              id="image-alt"
              value={state.imageAlt}
              onChange={(e) => editor.chain().updateAttributes("image", { alt: e.target.value }).run()}
              maxLength={255}
              placeholder="What the image shows, for screen readers"
              className="h-10 min-w-0 flex-1 rounded-lg border border-castle-200 bg-white px-3 text-[15px] outline-none focus:border-castle-500"
            />
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteSelection().run()}
              className="h-10 rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              Remove image
            </button>
          </div>
        )}
      </div>

      <EditorContent editor={editor} />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-b-2xl border-t border-castle-100 px-4 py-2.5 text-xs text-ink/55 sm:rounded-b-3xl">
        <span aria-live="polite">
          {uploads > 0 ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-castle-700">
              <Spinner className="h-3.5 w-3.5 animate-spin" /> Uploading image…
            </span>
          ) : notice ? (
            <span className="font-semibold text-red-700">{notice}</span>
          ) : (
            "Tip: paste or drag images into the text. Select an image to describe it."
          )}
        </span>
        <span className="tabular-nums">
          {state.words} words · ~{Math.max(1, Math.round(state.words / 220))} min read
        </span>
      </div>

      <MediaDialog
        open={dialogOpen}
        title="Insert an image"
        confirmLabel="Insert image"
        withAlt
        library={library}
        onUploaded={onLibraryAdd}
        onClose={() => setDialogOpen(false)}
        onSelect={(image, alt) => {
          setDialogOpen(false);
          editor.chain().focus().setImage({ src: image.url, alt }).run();
        }}
      />
    </div>
  );
}

function toolbarState(e: Editor) {
  const text = e.getText().trim();
  return {
    bold: e.isActive("bold"),
    italic: e.isActive("italic"),
    underline: e.isActive("underline"),
    strike: e.isActive("strike"),
    h2: e.isActive("heading", { level: 2 }),
    h3: e.isActive("heading", { level: 3 }),
    bullet: e.isActive("bulletList"),
    ordered: e.isActive("orderedList"),
    quote: e.isActive("blockquote"),
    link: e.isActive("link"),
    image: e.isActive("image"),
    imageAlt: String(e.getAttributes("image").alt ?? ""),
    canUndo: e.can().undo(),
    canRedo: e.can().redo(),
    words: text ? text.split(/\s+/).length : 0,
  };
}

function Tool({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // keep the editor selection
      onClick={onClick}
      className={cn(
        "inline-flex h-9 min-w-9 shrink-0 items-center justify-center gap-1.5 rounded-lg px-2 text-[15px] transition-colors disabled:opacity-35",
        active ? "bg-castle-600 text-white" : "text-ink/75 hover:bg-castle-50 hover:text-castle-700",
      )}
    >
      {children}
    </button>
  );
}

const Divider = () => <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-castle-100" />;

const Svg = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-[18px] w-[18px]">
    <path d={d} />
  </svg>
);

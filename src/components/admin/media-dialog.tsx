"use client";

import { useEffect, useRef, useState } from "react";
import { uploadMedia, type UploadResult } from "@/app/(admin)/admin/blog-actions";
import { IconClose, IconUpload } from "@/components/admin/admin-icons";
import { Spinner } from "@/components/ui/icons";
import { IMAGE_ACCEPT, MAX_IMAGE_BYTES } from "@/lib/blog-shared";
import { cn } from "@/lib/cn";

export type LibraryImage = { id: number; url: string; filename: string };

/** Checks type and size in the browser for instant feedback; the server checks the bytes again. */
export function clientImageProblem(file: File) {
  if (!IMAGE_ACCEPT.split(",").includes(file.type)) return `${file.name}: use a JPEG, PNG or WebP image.`;
  if (file.size > MAX_IMAGE_BYTES) return `${file.name}: images must be 3 MB or smaller.`;
  return null;
}

export async function uploadImage(file: File): Promise<UploadResult> {
  const problem = clientImageProblem(file);
  if (problem) return { ok: false, error: problem };
  const body = new FormData();
  body.append("file", file);
  try {
    return await uploadMedia(body);
  } catch {
    return { ok: false, error: "The upload failed. Check your connection and try again." };
  }
}

export const imageFiles = (files: FileList | null | undefined) =>
  Array.from(files ?? []).filter((f) => f.type.startsWith("image/"));

/**
 * Choose an image from the media library or upload a new one.
 * Built on <dialog>, which traps focus and closes on Escape.
 */
export function MediaDialog({
  open,
  title,
  confirmLabel,
  withAlt = false,
  library,
  onUploaded,
  onSelect,
  onClose,
}: {
  open: boolean;
  title: string;
  confirmLabel: string;
  withAlt?: boolean;
  library: LibraryImage[];
  onUploaded: (image: LibraryImage) => void;
  onSelect: (image: LibraryImage, alt: string) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [alt, setAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const upload = async (files: File[]) => {
    setError(null);
    setUploading(true);
    try {
      for (const file of files) {
        const result = await uploadImage(file);
        if (!result.ok) {
          setError(result.error);
          continue;
        }
        onUploaded(result.image);
        setSelected(result.image.id);
      }
    } finally {
      setUploading(false);
    }
  };

  const chosen = library.find((i) => i.id === selected) ?? null;

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && onClose()}
      aria-label={title}
      className="m-auto max-h-[calc(100dvh-1.5rem)] w-[min(60rem,calc(100vw-1.5rem))] overflow-hidden rounded-3xl border-0 bg-white p-0 text-ink shadow-lift-lg backdrop:bg-castle-950/60 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex max-h-[calc(100dvh-1.5rem)] flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-castle-100 px-5 py-4">
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-ink/60 hover:bg-castle-50 hover:text-ink">
            <IconClose className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const files = imageFiles(e.dataTransfer.files);
              if (files.length) void upload(files);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors",
              dragging ? "border-castle-500 bg-castle-50" : "border-castle-200 hover:border-castle-400 hover:bg-castle-50/60",
            )}
          >
            {uploading ? <Spinner className="h-6 w-6 animate-spin text-castle-600" /> : <IconUpload className="h-6 w-6 text-castle-600" />}
            <span className="font-semibold">{uploading ? "Uploading…" : "Upload a new image"}</span>
            <span className="text-sm text-ink/55">Drop a file here or tap to choose · JPEG, PNG or WebP · max 3 MB</span>
            <input
              type="file"
              accept={IMAGE_ACCEPT}
              multiple
              disabled={uploading}
              className="sr-only"
              onChange={(e) => {
                const files = imageFiles(e.target.files);
                e.target.value = "";
                if (files.length) void upload(files);
              }}
            />
          </label>
          {error && (
            <p role="alert" className="mt-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <p className="mt-6 text-xs font-semibold tracking-wider text-ink/55 uppercase">Media library</p>
          {library.length === 0 ? (
            <p className="mt-3 text-sm text-ink/60">No images yet — upload one above.</p>
          ) : (
            <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {library.map((image) => (
                <li key={image.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(image.id)}
                    onDoubleClick={() => onSelect(image, alt)}
                    aria-pressed={selected === image.id}
                    title={image.filename}
                    className={cn(
                      "block w-full overflow-hidden rounded-xl ring-offset-2 transition",
                      selected === image.id ? "ring-3 ring-castle-600" : "ring-castle-300 hover:ring-2",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- library thumbnails */}
                    <img src={image.url} alt={image.filename} loading="lazy" className="aspect-square w-full bg-castle-50 object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-castle-100 bg-castle-50/60 px-5 py-4 sm:flex-row sm:items-end">
          {withAlt && (
            <label className="flex-1 text-sm font-semibold">
              Image description <span className="font-normal text-ink/55">(for screen readers)</span>
              <input
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                maxLength={255}
                placeholder={chosen ? "What the image shows" : "Select an image first"}
                className="mt-1.5 h-11 w-full rounded-xl border border-castle-200 bg-white px-3 text-[15px] font-normal outline-none focus:border-castle-500"
              />
            </label>
          )}
          <div className="flex gap-2 sm:ml-auto">
            <button type="button" onClick={onClose} className="h-11 flex-1 rounded-full border border-castle-200 bg-white px-5 font-semibold hover:bg-castle-50 sm:flex-none">
              Cancel
            </button>
            <button
              type="button"
              disabled={!chosen}
              onClick={() => chosen && onSelect(chosen, alt)}
              className="h-11 flex-1 rounded-full bg-castle-600 px-6 font-semibold text-white hover:bg-castle-700 disabled:opacity-50 sm:flex-none"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

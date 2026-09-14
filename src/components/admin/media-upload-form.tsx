"use client";

import { useActionState, useRef, useState } from "react";
import { uploadMediaForm } from "@/app/(admin)/admin/blog-actions";
import { IconUpload } from "@/components/admin/admin-icons";
import { FormAlert, SubmitButton } from "@/components/forms/fields";
import { initialActionState } from "@/lib/action-state";
import { IMAGE_ACCEPT } from "@/lib/blog-shared";
import { cn } from "@/lib/cn";

export function MediaUploadForm() {
  const [state, formAction] = useActionState(uploadMediaForm, initialActionState);
  const [names, setNames] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  return (
    <form action={formAction} onSubmit={() => setNames([])} className="space-y-4">
      {state.status === "success" && (
        <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {state.message}
        </p>
      )}
      {state.status === "error" && <FormAlert message={state.message} />}

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (input.current && e.dataTransfer.files.length) {
            input.current.files = e.dataTransfer.files;
            setNames(Array.from(e.dataTransfer.files, (f) => f.name));
          }
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-5 py-8 text-center transition-colors",
          dragging ? "border-castle-500 bg-castle-50" : "border-castle-200 hover:border-castle-400 hover:bg-castle-50/60",
        )}
      >
        <IconUpload className="h-7 w-7 text-castle-600" />
        <span className="font-semibold">{names.length ? names.join(", ") : "Drop images here, or tap to choose"}</span>
        <span className="text-sm text-ink/55">JPEG, PNG or WebP · up to 3 MB each · 10 at a time</span>
        <input
          ref={input}
          type="file"
          name="file"
          multiple
          accept={IMAGE_ACCEPT}
          className="sr-only"
          onChange={(e) => setNames(Array.from(e.target.files ?? [], (f) => f.name))}
        />
      </label>

      <SubmitButton pendingLabel="Uploading…" className="w-full sm:w-auto">
        Upload
      </SubmitButton>
    </form>
  );
}

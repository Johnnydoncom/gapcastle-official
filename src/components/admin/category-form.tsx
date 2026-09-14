"use client";

import { useActionState, useState } from "react";
import { saveCategory } from "@/app/(admin)/admin/blog-actions";
import { FormAlert, SubmitButton, TextareaField, TextField } from "@/components/forms/fields";
import { initialActionState } from "@/lib/action-state";
import { slugify } from "@/lib/blog-shared";

type Category = { id: number; name: string; slug: string; description: string | null };

export function CategoryForm({ category }: { category: Category | null }) {
  const [attempt, setAttempt] = useState(0);
  return <Inner key={attempt} category={category} onReset={() => setAttempt((n) => n + 1)} />;
}

function Inner({ category, onReset }: { category: Category | null; onReset: () => void }) {
  const [state, formAction] = useActionState(saveCategory, initialActionState);
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};
  const [name, setName] = useState(v.name ?? category?.name ?? "");

  if (state.status === "success" && !category) {
    return (
      <div className="space-y-4">
        <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {state.message}
        </p>
        <button type="button" onClick={onReset} className="text-sm font-semibold text-castle-600 hover:underline">
          Add another category
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.status === "success" && (
        <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {state.message}
        </p>
      )}
      {state.status === "error" && <FormAlert message={state.message} />}
      {category && <input type="hidden" name="id" value={category.id} />}
      <TextField name="name" label="Name" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} error={e.name} />
      <TextField
        name="slug"
        label="Web address"
        optional
        hint={`Used in /blog?category=… — defaults to “${slugify(name, 100) || "category-name"}”.`}
        defaultValue={v.slug ?? category?.slug ?? ""}
        maxLength={100}
        error={e.slug}
      />
      <TextareaField
        name="description"
        label="Description"
        optional
        rows={3}
        maxLength={300}
        defaultValue={v.description ?? category?.description ?? ""}
        error={e.description}
      />
      <SubmitButton pendingLabel="Saving…" className="w-full sm:w-auto">
        {category ? "Save category" : "Add category"}
      </SubmitButton>
    </form>
  );
}

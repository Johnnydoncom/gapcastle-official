/** Shape every form server action returns to `useActionState`. */
export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Human-readable reference such as GC-SCH-7K4Q2M, shown on success. */
  reference?: string;
  /** First error per field, keyed by input name. */
  fieldErrors?: Record<string, string>;
  /** Submitted values, echoed back so a failed no-JS submission keeps the input. */
  values?: Record<string, string>;
};

export const initialActionState: ActionState = { status: "idle" };

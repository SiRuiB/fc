export function StatusPill({ status }: { status: string }) {
  const base =
    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium";

  const s = (status || "").toUpperCase();

  if (s === "APPROVED") {
    return (
      <span className={`${base} border-green-200 bg-green-50 text-green-700`}>
        APPROVED
      </span>
    );
  }

  if (s === "REVIEW") {
    return (
      <span className={`${base} border-yellow-200 bg-yellow-50 text-yellow-800`}>
        REVIEW
      </span>
    );
  }

  if (s === "BLOCKED") {
    return (
      <span className={`${base} border-red-200 bg-red-50 text-red-700`}>
        BLOCKED
      </span>
    );
  }

  // default: DRAFT or unknown
  return (
    <span className={`${base} border-neutral-200 bg-neutral-50 text-neutral-700`}>
      {(s || "DRAFT") as string}
    </span>
  );
}
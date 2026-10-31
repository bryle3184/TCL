import { cn, statusTone } from "@/lib/utils";

export function StatusBadge({
  status,
  className,
}: {
  status?: string | null;
  className?: string;
}) {
  if (!status) return <span className="text-muted-foreground">—</span>;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        statusTone(status),
        className,
      )}
    >
      {status}
    </span>
  );
}

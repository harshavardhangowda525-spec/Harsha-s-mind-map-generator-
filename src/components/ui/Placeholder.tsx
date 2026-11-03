import { cn } from "@/lib/utils";

/** Visible marker for content that must be verified before launch. */
export function PlaceholderTag({ children = "Placeholder", className }: { children?: React.ReactNode; className?: string }) {
  return <span className={cn("placeholder-tag", className)}>{children}</span>;
}

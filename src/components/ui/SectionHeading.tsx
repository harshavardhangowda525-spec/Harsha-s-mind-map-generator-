import { cn } from "@/lib/utils";

type Props = {
  eyebrow: string;
  index?: string;
  lines: string[];
  intro?: React.ReactNode;
  align?: "left" | "split";
  className?: string;
  id?: string;
};

/** Editorial section header: index + eyebrow, massive headline, optional intro. */
export function SectionHeading({ eyebrow, index, lines, intro, align = "split", className, id }: Props) {
  return (
    <div
      className={cn(
        "grid gap-8",
        align === "split" && "lg:grid-cols-[1.4fr_1fr] lg:items-end",
        className,
      )}
    >
      <div>
        <p className="eyebrow mb-6" data-reveal>
          {index && <span className="text-ember tabular-nums">{index}</span>}
          {eyebrow}
        </p>
        <h2 id={id} className="display text-[clamp(2.75rem,8.5vw,7.25rem)] text-chrome">
          {lines.map((l, i) => (
            <span key={l} className="block overflow-hidden pb-[0.04em]">
              <span className={cn("block", i % 2 === 1 && "text-metal")} data-reveal style={{ ["--d" as string]: i * 110 }}>
                {l}
              </span>
            </span>
          ))}
        </h2>
      </div>
      {intro && (
        <div className="max-w-md text-base leading-relaxed text-mute lg:pb-3 lg:justify-self-end" data-reveal style={{ ["--d" as string]: 200 }}>
          {intro}
        </div>
      )}
    </div>
  );
}

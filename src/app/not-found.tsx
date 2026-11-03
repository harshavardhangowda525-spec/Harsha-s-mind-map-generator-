import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[100svh] place-items-center bg-ink px-4 text-center">
      <div>
        <p className="display text-[clamp(6rem,30vw,16rem)] leading-none text-outline">404</p>
        <h1 className="display mt-4 text-4xl text-chrome">Page not found.</h1>
        <p className="mt-3 text-mute">This page skipped leg day. Let&apos;s get you back on track.</p>
        <Link href="/" className="mt-8 inline-flex min-h-12 items-center bg-ember px-7 text-sm font-bold uppercase tracking-[0.2em] text-[#0b0b0b]">
          Back to home
        </Link>
      </div>
    </main>
  );
}

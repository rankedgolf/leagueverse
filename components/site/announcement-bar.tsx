import Link from "next/link";

export function AnnouncementBar() {
  return (
    <div className="border-b border-violet-800 bg-violet-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-2 text-center">
        <Link
          href="/pricing"
          className="text-sm font-semibold text-violet-100 transition hover:text-white"
        >
          🚀 Founding Commissioner Pass • $19 • Sleeper Integration Available Now
        </Link>
      </div>
    </div>
  );
}
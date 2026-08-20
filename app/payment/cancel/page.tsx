import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center">
        <h1 className="text-4xl font-bold">
          Checkout Cancelled
        </h1>

        <p className="mt-4 text-slate-400">
          Your league has not been activated.
        </p>

        <Link
          href="/pricing"
          className="mt-8 inline-block rounded-lg border border-slate-700 px-6 py-3 font-semibold"
        >
          Return to Pricing
        </Link>
      </div>
    </main>
  );
}
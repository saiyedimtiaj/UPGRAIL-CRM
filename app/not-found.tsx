import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <p className="font-mono text-sm font-medium tracking-widest text-emerald-700">
          404
        </p>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          We couldn&apos;t find that page
        </h1>
        <p className="text-sm text-slate-600">
          The link may be out of date, or the record may have been removed.
        </p>
        <Link
          href="/admin"
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}

import { Lock } from "lucide-react"

export function LockScreen({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/20 bg-brand-card text-emerald-400">
        <Lock className="h-7 w-7" />
      </div>
      <div>
        <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>
  )
}

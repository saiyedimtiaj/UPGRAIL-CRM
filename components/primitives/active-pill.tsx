

export function ActivePill({ active }: { active: boolean }) {
  return (
    <span
      className={
        active
          ? "inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-700"
          : "inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-500"
      }
    >
      {active ? "ACTIVE" : "DEACTIVATED"}
    </span>
  )
}

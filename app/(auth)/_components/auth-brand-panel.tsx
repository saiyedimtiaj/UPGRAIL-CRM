import { CheckCircle2, Sparkles } from "lucide-react"

import { BrandMark } from "@/components/layout/brand-mark"
import { Bdt } from "@/components/primitives/money"

export function AuthBrandPanel() {
  return (
    <div className="emerald-ambient-mesh relative hidden flex-col justify-between overflow-hidden border-r border-white/10 bg-gradient-to-br from-[#0b2417] via-[#071910] to-[#020b06] p-12 lg:flex lg:w-1/2">
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-emerald-600/20 blur-3xl" />

      <div className="relative z-10 flex items-center gap-3">
        <BrandMark size="lg" />
        <div>
          <span className="flex items-center gap-1 text-2xl font-extrabold tracking-tight text-white">
            AdFund<span className="font-medium text-emerald-400">Global</span>
          </span>
          <span className="block font-mono text-[11px] tracking-wider text-emerald-400/80 uppercase">
            Institutional FX &amp; Ad Treasury
          </span>
        </div>
      </div>

      <div className="relative z-10 my-auto space-y-6 py-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Full System Specification Compliant</span>
          </div>
          <h2 className="text-3xl leading-tight font-black tracking-tight text-white xl:text-4xl">
            Real-time USD Sourcing &amp; <br />
            <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Audited Ad Account Spread
            </span>
          </h2>
          <p className="max-w-lg text-sm leading-relaxed text-zinc-300">
            Automated multi-tier currency finalization across direct BDT
            sellers, card % rate conduits, and TRC20 USDT settlements.
          </p>
        </div>

        <div className="max-w-md space-y-4 rounded-2xl border border-emerald-500/30 bg-[#0e1c15]/90 p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400" />
              <span className="font-mono text-xs font-bold tracking-wider text-white uppercase">
                Live Trading Engine
              </span>
            </div>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-400">
              +<Bdt value={3.3} /> / USD SPREAD
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-zinc-400">Client Direct Rate</div>
              <div className="mt-0.5 font-mono font-bold text-white">
                <Bdt value={125.8} />
                /$1
              </div>
            </div>
            <div>
              <div className="text-zinc-400">Nazmul Sourcing Rate</div>
              <div className="mt-0.5 font-mono font-bold text-white">
                <Bdt value={122.5} />
                /$1
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-2 text-xs text-emerald-400/80">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>Immutable Audit Trail &amp; Role Permissions</span>
        <span className="ml-auto font-mono text-[10px] text-zinc-500">
          v2.4 Production Engine
        </span>
      </div>
    </div>
  )
}

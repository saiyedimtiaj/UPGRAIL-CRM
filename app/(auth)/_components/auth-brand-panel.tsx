import { CheckCircle2, ShieldCheck } from "lucide-react"

import { AuthLogo } from "@/app/(auth)/_components/auth-logo"

export function AuthBrandPanel() {
  return (
    <>
      {}
      <div className="relative overflow-hidden bg-[#0b1524] px-5 pt-[calc(env(safe-area-inset-top)+1.75rem)] pb-7 sm:px-8 lg:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl"
        />
        <div className="relative flex items-center gap-3">
          <AuthLogo size={40} priority />
          <div className="min-w-0">
            <p className="truncate text-base font-bold tracking-tight text-white">
              AdFund Global
            </p>
            <p className="truncate font-mono text-[10px] tracking-[0.14em] text-sky-300/80 uppercase">
              Institutional FX &amp; Ad Treasury
            </p>
          </div>
        </div>
      </div>

      {}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0b1524] p-10 lg:flex lg:w-1/2 xl:p-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-24 h-[26rem] w-[26rem] rounded-full bg-sky-500/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/3 -right-28 h-[24rem] w-[24rem] rounded-full bg-blue-500/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 left-1/4 h-80 w-80 rounded-full bg-teal-500/15 blur-3xl"
        />

        <div className="relative z-10 flex items-center gap-3.5">
          <AuthLogo size={52} priority />
          <div>
            <p className="text-xl font-bold tracking-tight text-white">
              AdFund Global
            </p>
            <p className="font-mono text-[10px] tracking-[0.16em] text-sky-300/80 uppercase">
              Institutional FX &amp; Ad Treasury
            </p>
          </div>
        </div>

        <div className="relative z-10 my-auto space-y-7 py-10">
          <div className="space-y-4">
            <h2 className="text-[2rem] leading-[1.12] font-bold tracking-tight text-white xl:text-[2.5rem]">
              Real-time USD sourcing and
              <br />
              <span className="bg-gradient-to-r from-sky-300 via-cyan-300 to-teal-200 bg-clip-text text-transparent">
                audited account spread
              </span>
            </h2>
            <p className="max-w-md text-[0.9375rem] leading-relaxed text-slate-400">
              Automated multi-tier currency finalization across direct BDT
              sellers, card-rate conduits, and TRC20 USDT settlements.
            </p>
          </div>

          <div className="max-w-md space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3.5">
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400" />
                </span>
                <span className="font-mono text-[11px] font-semibold tracking-[0.12em] text-white uppercase">
                  Live trading engine
                </span>
              </span>
              <span className="rounded-md bg-sky-400/10 px-2 py-1 font-mono text-[11px] font-semibold text-sky-300 tabular-nums">
                +৳3.30/USD
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-slate-400">Client direct rate</dt>
                <dd className="mt-1 font-mono text-sm font-semibold text-white tabular-nums">
                  ৳125.80<span className="text-slate-500">/$1</span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Nazmul sourcing rate</dt>
                <dd className="mt-1 font-mono text-sm font-semibold text-white tabular-nums">
                  ৳122.50<span className="text-slate-500">/$1</span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
            Immutable audit trail
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
            Role-based permissions
          </span>
        </div>
      </div>
    </>
  )
}

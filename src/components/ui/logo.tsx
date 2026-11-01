import { cn } from '@/lib/utils'

export function Logo({
  className,
  height = 28,
  collapsed = false,
}: {
  className?: string
  height?: number
  collapsed?: boolean
}) {
  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      <div
        className="rounded-lg bg-[#f08327] flex items-center justify-center shrink-0 font-bold text-white shadow-sm"
        style={{ height, width: height }}
      >
        <span className="text-sm font-black tracking-tighter">Z</span>
      </div>
      {!collapsed && (
        <div className="flex items-baseline gap-1.5 overflow-hidden">
          <span className="text-[15px] font-bold text-white tracking-tight">
            Zuno
          </span>
          <span className="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase">
            Admin
          </span>
        </div>
      )}
    </div>
  )
}

import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-lme-surface-soft border border-lme-border", className)}
      {...props}
    />
  )
}

export { Skeleton }

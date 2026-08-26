import { cn } from "../../../../lib/cn";

export function Badge({ className, ...props }) {
  return <span className={cn("inline-flex h-7 items-center rounded-full bg-[#f0f0f0] px-3 text-[13px] font-semibold text-[#4a4a4a]", className)} {...props} />;
}

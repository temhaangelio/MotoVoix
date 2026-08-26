import { cn } from "../../../../lib/cn";

export function Select({ className, children, ...props }) {
  return (
    <select className={cn("h-12 w-full rounded-2xl border border-transparent bg-[#f5f5f5] px-4 text-[15px] outline-none focus:border-black focus:bg-white", className)} {...props}>
      {children}
    </select>
  );
}

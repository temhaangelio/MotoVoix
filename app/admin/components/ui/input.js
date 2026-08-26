import { cn } from "../../../../lib/cn";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn("h-12 w-full rounded-2xl border border-transparent bg-[#f5f5f5] px-4 text-[15px] outline-none transition focus:border-black focus:bg-white disabled:opacity-50", className)}
      {...props}
    />
  );
}

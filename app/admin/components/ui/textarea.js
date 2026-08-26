import { cn } from "../../../../lib/cn";

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn("min-h-28 w-full resize-y rounded-2xl border border-transparent bg-[#f5f5f5] px-4 py-3 text-[15px] outline-none transition focus:border-black focus:bg-white disabled:opacity-50", className)}
      {...props}
    />
  );
}

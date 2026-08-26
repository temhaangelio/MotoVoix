import { cn } from "../../../../lib/cn";

export function TableWrap({ className, ...props }) {
  return <div className={cn("w-full overflow-x-auto", className)} {...props} />;
}

export function Table({ className, ...props }) {
  return <table className={cn("w-full min-w-[720px] border-collapse text-left [&_tbody_tr:last-child_td]:border-b-0", className)} {...props} />;
}

export function Th({ className, ...props }) {
  return <th className={cn("border-b border-[#f1f1f1] px-2 pb-3 text-[13px] font-semibold text-[#a1a1a1]", className)} {...props} />;
}

export function Td({ className, ...props }) {
  return <td className={cn("border-b border-[#f5f5f5] px-2 py-3 text-[14px]", className)} {...props} />;
}

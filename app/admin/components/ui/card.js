import { cn } from "../../../../lib/cn";

export function Card({ className, ...props }) {
  return <div className={cn("card", className)} {...props} />;
}

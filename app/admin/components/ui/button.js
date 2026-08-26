import { cn } from "../../../../lib/cn";

const variants = {
      primary: "bg-black !text-white hover:bg-neutral-800",
  secondary: "bg-[#f5f5f5] text-black hover:bg-[#ececec]",
  ghost: "bg-transparent text-[#4a4a4a] hover:bg-white hover:text-black",
  outline: "border border-[#dedede] bg-white text-black hover:bg-[#f7f7f7]",
  destructive: "bg-[#fff1f0] text-[#b42318] hover:bg-[#fee4e2]",
};

const sizes = {
  sm: "min-h-9 px-4 text-[13px]",
  md: "min-h-11 px-5",
  lg: "min-h-12 px-6",
};

export function buttonVariants({ variant = "primary", size = "md", className } = {}) {
  return cn(
    "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50",
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    className,
  );
}

export function Button({ className, variant = "primary", size = "md", type = "button", ...props }) {
  return <button type={type} className={buttonVariants({ variant, size, className })} {...props} />;
}

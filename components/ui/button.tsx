import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("btn", {
  variants: {
    variant: { primary: "bg-ink text-white hover:bg-ink/90", secondary: "bg-surface border border-line text-ink hover:bg-canvas", ghost: "text-ink-2 hover:bg-ink/5", danger: "bg-rose-soft text-rose hover:bg-rose/15" },
    size: { sm: "px-3 py-1.5 text-[13px] rounded-lg", md: "", lg: "px-5 py-3 text-[15px]" },
  },
  defaultVariants: { variant: "primary", size: "md" },
});
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});
Button.displayName = "Button";

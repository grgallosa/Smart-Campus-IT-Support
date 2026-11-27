import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const styles = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md text-[13px] font-medium outline-ac transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-ac text-btt hover:bg-ach",
        outline: "border border-bd2 bg-sf hover:bg-b2",
        ghost: "hover:bg-b2",
        link: "text-acx hover:underline",
      },
      size: { md: "h-8 px-3", sm: "h-7 px-2 text-xs", icon: "h-8 w-8 justify-center" },
    },
    defaultVariants: { variant: "outline", size: "md" },
  }
);

export const Button = ({ variant, size, className, ...p }) => (
  <button type="button" className={cn(styles({ variant, size }), variant === "link" && "h-auto px-0", className)} {...p} />
);

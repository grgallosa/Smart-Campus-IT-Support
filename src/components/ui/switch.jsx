import * as S from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export const Switch = ({ className, ...p }) => (
  <S.Root className={cn("relative h-[18px] w-[30px] shrink-0 rounded-full bg-bd2 outline-ac transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-45 data-[state=checked]:bg-ac", className)} {...p}>
    <S.Thumb className="block size-3.5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[14px]" />
  </S.Root>
);

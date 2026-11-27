import * as T from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = T.Root;
export const TabsContent = T.Content;
export const TabsList = ({ className, ...p }) => <T.List className={cn("flex gap-4 overflow-x-auto border-b border-bd px-4", className)} {...p} />;
export const TabsTrigger = ({ className, ...p }) => (
  <T.Trigger className={cn("-mb-px whitespace-nowrap border-b-2 border-transparent py-2 font-medium text-mu data-[state=active]:border-ac data-[state=active]:text-tx", className)} {...p} />
);

import * as D from "@radix-ui/react-dialog";

export const Dialog = D.Root;
export const DialogClose = D.Close;
export const DialogContent = ({ title, children }) => (
  <D.Portal>
    <D.Overlay className="fixed inset-0 z-40 bg-black/40" />
    <D.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-bd bg-sf p-4 shadow-lg">
      <D.Title className="mb-3 text-sm font-semibold">{title}</D.Title>
      <D.Description className="sr-only">{title}</D.Description>
      {children}
    </D.Content>
  </D.Portal>
);

import { Inbox } from "lucide-react";

export function EmptyState({ title = "No records yet", description = "New records will appear here." }) {
  return (
    <div className="grid min-h-48 place-items-center text-center">
      <div>
        <Inbox className="mx-auto mb-3 text-[#a1a1a1]" />
        <strong className="block">{title}</strong>
        <p className="mt-1 text-sm text-[#a1a1a1]">{description}</p>
      </div>
    </div>
  );
}

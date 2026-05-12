import { ChevronDown } from "lucide-react";

const items = [
  "О доставке",
  "Материалы и детали",
  "Инструкции по уходу",
  "Размерная сетка",
  "Lookbook",
];

export function ProductAccordionSection() {
  return (
    <div className="border-t border-neutral-200">
      {items.map((item) => (
        <button
          key={item}
          className="flex h-14 w-full items-center justify-between border-b border-neutral-200 text-left text-sm font-semibold"
        >
          <span>{item}</span>
          <ChevronDown size={18} />
        </button>
      ))}
    </div>
  );
}
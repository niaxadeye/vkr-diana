import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { ProductAccordionItem } from "@/entities/product/api/product.api";
import { cn } from "@/shared/lib/cn";

type ProductAccordionSectionProps = {
  items?: ProductAccordionItem[] | null;
};

export function ProductAccordionSection({ items }: ProductAccordionSectionProps) {
  const visibleItems = useMemo(() => {
    return (items ?? [])
      .filter((item) => item.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [items]);

  const defaultOpenId = useMemo(() => {
    const defaultItem = visibleItems.find((item) => item.isOpenByDefault);
    return defaultItem?.id ?? visibleItems[0]?.id ?? null;
  }, [visibleItems]);

  const [openId, setOpenId] = useState<string | null>(defaultOpenId);

  useEffect(() => {
    setOpenId(defaultOpenId);
  }, [defaultOpenId]);

  if (visibleItems.length === 0) {
    return null;
  }

  function toggleItem(id: string) {
    setOpenId((currentId) => (currentId === id ? null : id));
  }

  return (
    <div className="w-full">
      {visibleItems.map((item) => {
        const isOpen = openId === item.id;

        return (
          <article
            key={item.id}
            className={cn("border-b border-[#e5e5e5] first:border-t-0", !isOpen && "hover:underline hover:underline-offset-[3px]")}
          >
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              className="flex w-full items-center justify-between gap-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span
                className={cn(
                  "text-[16px] leading-6 text-black transition",
                  isOpen ? "font-[450]" : "font-[450]",
                  !isOpen && "hover:underline hover:underline-offset-[3px]",
                )}
              >
                {item.title}
              </span>

              <ChevronDown
                size={18}
                strokeWidth={1.8}
                className={cn(
                  "shrink-0 text-black transition-transform duration-300 ease-out",
                  isOpen && "rotate-180",
                )}
              />
            </button>

            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="pb-5">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => (
                        <p className="text-[15px] leading-[22px] text-black">
                          {children}
                        </p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-black">
                          {children}
                        </strong>
                      ),
                      ul: ({ children }) => (
                        <ul className="my-4 list-disc space-y-2 pl-5 text-[15px] leading-[22px] text-black">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="my-4 list-decimal space-y-2 pl-5 text-[15px] leading-[22px] text-black">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="pl-1 text-[15px] leading-[22px] text-black">
                          {children}
                        </li>
                      ),
                      a: ({ children, href }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-black underline underline-offset-[3px]"
                        >
                          {children}
                        </a>
                      ),
                      h2: ({ children }) => (
                        <h2 className="mb-3 mt-5 text-[18px] font-semibold leading-7 text-black">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="mb-3 mt-5 text-[16px] font-semibold leading-6 text-black">
                          {children}
                        </h3>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="my-4 border-l-2 border-black pl-4 text-[15px] leading-[22px] text-[#666666]">
                          {children}
                        </blockquote>
                      ),
                      table: ({ children }) => (
                        <div className="my-4 overflow-x-auto">
                          <table className="w-full border-collapse text-[14px]">
                            {children}
                          </table>
                        </div>
                      ),
                      th: ({ children }) => (
                        <th className="border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-left font-semibold text-black">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="border border-[#e5e5e5] px-3 py-2 text-black">
                          {children}
                        </td>
                      ),
                    }}
                  >
                    {item.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
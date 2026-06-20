import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/shared/lib/cn";

type MarkdownProps = {
  children: string;
  className?: string;
};

/**
 * Единый рендер markdown для всего проекта.
 * remarkGfm включает таблицы, зачёркивание, списки задач и автоссылки.
 * Класс .markdown-content (в index.css) задаёт типографику, т.к. Tailwind preflight
 * сбрасывает стили у заголовков, списков, strong и т.д.
 * Используется и на публичных страницах, и в превью админ-редактора —
 * чтобы редактор и сайт выглядели одинаково.
 */
export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={cn("markdown-content", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getAdminInformationPages, updateInformationPage } from "@/entities/information/api/information.admin.api";
import type { InformationPage as InformationPageType } from "@/entities/information/model/information.types";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { Markdown } from "@/shared/ui/markdown/Markdown";

export function InformationAdminPage() {
  const [pages, setPages] = useState<InformationPageType[]>([]);
  const [selectedPage, setSelectedPage] = useState<InformationPageType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getAdminInformationPages();
        setPages(data);
        setSelectedPage(data[0] ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const handleSave = async () => {
    if (!selectedPage) return;
    setSaving(true);
    try {
      const updated = await updateInformationPage(selectedPage.slug, {
        title: selectedPage.title,
        content: selectedPage.content,
        sortOrder: selectedPage.sortOrder,
        isActive: selectedPage.isActive,
      });

      // Обновляем локальное состояние ответом сервера, чтобы правки
      // не «терялись» при переключении вкладок.
      const nextPage = updated ?? selectedPage;
      setSelectedPage(nextPage);
      setPages((current) =>
        current.map((page) =>
          page.slug === nextPage.slug ? nextPage : page,
        ),
      );

      toast.success("Страница сохранена");
    } catch (err) {
      console.error(err);
      toast.error("Не удалось сохранить страницу");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex gap-6 p-6">
      {/* Список страниц */}
      <aside className="w-1/3 border-r border-gray-200">
        {loading ? (
          <div>Загрузка...</div>
        ) : (
          pages.map((page) => (
            <div
              key={page.slug}
              className={`p-2 cursor-pointer ${selectedPage?.slug === page.slug ? "bg-gray-100 font-bold" : ""}`}
              onClick={() => setSelectedPage(page)}
            >
              {page.title}
            </div>
          ))
        )}
      </aside>

      {/* Редактор */}
      <section className="w-2/3">
        {selectedPage && (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={selectedPage.title}
              onChange={(e) => setSelectedPage({ ...selectedPage, title: e.target.value })}
              className="border p-2 rounded"
              placeholder="Название"
            />
            <input
              type="text"
              value={selectedPage.slug}
              onChange={(e) => setSelectedPage({ ...selectedPage, slug: e.target.value })}
              className="border p-2 rounded"
              placeholder="Slug"
            />
            <MdEditor
              value={selectedPage.content}
              style={{ height: "400px" }}
              renderHTML={(text) => <Markdown>{text}</Markdown>}
              onChange={({ text }) => setSelectedPage({ ...selectedPage, content: text })}
            />
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Сохраняем..." : "Сохранить"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
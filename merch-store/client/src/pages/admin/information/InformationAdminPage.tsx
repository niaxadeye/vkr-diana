import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAdminInformationPages, updateInformationPage } from "@/entities/information/api/information.admin.api";
import type { InformationPage as InformationPageType } from "@/entities/information/model/information.types";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";

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
      await updateInformationPage(selectedPage.slug, selectedPage);
      alert("Сохранено!");
    } catch (err) {
      console.error(err);
      alert("Ошибка при сохранении");
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
              renderHTML={(text) => <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>}
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
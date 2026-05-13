import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";

import {
  getAdminHomeHero,
  updateAdminHomeHero,
  uploadHomeHeroMedia,
} from "@/entities/home/api/home.api";
import type { HomeHeroBanner } from "@/entities/home/model/home.types";
import { getMediaUrl } from "@/shared/lib/getMediaUrl";

type HomeHeroForm = Pick<
  HomeHeroBanner,
  | "title"
  | "imageDesktop"
  | "imageMobile"
  | "videoDesktop"
  | "videoMobile"
  | "ctaLabel"
  | "ctaHref"
  | "isActive"
>;

const emptyForm: HomeHeroForm = {
  title: "",
  imageDesktop: "",
  imageMobile: "",
  videoDesktop: "",
  videoMobile: "",
  ctaLabel: "",
  ctaHref: "",
  isActive: true,
};

export function AdminHomePage() {
  const [form, setForm] = useState<HomeHeroForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<keyof HomeHeroForm | null>(
    null,
  );
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadHero() {
      try {
        setIsLoading(true);
        setError("");

        const hero = await getAdminHomeHero();

        setForm({
          title: hero.title,
          imageDesktop: hero.imageDesktop,
          imageMobile: hero.imageMobile,
          videoDesktop: hero.videoDesktop ?? "",
          videoMobile: hero.videoMobile ?? "",
          ctaLabel: hero.ctaLabel,
          ctaHref: hero.ctaHref,
          isActive: hero.isActive,
        });
      } catch (loadError) {
        console.error("LOAD_ADMIN_HOME_HERO_ERROR:", loadError);
        setError("Не удалось загрузить настройки главной страницы");
      } finally {
        setIsLoading(false);
      }
    }

    void loadHero();
  }, []);

  function updateField<K extends keyof HomeHeroForm>(
    key: K,
    value: HomeHeroForm[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setSuccessMessage("");
  }

  async function handleUpload(
    event: ChangeEvent<HTMLInputElement>,
    field: keyof HomeHeroForm,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploadingField(field);
      setError("");
      setSuccessMessage("");

      const uploaded = await uploadHomeHeroMedia(file);

      updateField(field, uploaded.url as never);
    } catch (uploadError) {
      console.error("UPLOAD_HOME_HERO_MEDIA_ERROR:", uploadError);
      setError("Не удалось загрузить файл");
    } finally {
      setUploadingField(null);
      event.target.value = "";
    }
  }

  function validateForm() {
    if (!form.title.trim()) return "Введите заголовок hero-блока";
    if (!form.ctaLabel.trim()) return "Введите текст кнопки";
    if (!form.ctaHref.trim()) return "Введите ссылку кнопки";
    if (!form.imageDesktop.trim()) return "Добавьте desktop-изображение";
    if (!form.imageMobile.trim()) return "Добавьте mobile-изображение";

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setSuccessMessage("");

      await updateAdminHomeHero({
        title: form.title.trim(),
        imageDesktop: form.imageDesktop.trim(),
        imageMobile: form.imageMobile.trim(),
        videoDesktop: form.videoDesktop?.trim() || null,
        videoMobile: form.videoMobile?.trim() || null,
        ctaLabel: form.ctaLabel.trim(),
        ctaHref: form.ctaHref.trim(),
        isActive: form.isActive,
      });

      setSuccessMessage("Главная страница сохранена");
    } catch (saveError) {
      console.error("SAVE_ADMIN_HOME_HERO_ERROR:", saveError);
      setError("Не удалось сохранить главную страницу");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="p-4 md:p-8">
        <div className="rounded-[28px] bg-white p-6 text-[15px] text-neutral-500">
          Загружаем настройки главной страницы...
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 md:p-8">
      <div className="mx-auto max-w-[1480px]">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-neutral-400">
              Админ-панель
            </p>

            <h1 className="mt-2 text-[36px] font-medium leading-[42px] tracking-[-0.04em] text-black">
              Главная страница
            </h1>

            <p className="mt-3 max-w-[640px] text-[15px] leading-6 text-neutral-500">
              Управление hero-блоком на главной странице: фоновые изображения,
              видео, заголовок, кнопка и ссылка.
            </p>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-200 px-5 text-[14px] font-medium text-black transition hover:bg-neutral-50"
          >
            Открыть главную
          </a>
        </div>

        {error && (
          <div className="mb-5 rounded-[20px] bg-red-50 px-5 py-4 text-[14px] font-medium text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-5 rounded-[20px] bg-green-50 px-5 py-4 text-[14px] font-medium text-green-700">
            {successMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_460px]"
        >
          <section className="rounded-[28px] bg-white p-5 md:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[22px] font-medium tracking-[-0.03em] text-black">
                  Контент hero-блока
                </h2>

                <p className="mt-1 text-[14px] text-neutral-500">
                  Эти данные отображаются на главной странице магазина.
                </p>
              </div>

              <label className="flex h-10 items-center gap-2 rounded-full bg-neutral-100 px-4 text-[14px] font-medium text-black">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    updateField("isActive", event.target.checked)
                  }
                />
                Активен
              </label>
            </div>

            <div className="grid gap-5">
              <Field label="Заголовок">
                <input
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  className="input"
                  placeholder="TEAM SPIRIT L3GACY"
                />
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Текст кнопки">
                  <input
                    value={form.ctaLabel}
                    onChange={(event) =>
                      updateField("ctaLabel", event.target.value)
                    }
                    className="input"
                    placeholder="К коллекции"
                  />
                </Field>

                <Field label="Ссылка кнопки">
                  <input
                    value={form.ctaHref}
                    onChange={(event) =>
                      updateField("ctaHref", event.target.value)
                    }
                    className="input"
                    placeholder="/collections/team-spirit-l3g4cy"
                  />
                </Field>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <MediaField
                  label="Desktop изображение"
                  value={form.imageDesktop}
                  field="imageDesktop"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  isUploading={uploadingField === "imageDesktop"}
                  onChange={updateField}
                  onUpload={handleUpload}
                />

                <MediaField
                  label="Mobile изображение"
                  value={form.imageMobile}
                  field="imageMobile"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  isUploading={uploadingField === "imageMobile"}
                  onChange={updateField}
                  onUpload={handleUpload}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <MediaField
                  label="Desktop видео"
                  value={form.videoDesktop ?? ""}
                  field="videoDesktop"
                  accept="video/webm,video/mp4"
                  isUploading={uploadingField === "videoDesktop"}
                  onChange={updateField}
                  onUpload={handleUpload}
                />

                <MediaField
                  label="Mobile видео"
                  value={form.videoMobile ?? ""}
                  field="videoMobile"
                  accept="video/webm,video/mp4"
                  isUploading={uploadingField === "videoMobile"}
                  onChange={updateField}
                  onUpload={handleUpload}
                />
              </div>
            </div>
          </section>

          <aside className="rounded-[28px] bg-white p-5 md:p-7">
            <h2 className="text-[22px] font-medium tracking-[-0.03em] text-black">
              Превью
            </h2>

            <p className="mt-1 text-[14px] text-neutral-500">
              Быстрая проверка текущих медиа и текста.
            </p>

            <div className="mt-5 overflow-hidden rounded-[24px] border border-neutral-200">
              <div className="relative aspect-square bg-neutral-100">
                {form.videoMobile ? (
                  <video
                    src={getMediaUrl(form.videoMobile)}
                    poster={getMediaUrl(form.imageMobile)}
                    className="h-full w-full object-cover"
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                ) : form.imageMobile ? (
                  <img
                    src={getMediaUrl(form.imageMobile)}
                    alt={form.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[14px] text-neutral-400">
                    Нет mobile media
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="text-[30px] font-medium uppercase leading-[36px] tracking-[-0.04em] text-black">
                  {form.title || "Заголовок"}
                </h3>

                <div className="mt-5 flex h-11 items-center justify-center rounded-full bg-black px-6 text-[15px] font-medium text-white">
                  {form.ctaLabel || "Кнопка"}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-black px-6 text-[15px] font-medium text-white transition hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Сохраняем..." : "Сохранить"}
            </button>
          </aside>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium uppercase tracking-[0.08em] text-neutral-500">
        {label}
      </span>

      {children}
    </label>
  );
}

function MediaField({
  label,
  value,
  field,
  accept,
  isUploading,
  onChange,
  onUpload,
}: {
  label: string;
  value: string;
  field: keyof HomeHeroForm;
  accept: string;
  isUploading: boolean;
  onChange: <K extends keyof HomeHeroForm>(
    key: K,
    value: HomeHeroForm[K],
  ) => void;
  onUpload: (
    event: ChangeEvent<HTMLInputElement>,
    field: keyof HomeHeroForm,
  ) => Promise<void>;
}) {
  return (
    <div>
      <Field label={label}>
        <input
          value={value}
          onChange={(event) => onChange(field, event.target.value as never)}
          className="input"
          placeholder="/uploads/home/file.webm"
        />
      </Field>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-neutral-100 px-4 text-[14px] font-medium text-black transition hover:bg-neutral-200">
          {isUploading ? "Загрузка..." : "Загрузить файл"}

          <input
            type="file"
            accept={accept}
            disabled={isUploading}
            onChange={(event) => void onUpload(event, field)}
            className="hidden"
          />
        </label>

        {value && (
          <button
            type="button"
            onClick={() => onChange(field, "" as never)}
            className="h-10 rounded-full px-4 text-[14px] font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-black"
          >
            Очистить
          </button>
        )}
      </div>
    </div>
  );
}
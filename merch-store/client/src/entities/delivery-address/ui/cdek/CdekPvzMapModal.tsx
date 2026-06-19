import { useEffect, useMemo, useRef, useState } from "react";

import type { CdekOfficeOption } from "@/entities/cdek/api/cdek.api";
import { loadYandexMaps, type YmapsMap } from "@/shared/lib/yandexMaps";

type CdekPvzMapModalProps = {
  open: boolean;
  offices: CdekOfficeOption[];
  selectedCode?: string;
  onClose: () => void;
  onSelect: (office: CdekOfficeOption) => void;
};

function getOfficesWithCoords(offices: CdekOfficeOption[]) {
  return offices.filter(
    (office) =>
      typeof office.latitude === "number" &&
      typeof office.longitude === "number",
  );
}

export function CdekPvzMapModal({
  open,
  offices,
  selectedCode,
  onClose,
  onSelect,
}: CdekPvzMapModalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<YmapsMap | null>(null);

  // Актуальный onSelect без пересоздания карты.
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const [activeCode, setActiveCode] = useState<string | undefined>(selectedCode);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  const officesWithCoords = useMemo(
    () => getOfficesWithCoords(offices),
    [offices],
  );

  const activeOffice = officesWithCoords.find(
    (office) => office.code === activeCode,
  );

  useEffect(() => {
    if (open) {
      setActiveCode(selectedCode);
    }
  }, [open, selectedCode]);

  // Инициализация карты и расстановка меток.
  useEffect(() => {
    if (!open || officesWithCoords.length === 0) {
      return;
    }

    let cancelled = false;

    setStatus("loading");

    loadYandexMaps()
      .then((ymaps) => {
        if (cancelled || !containerRef.current) {
          return;
        }

        // Пересоздаём карту заново при каждом открытии.
        if (mapRef.current) {
          mapRef.current.destroy();
          mapRef.current = null;
        }

        const first = officesWithCoords[0];
        const map = new ymaps.Map(
          containerRef.current,
          {
            center: [first.latitude as number, first.longitude as number],
            zoom: 12,
            controls: ["zoomControl", "geolocationControl"],
          },
          { suppressMapOpenBlock: true },
        );

        mapRef.current = map;

        for (const office of officesWithCoords) {
          const isActive = office.code === activeCode;

          const placemark = new ymaps.Placemark(
            [office.latitude as number, office.longitude as number],
            {
              balloonContentHeader: office.name,
              balloonContentBody: office.fullAddress || office.address,
              balloonContentFooter: office.workTime ?? "",
              hintContent: office.name,
            },
            {
              preset: isActive
                ? "islands#blackDotIcon"
                : "islands#redDotIcon",
            },
          );

          placemark.events.add("click", () => {
            setActiveCode(office.code);
          });

          map.geoObjects.add(placemark);
        }

        // Подгоняем область под все метки.
        const bounds = map.geoObjects.getBounds();
        if (bounds) {
          map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 40 });
        }

        setStatus("ready");
      })
      .catch((error) => {
        console.error("YANDEX_MAPS_INIT_ERROR:", error);
        if (!cancelled) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
    // activeCode намеренно не в зависимостях: подсветку выбранной метки
    // не перерисовываем целиком, чтобы не пересоздавать карту на каждый клик.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, officesWithCoords]);

  if (!open) {
    return null;
  }

  function handleConfirm() {
    if (activeOffice) {
      onSelectRef.current(activeOffice);
      onClose();
    }
  }

  const hasOffices = officesWithCoords.length > 0;

  return (
    <div className="fixed inset-0 z-[130]">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />

      <div className="absolute left-1/2 top-1/2 flex h-[calc(100vh-32px)] max-h-[760px] w-[calc(100%-24px)] max-w-[900px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-[#e5e5e5] px-6 py-4">
          <h2 className="text-[20px] font-[500] tracking-[-0.03em] text-[#060606]">
            Пункт выдачи на карте
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f0f0] text-[#060606] transition hover:bg-[#060606] hover:text-white"
            aria-label="Закрыть карту"
          >
            ✕
          </button>
        </div>

        <div className="relative flex-1">
          {!hasOffices ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-[15px] text-[#666666]">
              Для этого города нет пунктов выдачи с координатами на карте.
            </div>
          ) : (
            <>
              <div ref={containerRef} className="h-full w-full" />

              {status === "loading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-[15px] text-[#666666]">
                  Загружаем карту...
                </div>
              )}

              {status === "error" && (
                <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-[15px] text-[#666666]">
                  Не удалось загрузить карту. Выберите пункт выдачи из списка.
                </div>
              )}
            </>
          )}
        </div>

        <div className="border-t border-[#e5e5e5] px-6 py-4">
          {activeOffice ? (
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium text-[#060606]">
                  {activeOffice.name}
                </p>
                <p className="truncate text-[14px] text-[#666666]">
                  {activeOffice.fullAddress || activeOffice.address}
                </p>
              </div>

              <button
                type="button"
                onClick={handleConfirm}
                className="h-11 shrink-0 rounded-full bg-[#060606] px-6 text-[15px] font-[500] text-white transition hover:bg-neutral-800"
              >
                Выбрать ПВЗ
              </button>
            </div>
          ) : (
            <p className="text-[14px] text-[#666666]">
              Нажмите на пункт выдачи на карте, чтобы выбрать его.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

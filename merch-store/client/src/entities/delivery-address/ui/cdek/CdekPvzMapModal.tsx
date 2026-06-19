import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { CdekOfficeOption } from "@/entities/cdek/api/cdek.api";

type CdekPvzMapModalProps = {
  open: boolean;
  offices: CdekOfficeOption[];
  selectedCode?: string;
  onClose: () => void;
  onSelect: (office: CdekOfficeOption) => void;
};

// Пин ПВЗ. Используем divIcon, т.к. дефолтные png-иконки Leaflet ломаются в сборке.
function createPin(active: boolean) {
  const color = active ? "#060606" : "#C8102E";

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 28px; height: 36px;
        transform: translate(-50%, -100%);
        filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));
      ">
        <svg viewBox="0 0 28 36" width="28" height="36" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 0C6.27 0 0 6.27 0 14c0 9.5 14 22 14 22s14-12.5 14-22C28 6.27 21.73 0 14 0z" fill="${color}"/>
          <circle cx="14" cy="14" r="5" fill="#ffffff"/>
        </svg>
      </div>
    `,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
  });
}

function getOfficesWithCoords(offices: CdekOfficeOption[]) {
  return offices.filter(
    (office) =>
      typeof office.latitude === "number" &&
      typeof office.longitude === "number",
  );
}

// Подгоняет видимую область под все пины при смене списка ПВЗ.
function FitBounds({ offices }: { offices: CdekOfficeOption[] }) {
  const map = useMap();

  useEffect(() => {
    const points = getOfficesWithCoords(offices).map(
      (office) => [office.latitude as number, office.longitude as number] as [number, number],
    );

    if (points.length === 0) {
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }

    map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
  }, [offices, map]);

  return null;
}

export function CdekPvzMapModal({
  open,
  offices,
  selectedCode,
  onClose,
  onSelect,
}: CdekPvzMapModalProps) {
  const [activeCode, setActiveCode] = useState<string | undefined>(selectedCode);

  useEffect(() => {
    if (open) {
      setActiveCode(selectedCode);
    }
  }, [open, selectedCode]);

  const officesWithCoords = useMemo(
    () => getOfficesWithCoords(offices),
    [offices],
  );

  const activeOffice = officesWithCoords.find(
    (office) => office.code === activeCode,
  );

  const defaultCenter = useMemo<[number, number]>(() => {
    const first = officesWithCoords[0];

    if (first) {
      return [first.latitude as number, first.longitude as number];
    }

    // Москва как запасной центр.
    return [55.751244, 37.618423];
  }, [officesWithCoords]);

  if (!open) {
    return null;
  }

  function handleConfirm() {
    if (activeOffice) {
      onSelect(activeOffice);
      onClose();
    }
  }

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
          {officesWithCoords.length === 0 ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-[15px] text-[#666666]">
              Для этого города нет пунктов выдачи с координатами на карте.
            </div>
          ) : (
            <MapContainer
              center={defaultCenter}
              zoom={12}
              scrollWheelZoom
              className="h-full w-full"
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <FitBounds offices={officesWithCoords} />

              {officesWithCoords.map((office) => (
                <Marker
                  key={office.code}
                  position={[
                    office.latitude as number,
                    office.longitude as number,
                  ]}
                  icon={createPin(office.code === activeCode)}
                  eventHandlers={{
                    click: () => setActiveCode(office.code),
                  }}
                >
                  <Popup>
                    <div className="min-w-[180px]">
                      <p className="text-[14px] font-semibold text-[#060606]">
                        {office.name}
                      </p>
                      <p className="mt-1 text-[13px] text-[#666666]">
                        {office.fullAddress || office.address}
                      </p>
                      {office.workTime && (
                        <p className="mt-1 text-[12px] text-[#999999]">
                          {office.workTime}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          onSelect(office);
                          onClose();
                        }}
                        className="mt-2 inline-flex h-9 items-center justify-center rounded-full bg-[#060606] px-4 text-[13px] font-medium text-white transition hover:bg-neutral-800"
                      >
                        Выбрать этот ПВЗ
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
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

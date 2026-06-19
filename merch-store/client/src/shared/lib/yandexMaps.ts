// Минимальные типы для нужной нам части Yandex Maps JS API 2.1.
type YmapsGeoObject = {
  events: {
    add: (event: string, handler: () => void) => void;
  };
};

type YmapsCollection = {
  add: (object: unknown) => void;
  removeAll: () => void;
  getBounds: () => number[][] | null;
};

export type YmapsMap = {
  geoObjects: YmapsCollection;
  setBounds: (
    bounds: number[][],
    options?: { checkZoomRange?: boolean; zoomMargin?: number },
  ) => void;
  setCenter: (center: number[], zoom?: number) => void;
  destroy: () => void;
};

export type Ymaps = {
  ready: (callback: () => void) => void;
  Map: new (
    element: HTMLElement | string,
    state: { center: number[]; zoom: number; controls?: string[] },
    options?: Record<string, unknown>,
  ) => YmapsMap;
  Placemark: new (
    geometry: number[],
    properties: Record<string, unknown>,
    options: Record<string, unknown>,
  ) => YmapsGeoObject;
};

declare global {
  interface Window {
    ymaps?: Ymaps;
  }
}

let loaderPromise: Promise<Ymaps> | null = null;

/**
 * Однократно подгружает Yandex Maps JS API 2.1 и резолвит готовый ymaps.
 * Повторные вызовы возвращают тот же промис.
 */
export function loadYandexMaps(): Promise<Ymaps> {
  if (loaderPromise) {
    return loaderPromise;
  }

  loaderPromise = new Promise<Ymaps>((resolve, reject) => {
    // Уже загружен ранее.
    if (window.ymaps) {
      window.ymaps.ready(() => resolve(window.ymaps as Ymaps));
      return;
    }

    const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY as
      | string
      | undefined;

    const script = document.createElement("script");
    const keyParam = apiKey ? `&apikey=${apiKey}` : "";
    script.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU${keyParam}`;
    script.async = true;

    script.onload = () => {
      if (!window.ymaps) {
        reject(new Error("YANDEX_MAPS_NOT_AVAILABLE"));
        return;
      }

      window.ymaps.ready(() => resolve(window.ymaps as Ymaps));
    };

    script.onerror = () => {
      loaderPromise = null;
      reject(new Error("YANDEX_MAPS_SCRIPT_LOAD_FAILED"));
    };

    document.head.appendChild(script);
  });

  return loaderPromise;
}

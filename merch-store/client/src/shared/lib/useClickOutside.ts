import { useEffect, useRef } from "react";

/**
 * Закрывает элемент по клику/тапу вне его области.
 * Возвращает ref, который нужно повесить на оборачивающий элемент.
 */
export function useClickOutside<T extends HTMLElement = HTMLDivElement>(
  isOpen: boolean,
  onClose: () => void,
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!ref.current) {
        return;
      }

      if (!ref.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen, onClose]);

  return ref;
}

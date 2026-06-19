import { useEffect, useState } from "react";

/**
 * Реактивно отслеживает media-запрос.
 * Пример: useMediaQuery("(max-width: 767px)") — true на мобильных.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    function handleChange(event: MediaQueryListEvent) {
      setMatches(event.matches);
    }

    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}

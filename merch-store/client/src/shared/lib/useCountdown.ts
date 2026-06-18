import { useEffect, useState } from "react";

export type Countdown = {
  /** Осталось миллисекунд (0, если срок истёк или не задан). */
  remainingMs: number;
  /** Срок истёк (либо дедлайн не задан). */
  isExpired: boolean;
  /** Форматированная строка вида "MM:SS" или "HH:MM:SS". */
  formatted: string;
};

function formatRemaining(remainingMs: number): string {
  if (remainingMs <= 0) {
    return "00:00";
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = hours > 0 ? [hours, minutes, seconds] : [minutes, seconds];

  return parts.map((value) => String(value).padStart(2, "0")).join(":");
}

/**
 * Живой обратный отсчёт до дедлайна. Обновляется раз в секунду.
 * deadline — ISO-строка/Date или null (тогда таймер считается истёкшим).
 */
export function useCountdown(deadline: string | Date | null | undefined): Countdown {
  const deadlineMs = deadline ? new Date(deadline).getTime() : null;

  const compute = () => {
    if (!deadlineMs) {
      return 0;
    }

    return Math.max(0, deadlineMs - Date.now());
  };

  const [remainingMs, setRemainingMs] = useState<number>(compute);

  useEffect(() => {
    if (!deadlineMs) {
      setRemainingMs(0);
      return;
    }

    setRemainingMs(Math.max(0, deadlineMs - Date.now()));

    const intervalId = setInterval(() => {
      const next = Math.max(0, deadlineMs - Date.now());
      setRemainingMs(next);

      if (next <= 0) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [deadlineMs]);

  return {
    remainingMs,
    isExpired: remainingMs <= 0,
    formatted: formatRemaining(remainingMs),
  };
}

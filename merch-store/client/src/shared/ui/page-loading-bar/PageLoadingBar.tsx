import { useEffect, useRef, useState } from "react";

import { subscribeAppLoading } from "@/shared/lib/appLoading";

export function PageLoadingBar() {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const hideTimerRef = useRef<number | null>(null);

    useEffect(() => {
        return subscribeAppLoading((loading) => {
            setIsLoading(loading);
        });
    }, []);

    useEffect(() => {
        if (hideTimerRef.current) {
            window.clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
        }

        if (isLoading) {
            setProgress((current) => (current <= 0 ? 12 : current));

            const interval = window.setInterval(() => {
                setProgress((current) => {
                    if (current >= 88) return current;

                    return current + Math.random() * 10;
                });
            }, 180);

            return () => {
                window.clearInterval(interval);
            };
        }

        setProgress(100);

        hideTimerRef.current = window.setTimeout(() => {
            setProgress(0);
        }, 350);

        return undefined;
    }, [isLoading]);

    if (progress <= 0) {
        return null;
    }

    return (
        <div className="fixed left-0 top-0 z-[99999] h-[4px] w-full bg-transparent">
            <div
                className="h-full bg-black transition-[width] duration-200 ease-out"
                style={{
                    width: `${Math.min(progress, 100)}%`,
                }}
            />
        </div>
    );
}
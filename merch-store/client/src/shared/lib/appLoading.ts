type Listener = (isLoading: boolean) => void;

let activeRequests = 0;
const listeners = new Set<Listener>();

function notify() {
    const isLoading = activeRequests > 0;

    listeners.forEach((listener) => {
        listener(isLoading);
    });
}

export function startAppLoading() {
    activeRequests += 1;
    notify();
}

export function stopAppLoading() {
    activeRequests = Math.max(0, activeRequests - 1);
    notify();
}

export function subscribeAppLoading(listener: Listener) {
    listeners.add(listener);

    listener(activeRequests > 0);

    return () => {
        listeners.delete(listener);
    };
}
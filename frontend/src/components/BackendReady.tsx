import { useEffect, useState, type ReactNode } from 'react';

const API = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

/** Retry only a safe health read; never replay forms or payments. */
export default function BackendReady({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    let retry: ReturnType<typeof setTimeout>;
    let controller: AbortController;
    const deadline = Date.now() + 180_000;
    setFailed(false);
    async function check() {
      controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15_000);
      try {
        const response = await fetch(`${API}/health`, { signal: controller.signal, cache: 'no-store' });
        if (response.ok && (await response.json()).status === 'ok') {
          if (!cancelled) setReady(true);
          return;
        }
      } catch { /* Render may return HTML or time out while starting. */ }
      finally { clearTimeout(timeout); }
      if (cancelled) return;
      if (Date.now() >= deadline) setFailed(true);
      else retry = setTimeout(check, 5_000);
    }
    void check();
    return () => { cancelled = true; clearTimeout(retry); controller?.abort(); };
  }, [attempt]);
  if (ready) return children;
  return <main style={{ minHeight: '100svh', display: 'grid', placeItems: 'center', padding: 24, background: '#EAE7DD', color: '#182F28' }}>
    <section style={{ maxWidth: 480, padding: 32, background: '#FFFDF7', borderRadius: 18 }}>
      <h1 style={{ fontSize: 28 }}>{failed ? 'Unable to connect yet' : 'Server waking up…'}</h1>
      <p role="status" aria-live="polite" style={{ fontSize: 17, lineHeight: 1.6 }}>
        {failed ? 'Check your internet connection and try again. Your saved data has not been changed.' : 'After some time without visitors, our free server goes to sleep. This can take around two minutes. We’ll open the app automatically when it is ready.'}
      </p>
      {failed && <button onClick={() => setAttempt(n => n + 1)} style={{ minHeight: 48, padding: '12px 24px', background: '#26483E', color: '#FFFDF7', borderRadius: 8 }}>Try again</button>}
    </section>
  </main>;
}

import { useCallback, useEffect, useRef, useState } from 'react';

export const AUTH_EVENT = 'side-a-auth';
const TOKEN_KEY = 'side-a-google-id-token';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (opts: { client_id: string; callback: (res: { credential: string }) => void }) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
        };
      };
    };
  }
}

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getAdminToken(): string | null {
  return readToken();
}

function loadGisScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-gis]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('GIS failed to load')));
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.setAttribute('data-gis', '1');
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('GIS failed to load'));
    document.head.appendChild(s);
  });
}

export function GoogleSignIn(): React.ReactElement {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
  const [signedIn, setSignedIn] = useState<boolean>(() => readToken() !== null);
  const [failed, setFailed] = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = (): void => setSignedIn(readToken() !== null);
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    if (!clientId || signedIn) return;
    let cancelled = false;
    void loadGisScript()
      .then(() => {
        if (cancelled || !btnRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (res) => {
            try {
              localStorage.setItem(TOKEN_KEY, res.credential);
            } catch {
              /* private mode */
            }
            setSignedIn(true);
            window.dispatchEvent(new Event(AUTH_EVENT));
          },
        });
        window.google.accounts.id.renderButton(btnRef.current, { theme: 'filled_black', size: 'medium' });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [clientId, signedIn]);

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
    setSignedIn(false);
    window.dispatchEvent(new Event(AUTH_EVENT));
  }, []);

  if (!clientId) {
    return (
      <span className="pill" title="Set VITE_GOOGLE_CLIENT_ID to enable admin sign-in">
        Sign-in not configured
      </span>
    );
  }
  if (failed) {
    return <span className="pill">Google sign-in failed to load</span>;
  }
  if (signedIn) {
    return (
      <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
        <span className="pill" style={{ color: 'var(--gold)', borderColor: 'var(--gold)' }}>
          Signed in
        </span>
        <button type="button" className="btn small" onClick={signOut}>
          Sign out
        </button>
      </span>
    );
  }
  return <div ref={btnRef} style={{ minHeight: 40, display: 'inline-flex', alignItems: 'center' }} />;
}

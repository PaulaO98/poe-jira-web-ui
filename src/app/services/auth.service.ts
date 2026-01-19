import { Injectable, PLATFORM_ID, inject, InjectionToken, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { ApiService } from './api.service';

/** Injection token for storage so tests can provide a mock without touching global localStorage */
export const STORAGE = new InjectionToken<Storage | null>('STORAGE', {
  providedIn: 'root',
  factory: () => (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) || null,
});

@Injectable({ providedIn: 'root' })
export class AuthService {
  private key = 'token';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId as object);

  private api = inject(ApiService);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private storage = inject(STORAGE);

  register(name: string, email: string, password: string) {
    return this.api.post<unknown>('/auth/register', { name, email, password }).pipe(
      tap((res) => {
        const payload = res as { accessToken?: string } | undefined;
        const token = payload?.accessToken;
        if (!token) throw new Error('No accessToken in response');
        if (this.isBrowser) {
          try {
            this.storage?.setItem(this.key, token);
          } catch {
            /* ignore */
          }
        }
      })
    );
  }

  login(email: string, password: string) {
    return this.api.post<unknown>('/auth/login', { email, password }).pipe(
      tap((res) => {
        const payload = res as { accessToken?: string } | undefined;
        const token = payload?.accessToken;
        if (!token) throw new Error('No accessToken in response');
        if (this.isBrowser) {
          try {
            this.storage?.setItem(this.key, token);
          } catch {
            /* ignore */
          }
        }
      })
    );
  }

  getToken() {
    if (!this.isBrowser) return null;
    try {
      return this.storage?.getItem(this.key) ?? null;
    } catch {
      return null;
    }
  }

  // allow setting token programmatically (used by refresh flow)
  setToken(token: string | null) {
    if (!this.isBrowser) return;
    try {
      if (token) this.storage?.setItem(this.key, token);
      else this.storage?.removeItem(this.key);
    } catch {
      /* ignore */
    }
  }

  logout() {
    if (this.isBrowser) {
      try {
        this.storage?.removeItem(this.key);
      } catch {
        /* ignore */
      }
      this.router.navigate(['/login']);
    }
  }

  forceLogout() {
    // clear token consistently
    try {
      this.setToken(null);
    } catch {
      try {
        this.storage?.removeItem(this.key);
      } catch {
        /* ignore */
      }
    }

    try {
      this.ngZone.run(() => {
        this.router.navigateByUrl('/login', { replaceUrl: true });
      });
    } catch {
      // fallback to browser navigation if available
      if (this.isBrowser && typeof window !== 'undefined') {
        try {
          window.location.replace('/login');
        } catch {
          // final best-effort: use href
          window.location.href = '/login';
        }
      }
    }
  }

  isLoggedIn() {
    return !!this.getToken();
  }
}

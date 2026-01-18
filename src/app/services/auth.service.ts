import { Injectable, PLATFORM_ID, inject, InjectionToken } from '@angular/core';
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

  isLoggedIn() {
    return !!this.getToken();
  }
}

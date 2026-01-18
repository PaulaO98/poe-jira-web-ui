/// <reference types="jasmine" />
import { TestBed } from '@angular/core/testing';
import { of, firstValueFrom } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService, STORAGE } from './auth.service';
import { ApiService } from './api.service';

describe('AuthService', () => {
  let service: AuthService;
  let apiSpy: any;
  let routerSpy: any;
  let storageMock: any;

  beforeEach(() => {
    // avoid relying on jasmine global creation helpers; use plain objects and manual spies
    apiSpy = { post: () => of({}) } as any;
    // make a simple call-tracking stub for router; assign `navigate` where tests need it
    routerSpy = { _calls: [] } as any;

    // storage mock injected via STORAGE token so tests don't touch proxied global localStorage
    const setCalls: any[] = [];
    const removed: any[] = [];
    storageMock = {
      setItem: (_k: string, v: string) => setCalls.push([_k, v]),
      getItem: (_k: string) => null,
      removeItem: (_k: string) => removed.push(_k),
      // expose arrays so tests can assert
      __setCalls: setCalls,
      __removed: removed,
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: apiSpy },
        { provide: Router, useValue: routerSpy },
        { provide: STORAGE, useValue: storageMock },
        // pretend we're in a browser environment
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('should store token on register success', async () => {
    // stub api post to return a token and check storageMock calls
    apiSpy.post = () => of({ accessToken: 'tok-123' });
    await firstValueFrom(service.register('n', 'e@x.com', 'pw'));
    expect(
      storageMock.__setCalls.find((c: any[]) => c[0] === 'token' && c[1] === 'tok-123')
    ).toBeDefined();
  });

  it('should throw if register response missing token', async () => {
    apiSpy.post = () => of({});
    try {
      await firstValueFrom(service.register('n', 'e@x.com', 'pw'));
      fail('should have errored');
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it('should store token on login success', async () => {
    apiSpy.post = () => of({ accessToken: 'tok-xyz' });
    await firstValueFrom(service.login('e@x.com', 'pw'));
    expect(
      storageMock.__setCalls.find((c: any[]) => c[0] === 'token' && c[1] === 'tok-xyz')
    ).toBeDefined();
  });

  it('getToken and isLoggedIn should reflect localStorage', () => {
    // stub getItem on storage mock
    storageMock.getItem = (_k: string) => 'tok-abc';
    expect(service.getToken()).toBe('tok-abc');
    expect(service.isLoggedIn()).toBeTruthy();
  });

  it('logout should remove token and navigate', () => {
    // ensure storageMock records removals and router is called
    (storageMock.__removed as any[]).length = 0; // reset
    (routerSpy as any)._calls = [];
    (routerSpy as any).navigate = (...args: any[]) => (routerSpy as any)._calls.push(args);
    service.logout();
    expect((storageMock.__removed as any[]).includes('token')).toBeTruthy();
    expect(
      (routerSpy as any)._calls.some((c: any[]) => Array.isArray(c[0]) && c[0][0] === '/login')
    ).toBeTruthy();
  });
});

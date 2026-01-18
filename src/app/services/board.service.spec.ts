import { TestBed } from '@angular/core/testing';
import { of, firstValueFrom } from 'rxjs';

import { BoardService } from './board.service';
import { ApiService } from './api.service';

describe('BoardService', () => {
  let service: BoardService;

  let apiSpy: any;

  beforeEach(() => {
    apiSpy = {
      get: (_url: string) => of({}),
      post: (_url: string, _body: any) => of(null),
      patch: (_url: string, _body: any) => of(null),
    };

    TestBed.configureTestingModule({ providers: [{ provide: ApiService, useValue: apiSpy }] });
    service = TestBed.inject(BoardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call api.get for getBoardIssues', async () => {
    let called = false;
    apiSpy.get = (url: string) => {
      called = true;
      expect(url).toContain('/projects/99/board/issues');
      return of({ board: {}, columns: [] });
    };

    const v = await firstValueFrom(service.getBoardIssues(99));
    expect(called).toBeTruthy();
    expect(v).toBeDefined();
  });

  it('should call api.post for createIssue', async () => {
    let called = false;
    apiSpy.post = (url: string, body: any) => {
      called = true;
      expect(url).toContain('/projects/7/board/issues');
      expect(body.title).toBe('T');
      return of({});
    };

    await firstValueFrom(service.createIssue(7, { title: 'T', columnId: 1 }));
    expect(called).toBeTruthy();
  });

  it('should call api.patch for moveIssue', async () => {
    let called = false;
    apiSpy.patch = (url: string, body: any) => {
      called = true;
      expect(url).toContain('/projects/7/board/issues/5/move');
      expect(body.toColumnId).toBe(2);
      return of({});
    };

    await firstValueFrom(service.moveIssue(7, 5, { toColumnId: 2 }));
    expect(called).toBeTruthy();
  });
});

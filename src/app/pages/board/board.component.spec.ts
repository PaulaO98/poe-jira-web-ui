import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { BoardComponent } from './board.component';
import { BoardService } from '../../services/board.service';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;
  let mockBoardService: any;

  const sample = {
    board: { id: 1, projectId: 7, name: 'B', type: 'KANBAN' },
    columns: [
      {
        id: 10,
        boardId: 1,
        name: 'ToDo',
        position: 0,
        wipLimit: null,
        issues: [{ id: 101, projectId: 7, columnId: 10, title: 'A' }],
      },
      {
        id: 20,
        boardId: 1,
        name: 'Done',
        position: 1,
        wipLimit: null,
        issues: [{ id: 201, projectId: 7, columnId: 20, title: 'B' }],
      },
    ],
  };

  beforeEach(async () => {
    mockBoardService = {
      getBoardIssues: () => of({ data: sample }),
      createIssue: (_projectId: number, _payload: any) =>
        of({ data: { id: 999, projectId: 7, columnId: 10, title: 'new' } }),
      moveIssue: (_projectId: number, _issueId: number, _payload: any) => of(null),
    };

    await TestBed.configureTestingModule({
      imports: [BoardComponent, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '7' } } } },
        { provide: BoardService, useValue: mockBoardService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create and load board data', () => {
    expect(component).toBeTruthy();
    expect(component.data).toBeTruthy();
    expect(component.data?.board.id).toBe(1);
    expect(component.data?.columns.length).toBe(2);
    expect(component.dropListIds).toEqual(['col-10', 'col-20']);
  });

  it('createIssue should not call service when title invalid', () => {
    const col = component.data!.columns[0];
    col.newTitle.setValue('');
    let called = false;
    mockBoardService.createIssue = () => {
      called = true;
      return of(null);
    };
    component.createIssue(col);
    expect(called).toBeFalsy();
  });

  it('createIssue should prepend created issue and clear title on success', async () => {
    const col = component.data!.columns[0];
    col.newTitle.setValue('New task');
    mockBoardService.createIssue = (_p: number, payload: any) =>
      of({ data: { id: 555, ...payload } });

    component.createIssue(col);
    // allow observable to emit
    await new Promise((r) => setTimeout(r, 0));

    expect(col.issues[0].id).toBe(555);
    expect(col.newTitle.value).toBe('');
  });

  it('onDrop should move an item across lists and call moveIssue', async () => {
    const from = component.data!.columns[0];
    const to = component.data!.columns[1];

    // prepare containers data arrays
    const prevContainer = { data: [...from.issues] } as any;
    const container = { data: [...to.issues] } as any;

    // simulate transfer
    const event: any = {
      previousContainer: prevContainer,
      container: container,
      previousIndex: 0,
      currentIndex: 1,
    };

    let movedPayload: any = null;
    mockBoardService.moveIssue = (_proj: number, _id: number, payload: any) => {
      movedPayload = payload;
      return of(null);
    };

    component.onDrop(event, to as any);
    expect(movedPayload).toBeTruthy();
    expect(movedPayload.toColumnId).toBe(to.id);
  });

  it('onDrop should reload on move failure', async () => {
    const from = component.data!.columns[0];
    const to = component.data!.columns[1];
    const prevContainer = { data: [...from.issues] } as any;
    const container = { data: [...to.issues] } as any;
    const event: any = {
      previousContainer: prevContainer,
      container: container,
      previousIndex: 0,
      currentIndex: 0,
    };

    let reloaded = false;
    // replace load to capture reload attempt
    (component as any).load = () => {
      reloaded = true;
    };

    mockBoardService.moveIssue = () => throwError(() => new Error('nope'));

    component.onDrop(event, to as any);
    await new Promise((r) => setTimeout(r, 0));
    expect(reloaded).toBeTruthy();
  });
});

/**
 * BoardComponent
 *
 * Purpose:
 * - Render a kanban board for a given project: columns and issues.
 * - Supports creating issues and drag-and-drop reordering.
 *
 * Inputs / Outputs:
 * - Reads `projectId` from ActivatedRoute snapshot.
 *
 * Data shapes:
 * - ApiBoardResponse: { board, columns[] } with issues arrays per column.
 * - ColumnVM: ApiColumn extended with local FormControl for new issue title.
 *
 * Lifecycle:
 * - fetches board data on init and rebuilds internal ColumnVMs.
 *
 * Error modes:
 * - Network errors displayed in `error`; move/create operations gracefully handle failures.
 */
import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { finalize } from 'rxjs/operators';
import { BoardService } from '../../services/board.service';

interface ApiIssue {
  id: number;
  projectId: number;
  columnId: number;
  issueNumber?: number;
  title: string;
  description?: string | null;
  priority?: string | null;
  position?: string | null;
}

interface ApiColumn {
  id: number;
  boardId: number;
  name: string;
  position: number;
  wipLimit: number | null;
  issues: ApiIssue[];
}

interface ApiBoardResponse {
  board: { id: number; projectId: number; name: string; type: string };
  columns: ApiColumn[];
}

interface ColumnVM extends ApiColumn {
  newTitle: FormControl<string>;
}

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './board.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent implements OnInit {
  projectId!: number;

  loading = false;
  error: string | null = null;

  data: { board: ApiBoardResponse['board']; columns: ColumnVM[] } | null = null;

  dropListIds: string[] = [];

  private route = inject(ActivatedRoute);
  private boardService = inject(BoardService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));
    this.load();
  }

  private buildColumnVM(c: ApiColumn): ColumnVM {
    return {
      ...c,
      issues: Array.isArray(c.issues) ? c.issues : [],
      newTitle: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)],
      }),
    };
  }

  load(): void {
    this.loading = true;
    this.error = null;

    this.boardService
      .getBoardIssues(this.projectId)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (res: unknown) => {
          this.loading = false;

          const payload =
            (res as unknown as { data?: ApiBoardResponse })?.data ??
            (res as unknown as ApiBoardResponse);

          const board = payload?.board;
          const columnsRaw = Array.isArray(payload?.columns) ? payload.columns : [];

          const columns = columnsRaw
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            .map((c) => this.buildColumnVM(c));

          this.dropListIds = columns.map((c) => this.dropListId(c.id));

          this.data = { board, columns };
          this.cdr.markForCheck();
        },
        error: (err: unknown) => {
          this.loading = false;
          const e = err as { error?: { message?: string }; message?: string } | undefined;
          const msg = e?.error?.message ?? e?.message;
          this.error = msg ? String(msg) : 'Error cargando board';
          this.cdr.markForCheck();
        },
      });
  }

  trackCol = (_: number, col: ColumnVM) => col.id;
  trackIssue = (_: number, issue: ApiIssue) => issue.id;

  dropListId(columnId: number): string {
    return `col-${columnId}`;
  }

  createIssue(col: ColumnVM): void {
    col.newTitle.markAsTouched();
    if (col.newTitle.invalid) return;

    const title = col.newTitle.value.trim();
    if (!title) return;

    this.boardService
      .createIssue(this.projectId, {
        title,
        description: '',
        columnId: col.id,
        priority: 'MEDIUM',
      })
      .subscribe({
        next: (created: unknown) => {
          const issue: ApiIssue =
            (created as unknown as { data?: ApiIssue })?.data ?? (created as unknown as ApiIssue);
          col.issues = [issue, ...col.issues];
          col.newTitle.setValue('');
          this.cdr.markForCheck();
        },
        error: (err: unknown) => {
          const e = err as { error?: { message?: string }; message?: string } | undefined;
          const msg = e?.error?.message ?? e?.message;
          this.error = msg ? String(msg) : 'Error creando issue';
          this.cdr.markForCheck();
        },
      });
  }

  onDrop(event: CdkDragDrop<ApiIssue[]>, toCol: ColumnVM): void {
    if (!this.data) return;

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    const moved = event.container.data[event.currentIndex];
    if (!moved) return;

    moved.columnId = toCol.id;

    const prev = event.currentIndex > 0 ? event.container.data[event.currentIndex - 1] : undefined;
    const next =
      event.currentIndex < event.container.data.length - 1
        ? event.container.data[event.currentIndex + 1]
        : undefined;

    const payload: { toColumnId: number; beforeIssueId?: number; afterIssueId?: number } = {
      toColumnId: toCol.id,
    };
    if (next?.id && next.id !== moved.id) payload.beforeIssueId = next.id;
    else if (prev?.id && prev.id !== moved.id) payload.afterIssueId = prev.id;

    this.boardService.moveIssue(this.projectId, moved.id, payload).subscribe({
      next: () => {
        // ok
      },
      error: () => {
        // si falla, recarga para sincronizar
        this.load();
      },
    });
  }
}

/**
 * WorkspacesComponent
 *
 * Purpose:
 * - Display a list of workspaces and allow creating a new workspace.
 * - Exposes a reactive `vm$` stream with { workspaces, loading, error }.
 *
 * Inputs / Outputs:
 * - No @Input/@Output. Uses WorkspacesService for API operations.
 *
 * Data shapes:
 * - vm$: Observable<{ workspaces: any[]; loading: boolean; error: string | null }>
 *
 * Lifecycle:
 * - Uses a BehaviorSubject reload$ to trigger data refresh.
 *
 * Error modes:
 * - API errors are surfaced through the `createError` and vm$.error fields.
 */
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, finalize, map, of, startWith, switchMap } from 'rxjs';

import { UiCardComponent } from '../../ui/molecules/card/ui-card.component';
import { UiButtonComponent } from '../../ui/atoms/button/ui-button.component';
import { WorkspacesService } from '../../services/workspaces.service';

interface Workspace {
  id: number;
  name?: string;
}

interface WsVm {
  workspaces: Workspace[];
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-workspaces',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, UiCardComponent, UiButtonComponent],
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss'],
})
export class WorkspacesComponent {
  nameCtrl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(2)],
  });

  creating = false;
  createError: string | null = null;

  private reload$ = new BehaviorSubject<void>(undefined);

  vm$ = this.reload$.pipe(
    switchMap(() =>
      this.api.list().pipe(
        map((workspaces) => ({ workspaces, loading: false, error: null } as WsVm)),
        startWith({ workspaces: [], loading: true, error: null } as WsVm),
        catchError((e) => {
          const err = e as { error?: { message?: string }; message?: string } | undefined;
          return of({
            workspaces: [],
            loading: false,
            error: err?.error?.message
              ? JSON.stringify(err.error.message)
              : 'Error cargando workspaces',
          } as WsVm);
        })
      )
    )
  );

  private api = inject(WorkspacesService);

  reload() {
    this.reload$.next();
  }

  create() {
    this.createError = null;
    this.nameCtrl.markAsTouched();
    if (this.nameCtrl.invalid || this.creating) return;

    this.creating = true;
    this.api
      .create(this.nameCtrl.value.trim())
      .pipe(finalize(() => (this.creating = false)))
      .subscribe({
        next: () => {
          this.nameCtrl.setValue('');
          this.reload();
        },
        error: (e: unknown) => {
          const err = e as { error?: { message?: string }; message?: string } | undefined;
          const msg = err?.error?.message ?? err?.message;
          this.createError = msg ? JSON.stringify(msg) : 'Error creando workspace';
        },
      });
  }

  trackWs = (_: number, w: Workspace) => w.id;
}

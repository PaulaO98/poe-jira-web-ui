/**
 * ProjectsComponent
 *
 * Purpose:
 * - List and create projects within a workspace.
 * - Provides a reactive view-model stream `vm$` for template binding.
 *
 * Inputs / Outputs:
 * - Reads `workspaceId` from ActivatedRoute snapshot.
 *
 * Data shapes:
 * - PrjVm: { projects: any[], loading: boolean, error: string | null }
 *
 * Lifecycle:
 * - Uses a reload$ trigger to fetch project list on demand.
 *
 * Error modes:
 * - API failures are captured and exposed via `vm$.error`.
 */
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, finalize, map, of, startWith, switchMap } from 'rxjs';

import { UiCardComponent } from '../../ui/molecules/card/ui-card.component';
import { UiButtonComponent } from '../../ui/atoms/button/ui-button.component';
import { ProjectsService } from '../../services/projects.service'; // ajusta tu path

interface Project {
  id: number;
  name?: string;
}

interface PrjVm {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, UiCardComponent, UiButtonComponent],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent {
  nameCtrl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(2)],
  });

  creating = false;
  createError: string | null = null;

  private reload$ = new BehaviorSubject<void>(undefined);

  vm$ = this.reload$.pipe(
    switchMap(() =>
      this.api.list(this.workspaceId).pipe(
        map((projects) => ({ projects, loading: false, error: null } as PrjVm)),
        startWith({ projects: [], loading: true, error: null } as PrjVm),
        catchError((e) => {
          const err = e as { error?: { message?: string }; message?: string } | undefined;
          return of({
            projects: [],
            loading: false,
            error: err?.error?.message
              ? JSON.stringify(err.error.message)
              : 'Error cargando projects',
          } as PrjVm);
        })
      )
    )
  );

  private route = inject(ActivatedRoute);
  private api = inject(ProjectsService);

  workspaceId = Number(this.route.snapshot.paramMap.get('workspaceId'));

  reload() {
    this.reload$.next();
  }

  create() {
    this.createError = null;
    this.nameCtrl.markAsTouched();
    if (this.nameCtrl.invalid || this.creating) return;

    this.creating = true;
    this.api
      .create(this.workspaceId, {
        name: this.nameCtrl.value,
        key: this.nameCtrl.value.trim().toUpperCase().replace(/\s+/g, '-').slice(0, 10),
      })
      .pipe(finalize(() => (this.creating = false)))
      .subscribe({
        next: () => {
          this.nameCtrl.setValue('');
          this.reload();
        },
        error: (e: unknown) => {
          const err = e as { error?: { message?: string }; message?: string } | undefined;
          const msg = err?.error?.message ?? err?.message;
          this.createError = msg ? JSON.stringify(msg) : 'Error creando proyecto';
        },
      });
  }

  trackPrj = (_: number, p: Project) => p.id;
}

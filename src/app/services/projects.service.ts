import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private api = inject(ApiService);

  list(workspaceId: number) {
    return this.api.get<unknown[]>(`/workspaces/${workspaceId}/projects`);
  }

  create(workspaceId: number, payload: { name: string; key: string; description?: string }) {
    return this.api.post<unknown>(`/workspaces/${workspaceId}/projects`, payload);
  }
}

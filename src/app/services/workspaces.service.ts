import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class WorkspacesService {
  private api = inject(ApiService);

  list() {
    return this.api.get<unknown[]>('/workspaces');
  }

  create(name: string) {
    return this.api.post<unknown>('/workspaces', { name });
  }
}

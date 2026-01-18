import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface BoardIssue {
  id: number;
  title: string;
  columnId: number;
  issueNumber?: number;
  position?: string;
}

export interface BoardColumnVM {
  id: number;
  name: string;
  position: number;
  wipLimit?: number | null;
  issues: BoardIssue[];
}

export interface BoardIssuesResponse {
  board: { id: number; projectId: number; name: string; type: string };
  columns: BoardColumnVM[];
}

@Injectable({ providedIn: 'root' })
export class BoardService {
  private api = inject(ApiService);

  getBoardIssues(projectId: number) {
    return this.api.get<BoardIssuesResponse>(`/projects/${projectId}/board/issues`);
  }

  createIssue(
    projectId: number,
    payload: { title: string; description?: string; columnId: number; priority?: string }
  ) {
    return this.api.post<unknown>(`/projects/${projectId}/board/issues`, payload);
  }

  moveIssue(
    projectId: number,
    issueId: number,
    payload: { toColumnId: number; beforeIssueId?: number; afterIssueId?: number }
  ) {
    return this.api.patch<unknown>(`/projects/${projectId}/board/issues/${issueId}/move`, payload);
  }
}

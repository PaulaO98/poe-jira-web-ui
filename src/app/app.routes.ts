import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { WorkspacesComponent } from './pages/workspaces/workspaces.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { BoardComponent } from './pages/board/board.component';
import { authGuard } from './core/auth.guard';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';

export const routes: Routes = [
  // Public
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Protected (wrapped with layout)
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'workspaces', component: WorkspacesComponent },
      { path: 'workspaces/:workspaceId/projects', component: ProjectsComponent },
      { path: 'projects/:projectId/board', component: BoardComponent },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
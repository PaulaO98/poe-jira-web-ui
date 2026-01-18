import { RenderMode, ServerRoute } from '@angular/ssr';

// Explicit server routes to ensure server-side rendering/hydration
export const serverRoutes: ServerRoute[] = [
  {
    path: 'login',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];

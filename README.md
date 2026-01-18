# PoeJiraWebUi

Documento de referencia y guía rápida del proyecto PoeJiraWebUi.

Este repositorio contiene una versión mínima/experimental de una interfaz tipo "JIRA" construida con Angular 21 y soporte SSR (Server-Side Rendering) usando `@angular/ssr`.

## Resumen del proyecto
- Stack principal: Angular 21, RxJS, Express (para la parte SSR empaquetada), TypeScript.
- Estructura clave: el código fuente está en `src/` con páginas en `src/app/pages`, configuración SSR en `src/main.server.ts` y rutas de servidor en `src/app/app.routes.server.ts`.

## Requisitos
- Node.js (recomendado la versión usada por el proyecto) y npm.

## Instalación

```bash
npm install
```

## Scripts disponibles (package.json)

- `npm start` — arranca el dev server (Angular CLI `ng serve`) en http://localhost:4200.
- `npm run build` — construye la app cliente (`ng build`) y escribe `dist/`.
- `npm run watch` — build en modo watch para desarrollo.
- `npm test` — ejecuta tests unitarios.
- `npm run serve:ssr:poe-jira-web-ui` — arranca el servidor Node empaquetado para SSR (ejecuta `dist/poe-jira-web-ui/server/server.mjs`), por defecto escucha en el puerto 4000.

Ejemplos:

```bash
# dev (cliente solamente)
npm start

# build producción / preparación SSR
npm run build

# servir SSR (después de build)
npm run serve:ssr:poe-jira-web-ui
```

Nota: el dev server usa por defecto el puerto 4200; el servidor SSR por defecto usa el puerto 4000 en este proyecto. Si ves HTML renderizado en el navegador sin que hayas arrancado explícitamente SSR, revisa que no haya un proceso Node escuchando en el puerto 4000 (u otro proxy local que redirija peticiones).

## Arquitectura y decisiones SSR

- `main.server.ts` debe bootstrappear la aplicación raíz (App root), no un componente de página individual. Esto evita errores de hidratación como `NG05104: The selector 'app-login' did not match any elements`.
- `src/app/app.routes.server.ts` controla qué rutas se renderizan en el servidor y con qué modo (`RenderMode.Server` o `RenderMode.Prerender`).
- Ejemplo actual (extracto):

```ts
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
	{ path: 'login', renderMode: RenderMode.Server },

	# PoeJiraWebUi

	Guía rápida y referencia del proyecto PoeJiraWebUi.

	Este repositorio contiene una interfaz tipo "JIRA" construida con Angular 21. El foco principal es la aplicación cliente (SPA) con un conjunto de páginas para login, registro, workspaces, proyectos y un tablero Kanban.

	## Resumen del proyecto
	- Stack: Angular 21, RxJS, TypeScript.
	- Código principal en `src/` con páginas en `src/app/pages`.

	## Requisitos e instalación

	```bash
	npm install
	```

	## Scripts (package.json)

	- `npm start` — arranca el dev server (`ng serve`) en http://localhost:4200
	- `npm run build` — construye la app cliente y coloca artefactos en `dist/`
	- `npm run watch` — build en modo watch
	- `npm test` — ejecuta tests unitarios
	- `npm run serve:ssr:poe-jira-web-ui` — (opcional) sirve el bundle SSR si previamente hiciste `ng build` y empaquetaste el servidor

	Ejemplos:

	```bash
	# desarrollo (cliente)
	npm start

	# build para producción
	npm run build
	```

	## Estructura y rutas principales

	- `src/app/pages/login` — Login
	- `src/app/pages/register` — Registro
	- `src/app/pages/workspaces` — Workspaces
	- `src/app/pages/projects` — Projects
	- `src/app/pages/board` — Kanban board

	Rutas definidas en `src/app/app.routes.ts`. Principales endpoints de la app:

	- `/login`
	- `/register`
	- `/workspaces`
	- `/workspaces/:workspaceId/projects`
	- `/projects/:projectId/board`

	## Desarrollo y buenas prácticas

	- Usa `npm start` para desarrollo local y abre `http://localhost:4200`.
	- Ejecuta `npx tsc --noEmit -p tsconfig.json` antes de abrir PR para comprobar tipos.
	- Protege accesos a APIs del navegador (como `localStorage`) cuando escribas código que podría ejecutarse en entornos de servidor.

	## Testing

	- Ejecuta `npm test` para los unit tests. Añade tests cuando cambies comportamiento crítico (servicios, lógica del tablero, etc.).

	## Notas técnicas importantes

	- `AuthInterceptor` gestiona cabeceras de autorización para las peticiones API. Comprueba `src/app/core/auth.interceptor.ts` si necesitas añadir cabeceras globales.
	- `AuthService` gestiona el token/usuario local y protege accesos a `localStorage` según el entorno.

	— Fin


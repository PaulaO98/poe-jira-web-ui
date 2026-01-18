/**
 * AppLayoutComponent
 *
 * Purpose:
 * - Shell layout component that renders the topbar and a router outlet.
 * - Handles global layout actions like logout.
 *
 * Inputs / Outputs:
 * - No @Input/@Output. Uses AuthService to perform logout.
 *
 * Lifecycle:
 * - Standalone component used as application shell.
 *
 * Error modes:
 * - Minimal logic; mostly delegates to AuthService and Router.
 */
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { TopbarComponent } from '../../ui/organisms/topbar/topbar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TopbarComponent],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
})
export class AppLayoutComponent {
  userName: string | null = null;

  private auth = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

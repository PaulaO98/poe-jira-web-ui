/**
 * TopbarComponent
 *
 * Purpose:
 * - Small top navigation bar showing app title and user actions (logout).
 *
 * Inputs / Outputs:
 * - @Input() title: string - title to display
 * - @Input() userName: string | null - optional user display name
 * - @Output() logout: EventEmitter<void> - emits when user clicks logout
 *
 * Data shapes & behavior:
 * - Pure presentational component; does not fetch data itself.
 */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UiButtonComponent } from '../../atoms/button/ui-button.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink, UiButtonComponent],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent {
  @Input() title = 'Jira MVP';
  @Input() userName: string | null = null;
  @Output() logout = new EventEmitter<void>();
}

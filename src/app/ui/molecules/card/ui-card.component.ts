/**
 * UiCardComponent
 *
 * Purpose:
 * - Simple container component used to visually group content.
 *
 * Usage:
 * - Wrap content with <ui-card> ... </ui-card> to apply card styles.
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-ui-card',
  standalone: true,
  template: `<div class="card"><ng-content></ng-content></div>`,
  styleUrls: ['./ui-card.component.scss'],
})
export class UiCardComponent {}

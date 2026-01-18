/**
 * UiButtonComponent
 *
 * Purpose:
 * - Reusable button component with variants and optional loading state.
 *
 * Inputs:
 * - type: 'button' | 'submit'
 * - variant: 'primary' | 'ghost' | 'danger'
 * - disabled: boolean
 * - loading: boolean (renders a loading indicator)
 */
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type BtnVariant = 'primary' | 'ghost' | 'danger';

@Component({
  selector: 'app-ui-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-button.component.html',
  styleUrls: ['./ui-button.component.scss'],
})
export class UiButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: BtnVariant = 'primary';
  @Input() disabled = false;
  @Input() loading = false;
}

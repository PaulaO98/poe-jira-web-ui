/**
 * UiFormFieldComponent
 *
 * Purpose:
 * - Small wrapper for form controls that renders a label, optional hint and error message.
 *
 * Inputs:
 * - label: string
 * - hint: string
 * - error: string | null (renders error state when present)
 */
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-form-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-form-field.component.html',
  styleUrls: ['./ui-form-field.component.scss'],
})
export class UiFormFieldComponent {
  @Input() label = '';
  @Input() hint = '';
  @Input() error: string | null = null;
}

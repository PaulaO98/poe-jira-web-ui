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
import { AfterContentInit, Component, ElementRef, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-form-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-form-field.component.html',
  styleUrls: ['./ui-form-field.component.scss'],
})
export class UiFormFieldComponent implements AfterContentInit {
  @Input() label = '';
  @Input() hint = '';
  @Input() error: string | null = null;

  controlId = `field-${Math.random().toString(36).slice(2, 9)}`;

  private host = inject(ElementRef) as ElementRef<HTMLElement>;

  ngAfterContentInit(): void {
    const el = this.host.nativeElement.querySelector('input, textarea, select');
    if (el && !el.id) {
      el.id = this.controlId;
    }
  }
}

import { CommonModule } from '@angular/common';
/**
 * LoginComponent
 *
 * Purpose:
 * - Display a login form and perform authentication.
 * - On success, navigates the user to the project board.
 *
 * Inputs / Outputs:
 * - No @Input/@Output. Uses injected AuthService and Router.
 *
 * Data shapes:
 * - form: FormGroup with { email: string, password: string }
 *
 * Lifecycle:
 * - Component is standalone and relies on ReactiveFormsModule.
 *
 * Error modes:
 * - Network / authentication errors are surfaced in `error` and shown to the user.
 */
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { UiCardComponent } from '../../ui/molecules/card/ui-card.component';
import { UiFormFieldComponent } from '../../ui/molecules/form-field/ui-form-field.component';
import { UiButtonComponent } from '../../ui/atoms/button/ui-button.component';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    UiCardComponent,
    UiFormFieldComponent,
    UiButtonComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loading = false;
  error: string | null = null;

  form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  private auth = inject(AuthService);
  private router = inject(Router);

  submit() {
    this.error = null;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading = true;
    const { email, password } = this.form.getRawValue();

    this.auth.login(email, password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/workspaces']);
      },
      error: (err: unknown) => {
        this.loading = false;
        const e = err as { error?: { message?: string }; message?: string } | undefined;
        const msg = e?.error?.message ?? e?.message;
        this.error = msg ? JSON.stringify(msg) : 'Login failed';
      },
    });
  }

  get errorEmail(): string | null {
    const c = this.form.controls.email;
    if (!c.touched) return null;
    if (c.hasError('required')) return 'Email requerido';
    if (c.hasError('email')) return 'Email inválido';
    return null;
  }

  get errorPassword(): string | null {
    const c = this.form.controls.password;
    if (!c.touched) return null;
    if (c.hasError('required')) return 'Password requerido';
    if (c.hasError('minlength')) return 'Mínimo 6 caracteres';
    return null;
  }
}

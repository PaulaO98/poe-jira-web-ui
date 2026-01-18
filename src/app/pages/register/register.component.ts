/**
 * RegisterComponent
 *
 * Purpose:
 * - Provide a registration form for new users and immediately log them in.
 *
 * Inputs / Outputs:
 * - No @Input/@Output. Uses injected AuthService and Router.
 *
 * Data shapes:
 * - form: FormGroup with { name: string, email: string, password: string }
 *
 * Lifecycle:
 * - Validates form client-side and submits to AuthService.register.
 *
 * Error modes:
 * - Network errors or validation failures displayed in `error`.
 */
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { UiCardComponent } from '../../ui/molecules/card/ui-card.component';
import { UiFormFieldComponent } from '../../ui/molecules/form-field/ui-form-field.component';
import { UiButtonComponent } from '../../ui/atoms/button/ui-button.component';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    UiCardComponent,
    UiFormFieldComponent,
    UiButtonComponent,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  loading = false;
  error: string | null = null;

  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
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
    if (this.loading) return;

    this.error = null;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading = true;
    const { name, email, password } = this.form.getRawValue();

    this.auth.register(name, email, password).subscribe({
      next: () => {
        this.loading = false;

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
      },
      error: (err: unknown) => {
        this.loading = false;
        const e = err as { error?: { message?: string }; message?: string } | undefined;
        const msg = e?.error?.message ?? e?.message;
        this.error = msg ? JSON.stringify(msg) : 'Register failed';
      },
    });
  }

  get errorName(): string | null {
    const c = this.form.controls.name;
    if (!c.touched) return null;
    if (c.hasError('required')) return 'Nombre requerido';
    if (c.hasError('minlength')) return 'Mínimo 2 caracteres';
    return null;
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

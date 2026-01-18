import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Observable } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authSpy: any;
  let routerSpy: any;

  beforeEach(async () => {
    authSpy = { login: () => of(null) };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: AuthService, useValue: authSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    routerSpy = TestBed.inject(Router);
    (routerSpy as any)._navCalls = [];
    (routerSpy as any).navigate = (...args: any[]) => (routerSpy as any)._navCalls.push(args);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit when form invalid', () => {
    let called = false;
    authSpy.login = () => {
      called = true;
      return of(null);
    };

    component.form.setValue({ email: '', password: '' });
    component.submit();
    expect(called).toBeFalsy();
  });

  it('should login and navigate on success', async () => {
    const navCalls: any[] = [];
    (routerSpy as any).navigate = (...args: any[]) => navCalls.push(args);

    authSpy.login = () => of(null);

    component.form.setValue({ email: 'p@example.com', password: 'secret1' });
    component.submit();
    await new Promise((r) => setTimeout(r, 0));

    expect(navCalls.some((c) => c[0] && c[0][0] === '/workspaces')).toBeTruthy();
    expect(component.loading).toBeFalsy();
  });

  it('should set error when login fails', async () => {
    let loginCalled = false;
    authSpy.login = () =>
      new Observable((sub) => {
        loginCalled = true;
        setTimeout(() => sub.error({ message: 'bad login' }), 0);
      });

    component.form.setValue({ email: 'x@x.com', password: 'secret' });
    component.submit();
    await new Promise((r) => setTimeout(r, 20));

    expect(loginCalled).toBeTruthy();
    expect(component.error).toBe(JSON.stringify('bad login'));
    expect(component.loading).toBeFalsy();
  });

  it('should produce validation error messages', () => {
    const email = component.form.controls.email;
    email.setValue('bad');
    email.markAsTouched();
    expect(component.errorEmail).toBe('Email inválido');

    const pw = component.form.controls.password;
    pw.setValue('123');
    pw.markAsTouched();
    expect(component.errorPassword).toBe('Mínimo 6 caracteres');
  });
});

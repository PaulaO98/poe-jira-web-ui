import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Observable } from 'rxjs';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authSpy: any;
  let routerSpy: any;

  beforeEach(async () => {
    authSpy = {
      register: () => of(null),
      login: () => of(null),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: AuthService, useValue: authSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    // get the real Router from RouterTestingModule and spy navigate
    routerSpy = TestBed.inject(Router);
    // replace navigate with a simple call recorder to avoid test-runtime-specific spy helpers
    (routerSpy as any)._navCalls = [];
    (routerSpy as any).navigate = (...args: any[]) => (routerSpy as any)._navCalls.push(args);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit when form invalid', () => {
    let called = false;
    authSpy.register = () => {
      called = true;
      return of(null);
    };

    component.form.setValue({ name: '', email: '', password: '' });
    component.submit();
    expect(called).toBeFalsy();
  });

  it('should register and login and navigate on success', async () => {
    const navCalls: any[] = [];
    (routerSpy as any).navigate = (...args: any[]) => navCalls.push(args);

    authSpy.register = () => of(null);
    authSpy.login = () => of(null);

    component.form.setValue({ name: 'Paula', email: 'p@example.com', password: 'secret1' });
    component.submit();
    await new Promise((r) => setTimeout(r, 0));

    expect(navCalls.some((c) => c[0] && c[0][0] === '/workspaces')).toBeTruthy();
    expect(component.loading).toBeFalsy();
  });

  it('should set error when login fails after register', async () => {
    let regCalled = false;
    let loginCalled = false;
    authSpy.register = () => {
      regCalled = true;
      return of(null);
    };
    authSpy.login = () =>
      new Observable((sub) => {
        loginCalled = true;
        setTimeout(() => sub.error({ message: 'bad login' }), 0);
      });

    component.form.setValue({ name: 'Xi', email: 'x@e.com', password: 'secret' });
    component.submit();
    await new Promise((r) => setTimeout(r, 20));

    expect(regCalled).toBeTruthy();
    expect(loginCalled).toBeTruthy();
    expect(component.error).toBe(JSON.stringify('bad login'));
    expect(component.loading).toBeFalsy();
  });

  it('should set error when register fails', async () => {
    let regCalled = false;
    authSpy.register = () =>
      new Observable((sub) => {
        regCalled = true;
        setTimeout(() => sub.error({ message: 'reg failed' }), 0);
      });

    component.form.setValue({ name: 'Xi', email: 'x@e.com', password: 'secret' });
    component.submit();
    await new Promise((r) => setTimeout(r, 20));

    expect(regCalled).toBeTruthy();
    expect(component.error).toBe(JSON.stringify('reg failed'));
    expect(component.loading).toBeFalsy();
  });

  it('should produce validation error messages', () => {
    const name = component.form.controls.name;
    name.setValue('');
    name.markAsTouched();
    expect(component.errorName).toBe('Nombre requerido');

    name.setValue('A');
    name.markAsTouched();
    expect(component.errorName).toBe('Mínimo 2 caracteres');

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

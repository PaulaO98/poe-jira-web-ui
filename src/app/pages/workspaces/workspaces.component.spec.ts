import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Observable } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { WorkspacesComponent } from './workspaces.component';
import { WorkspacesService } from '../../services/workspaces.service';

describe('WorkspacesComponent', () => {
  let component: WorkspacesComponent;
  let fixture: ComponentFixture<WorkspacesComponent>;
  let apiSpy: any;

  beforeEach(async () => {
    apiSpy = { list: () => of([]), create: () => of(null) };

    await TestBed.configureTestingModule({
      imports: [WorkspacesComponent, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: WorkspacesService, useValue: apiSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkspacesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load workspaces via vm$ and emit loading then results', async () => {
    const sample = [{ id: 2, name: 'W1' }];
    apiSpy.list = () => of(sample);

    const values: any[] = [];
    component.vm$.subscribe((v) => values.push(v));
    await new Promise((r) => setTimeout(r, 0));

    expect(values.length).toBeGreaterThanOrEqual(2);
    expect(values[0].loading).toBeTruthy();
    expect(
      values.some((v) => Array.isArray(v.workspaces) && v.workspaces.length === 1)
    ).toBeTruthy();
  });

  it('should call create and reset nameCtrl on success', async () => {
    let createCalled = false;
    apiSpy.create = () => {
      createCalled = true;
      return of(null);
    };

    component.nameCtrl.setValue('WS1');
    component.create();
    await new Promise((r) => setTimeout(r, 0));

    expect(createCalled).toBeTruthy();
    expect(component.creating).toBeFalsy();
    expect(component.nameCtrl.value).toBe('');
  });

  it('should set createError when create fails', async () => {
    apiSpy.create = () =>
      new Observable((sub) => {
        const id = setTimeout(() => sub.error({ message: 'fail' }), 0);
        return () => clearTimeout(id);
      });

    component.nameCtrl.setValue('WS2');
    component.create();
    await new Promise((r) => setTimeout(r, 20));

    expect(component.createError).toBe(JSON.stringify('fail'));
    expect(component.creating).toBeFalsy();
  });

  it('trackWs should return workspace id', () => {
    const w = { id: 123, name: 'x' } as any;
    expect(component.trackWs(0, w)).toBe(123);
  });
});

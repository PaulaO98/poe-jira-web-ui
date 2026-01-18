import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of, Observable } from 'rxjs';

import { ProjectsComponent } from './projects.component';
import { ProjectsService } from '../../services/projects.service';

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;
  let apiSpy: any;

  beforeEach(async () => {
    apiSpy = {
      list: (_workspaceId: number) => of([]),
      create: (_workspaceId: number, _body: any) => of(null),
    };

    await TestBed.configureTestingModule({
      imports: [ProjectsComponent, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '42' } } } },
        { provide: ProjectsService, useValue: apiSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load projects via vm$ and emit loading then results', async () => {
    const sample = [{ id: 1, name: 'P1' }];
    apiSpy.list = () => of(sample);

    const values: any[] = [];
    component.vm$.subscribe((v) => values.push(v));

    // allow async pipeline to run
    await new Promise((r) => setTimeout(r, 0));

    // first emission should be loading true, then the loaded projects
    expect(values.length).toBeGreaterThanOrEqual(2);
    expect(values[0].loading).toBeTruthy();
    expect(values.some((v) => Array.isArray(v.projects) && v.projects.length === 1)).toBeTruthy();
  });

  it('should call create and reset nameCtrl on success', async () => {
    let createCalled = false;
    apiSpy.create = () => {
      createCalled = true;
      return of(null);
    };

    component.nameCtrl.setValue('My Project');
    component.create();

    await new Promise((r) => setTimeout(r, 0));

    expect(createCalled).toBeTruthy();
    expect(component.creating).toBeFalsy();
    expect(component.nameCtrl.value).toBe('');
  });

  it('should set createError when create fails', async () => {
    apiSpy.create = () =>
      new Observable((sub) => {
        const id = setTimeout(() => sub.error({ message: 'boom' }), 0);
        return () => clearTimeout(id);
      });

    component.nameCtrl.setValue('Xx');
    component.create();
    await new Promise((r) => setTimeout(r, 20));

    expect(component.createError).toBe(JSON.stringify('boom'));
    expect(component.creating).toBeFalsy();
  });

  it('trackPrj should return project id', () => {
    const p = { id: 99, name: 't' } as any;
    expect(component.trackPrj(0, p)).toBe(99);
  });
});

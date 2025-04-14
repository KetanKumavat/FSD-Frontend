import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentOrientationsComponent } from './department-orientations.component';

describe('DepartmentOrientationsComponent', () => {
  let component: DepartmentOrientationsComponent;
  let fixture: ComponentFixture<DepartmentOrientationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DepartmentOrientationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentOrientationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

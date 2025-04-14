import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentDialogComponent } from './department-dialog.component';

describe('DepartmentDialogComponent', () => {
  let component: DepartmentDialogComponent;
  let fixture: ComponentFixture<DepartmentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

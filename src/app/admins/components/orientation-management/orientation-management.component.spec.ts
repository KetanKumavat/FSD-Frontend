import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrientationManagementComponent } from './orientation-management.component';

describe('OrientationManagementComponent', () => {
  let component: OrientationManagementComponent;
  let fixture: ComponentFixture<OrientationManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrientationManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrientationManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

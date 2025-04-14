import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrientationRegistrationComponent } from './orientation-registration.component';

describe('OrientationRegistrationComponent', () => {
  let component: OrientationRegistrationComponent;
  let fixture: ComponentFixture<OrientationRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrientationRegistrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrientationRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

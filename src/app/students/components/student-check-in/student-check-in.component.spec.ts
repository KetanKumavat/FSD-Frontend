import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentCheckInComponent } from './student-check-in.component';

describe('StudentCheckInComponent', () => {
  let component: StudentCheckInComponent;
  let fixture: ComponentFixture<StudentCheckInComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentCheckInComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentCheckInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

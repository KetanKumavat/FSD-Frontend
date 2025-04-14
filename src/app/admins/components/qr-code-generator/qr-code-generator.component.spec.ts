import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrCodeGeneratorComponent } from './qr-code-generator.component';

describe('QrCodeGeneratorComponent', () => {
  let component: QrCodeGeneratorComponent;
  let fixture: ComponentFixture<QrCodeGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QrCodeGeneratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrCodeGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
